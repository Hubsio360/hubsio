
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Framework, FrameworkControl } from '@/types';
import { Edit, Trash2, FileText, Plus } from 'lucide-react';
import { FrameworkControls } from './FrameworkControls';

interface FrameworksListProps {
  onEditFramework: (framework: Framework) => void;
  onDeleteFramework: (framework: Framework) => void;
  onEditControl: (control: FrameworkControl) => void;
  onAddControl: (framework: Framework) => void;
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

export const FrameworksList = ({
  onEditFramework,
  onDeleteFramework,
  onEditControl,
  onAddControl,
  sessionStatus
}: FrameworksListProps) => {
  const { frameworks, controls } = useData();

  const getControlsCountByFramework = (frameworkId: string) => {
    return controls.filter(control => control.frameworkId === frameworkId).length;
  };

  const getControlsByFramework = (frameworkId: string) => {
    return controls.filter(control => control.frameworkId === frameworkId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {frameworks.map((framework) => (
        <Card key={framework.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{framework.name}</CardTitle>
                <CardDescription>Version {framework.version}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEditFramework(framework)}
                  className="h-8 w-8"
                  disabled={sessionStatus !== 'authenticated'}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteFramework(framework)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={sessionStatus !== 'authenticated'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-muted-foreground mb-4">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span>{getControlsCountByFramework(framework.id)} contrôles</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddControl(framework)}
                className="h-7 px-2"
                disabled={sessionStatus !== 'authenticated'}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Ajouter</span>
              </Button>
            </div>
            <FrameworkControls 
              controls={getControlsByFramework(framework.id)} 
              onEditControl={onEditControl}
              sessionStatus={sessionStatus}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
