// Brand SVG for the Google OAuth provider. Monochrome 18x18, scaled to fit
// the terminal/Swiss design — currentColor inherits from the button text.

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  focusable: false,
};

export function GoogleIcon() {
  return (
    <svg {...base}>
      <path d="M21.35 11.1H12v2.97h5.34c-.23 1.36-1.66 3.99-5.34 3.99-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.74 3.49 14.55 2.5 12 2.5 6.85 2.5 2.65 6.7 2.65 11.85S6.85 21.2 12 21.2c6.93 0 9.84-4.86 9.84-11.7 0-.79-.09-1.39-.49-1.4z" />
    </svg>
  );
}
