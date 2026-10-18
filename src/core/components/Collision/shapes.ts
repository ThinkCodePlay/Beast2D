/* shapes.ts
  Pure geometry helpers for collision shapes (world space).
*/

export type CircleShape = { type: "circle"; x: number; y: number; radius: number };
export type RectShape = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};
export type ColliderShape = CircleShape | RectShape;

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function shapeBounds(shape: ColliderShape): Bounds {
  if (shape.type === "circle") {
    return {
      minX: shape.x - shape.radius,
      minY: shape.y - shape.radius,
      maxX: shape.x + shape.radius,
      maxY: shape.y + shape.radius,
    };
  }
  return {
    minX: shape.x,
    minY: shape.y,
    maxX: shape.x + shape.width,
    maxY: shape.y + shape.height,
  };
}

export function intersectsShapes(a: ColliderShape, b: ColliderShape): boolean {
  if (a.type === "circle" && b.type === "circle") return circleCircle(a, b);
  if (a.type === "rect" && b.type === "rect") return rectRect(a, b);
  if (a.type === "circle" && b.type === "rect") return circleRect(a, b);
  if (a.type === "rect" && b.type === "circle") return circleRect(b, a);
  return false;
}

function circleCircle(a: CircleShape, b: CircleShape): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radiusSum = a.radius + b.radius;
  return dx * dx + dy * dy <= radiusSum * radiusSum;
}

function rectRect(a: RectShape, b: RectShape): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function circleRect(circle: CircleShape, rect: RectShape): boolean {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}
