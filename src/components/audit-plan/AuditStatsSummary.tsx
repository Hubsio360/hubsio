
import React from 'react';
import { CalendarIcon, UsersIcon, ClockIcon, CheckIcon } from 'lucide-react';

interface AuditStatsSummaryProps {
  businessDays: number;
  topicsCount: number;
}

const AuditStatsSummary: React.FC<AuditStatsSummaryProps> = ({ 
  businessDays, 
  topicsCount 
}) => {
  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-sm font-medium">Récapitulatif</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm font-medium mb-1 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            Durée
          </div>
          <div className="text-2xl font-semibold">
            {businessDays} <span className="text-sm font-normal">jours</span>
          </div>
        </div>
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm font-medium mb-1 flex items-center">
            <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            Thématiques
          </div>
          <div className="text-2xl font-semibold">
            {topicsCount} <span className="text-sm font-normal">sujets</span>
          </div>
        </div>
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm font-medium mb-1 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            Interviews
          </div>
          <div className="text-2xl font-semibold">
            {topicsCount} <span className="text-sm font-normal">sessions</span>
          </div>
        </div>
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="text-sm font-medium mb-1 flex items-center">
            <CheckIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            Couverture
          </div>
          <div className="text-2xl font-semibold">
            100<span className="text-sm font-normal">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditStatsSummary;
