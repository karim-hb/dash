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
    default: "bg-black border border-gray-800",
    terminal: "bg-black border border-gray-800",
    metric: "bg-black border border-gray-800"
  };

  const headerClasses = {
    default: `px-2 py-1 border-b border-gray-800 bg-gray-900 ${headerClassName}`,
    terminal: `px-2 py-0.5 border-b border-gray-800 bg-gray-900 font-mono ${headerClassName}`,
    metric: `px-2 py-1 border-b border-gray-800 bg-gray-900 ${headerClassName}`
  };

  const contentClasses = {
    default: `p-2 ${contentClassName}`,
    terminal: `p-2 ${contentClassName}`,
    metric: `p-2 ${contentClassName}`
  };

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      {(title || icon || badge || actions) && (
        <div className={headerClasses[variant]}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && <div className="text-green-400 text-[10px]">{icon}</div>}
              {title && (
                <h2 className={`font-mono text-[10px] uppercase tracking-widest text-gray-300`}>
                  {title}
                </h2>
              )}
              {badge && (
                <div className="px-1 py-0.5 bg-green-900 text-green-300 text-[9px] font-mono border border-green-700">
                  {badge}
                </div>
              )}
            </div>
            {actions && <div className="flex items-center gap-1">{actions}</div>}
          </div>
        </div>
      )}
      <div className={contentClasses[variant]}>
        {children}
      </div>
    </div>
  );
}
