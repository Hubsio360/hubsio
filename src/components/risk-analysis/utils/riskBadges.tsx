
import { Badge } from '@/components/ui/badge';
import { RiskLevel, RiskStatus, RiskScope, RiskTreatmentStrategy } from '@/types';

export const getRiskLevelBadge = (level: RiskLevel) => {
  switch (level) {
    case 'low':
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Faible</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Moyen</Badge>;
    case 'high':
      return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">Élevé</Badge>;
    case 'critical':
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Critique</Badge>;
    default:
      return <Badge>{level}</Badge>;
  }
};

export const getRiskStatusBadge = (status: RiskStatus) => {
  switch (status) {
    case 'identified':
      return <Badge variant="outline">Identifié</Badge>;
    case 'analyzed':
      return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Analysé</Badge>;
    case 'treated':
      return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">Traité</Badge>;
    case 'accepted':
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Accepté</Badge>;
    case 'monitored':
      return <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20">Surveillé</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const getRiskScopeBadge = (scope: RiskScope) => {
  switch (scope) {
    case 'technical':
      return <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20">Technique</Badge>;
    case 'organizational':
      return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Organisationnel</Badge>;
    case 'human':
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Humain</Badge>;
    case 'physical':
      return <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20">Physique</Badge>;
    case 'environmental':
      return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Environnemental</Badge>;
    default:
      return <Badge>{scope}</Badge>;
  }
};

export const getRiskTreatmentStrategyBadge = (strategy: RiskTreatmentStrategy) => {
  switch (strategy) {
    case 'reduce':
      return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Réduire</Badge>;
    case 'maintain':
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Maintenir</Badge>;
    case 'avoid':
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Éviter</Badge>;
    case 'share':
      return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">Partager</Badge>;
    default:
      return <Badge>{strategy}</Badge>;
  }
};
