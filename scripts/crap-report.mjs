/**
 * Change Risk Anti-Patterns (CRAP) for src/.
 *
 * CRAP = comp^2 * (1 - cov)^3 + comp
 *   comp: cyclomatic complexity (ESLint-style; nested functions are separate)
 *   cov:  statement coverage inside the function, 0..1 (from Vitest v8 / Istanbul)
 *
 * A score above 30 is the usual "refactor or cover this" line.
 * At 100% statement coverage, CRAP equals complexity.
 *
 * Run: pnpm run crap
 * Reads: coverage/coverage-final.json (written by vitest --coverage)
 */
import { createRequire } from "node:module";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(repoRoot, "src");
const coveragePath = path.join(repoRoot, "coverage", "coverage-final.json");
const CRAP_THRESHOLD = 30;

function walkTs(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walkTs(full, out);
    else if (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function isFunctionWithBody(node) {
  return (
    (ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node)) &&
    node.body !== undefined
  );
}

function isNestedFunction(node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

function decisionWeight(node) {
  if (
    ts.isIfStatement(node) ||
    ts.isForStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node) ||
    ts.isCatchClause(node) ||
    ts.isConditionalExpression(node) ||
    ts.isCaseClause(node)
  ) {
    return 1;
  }
  if (!ts.isBinaryExpression(node)) return 0;
  const op = node.operatorToken.kind;
  if (
    op === ts.SyntaxKind.AmpersandAmpersandToken ||
    op === ts.SyntaxKind.BarBarToken ||
    op === ts.SyntaxKind.QuestionQuestionToken ||
    op === ts.SyntaxKind.AmpersandAmpersandEqualsToken ||
    op === ts.SyntaxKind.BarBarEqualsToken ||
    op === ts.SyntaxKind.QuestionQuestionEqualsToken
  ) {
    return 1;
  }
  return 0;
}

function cyclomaticComplexity(fn) {
  let complexity = 1;
  const visit = (node) => {
    if (node !== fn && isNestedFunction(node)) return;
    complexity += decisionWeight(node);
    ts.forEachChild(node, visit);
  };
  visit(fn);
  return complexity;
}

function functionLabel(node) {
  if (ts.isConstructorDeclaration(node)) {
    const cls = node.parent;
    const className = cls && ts.isClassLike(cls) && cls.name ? cls.name.text : "class";
    return `${className}.constructor`;
  }
  if (
    ts.isMethodDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  ) {
    const cls = node.parent;
    const className = cls && ts.isClassLike(cls) && cls.name ? cls.name.text : "";
    const kind = ts.isGetAccessorDeclaration(node)
      ? "get "
      : ts.isSetAccessorDeclaration(node)
        ? "set "
        : "";
    const name = propertyName(node.name);
    return className ? `${className}.${kind}${name}` : `${kind}${name}`;
  }
  if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name) {
    return node.name.text;
  }
  const parent = node.parent;
  if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.text;
  }
  if (parent && ts.isPropertyAssignment(parent)) return propertyName(parent.name);
  if (parent && ts.isPropertyDeclaration(parent)) return propertyName(parent.name);
  return "(anonymous)";
}

function propertyName(name) {
  if (!name) return "(anonymous)";
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }
  if (ts.isNumericLiteral(name)) return name.text;
  return "(anonymous)";
}

function posOf(sourceFile, position) {
  const lc = sourceFile.getLineAndCharacterOfPosition(position);
  return { line: lc.line + 1, column: lc.character };
}

