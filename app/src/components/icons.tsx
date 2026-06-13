// ────────────────────────────────────────────────────────────────────────
// Inline SVG icons — terminal/cyberpunk style, currentColor-driven.
// Drop-in replacements for emoji glyphs that were rendered as raw text.
// All icons: 24×24 viewBox, 1.5px stroke, square caps, no fill.
// ────────────────────────────────────────────────────────────────────────

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': true,
  focusable: false,
  style: { verticalAlign: '-2px', display: 'inline-block' },
};

// Arrow pointing right. Used in GET STARTED links, dash-link rows, ./login CTAs.
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <line x1="3" y1="12" x2="20" y2="12" />
      <polyline points="14 6 20 12 14 18" />
    </svg>
  );
}

// Terminal prompt chevron. Used inside the term-line prompt slots.
export function PromptIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <polyline points="9 5 16 12 9 19" />
    </svg>
  );
}

// Warning triangle with exclamation. Used in the new-key notice.
export function WarnIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3 L22 20 L2 20 Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
