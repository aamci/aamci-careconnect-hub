import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDesktop = ['laptop', 'desktop', 'wide'].includes(breakpoint);

  return (
    <MainLayout activeNav="settings" onNavChange={(nav) => navigate(nav === 'agenda' ? '/' : `/${nav}`)}>
      <div className="h-full flex bg-background">
        {/* Mobile header bar */}
        {!isDesktop && (
          <div className="fixed top-14 left-[72px] right-0 z-30 flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <p className="text-sm font-semibold text-foreground">Parametres</p>
          </div>
        )}

        {/* Desktop Sidebar */}
        {isDesktop && (
          <div className="w-64 border-r border-border flex-shrink-0 overflow-y-auto">
            <SettingsSidebar />
          </div>
        )}

        {/* Mobile Sidebar Sheet */}
        {!isDesktop && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <SettingsSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <div className={cn('flex-1 overflow-y-auto', !isDesktop && 'pt-12')}>
          {/* Back to agenda link */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-primary hover:text-primary/80 -ml-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Revenir a l'agenda
            </Button>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
