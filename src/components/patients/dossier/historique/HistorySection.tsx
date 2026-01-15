import React from 'react';
import { Appointment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import AppointmentRow from './AppointmentRow';
import { GroupedAppointments } from '@/hooks/data/usePatientHistory';

interface HistorySectionProps {
  title: string;
  count: number;
  appointments?: Appointment[];
  groupedAppointments?: GroupedAppointments[];
  onOpenAppointment: (appointment: Appointment) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  title,
  count,
  appointments,
  groupedAppointments,
  onOpenAppointment,
}) => {
  if (count === 0) return null;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="mb-3">
        <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-muted text-sm font-medium text-foreground">
          {title} ({count})
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Simple list (for upcoming) */}
          {appointments && !groupedAppointments && (
            <div className="divide-y divide-border">
              {appointments.map((apt) => (
                <AppointmentRow
                  key={apt.id}
                  appointment={apt}
                  onOpen={onOpenAppointment}
                />
              ))}
            </div>
          )}

          {/* Grouped by year (for past) */}
          {groupedAppointments && (
            <div>
              {groupedAppointments.map((group) => (
                <div key={group.year}>
                  {/* Year header */}
                  <div className="px-4 py-2 bg-muted/30 border-b border-border">
                    <span className="text-sm font-semibold text-foreground">
                      {group.year}
                    </span>
                  </div>
                  {/* Appointments for this year */}
                  <div className="divide-y divide-border">
                    {group.items.map((apt) => (
                      <AppointmentRow
                        key={apt.id}
                        appointment={apt}
                        onOpen={onOpenAppointment}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistorySection;
