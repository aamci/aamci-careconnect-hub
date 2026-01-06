import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AgendaSidebarHeaderProps {
  onNewAppointment?: () => void;
}

const AgendaSidebarHeader: React.FC<AgendaSidebarHeaderProps> = ({ onNewAppointment }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-card p-3"
    >
      <Button 
        onClick={onNewAppointment}
        className="w-full action-btn action-btn-primary gap-2 justify-center"
      >
        <Plus className="w-4 h-4" />
        <span>Trouver un créneau</span>
      </Button>
    </motion.div>
  );
};

export default AgendaSidebarHeader;
