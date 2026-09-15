/**
 * AdCraft Motion Curves — After Effects Speed Graph Evaluator
 * 
 * Replaces generic springs and linear transitions with cubic bezier
 * velocity profiles calibrated to high-end motion design standards.
 */

export interface BezierPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const MotionCurves = {
  // Classic AE Snappy: explosive acceleration with a long, buttery deceleration
  snappy: { x1: 0.16, y1: 1.0, x2: 0.3, y2: 1.0 },

  // High-velocity punch: maximum impact on frame 1-3, immediate settle
  punch: { x1: 0.05, y1: 0.95, x2: 0.1, y2: 1.0 },

  // Cinematic Camera Glide: smooth acceleration and deceleration for dollies
  glide: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 },

  // Kinetic Typography Reveal: fast crisp entry without overshoot
  kinetic: { x1: 0.2, y1: 0.0, x2: 0.0, y2: 1.0 },

  // Asymmetric whip: explosive departure or entry
  whip: { x1: 0.8, y1: 0.0, x2: 0.2, y2: 1.0 },

  // Elastic settle: subtle overshoot for tactile UI feedback
  overshoot: { x1: 0.34, y1: 1.36, x2: 0.64, y2: 1.0 },
};

/**
 * Newton-Raphson cubic bezier solver (equivalent to After Effects speed graph)
 */
export function evaluateCubicBezier(
  t: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  // Initial guess
  let x = t;
  for (let i = 0; i < 8; i++) {
    // Current bezier X
    const currentX =
      3 * (1 - x) * (1 - x) * x * x1 +
      3 * (1 - x) * x * x * x2 +
      x * x * x;
    const diff = currentX - t;
    if (Math.abs(diff) < 1e-5) break;

    // Derivative dX/dx
    const dx =
      3 * (1 - x) * (1 - x) * x1 +
      6 * (1 - x) * x * (x2 - x1) +
      3 * x * x * (1 - x2);
    if (Math.abs(dx) < 1e-6) break;
    x -= diff / dx;
  }

  // Calculate Y at solve parameter x
  return (
    3 * (1 - x) * (1 - x) * x * y1 +
    3 * (1 - x) * x * x * y2 +
    x * x * x
  );
}

/**
 * Interpolate a value between start and end using an After Effects speed curve
 */
export function interpolateWithCurve(
  frame: number,
  startFrame: number,
  endFrame: number,
  startValue: number,
  endValue: number,
  curve: BezierPoints = MotionCurves.snappy
): number {
  if (frame <= startFrame) return startValue;
  if (frame >= endFrame) return endValue;

  const progress = (frame - startFrame) / (endFrame - startFrame);
  const eased = evaluateCubicBezier(progress, curve.x1, curve.y1, curve.x2, curve.y2);
  return startValue + (endValue - startValue) * eased;
}
