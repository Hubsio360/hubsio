
import { AuditTheme } from '@/types';

export const importStandardAuditPlan = async (
  auditId: string, 
  planData: any[], 
  themes: AuditTheme[],
  addTheme: (theme: Omit<AuditTheme, 'id'>) => Promise<AuditTheme | null>,
  addInterview: (interview: any) => Promise<any>
): Promise<boolean> => {
  try {
    const themeInterviews = planData.reduce((acc: Record<string, any[]>, item) => {
      const theme = item['Thème'] || 'Sans thème';
      if (!acc[theme]) {
        acc[theme] = [];
      }
      acc[theme].push(item);
      return acc;
    }, {});

    for (const [themeName, interviews] of Object.entries(themeInterviews) as [string, any[]][]) {
      let themeId = themes.find(t => t.name === themeName)?.id;
      
      if (!themeId) {
        const newTheme = await addTheme({ name: themeName });
        themeId = newTheme?.id;
      }

      for (const interview of interviews) {
        const dateTimeParts = interview['Date-Heure'].split(' → ');
        const startDateTime = new Date(dateTimeParts[0]);
        
        let durationMinutes = 30;
        if (dateTimeParts.length > 1) {
          const endTime = new Date(dateTimeParts[1]);
          durationMinutes = Math.round((endTime.getTime() - startDateTime.getTime()) / (1000 * 60));
        }

        await addInterview({
          auditId,
          themeId,
          title: interview['Titre'],
          description: `Thématique: ${themeName}`,
          startTime: startDateTime.toISOString(),
          durationMinutes,
          controlRefs: interview['Clause/Contrôle'],
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error importing standard audit plan:', error);
    return false;
  }
};
