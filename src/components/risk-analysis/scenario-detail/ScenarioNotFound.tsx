
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScenarioNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mb-4" />
          <h2 className="text-xl font-semibold mb-2">Scénario non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            Le scénario de risque que vous cherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate(-1)}>
            Retourner à l'analyse de risque
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioNotFound;
