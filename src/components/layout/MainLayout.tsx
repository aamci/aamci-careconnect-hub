import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  activeNav: string;
  onNavChange: (item: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeNav, onNavChange }) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar activeItem={activeNav} onItemChange={onNavChange} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
