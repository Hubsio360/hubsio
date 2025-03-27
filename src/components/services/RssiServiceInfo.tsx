
import React from 'react';
import { RssiService } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon, UserIcon, ScrollText } from 'lucide-react';

interface RssiServiceInfoProps {
  rssiService: RssiService;
}

const RssiServiceInfo: React.FC<RssiServiceInfoProps> = ({ rssiService }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Détails du service RSSI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground mr-2">Temps alloué:</span>
            <span>{rssiService.allocationTime} heures par mois</span>
          </div>
          
          {rssiService.mainContactName && (
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Contact principal:</span>
              <span>{rssiService.mainContactName}</span>
            </div>
          )}
          
          {rssiService.slaDetails && (
            <div className="flex items-start">
              <ScrollText className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
              <div>
                <span className="text-muted-foreground mr-2">Conditions SLA:</span>
                <p className="mt-1">{rssiService.slaDetails}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RssiServiceInfo;