function collectFunctions(filePath) {
  const text = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const functions = [];
  const visit = (node) => {
    if (isFunctionWithBody(node)) {
      const start = posOf(sourceFile, node.getStart(sourceFile));
      const end = posOf(sourceFile, node.getEnd());
      functions.push({
        name: functionLabel(node),
        file: filePath,
        startLine: start.line,
        startColumn: start.column,
        endLine: end.line,
        endColumn: end.column,
        complexity: cyclomaticComplexity(node),
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return functions;
}

function normalizeKey(filePath) {
  return path.resolve(filePath).replaceAll("\\", "/").toLowerCase();
}

function loadCoverage() {
  let raw;
  try {
    raw = JSON.parse(readFileSync(coveragePath, "utf8"));
  } catch {
    console.error(`Missing ${coveragePath}. Run: pnpm run test:coverage`);
    process.exit(1);
  }
  const byFile = new Map();
  for (const [file, data] of Object.entries(raw)) {
    byFile.set(normalizeKey(file), data);
  }
  return byFile;
}

function positionInside(line, column, fn) {
  if (line < fn.startLine || line > fn.endLine) return false;
  if (line === fn.startLine && column < fn.startColumn) return false;
  if (line === fn.endLine && column >= fn.endColumn) return false;
  return true;
}

function spanSize(fn) {
  return (fn.endLine - fn.startLine) * 10_000 + (fn.endColumn - fn.startColumn);
}

function innermost(functions, line, column) {
  let best = null;
  let bestSize = Infinity;
  for (const fn of functions) {
    if (!positionInside(line, column, fn)) continue;
    const size = spanSize(fn);
    if (size < bestSize) {
      best = fn;
      bestSize = size;
    }
  }
  return best;
}

function crapScore(complexity, coverage) {
  const uncovered = 1 - coverage;
  return complexity * complexity * uncovered * uncovered * uncovered + complexity;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function pad(value, width) {
  return String(value).padStart(width);
}

const coverage = loadCoverage();
const rows = [];

for (const file of walkTs(srcRoot)) {
  const functions = collectFunctions(file);
  const data = coverage.get(normalizeKey(file));
  const statementHits = new Map(functions.map((fn) => [fn, { total: 0, covered: 0 }]));
  const functionHits = new Map(functions.map((fn) => [fn, false]));

  if (data?.statementMap && data.s) {
    for (const [id, loc] of Object.entries(data.statementMap)) {
      const fn = innermost(functions, loc.start.line, loc.start.column);
      if (!fn) continue;
      const bucket = statementHits.get(fn);
      bucket.total += 1;
      if ((data.s[id] ?? 0) > 0) bucket.covered += 1;
    }
  }

  if (data?.fnMap && data.f) {
    for (const [id, meta] of Object.entries(data.fnMap)) {
      const loc = meta.loc?.start ?? meta.decl?.start;
      if (!loc) continue;
      const fn = innermost(functions, loc.line, loc.column);
      if (!fn) continue;
      if ((data.f[id] ?? 0) > 0) functionHits.set(fn, true);
    }
  }

  for (const fn of functions) {
    const statements = statementHits.get(fn);
    let cov;
    if (statements.total === 0) cov = functionHits.get(fn) ? 1 : 0;
    else cov = statements.covered / statements.total;
    rows.push({
      file: rel(file),
      name: fn.name,
      line: fn.startLine,
      complexity: fn.complexity,
      statements: statements.total,
      coveredStatements: statements.covered,
      coverage: cov,
      crap: crapScore(fn.complexity, cov),
    });
  }
}

rows.sort((a, b) => b.crap - a.crap || b.complexity - a.complexity || a.file.localeCompare(b.file));

const over = rows.filter((row) => row.crap > CRAP_THRESHOLD);
const untested = rows.filter((row) => row.coverage === 0).length;
const mean =
  rows.length === 0 ? 0 : rows.reduce((sum, row) => sum + row.crap, 0) / rows.length;

console.log("");
console.log("CRAP (Change Risk Anti-Patterns)");
console.log("CRAP = comp^2 * (1 - cov)^3 + comp");
console.log(`Threshold: > ${CRAP_THRESHOLD}`);
console.log("");
console.log(`Functions: ${rows.length}`);
console.log(`Untested (0% statement coverage): ${untested}`);
console.log(`CRAP > ${CRAP_THRESHOLD}: ${over.length}`);
console.log(`Mean CRAP: ${mean.toFixed(2)}`);
if (rows[0]) console.log(`Highest: ${rows[0].crap.toFixed(2)}  ${rows[0].file}:${rows[0].line} ${rows[0].name}`);
console.log("");

const shown = over.length > 0 ? over : rows.slice(0, 25);
console.log(over.length > 0 ? `Functions over ${CRAP_THRESHOLD}:` : "No function is over 30. Highest 25:");
console.log("");
console.log(`${pad("CRAP", 8)} ${pad("COMP", 5)} ${pad("COV", 7)}  LOCATION`);
for (const row of shown) {
  const covPct = `${(row.coverage * 100).toFixed(1)}%`;
  console.log(
    `${pad(row.crap.toFixed(2), 8)} ${pad(row.complexity, 5)} ${pad(covPct, 7)}  ${row.file}:${row.line} ${row.name}`,
  );
}

const reportPath = path.join(repoRoot, "coverage", "crap.json");
writeFileSync(
  reportPath,
  JSON.stringify(
    {
      threshold: CRAP_THRESHOLD,
      formula: "comp^2 * (1 - cov)^3 + comp",
      summary: {
        functions: rows.length,
        untested,
        overThreshold: over.length,
        mean,
        highest: rows[0] ?? null,
      },
      functions: rows,
    },
    null,
    2,
  ),
);
console.log("");
console.log(`Full per-function report: ${rel(reportPath)}`);
