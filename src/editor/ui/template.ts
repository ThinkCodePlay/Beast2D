export function cloneTemplate(html: string): HTMLElement {
  const holder = document.createElement("template");
  holder.innerHTML = html.trim();
  const node = holder.content.firstElementChild;
  if (!(node instanceof HTMLElement)) {
    throw new Error("Screen template needs a root element");
  }
  return node;
}

export function templateRefs(root: ParentNode): Map<string, HTMLElement> {
  const found = new Map<string, HTMLElement>();
  for (const el of root.querySelectorAll<HTMLElement>("[data-ref]")) {
    const name = el.dataset.ref;
    if (name) found.set(name, el);
  }
  return found;
}

export function requireRef(
  found: Map<string, HTMLElement>,
  name: string,
): HTMLElement {
  const el = found.get(name);
  if (!el) throw new Error(`Missing data-ref="${name}"`);
  return el;
}
