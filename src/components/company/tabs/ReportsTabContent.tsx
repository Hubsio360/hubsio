
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ReportsTabContent = () => {
  return (
    <Card>
      <CardContent className="pt-6 text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Rapports d'audit</h3>
        <p className="text-muted-foreground mb-6">
          Les rapports générés pour cette entreprise apparaîtront ici une fois validés
        </p>
      </CardContent>
    </Card>
  );
};

export default ReportsTabContent;
