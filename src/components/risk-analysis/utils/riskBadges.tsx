
import { Badge } from '@/components/ui/badge';
import { RiskLevel, RiskScope, RiskStatus } from '@/types';
import { RiskScenarioScope } from '@/types/risk-scenario';

export const getRiskLevelBadge = (level: RiskLevel) => {
  switch (level) {
    case 'low':
      return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">Faible</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">Moyen</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800">Élevé</Badge>;
    case 'critical':
      return <Badge variant="outline" className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">Critique</Badge>;
    default:
      return <Badge variant="outline">Non défini</Badge>;
  }
};

export const getRiskStatusBadge = (status: RiskStatus) => {
  switch (status) {
    case 'identified':
      return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">Identifié</Badge>;
    case 'analyzed':
      return <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800">Analysé</Badge>;
    case 'treated':
      return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">Traité</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800">Accepté</Badge>;
    case 'monitored':
      return <Badge variant="outline" className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">Surveillé</Badge>;
    default:
      return <Badge variant="outline">Non défini</Badge>;
  }
};

// Fonction pour afficher le badge de scope (technique, organisationnel, etc.)
export const getRiskScopeBadge = (scope: RiskScope | RiskScenarioScope) => {
  switch (scope) {
    case 'technical':
      return <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900/20 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800">Technique</Badge>;
    case 'organizational':
      return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">Organisationnel</Badge>;
    case 'human':
      return <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">Humain</Badge>;
    case 'physical':
      return <Badge variant="outline" className="bg-lime-100 dark:bg-lime-900/20 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800">Physique</Badge>;
    case 'environmental':
      return <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Environnemental</Badge>;
    case 'organization':
      return <Badge variant="outline" className="bg-violet-100 dark:bg-violet-900/20 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800">Organisation</Badge>;
    case 'system':
      return <Badge variant="outline" className="bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">Système</Badge>;
    case 'service':
      return <Badge variant="outline" className="bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800">Service</Badge>;
    case 'process':
      return <Badge variant="outline" className="bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800">Processus</Badge>;
    default:
      return <Badge variant="outline">Non défini</Badge>;
  }
};
