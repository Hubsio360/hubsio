
import React, { useEffect, useState } from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AuditTheme } from '@/types';

interface ThemeSelectorProps {
  auditId: string;
  frameworkId?: string;
  selectedTopicIds: string[];
  onSelectionChange: (topicIds: string[]) => void;
  excludedThemeNames?: string[];
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  auditId,
  frameworkId,
  selectedTopicIds,
  onSelectionChange,
  excludedThemeNames = ['ADMIN', 'Cloture']
}) => {
  const { fetchThemes, themes: allThemes, loading: globalLoading, addTheme } = useData();
  const [frameworkThemes, setFrameworkThemes] = useState<AuditTheme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Load themes directly from the data context
  const loadThemes = async () => {
    if (!auditId) {
      console.log("No audit ID provided for theme loading");
      return;
    }
    
    setLoadingThemes(true);
    setError(null);
    
    try {
      console.log(`Attempt ${attemptCount + 1}: Loading themes...`);
      
      // Simply use fetchThemes from context which will update the themes state
      const themes = await fetchThemes();
      console.log("Themes loaded:", themes);
      
      if (themes && Array.isArray(themes) && themes.length > 0) {
        // Filter out excluded theme names
        const filteredThemes = themes.filter(theme => 
          !excludedThemeNames.includes(theme.name)
        );
        
        setFrameworkThemes(filteredThemes);
        console.log("Themes set in local state:", filteredThemes);
      } else {
        console.error("No themes found or returned");
        setError("No themes were found. Please add themes or try again.");
      }
    } catch (error) {
      console.error("Complete error while loading themes:", error);
      setError("Could not load themes. Please try again.");
    } finally {
      setLoadingThemes(false);
    }
  };

  // Initial theme loading
  useEffect(() => {
    loadThemes();
  }, [auditId, fetchThemes, attemptCount]);

  // Automatic retry mechanism on failure
  useEffect(() => {
    // If error and less than 3 automatic attempts
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Automatic retry ${retryCount + 1}/3...`);
        setRetryCount(prev => prev + 1);
        setAttemptCount(prev => prev + 1);
      }, 1500); // Increase delay between attempts
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  // Manual retry function
  const handleRetry = () => {
    setAttemptCount(prev => prev + 1);
    setRetryCount(0); // Reset automatic retry counter
  };

  // Function to add a new theme
  const handleAddTheme = async () => {
    const themeName = prompt("New theme name:");
    if (!themeName || themeName.trim() === '') return;
    
    const description = prompt("Description (optional):");
    
    try {
      const newTheme = await addTheme({
        name: themeName.trim(),
        description: description ? description.trim() : ''
      });
      
      if (newTheme) {
        toast({
          title: "Theme added",
          description: `The theme "${newTheme.name}" has been successfully added.`,
        });
        
        // Reload themes
        handleRetry();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not add the theme.",
        });
      }
    } catch (error) {
      console.error("Error adding theme:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while adding the theme.",
      });
    }
  };

  // Debug theme loading state
  useEffect(() => {
    console.log("Theme loading state:", {
      loadingThemes,
      globalLoading,
      frameworkThemes: frameworkThemes.length,
      allThemes: allThemes.length,
      error
    });
  }, [loadingThemes, globalLoading, frameworkThemes, allThemes, error]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Interview Themes</CardTitle>
          <CardDescription>
            Select the themes to include in your audit plan
          </CardDescription>
        </div>
        <Button 
          onClick={handleAddTheme}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New theme
        </Button>
      </CardHeader>
      <CardContent>
        {loadingThemes || globalLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button 
                onClick={handleRetry}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button 
                onClick={handleAddTheme}
                variant="outline"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add a theme
              </Button>
            </div>
          </div>
        ) : (
          <TopicsList 
            auditId={auditId} 
            frameworkId={frameworkId}
            onSelectionChange={onSelectionChange}
            excludedThemeNames={excludedThemeNames}
            frameworkThemes={frameworkThemes}
            loadingThemes={loadingThemes}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
