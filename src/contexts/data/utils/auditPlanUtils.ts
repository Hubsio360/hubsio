
import { AuditTheme, StandardClause, AuditTopic, AuditInterview } from '@/types';

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
    
    // Utiliser planData ou créer un plan standard
    let planToUse = planData && Array.isArray(planData) && planData.length > 0 
      ? planData 
      : createStandardPlan();
    
    console.log(`Using ${planToUse === planData ? 'provided' : 'standard'} plan with ${planToUse.length} items`);
    
    // Organiser les données par thème
    const themeInterviews = planToUse.reduce((acc: Record<string, any[]>, item) => {
      if (!item) return acc; // Ignorer les entrées nulles ou undefined
      
      const theme = item['Thème'] || 'Sans thème';
      if (!acc[theme]) {
        acc[theme] = [];
      }
      acc[theme].push(item);
      return acc;
    }, {});

    // Maintenir une map de thèmes pour éviter les doublons et gérer les IDs
    const themeMap = new Map<string, string>();
    if (Array.isArray(themes)) {
      themes.forEach(theme => {
        if (theme && theme.id && theme.name) {
          themeMap.set(theme.name, theme.id);
        }
      });
    }

    console.log(`Available themes: ${Array.isArray(themes) ? themes.map(t => t?.name).join(', ') : 'None'}`);

    // Créer les thèmes standard si nécessaire
    const standardThemes = [
      { name: 'ADMIN', description: 'Administration et organisation de l\'audit' },
      { name: 'Gouvernance', description: 'Politiques et organisation de la sécurité' },
      { name: 'Exploitation & réseaux', description: 'Sécurité des communications et réseaux' },
      { name: 'Sécurité des ressources humaines', description: 'Gestion des ressources humaines' },
      { name: 'Gestion des actifs', description: 'Inventaire et classification des actifs' },
      { name: 'Cloture', description: 'Réunion de clôture et conclusions' }
    ];

    // Créer les thèmes standard s'ils n'existent pas
    for (const themeData of standardThemes) {
      if (!themeMap.has(themeData.name)) {
        console.log(`Creating standard theme: ${themeData.name}`);
        try {
          const newTheme = await addTheme(themeData);
          if (newTheme && newTheme.id) {
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
      // Vérifier si le nom du thème existe et attribuer un ID
      let themeId = themeMap.get(themeName);
      
      if (!themeId) {
        console.log(`Theme '${themeName}' not found in theme map, creating it`);
        try {
          const newTheme = await addTheme({ name: themeName });
          if (newTheme && newTheme.id) {
            themeId = newTheme.id;
            themeMap.set(themeName, themeId);
            console.log(`Created new theme: ${themeName} with ID ${themeId}`);
          } else {
            console.error(`Erreur lors de la création du thème: ${themeName}`);
            themeId = 'theme-default';
          }
        } catch (error) {
          console.error(`Error creating theme ${themeName}:`, error);
          themeId = 'theme-default';
        }
      }
      
      // Création de topics si les fonctions nécessaires sont disponibles
      if (addTopic && associateControlsWithTopic) {
        const topicName = `Topic - ${themeName}`;
        console.log(`Creating topic: ${topicName}`);
        try {
          const topic = await addTopic({
            name: topicName,
            description: `Topic automatiquement créé pour le thème ${themeName}`
          });
          
          if (topic && topic.id) {
            // Association avec les contrôles pertinents
            const clauseRefs = themeToClausesMap[themeName] || [];
            if (clauseRefs.length > 0 && Array.isArray(standardClauses) && standardClauses.length > 0) {
              // Filtrer les clauses standards correspondantes
              const relevantClauseIds = standardClauses
                .filter(clause => clause && clause.referenceCode && 
                  clauseRefs.some(ref => clause.referenceCode.startsWith(ref)))
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
      
      // Création des interviews avec le themeId validé
      for (const interview of interviews) {
        if (!interview) continue; // Ignorer les entrées nulles
        
        let startDateTime = new Date();
        let durationMinutes = 30;
        
        // Gestion des formats de date
        if (interview['Date-Heure']) {
          const dateTimeParts = interview['Date-Heure'].split(' → ');
          try {
            startDateTime = new Date(dateTimeParts[0]);
            if (isNaN(startDateTime.getTime())) {
              console.warn(`Invalid date: ${dateTimeParts[0]}, using current date`);
              startDateTime = new Date();
            }
          } catch (error) {
            console.warn(`Invalid date format: ${dateTimeParts[0]}, using current date`);
          }
          
          if (dateTimeParts.length > 1) {
            try {
              const endTime = new Date(dateTimeParts[1]);
              if (!isNaN(endTime.getTime())) {
                durationMinutes = Math.round((endTime.getTime() - startDateTime.getTime()) / (1000 * 60));
                if (durationMinutes <= 0) durationMinutes = 30;
              }
            } catch (error) {
              console.warn(`Invalid end date format, using default duration of 30 minutes`);
            }
          }
        }
        
        // Utiliser durationMinutes de l'interview ou la valeur par défaut/calculée
        durationMinutes = interview.durationMinutes || durationMinutes;
        
        try {
          const interviewData = {
            auditId,
            themeId,
            title: interview['Titre'] || `Interview: ${themeName}`,
            description: `Thématique: ${themeName}`,
            startTime: startDateTime.toISOString(),
            durationMinutes: durationMinutes,
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

// Fonction pour générer un plan standard avec des dates relatives
const createStandardPlan = (): AuditInterview[] => {
  console.log('Creating standard plan with relative dates');
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  
  // Créer des heures de début raisonnables
  const morningStart = new Date(now);
  morningStart.setHours(9, 0, 0, 0);
  
  const afternoonStart = new Date(now);
  afternoonStart.setHours(14, 0, 0, 0);
  
  const tomorrowMorningStart = new Date(tomorrow);
  tomorrowMorningStart.setHours(9, 0, 0, 0);
  
  const tomorrowAfternoonStart = new Date(tomorrow);
  tomorrowAfternoonStart.setHours(14, 0, 0, 0);

  // Générer des IDs uniques pour les interviews du plan standard
  const genInterviewId = () => `interview-standard-${Math.random().toString(36).substring(2, 7)}`;
  
  const standardPlan = [
    {
      id: genInterviewId(),
      startTime: morningStart.toISOString(),
      themeId: 'theme-1',
      title: 'Réunion d\'ouverture',
      description: 'Présentation de l\'audit et des objectifs',
      durationMinutes: 60,
      location: 'Salle de réunion principale',
    },
    {
      id: genInterviewId(),
      startTime: afternoonStart.toISOString(),
      themeId: 'theme-2',
      title: 'Sécurité des communications',
      description: 'Revue des mécanismes de protection des communications',
      durationMinutes: 90,
      location: 'Bureau DSI',
      controlRefs: 'A.8.15 Sécurité des communications, A.8.16 Transfert d\'informations',
    },
    {
      id: genInterviewId(),
      startTime: tomorrowMorningStart.toISOString(),
      themeId: 'theme-5',
      title: 'Gestion des ressources humaines',
      description: 'Sécurité des RH et sensibilisation du personnel',
      durationMinutes: 90,
      location: 'Salle de formation',
      controlRefs: 'A.7 Sécurité des ressources humaines',
    },
    {
      id: genInterviewId(),
      startTime: tomorrowAfternoonStart.toISOString(),
      themeId: 'theme-12',
      title: 'Réunion de clôture',
      description: 'Présentation des conclusions préliminaires',
      durationMinutes: 60,
      location: 'Salle de réunion principale',
    }
  ];
  
  return standardPlan as unknown as AuditInterview[];
};
