
import { Link } from 'react-router-dom';
import { ShieldAlert, MoveRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RiskAnalysisTabContentProps {
  companyId: string;
}

const RiskAnalysisTabContent = ({ companyId }: RiskAnalysisTabContentProps) => {
  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-lg font-medium mb-2 flex items-center justify-center sm:justify-start">
                <ShieldAlert className="h-5 w-5 mr-2 text-amber-500" />
                Analyse des risques
              </h3>
              <p className="text-muted-foreground">
                Identifiez et évaluez les risques de sécurité pour ce client
              </p>
            </div>
            <Button asChild>
              <Link to={`/risk-analysis/${companyId}`}>
                Accéder à l'analyse
                <MoveRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Scénarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Traitements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">...</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RiskAnalysisTabContent;
