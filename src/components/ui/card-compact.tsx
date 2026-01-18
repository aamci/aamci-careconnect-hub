/**
 * CardCompact - Density-aware card component
 *
 * Automatically adapts to the current density mode (compact/standard/confort).
 * Designed for Patient Dossier cards that need to fit in constrained space.
 *
 * Features:
 * - Uses CSS custom properties from density-tokens.css
 * - Collapsible header support
 * - Optional mini mode for ultra-compact display
 * - Smooth transitions between density modes
 */

import * as React from 'react';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface CardCompactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title displayed in header */
  title: string;
  /** Optional icon for header */
  icon?: LucideIcon;
  /** Header actions (buttons, links) - rendered on right side */
  headerActions?: React.ReactNode;
  /** Whether the card can be collapsed */
  collapsible?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Default collapsed state (uncontrolled) */
  defaultCollapsed?: boolean;
  /** Mini mode - even more compact, single line */
  mini?: boolean;
  /** Disable padding on content area */
  noPadding?: boolean;
  /** Custom header className */
  headerClassName?: string;
  /** Custom content className */
  contentClassName?: string;
  /** Badge to display after title */
  badge?: React.ReactNode;
  /** Force compact mode regardless of global density */
  forceCompact?: boolean;
}

const CardCompact = React.forwardRef<HTMLDivElement, CardCompactProps>(
  (
    {
      className,
      title,
      icon: Icon,
      headerActions,
      collapsible = false,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      defaultCollapsed = false,
      mini = false,
      noPadding = false,
      headerClassName,
      contentClassName,
      badge,
      forceCompact = false,
      children,
      ...props
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);

    const isCollapsed = controlledCollapsed ?? internalCollapsed;

    const handleToggleCollapse = () => {
      const newValue = !isCollapsed;
      setInternalCollapsed(newValue);
      onCollapsedChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-card rounded-[var(--density-card-radius)] border border-border shadow-sm overflow-hidden',
          'transition-all duration-200 ease-out',
          forceCompact && 'density-compact',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between border-b border-border/50 bg-muted/30',
            'px-[var(--density-card-padding)] h-[var(--density-info-card-header-height)]',
            mini && 'h-[calc(var(--density-info-card-header-height)-4px)]',
            collapsible && 'cursor-pointer hover:bg-muted/50',
            isCollapsed && 'border-b-0',
            headerClassName
          )}
          onClick={collapsible ? handleToggleCollapse : undefined}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={
            collapsible
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleCollapse();
                  }
                }
              : undefined
          }
        >
          <div className="flex items-center gap-[var(--density-space-sm)] min-w-0 flex-1">
            {Icon && (
              <Icon
                className="shrink-0 text-muted-foreground"
                style={{
                  width: 'var(--density-icon-md)',
                  height: 'var(--density-icon-md)',
                }}
              />
            )}
            <h3
              className="font-semibold text-foreground truncate"
              style={{ fontSize: 'var(--density-text-sm)' }}
            >
              {title}
            </h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          <div className="flex items-center gap-[var(--density-space-xs)] shrink-0">
            {headerActions && (
              <div
                className="flex items-center gap-[var(--density-space-xs)]"
                onClick={(e) => e.stopPropagation()}
              >
                {headerActions}
              </div>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCollapse();
                }}
              >
                {isCollapsed ? (
                  <ChevronDown
                    style={{
                      width: 'var(--density-icon-sm)',
                      height: 'var(--density-icon-sm)',
                    }}
                  />
                ) : (
                  <ChevronUp
                    style={{
                      width: 'var(--density-icon-sm)',
                      height: 'var(--density-icon-sm)',
                    }}
                  />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div
            className={cn(
              'transition-all duration-200 ease-out',
              !noPadding && 'p-[var(--density-card-padding)]',
              mini && !noPadding && 'p-[var(--density-space-sm)]',
              contentClassName
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

CardCompact.displayName = 'CardCompact';

/**
 * InfoRowCompact - Single row of info in a card
 * Label: Value format with density-aware sizing
 */
export interface InfoRowCompactProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Highlight the value */
  highlight?: boolean;
  /** Make the row clickable */
  onClick?: () => void;
}

const InfoRowCompact = React.forwardRef<HTMLDivElement, InfoRowCompactProps>(
  ({ className, label, value, icon: Icon, highlight, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between min-h-[var(--density-list-item-height)]',
          'py-[var(--density-space-xs)] px-[var(--density-space-sm)]',
          'border-b border-border/30 last:border-b-0',
          onClick && 'cursor-pointer hover:bg-muted/30 transition-colors',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        <div className="flex items-center gap-[var(--density-space-sm)] text-muted-foreground">
          {Icon && (
            <Icon
              style={{
                width: 'var(--density-icon-sm)',
                height: 'var(--density-icon-sm)',
              }}
            />
          )}
          <span style={{ fontSize: 'var(--density-text-sm)' }}>{label}</span>
        </div>
        <span
          className={cn(
            'font-medium text-right truncate max-w-[60%]',
            highlight ? 'text-accent' : 'text-foreground'
          )}
          style={{ fontSize: 'var(--density-text-sm)' }}
        >
          {value}
        </span>
      </div>
    );
  }
);

InfoRowCompact.displayName = 'InfoRowCompact';

/**
 * ListItemCompact - Single item in a list within a card
 */
export interface ListItemCompactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Primary text */
  primary: React.ReactNode;
  /** Secondary/subtitle text */
  secondary?: React.ReactNode;
  /** Left side element (avatar, icon, etc) */
  left?: React.ReactNode;
  /** Right side element (badge, action, etc) */
  right?: React.ReactNode;
  /** Make the item clickable */
  onClick?: () => void;
  /** Selected/active state */
  selected?: boolean;
}

const ListItemCompact = React.forwardRef<HTMLDivElement, ListItemCompactProps>(
  ({ className, primary, secondary, left, right, onClick, selected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-[var(--density-space-sm)]',
          'min-h-[var(--density-list-item-height)]',
          'py-[var(--density-space-xs)] px-[var(--density-space-sm)]',
          'border-b border-border/30 last:border-b-0',
          onClick && 'cursor-pointer hover:bg-muted/40 transition-colors',
          selected && 'bg-accent/10 border-l-2 border-l-accent',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        {left && <div className="shrink-0">{left}</div>}

        <div className="flex-1 min-w-0">
          <div
            className="font-medium text-foreground truncate"
            style={{ fontSize: 'var(--density-text-sm)' }}
          >
            {primary}
          </div>
          {secondary && (
            <div
              className="text-muted-foreground truncate"
              style={{ fontSize: 'var(--density-text-xs)' }}
            >
              {secondary}
            </div>
          )}
        </div>

        {right && <div className="shrink-0">{right}</div>}
      </div>
    );
  }
);

ListItemCompact.displayName = 'ListItemCompact';

/**
 * BadgeCompact - Small badge using density tokens
 */
export interface BadgeCompactProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

const BadgeCompact = React.forwardRef<HTMLSpanElement, BadgeCompactProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary/10 text-primary',
      success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      outline: 'border border-border bg-transparent text-muted-foreground',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium',
          'h-[var(--density-badge-height)] px-[var(--density-space-sm)]',
          variantClasses[variant],
          className
        )}
        style={{ fontSize: 'var(--density-text-xs)' }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

BadgeCompact.displayName = 'BadgeCompact';

export { CardCompact, InfoRowCompact, ListItemCompact, BadgeCompact };
