import React, { useState } from 'react';
import { CompanyRiskScale, RiskScaleLevel, RiskScaleType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Save } from 'lucide-react';

interface RiskScaleCardProps {
  companyScale: CompanyRiskScale;
  scaleType: RiskScaleType;
  levels: RiskScaleLevel[];
  isLoading: boolean;
  onToggleActive: (scaleId: string, isActive: boolean) => void;
  onUpdateLevel: (levelId: string, updatedData: Partial<RiskScaleLevel>) => void;
}

const RiskScaleCard: React.FC<RiskScaleCardProps> = ({
  companyScale,
  scaleType,
  levels,
  isLoading,
  onToggleActive,
  onUpdateLevel
}) => {
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; description: string }>({
    name: '',
    description: ''
  });

  const handleStartEdit = (level: RiskScaleLevel) => {
    setEditingLevelId(level.id);
    setEditValues({
      name: level.name,
      description: level.description
    });
  };

  const handleSaveEdit = async (levelId: string) => {
    await onUpdateLevel(levelId, editValues);
    setEditingLevelId(null);
  };

  const handleCancelEdit = () => {
    setEditingLevelId(null);
  };

  const getLevelValue = (level: RiskScaleLevel): number => {
    return level.level_value;
  };

  const getLevelColor = (level: RiskScaleLevel) => {
    return level.color || 
      (getLevelValue(level) === 1 ? "#4CAF50" : 
       getLevelValue(level) === 2 ? "#FFA726" : 
       getLevelValue(level) === 3 ? "#9C27B0" : "#F44336");
  };

  const getIsActive = (scale: CompanyRiskScale): boolean => {
    return scale.is_active || false;
  };

  if (isLoading) {
    return (
      <Card className="w-full mb-4">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2 mb-4">
              <Skeleton className="h-8 w-8" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-16" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center pr-10">
          <span>{scaleType.name}</span>
          <Switch 
            checked={companyScale.is_active} 
            onCheckedChange={() => onToggleActive(companyScale.id, companyScale.is_active)}
          />
        </CardTitle>
        <CardDescription>{scaleType.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {levels.sort((a, b) => getLevelValue(a) - getLevelValue(b)).map((level) => (
          <div key={level.id} className="mb-4 border-b pb-3 last:border-b-0">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: getLevelColor(level) }} 
              />
              
              {editingLevelId === level.id ? (
                <div className="flex-1">
                  <Input 
                    value={editValues.name} 
                    onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                    className="mb-2"
                  />
                  <Input 
                    value={editValues.description} 
                    onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                  />
                  <div className="flex justify-end mt-2 gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={() => handleSaveEdit(level.id)}>
                      <Save className="h-4 w-4 mr-1" />
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{level.name}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleStartEdit(level)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RiskScaleCard;
