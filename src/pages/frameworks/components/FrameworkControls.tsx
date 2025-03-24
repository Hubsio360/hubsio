
import { FrameworkControl } from '@/types';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FrameworkControlsProps {
  controls: FrameworkControl[];
  onEditControl: (control: FrameworkControl) => void;
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

export const FrameworkControls = ({ 
  controls, 
  onEditControl,
  sessionStatus 
}: FrameworkControlsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredControls = controls.filter(control => {
    const searchLower = searchQuery.toLowerCase();
    return (
      control.referenceCode.toLowerCase().includes(searchLower) ||
      control.title.toLowerCase().includes(searchLower) ||
      (control.description && control.description.toLowerCase().includes(searchLower))
    );
  });
  
  // Séparer les contrôles et les exigences
  const controlItems = filteredControls.filter(c => c.type !== 'requirement');
  const requirementItems = filteredControls.filter(c => c.type === 'requirement');

  // Fonction pour afficher un groupe d'éléments (contrôles ou exigences)
  const renderItems = (items: FrameworkControl[], title: string) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-b border-muted">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {item.referenceCode}
                    </Badge>
                    <span className="text-sm font-medium truncate">{item.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditControl(item);
                    }}
                    disabled={sessionStatus !== 'authenticated'}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  {item.description || "Aucune description disponible."}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un contrôle ou une exigence..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {renderItems(controlItems, "Contrôles")}
      {renderItems(requirementItems, "Exigences")}
      
      {filteredControls.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          {searchQuery 
            ? "Aucun résultat trouvé pour cette recherche" 
            : "Aucun contrôle ou exigence trouvé pour ce référentiel"}
        </div>
      )}
    </div>
  );
};
