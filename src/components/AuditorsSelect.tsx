
import React, { useState, useEffect } from 'react';
import { Check, PlusCircle, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from '@/types';

export type Auditor = User;

interface AuditorsSelectProps {
  auditors: Auditor[];
  selectedAuditors: { userId: string; roleInAudit: 'lead' | 'participant' }[];
  onAuditorSelect: (userId: string, role: 'lead' | 'participant') => void;
  onAuditorRemove: (userId: string) => void;
}

export const AuditorsSelect: React.FC<AuditorsSelectProps> = ({
  auditors,
  selectedAuditors,
  onAuditorSelect,
  onAuditorRemove
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'lead' | 'participant'>('participant');

  const handleSelect = (userId: string) => {
    onAuditorSelect(userId, selectedRole);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedAuditors.length > 0 ? (
          selectedAuditors.map(({ userId, roleInAudit }) => {
            const auditor = auditors.find(a => a.id === userId);
            if (!auditor) return null;
            
            return (
              <Badge 
                key={userId} 
                variant={roleInAudit === 'lead' ? 'default' : 'secondary'}
                className="flex items-center gap-1 px-3 py-1.5"
              >
                <UserRound className="h-3.5 w-3.5" />
                <span>{auditor.name}</span>
                <span className="text-xs opacity-75">({roleInAudit})</span>
                <button 
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => onAuditorRemove(userId)}
                >
                  <span className="sr-only">Remove</span>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground">Aucun auditeur sélectionné</div>
        )}
      </div>

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[260px] justify-start">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Ajouter un auditeur</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un auditeur..." />
              <CommandList>
                <CommandEmpty>Aucun auditeur trouvé.</CommandEmpty>
                <CommandGroup heading="Rôle dans l'audit">
                  <div className="flex gap-2 p-2">
                    <Button 
                      size="sm" 
                      variant={selectedRole === 'lead' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('lead')}
                      className="flex-1"
                    >
                      Lead
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedRole === 'participant' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('participant')}
                      className="flex-1"
                    >
                      Participant
                    </Button>
                  </div>
                </CommandGroup>
                <CommandGroup heading="Auditeurs disponibles">
                  <ScrollArea className="h-[200px]">
                    {auditors
                      .filter(auditor => !selectedAuditors.some(sa => sa.userId === auditor.id))
                      .map(auditor => (
                        <CommandItem
                          key={auditor.id}
                          onSelect={() => handleSelect(auditor.id)}
                          className="flex items-center gap-2"
                        >
                          <UserRound className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{auditor.name}</span>
                            <span className="text-xs text-muted-foreground">{auditor.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
