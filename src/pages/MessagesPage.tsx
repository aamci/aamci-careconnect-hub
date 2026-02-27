import React, { useState } from 'react';
import { Mail, MessageCircle, Shield } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import EmailMode from '@/components/messaging/EmailMode';
import ChatMode from '@/components/messaging/ChatMode';
import { MessageMode } from '@/types/messaging';

const modes: { id: MessageMode; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'email', label: 'Courrier', icon: Mail, description: 'Courrier medical securise' },
  { id: 'chat', label: 'Messagerie', icon: MessageCircle, description: 'Messagerie instantanee' },
];

const MessagesPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('messages');
  const [activeMode, setActiveMode] = useState<MessageMode>('chat');

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mode selector header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
          <div className="flex items-center gap-1">
            {modes.map((mode) => {
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <mode.icon className="h-4 w-4" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-green-600" />
            <span>Communication chiffree</span>
          </div>
        </div>

        {/* Active mode content */}
        <div className="flex-1 overflow-hidden">
          {activeMode === 'email' ? <EmailMode /> : <ChatMode />}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
