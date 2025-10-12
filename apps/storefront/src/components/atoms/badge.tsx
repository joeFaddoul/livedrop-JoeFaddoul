import clsx from 'clsx';

export type BadgeProps = {
  children: React.ReactNode;
  color?: 'default' | 'info' | 'success' | 'warning';
  className?: string;
};

const colorStyles: Record<Required<BadgeProps>['color'], string> = {
  default: 'bg-slate-800 text-slate-200',
  info: 'bg-sky-500/20 text-sky-200',
  success: 'bg-emerald-500/20 text-emerald-200',
  warning: 'bg-amber-500/20 text-amber-200',
};

export function Badge({ children, color = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        colorStyles[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
