/**
 * Confetti Animation Utilities
 *
 * Provides celebration confetti effects using canvas-confetti library.
 * Used for success moments like appointment bookings.
 *
 * @module lib/utils/confetti
 */

import confetti from "canvas-confetti";

/**
 * Triggers a celebration confetti burst
 * Uses Daybreak brand colors (teal and warm orange)
 *
 * Animation details:
 * - Two bursts from left and right sides
 * - Daybreak color palette
 * - Particles spread across screen
 * - Auto-cleans up after animation
 *
 * @example
 * // Trigger confetti when booking succeeds
 * celebrateBooking();
 */
export function celebrateBooking(): void {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 9999,
    colors: ["#2A9D8F", "#3DBCB0", "#E9A23B", "#FEF7ED"], // Daybreak brand colors
  };

  /**
   * Generates random confetti particles within duration
   */
  function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Animation frame loop
   */
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    // Burst from left
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });

    // Burst from right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

/**
 * Triggers a single confetti burst from the center
 * Lighter celebration for smaller moments
 *
 * @example
 * // Trigger on form submission
 * celebrateSuccess();
 */
export function celebrateSuccess(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#2A9D8F", "#3DBCB0", "#E9A23B"],
    zIndex: 9999,
  });
}

/**
 * Clears all active confetti animations
 * Useful for cleanup on component unmount
 *
 * @example
 * useEffect(() => {
 *   return () => clearConfetti();
 * }, []);
 */
export function clearConfetti(): void {
  confetti.reset();
}
