
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
    console.log(`Starting import of audit plan for audit ID: ${auditId}`);
    
    // Validation: Check if auditId is provided and valid
    if (!auditId || auditId.trim() === '') {
      console.error('No audit ID provided for plan creation');
      return false;
    }
    
    // Générer un plan standard
    let planToUse = planData;
    
    // Si aucun plan n'est fourni, créer un plan standard
    if (!planData || planData.length === 0) {
      console.log('No plan data provided, creating standard plan');
      planToUse = createStandardPlan();
    }
    
    // Get theme data from planData or use empty array if none provided
    const themeInterviews = planToUse.reduce((acc: Record<string, any[]>, item) => {
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

    console.log(`Available themes: ${themes.map(t => t.name).join(', ')}`);

    // Créer les thèmes standard si nécessaire
    const standardThemes = [
      { name: 'ADMIN', description: 'Administration et organisation de l\'audit' },
      { name: 'Gouvernance', description: 'Politiques et organisation de la sécurité' },
      { name: 'Exploitation & réseaux', description: 'Sécurité des communications et réseaux' },
      { name: 'Sécurité des ressources humaines', description: 'Gestion des ressources humaines' },
      { name: 'Gestion des actifs', description: 'Inventaire et classification des actifs' },
      { name: 'Cloture', description: 'Réunion de clôture et conclusions' }
    ];

    // Créer les thèmes standard si nécessaire
    for (const themeData of standardThemes) {
      if (!themeMap.has(themeData.name)) {
        console.log(`Creating standard theme: ${themeData.name}`);
        try {
          const newTheme = await addTheme(themeData);
          if (newTheme) {
            themeMap.set(themeData.name, newTheme.id);
            console.log(`Theme created: ${themeData.name} with ID ${newTheme.id}`);
          }
        } catch (error) {
          console.error(`Error creating theme ${themeData.name}:`, error);
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

    console.log(`Processing ${Object.keys(themeInterviews).length} themes for audit ID: ${auditId}`);
    
    // Traitement de chaque thème
    for (const [themeName, interviews] of Object.entries(themeInterviews) as [string, any[]][]) {
      let themeId = themeMap.get(themeName);
      
      if (!themeId) {
        console.log(`Theme '${themeName}' not found in theme map, creating it`);
        try {
          const newTheme = await addTheme({ name: themeName });
          if (newTheme) {
            themeId = newTheme.id;
            themeMap.set(themeName, themeId);
            console.log(`Created new theme: ${themeName} with ID ${themeId}`);
          } else {
            console.error(`Erreur lors de la création du thème: ${themeName}`);
            // Use a default theme ID if we can't create one
            themeId = 'theme-default';
          }
        } catch (error) {
          console.error(`Error creating theme ${themeName}:`, error);
          // Use a default theme ID if we can't create one
          themeId = 'theme-default';
        }
      }
      
      // Si les fonctions pour créer des topics sont fournies, créer automatiquement des topics pour ce thème
      if (addTopic && associateControlsWithTopic) {
        const topicName = `Topic - ${themeName}`;
        console.log(`Creating topic: ${topicName}`);
        try {
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
                console.log(`Associating ${relevantClauseIds.length} controls with topic: ${topic.id}`);
                try {
                  await associateControlsWithTopic(topic.id, relevantClauseIds);
                } catch (error) {
                  console.error(`Error associating controls with topic ${topic.id}:`, error);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error creating topic for theme ${themeName}:`, error);
        }
      }

      console.log(`Creating ${interviews.length} interviews for theme: ${themeName} with ID ${themeId}`);
      
      // Création des interviews avec le themeId valide
      for (const interview of interviews) {
        let startDateTime = new Date();
        
        // Handle different date formats
        if (interview['Date-Heure']) {
          const dateTimeParts = interview['Date-Heure'].split(' → ');
          try {
            startDateTime = new Date(dateTimeParts[0]);
          } catch (error) {
            console.warn(`Invalid date format: ${dateTimeParts[0]}, using current date`);
          }
          
          let durationMinutes = 30;
          if (dateTimeParts.length > 1) {
            try {
              const endTime = new Date(dateTimeParts[1]);
              durationMinutes = Math.round((endTime.getTime() - startDateTime.getTime()) / (1000 * 60));
            } catch (error) {
              console.warn(`Invalid end date format, using default duration of 30 minutes`);
            }
          }
        }
        
        try {
          const interviewData = {
            auditId,
            themeId,
            title: interview['Titre'] || `Interview: ${themeName}`,
            description: `Thématique: ${themeName}`,
            startTime: startDateTime.toISOString(),
            durationMinutes: interview.durationMinutes || 30,
            controlRefs: interview['Clause/Contrôle'],
            location: 'À déterminer'
          };

          console.log(`Adding interview: ${JSON.stringify(interviewData)}`);
          await addInterview(interviewData);
        } catch (error) {
          console.error('Erreur lors de la création de l\'interview:', error);
        }
      }
    }

    console.log(`Successfully imported audit plan for audit ID: ${auditId}`);
    return true;
  } catch (error) {
    console.error('Error importing standard audit plan:', error);
    return false;
  }
};

// Fonction pour générer un plan standard
const createStandardPlan = () => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  
  const standardPlan = [
    {
      'Date-Heure': now.toISOString(),
      'Thème': 'ADMIN',
      'Titre': 'Réunion d\'ouverture',
      'Clause/Contrôle': null,
      durationMinutes: 60
    },
    {
      'Date-Heure': new Date(now.getTime() + 90 * 60000).toISOString(),
      'Thème': 'Exploitation & réseaux',
      'Titre': 'Sécurité des communications',
      'Clause/Contrôle': 'A.8.15 Sécurité des communications, A.8.16 Transfert d\'informations',
      durationMinutes: 90
    },
    {
      'Date-Heure': new Date(now.getTime() + 180 * 60000).toISOString(),
      'Thème': 'Sécurité des ressources humaines',
      'Titre': 'Gestion des ressources humaines',
      'Clause/Contrôle': 'A.7 Sécurité des ressources humaines',
      durationMinutes: 90
    },
    {
      'Date-Heure': tomorrow.toISOString(),
      'Thème': 'Gouvernance',
      'Titre': 'Politiques de sécurité',
      'Clause/Contrôle': 'A.5 Politiques de sécurité de l\'information',
      durationMinutes: 120
    },
    {
      'Date-Heure': new Date(tomorrow.getTime() + 180 * 60000).toISOString(),
      'Thème': 'Cloture',
      'Titre': 'Réunion de clôture',
      'Clause/Contrôle': null,
      durationMinutes: 60
    }
  ];
  
  return standardPlan;
};
