/*
 * COMPOSTEL — brand logo (issue #2).
 *
 * The golden scallop shell + wordmark, shown in the app header and footer so
 * the logo is present on every page. Always links back to Home.
 */

interface BrandLogoProps {
  /** Visual scale. "sm" for the footer, "md" (default) for the header. */
  size?: "sm" | "md";
}

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  return (
    <a className={`brandlogo brandlogo--${size}`} href="#/home" aria-label="Compostel — home">
      <img className="brandlogo__mark" src="/icon-192.png" alt="Compostel" width={40} height={40} />
      <span className="brandlogo__word">COMPOSTEL</span>
    </a>
  );
}
