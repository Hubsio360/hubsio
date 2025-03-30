
// Types for the frameworks and controls
export interface Framework {
  id: string;
  name: string;
  version: string;
}

export interface FrameworkControl {
  id: string;
  frameworkId: string;
  referenceCode: string;
  title: string;
  description?: string;
}

export interface FrameworkImport {
  name: string;
  version: string;
  controls: Omit<FrameworkControl, 'id' | 'frameworkId'>[];
}

export interface FrameworkImportResult {
  framework: Framework;
  controlsCount: number;
}
