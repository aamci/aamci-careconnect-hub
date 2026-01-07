import React, { useState, useEffect } from 'react';

interface NowIndicatorProps {
  startHour: number;
  slotHeight: number;
}

const NowIndicator: React.FC<NowIndicatorProps> = ({ startHour, slotHeight }) => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const minutesSinceStart = (currentHour - startHour) * 60 + currentMinute;
      const pos = (minutesSinceStart / 60) * slotHeight;
      setPosition(pos);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [startHour, slotHeight]);

  if (position < 0) return null;

  return (
    <div
      className="absolute left-0 right-0 flex items-center z-30 pointer-events-none"
      style={{ top: `${position}px` }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-destructive -ml-1 shadow-sm" />
      <div
        className="flex-1 h-[2px]"
        style={{
          background: 'linear-gradient(to right, hsl(var(--destructive)), hsl(var(--destructive) / 0.3), transparent)',
        }}
      />
    </div>
  );
};

export default NowIndicator;
