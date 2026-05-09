import { iconPaths, type IconName } from '@novabash/brand';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
}

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.5,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      className={className}
      aria-hidden={ariaHidden && !ariaLabel ? true : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
    />
  );
}
