
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FrameworkControl } from '@/types';
import { Edit } from 'lucide-react';

interface FrameworkControlsProps {
  controls: FrameworkControl[];
  onEditControl: (control: FrameworkControl) => void;
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

export const FrameworkControls = ({ controls, onEditControl, sessionStatus }: FrameworkControlsProps) => {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Voir les détails
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-2">
        <ScrollArea className="h-[300px] pr-3">
          {controls.map(control => (
            <ContextMenu key={control.id}>
              <ContextMenuTrigger>
                <div className="text-sm border p-2 rounded group relative hover:bg-accent/30 transition-colors mb-2">
                  <div className="font-medium">{control.referenceCode} - {control.title}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {control.description}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditControl(control);
                    }}
                    className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={sessionStatus !== 'authenticated'}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem 
                  onClick={() => onEditControl(control)}
                  className="flex items-center gap-2"
                  disabled={sessionStatus !== 'authenticated'}
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier ce contrôle</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};
