'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon?: LucideIcon;
  iconColor?: string;
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  icon: Icon,
  iconColor = 'text-blue-400',
  badge,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        {(Icon || badge) && (
          <div className={`flex items-center gap-2 ${iconColor} mb-1`}>
            {Icon && <Icon className="w-4 h-4" />}
            {badge && (
              <span className="text-xs font-semibold uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
