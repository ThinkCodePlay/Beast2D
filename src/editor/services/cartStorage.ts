const STORAGE_KEY = "beast2d-cart-script";

export function loadCartSource(fallback: string): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ?? fallback;
}

export function saveCartSource(source: string): void {
  localStorage.setItem(STORAGE_KEY, source);
}
