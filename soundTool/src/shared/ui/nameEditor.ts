/**
 * Tap-to-edit sound names: a temporary HTML input placed over the LCD. A DOM
 * input (not canvas key capture) so mobile shows its native keyboard. Styled
 * to sit inside the LCD plate; commits on Enter or blur, cancels on Escape.
 */

/** A rectangle in CSS pixels, page space (what getBoundingClientRect uses). */
export interface CssRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NameEditorOptions {
  value: string;
  maxLength: number;
  /** Receives the typed name on commit; not called on cancel. */
  onCommit(name: string): void;
}

/**
 * Map a rectangle in the canvas's own pixel space (e.g. 1536×1024) to CSS
 * page coordinates, accounting for the canvas's CSS scaling and position.
 */
export function canvasRectToCss(canvas: HTMLCanvasElement, rect: { x: number; y: number; width: number; height: number }): CssRect {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = bounds.width / canvas.width;
  const scaleY = bounds.height / canvas.height;
  return {
    x: bounds.left + rect.x * scaleX,
    y: bounds.top + rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}

/** Open the editor over the given rect. Only one editor exists at a time. */
export function openNameEditor(rect: CssRect, options: NameEditorOptions): void {
  closeOpenEditor();
  const input = document.createElement('input');
  input.type = 'text';
  input.value = options.value;
  input.maxLength = options.maxLength;
  input.spellcheck = false;
  input.autocapitalize = 'off';
  input.autocomplete = 'off';
  input.dataset.soundNameEditor = 'true';
  Object.assign(input.style, {
    position: 'fixed',
    left: `${rect.x + 2}px`,
    top: `${rect.y + 1}px`,
    width: `${Math.max(40, rect.width - 4)}px`,
    height: `${Math.max(16, rect.height - 2)}px`,
    font: `bold ${Math.max(12, rect.height * 0.5)}px monogram, monospace`,
    color: '#ffeaff',
    background: '#371c51',
    border: '1px solid #7d4f99',
    borderRadius: '2px',
    padding: '0 4px',
    outline: 'none',
    zIndex: '10',
  });
  let done = false;
  const commit = (): void => {
    if (done) return;
    done = true;
    options.onCommit(input.value);
    input.remove();
  };
  const cancel = (): void => {
    if (done) return;
    done = true;
    input.remove();
  };
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') cancel();
    event.stopPropagation();
  });
  input.addEventListener('blur', commit);
  document.body.appendChild(input);
  input.focus();
  input.select();
}

function closeOpenEditor(): void {
  document.querySelector('input[data-sound-name-editor]')?.remove();
}
