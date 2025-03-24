
import { AuditTheme, StandardClause } from '@/types';

export const importStandardAuditPlan = async (
  auditId: string, 
  planData: any[], 
  themes: AuditTheme[],
  standardClauses: StandardClause[],
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

    // Si aucun thème n'est disponible, créons des thèmes standard ISO 27001
    if (themes.length === 0 && Object.keys(themeInterviews).length === 0) {
      const standardThemes = [
        { name: 'ADMIN', description: 'Administration et organisation de l\'audit' },
        { name: 'Gouvernance', description: 'Politiques et organisation de la sécurité' },
        { name: 'Exploitation & réseaux', description: 'Sécurité des communications et réseaux' },
        { name: 'Sécurité des ressources humaines', description: 'Gestion des ressources humaines' },
        { name: 'Gestion des actifs', description: 'Inventaire et classification des actifs' },
        { name: 'Cloture', description: 'Réunion de clôture et conclusions' }
      ];

      // Créer un plan d'audit standard si aucune donnée n'est fournie
      if (planData.length === 0) {
        const standardPlan = [
          {
            'Date-Heure': new Date().toISOString(),
            'Thème': 'ADMIN',
            'Titre': 'Réunion d\'ouverture',
            'Clause/Contrôle': null
          },
          {
            'Date-Heure': new Date(new Date().getTime() + 90 * 60000).toISOString(),
            'Thème': 'Exploitation & réseaux',
            'Titre': 'Sécurité des communications',
            'Clause/Contrôle': 'A.8.15 Sécurité des communications, A.8.16 Transfert d\'informations'
          },
          {
            'Date-Heure': new Date(new Date().getTime() + 180 * 60000).toISOString(),
            'Thème': 'Sécurité des ressources humaines',
            'Titre': 'Gestion des ressources humaines',
            'Clause/Contrôle': 'A.7 Sécurité des ressources humaines'
          },
          {
            'Date-Heure': new Date(new Date().getTime() + 240 * 60000).toISOString(),
            'Thème': 'Gouvernance',
            'Titre': 'Politiques de sécurité',
            'Clause/Contrôle': 'A.5 Politiques de sécurité de l\'information'
          },
          {
            'Date-Heure': new Date(new Date().getTime() + 300 * 60000).toISOString(),
            'Thème': 'Cloture',
            'Titre': 'Réunion de clôture',
            'Clause/Contrôle': null
          }
        ];

        // Construire le themeInterviews à partir du plan standard
        standardPlan.forEach(item => {
          const theme = item['Thème'];
          if (!themeInterviews[theme]) {
            themeInterviews[theme] = [];
          }
          themeInterviews[theme].push(item);
        });

        // Créer les thèmes standard
        for (const themeData of standardThemes) {
          await addTheme(themeData);
        }
      }
    }

    // S'assurer que nous avons des thèmes valides avant de continuer
    let themeMap = new Map<string, string>();
    
    for (const theme of themes) {
      themeMap.set(theme.name, theme.id);
    }

    for (const [themeName, interviews] of Object.entries(themeInterviews) as [string, any[]][]) {
      let themeId = themeMap.get(themeName);
      
      if (!themeId) {
        const newTheme = await addTheme({ name: themeName });
        if (newTheme) {
          themeId = newTheme.id;
          themeMap.set(themeName, themeId);
        } else {
          console.error(`Erreur lors de la création du thème: ${themeName}`);
          continue;
        }
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
