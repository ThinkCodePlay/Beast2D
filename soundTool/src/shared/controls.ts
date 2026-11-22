/**
 * How a panel realizes its buttons and dials: drawn flat into the 2D artwork
 * ('2d'), or left out so the 3D scene can place real meshes there ('3d').
 */
export type ControlMode = "2d" | "3d";
