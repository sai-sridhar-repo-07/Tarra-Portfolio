/**
 * Fixed noise texture overlay for the entire page.
 * Adds a subtle grain/film texture over everything.
 * Purely decorative, pointer-events: none.
 */
export default function NoiseOverlay() {
  return <div className="noise-overlay" aria-hidden="true" />
}
