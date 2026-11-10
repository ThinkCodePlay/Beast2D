const SPEED = 60;
const SIZE = 10;
const WIDTH = 320;
const HEIGHT = 240;

let x = 112;
let y = 33333;

function init() {
  x = 112;
  y = 104;
}

function mine(a: number) {
  return "hi"
}

function update(dt: number) {
  if (btn("left")) x -= SPEED * dt;
  if (btn("right")) x += SPEED * dt;
  if (btn("up")) y -= SPEED * dt;
  if (btn("down")) y += SPEED * dt;
  x = Math.min(WIDTH - SIZE, Math.max(0, x));
  y = Math.min(HEIGHT - SIZE, 
              Math.max(0, y));
}

function draw() {
  cls(0);
  rectfill(Math.round(x), Math.round(y), SIZE, SIZE, 10);
  print("HELLO", 8, 8, 4);
  rectfill(x, y, 1,2, ); 
}