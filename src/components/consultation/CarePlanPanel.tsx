import React, { useState } from 'react';
import { 
  Printer, 
  Edit2, 
  Pill, 
  FlaskConical, 
  FileText, 
  Scan, 
  MoreHorizontal,
  Plus,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CarePlanAction, CarePlanTask } from '@/types/consultation';

interface ActionType {
  id: string;
  type: CarePlanAction['type'];
  label: string;
  icon: React.ElementType;
}

const actionTypes: ActionType[] = [
  { id: 'pharmacy', type: 'pharmacy', label: 'Ordonnance pharmacie', icon: Pill },
  { id: 'biology', type: 'biology', label: 'Ordonnance de biologie', icon: FlaskConical },
  { id: 'letter', type: 'letter', label: 'Courrier', icon: FileText },
  { id: 'imaging', type: 'imaging', label: "Ordonnance d'imagerie", icon: Scan },
  { id: 'other', type: 'other', label: 'Autres', icon: MoreHorizontal },
];

interface CarePlanPanelProps {
  onPrint?: () => void;
  onActionCreate?: (type: CarePlanAction['type']) => void;
  onTaskCreate?: (label: string) => void;
}

const CarePlanPanel: React.FC<CarePlanPanelProps> = ({
  onPrint,
  onActionCreate,
  onTaskCreate
}) => {
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [createdActions, setCreatedActions] = useState<CarePlanAction[]>([]);

  const handleAddTask = () => {
    if (newTaskLabel.trim()) {
      const newTask: CarePlanTask = {
        id: `task-${Date.now()}`,
        label: newTaskLabel.trim(),
        isCompleted: false,
      };
      setTasks(prev => [...prev, newTask]);
      onTaskCreate?.(newTaskLabel.trim());
      setNewTaskLabel('');
    }
  };

  const handleActionClick = (type: CarePlanAction['type']) => {
    onActionCreate?.(type);
    // Add to created actions for display
    const actionType = actionTypes.find(a => a.type === type);
    if (actionType) {
      setCreatedActions(prev => [...prev, {
        id: `action-${Date.now()}`,
        type,
        label: actionType.label,
        createdAt: new Date()
      }]);
    }
  };

  return (
    <div className="w-[280px] h-full bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Plan de soins</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onPrint}
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm">Imprimer</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          {actionTypes.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.type)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group flex-1"
            >
              <div className="w-10 h-10 rounded-lg bg-muted/50 group-hover:bg-muted flex items-center justify-center transition-colors">
                <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-[10px] text-center text-muted-foreground group-hover:text-foreground leading-tight transition-colors">
                {action.label.split(' ').slice(0, 2).join(' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Created Actions */}
          {createdActions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-2">Actions créées</h3>
              <div className="space-y-2">
                {createdActions.map((action) => (
                  <div 
                    key={action.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                      {(() => {
                        const ActionIcon = actionTypes.find(a => a.type === action.type)?.icon || FileText;
                        return <ActionIcon className="w-3.5 h-3.5 text-primary" />;
                      })()}
                    </div>
                    <span className="text-sm text-foreground flex-1">{action.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prochaine fois */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Prochaine fois</h3>
            
            {/* Task List */}
            {tasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
                  >
                    <input 
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => {
                        setTasks(prev => prev.map(t => 
                          t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
                        ));
                      }}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className={cn(
                      "text-sm flex-1",
                      task.isCompleted && "line-through text-muted-foreground"
                    )}>
                      {task.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Task Input */}
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                value={newTaskLabel}
                onChange={(e) => setNewTaskLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Ajouter une tâche..."
                className="h-8 text-sm border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CarePlanPanel;
