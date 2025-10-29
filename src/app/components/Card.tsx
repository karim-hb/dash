'use client';

import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: ReactNode;
  badge?: string | ReactNode;
  actions?: ReactNode;
  variant?: 'default' | 'terminal' | 'metric';
}

export default function Card({
  title,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
  icon,
  badge,
  actions,
  variant = 'default'
}: CardProps) {
  const baseClasses = {
    default: "bloomberg-card border-2 border-slate-700/60",
    terminal: "bloomberg-card border-2 border-slate-700/60",
    metric: "bloomberg-card border-2 border-slate-700/60"
  };

  const headerClasses = {
    default: `px-8 py-5 border-b-2 border-slate-700/60 bg-slate-950/90 bloomberg-header ${headerClassName}`,
    terminal: `px-8 py-4 border-b-2 border-slate-700/60 bg-slate-950/90 bloomberg-header font-mono ${headerClassName}`,
    metric: `px-8 py-5 border-b-2 border-slate-700/60 bg-slate-950/90 bloomberg-header ${headerClassName}`
  };

  const contentClasses = {
    default: `p-8 ${contentClassName}`,
    terminal: `p-8 ${contentClassName}`,
    metric: `p-8 ${contentClassName}`
  };

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      {(title || icon || badge || actions) && (
        <div className={headerClasses[variant]}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {icon && <div className="text-cyan-400 text-lg">{icon}</div>}
              {title && (
                <h2 className={`font-bold tracking-wider ${
                  variant === 'terminal' ? 'text-slate-100 font-mono text-sm uppercase' : 'text-white text-xl'
                }`}>
                  {variant === 'terminal' ? `${title}` : title}
                </h2>
              )}
              {badge && (
                <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-300 text-xs font-mono font-semibold">
                  {badge}
                </div>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className={contentClasses[variant]}>
        {children}
      </div>
    </div>
  );
}
