import React from 'react';
import { CalendarCheck, CalendarX, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PatientHistorySummary } from '@/hooks/data/usePatientHistory';

interface PresenceSummaryCardProps {
  summary: PatientHistorySummary;
}

const PresenceSummaryCard: React.FC<PresenceSummaryCardProps> = ({ summary }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Présence aux rendez-vous
        </h3>
        <div className="flex items-center justify-start gap-8 flex-wrap">
          {/* Honored */}
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">Rendez-vous honorés</span>
            <span className="text-sm font-semibold text-foreground ml-1">
              {summary.honoredCount}
            </span>
          </div>
          
          {/* Vertical separator */}
          <div className="h-6 w-px bg-border" />
          
          {/* Excused absences */}
          <div className="flex items-center gap-2">
            <CalendarX className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">Absences excusées</span>
            <span className="text-sm font-semibold text-foreground ml-1">
              {summary.excusedAbsenceCount}
            </span>
          </div>
          
          {/* Vertical separator */}
          <div className="h-6 w-px bg-border" />
          
          {/* Unexcused absences */}
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">Absences non excusées</span>
            <span className="text-sm font-semibold text-foreground ml-1">
              {summary.unexcusedAbsenceCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresenceSummaryCard;
