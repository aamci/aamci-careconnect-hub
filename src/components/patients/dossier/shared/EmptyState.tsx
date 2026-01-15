import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
}

/**
 * Reusable empty state component for dossier sections
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
}) => {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-1.5">
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
