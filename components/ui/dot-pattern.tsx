import { useId } from 'react';

import { cn } from '@/lib/utils';

interface DotPatternProps {
  width?: number | string;
  height?: number | string;
  x?: number | string;
  y?: number | string;
  cx?: number | string;
  cy?: number | string;
  cr?: number | string;
  className?: string;
  [key: string]: unknown;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80',
        className,
      )}
      {...props}
    >
      <defs>
        {/* Radial mask for center vs edges */}
        <mask id={`centerMask-${id}`}>
          <radialGradient id={`centerGradient-${id}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" />
            <stop offset="60%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <rect
            width="100%"
            height="100%"
            fill={`url(#centerGradient-${id})`}
          />
        </mask>

        <mask id={`edgeMask-${id}`}>
          <radialGradient id={`edgeGradient-${id}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="black" />
            <stop offset="60%" stopColor="black" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
          <rect width="100%" height="100%" fill={`url(#edgeGradient-${id})`} />
        </mask>

        <filter id={`blur-${id}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
        </filter>

        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>

      {/* Sharp center dots */}
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${id})`}
        mask={`url(#centerMask-${id})`}
      />

      {/* Blurred edge dots */}
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${id})`}
        filter={`url(#blur-${id})`}
        mask={`url(#edgeMask-${id})`}
        opacity="0.8"
      />
    </svg>
  );
}

export default DotPattern;
