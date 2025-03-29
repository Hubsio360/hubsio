
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { BusinessProcess, SuggestedScenario, RiskScenarioCreate } from '../types';

export interface ScenarioGenerationProgress {
  generating: boolean;
  progress: number;
}

export interface UseRiskScenariosResult {
  loading: boolean;
  suggestedScenarios: SuggestedScenario[];
  generatingScenarios: boolean;
  generationProgress: number;
  sessionError: string | null;
  generateRiskScenarios: (companyName: string, businessProcesses: BusinessProcess[]) => Promise<boolean>;
  generateAdditionalScenarios: () => Promise<void>;
  handleTemplateSelect: (template: EnhancedTemplate) => void;
  toggleScenarioSelection: (id: string) => void;
  saveScenarios: () => Promise<boolean>;
  saveAndClose: () => Promise<boolean>;
  setSuggestedScenarios: React.Dispatch<React.SetStateAction<SuggestedScenario[]>>;
  storeBusinessProcesses: (processes: BusinessProcess[]) => void;
}
