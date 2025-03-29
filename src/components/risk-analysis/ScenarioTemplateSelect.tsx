import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronsUpDown, Sparkles } from 'lucide-react';
import { useScenarioTemplates, EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import ScenarioTemplateDialog from './ScenarioTemplateDialog';
interface ScenarioTemplateSelectProps {
  onSelect: (template: EnhancedTemplate) => void;
}
const ScenarioTemplateSelect: React.FC<ScenarioTemplateSelectProps> = ({
  onSelect
}) => {
  const {
    open,
    setOpen,
    selectedTemplate,
    handleSelectTemplate,
    searchTerm,
    setSearchTerm,
    groupedTemplates,
    loading,
    error,
    handleRetry,
    templates,
    activeTab,
    setActiveTab
  } = useScenarioTemplates();

  // Force fetch templates on mount
  useEffect(() => {
    if (!templates || templates.length === 0) {
      handleRetry();
    }
  }, [templates, handleRetry]);
  const onTemplateSelect = (template: EnhancedTemplate) => {
    const selected = handleSelectTemplate(template);
    if (selected) {
      onSelect(selected);
    }
  };

  // Show loading state
  if (loading && !templates.length) {
    return <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>;
  }
  return;
};
export default ScenarioTemplateSelect;