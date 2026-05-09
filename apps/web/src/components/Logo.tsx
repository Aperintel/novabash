interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 28, withWordmark = false, className }: LogoProps) {
  if (!withWordmark) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        className={className}
        role="img"
        aria-label="NovaBash"
      >
        <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="butt" strokeLinejoin="miter">
          <path d="M8 4 L6 4 L6 11 L4 12 L6 13 L6 20 L8 20" />
          <path d="M16 4 L18 4 L18 11 L20 12 L18 13 L18 20 L16 20" />
          <line x1="7" y1="12" x2="17" y2="12" strokeWidth="1" />
        </g>
        <circle cx="12" cy="12" r="1.6" fill="var(--ember)" />
      </svg>
    );
  }

  const height = size;
  const markWidth = size;
  const totalWidth = markWidth + 8 + size * 4.6;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${height}`}
      width={totalWidth}
      height={height}
      fill="none"
      className={className}
      role="img"
      aria-label="NovaBash"
    >
      <g
        transform={`scale(${size / 24})`}
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        fill="none"
      >
        <path d="M8 4 L6 4 L6 11 L4 12 L6 13 L6 20 L8 20" />
        <path d="M16 4 L18 4 L18 11 L20 12 L18 13 L18 20 L16 20" />
        <line x1="7" y1="12" x2="17" y2="12" strokeWidth="1" />
      </g>
      <circle cx={size / 2} cy={size / 2} r={size / 14} fill="var(--ember)" />
      <text
        x={markWidth + 8}
        y={size * 0.74}
        fontFamily="var(--font-onest), system-ui, sans-serif"
        fontSize={size * 0.78}
        fontWeight="800"
        letterSpacing={`${size * -0.045}px`}
        fill="var(--fg)"
      >
        NovaBash
      </text>
    </svg>
  );
}
