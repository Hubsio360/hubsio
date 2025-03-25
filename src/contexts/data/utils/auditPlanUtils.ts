
import { AuditTheme, StandardClause, AuditTopic } from '@/types';

export const importStandardAuditPlan = async (
  auditId: string, 
  planData: any[], 
  themes: AuditTheme[],
  standardClauses: StandardClause[],
  addTheme: (theme: Omit<AuditTheme, 'id'>) => Promise<AuditTheme | null>,
  addInterview: (interview: any) => Promise<any>,
  addTopic?: (topic: Omit<AuditTopic, 'id'>) => Promise<AuditTopic | null>,
  associateControlsWithTopic?: (topicId: string, controlIds: string[]) => Promise<boolean>
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

    // Maintenir une map de thèmes pour éviter les doublons et gérer les IDs
    const themeMap = new Map<string, string>();
    themes.forEach(theme => {
      themeMap.set(theme.name, theme.id);
    });

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
          const newTheme = await addTheme(themeData);
          if (newTheme) {
            themeMap.set(themeData.name, newTheme.id);
          }
        }
      }
    }

    // Mapper les thèmes avec les clauses ISO standards pour la création automatique de topics
    const themeToClausesMap: Record<string, string[]> = {
      'ADMIN': [],
      'Gouvernance': ['A.5', 'A.6'],
      'Exploitation & réseaux': ['A.8.15', 'A.8.16', 'A.8'],
      'Sécurité des ressources humaines': ['A.7'],
      'Gestion des actifs': ['A.9'],
      'Cloture': []
    };

    // Traitement de chaque thème
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
      
      // Si les fonctions pour créer des topics sont fournies, créer automatiquement des topics pour ce thème
      if (addTopic && associateControlsWithTopic) {
        const topicName = `Topic - ${themeName}`;
        const topic = await addTopic({
          name: topicName,
          description: `Topic automatiquement créé pour le thème ${themeName}`
        });
        
        if (topic) {
          // Trouver les contrôles associés au thème
          const clauseRefs = themeToClausesMap[themeName] || [];
          if (clauseRefs.length > 0 && standardClauses.length > 0) {
            // Filtrer les clauses standards correspondantes
            const relevantClauseIds = standardClauses
              .filter(clause => clauseRefs.some(ref => clause.referenceCode && clause.referenceCode.startsWith(ref)))
              .map(clause => clause.id);
            
            if (relevantClauseIds.length > 0) {
              await associateControlsWithTopic(topic.id, relevantClauseIds);
            }
          }
        }
      }

      // Vérifier que themeId est défini avant de créer les interviews
      if (!themeId) {
        console.error(`Impossible de créer des interviews pour le thème ${themeName} car son ID est manquant.`);
        continue;
      }

      // Création des interviews avec le themeId valide
      for (const interview of interviews) {
        const dateTimeParts = interview['Date-Heure'].split(' → ');
        const startDateTime = new Date(dateTimeParts[0]);
        
        let durationMinutes = 30;
        if (dateTimeParts.length > 1) {
          const endTime = new Date(dateTimeParts[1]);
          durationMinutes = Math.round((endTime.getTime() - startDateTime.getTime()) / (1000 * 60));
        }
        
        try {
          await addInterview({
            auditId,
            themeId,
            title: interview['Titre'],
            description: `Thématique: ${themeName}`,
            startTime: startDateTime.toISOString(),
            durationMinutes,
            controlRefs: interview['Clause/Contrôle'],
          });
        } catch (error) {
          console.error('Erreur lors de la création de l\'interview:', error);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error importing standard audit plan:', error);
    return false;
  }
};
