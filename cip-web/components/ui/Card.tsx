import type { HTMLAttributes } from 'react';

type CardRadius = 'xl' | '2xl' | '3xl';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  radius?: CardRadius;
  padding?: CardPadding;
  hoverable?: boolean;
}

const radiusClasses: Record<CardRadius, string> = {
  xl: 'rounded-2xl',
  '2xl': 'rounded-[32px]',
  '3xl': 'rounded-[40px]',
};

const paddingClasses: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  radius = 'xl',
  padding = 'md',
  hoverable = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`border backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)] ${radiusClasses[radius]} ${paddingClasses[padding]} ${
        hoverable ? 'transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
