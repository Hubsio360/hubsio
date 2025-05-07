
import React from 'react';
import { Card } from '@/components/ui/card';

interface CtiResultViewerProps {
  content: string;
}

const CtiResultViewer: React.FC<CtiResultViewerProps> = ({ content }) => {
  // Fonction pour traiter le contenu et le formater avec des couleurs
  const formatContent = () => {
    // Rechercher différentes sections et appliquer un formatage spécifique
    let formattedContent = content;
    
    // Convertir les retours à la ligne en éléments JSX
    const paragraphs = formattedContent.split('\n').filter(line => line.trim() !== '');

    return paragraphs.map((paragraph, index) => {
      // Styliser les titres
      if (paragraph.startsWith('# ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-primary mt-6 mb-3">
            {paragraph.substring(2)}
          </h2>
        );
      }
      // Styliser les sous-titres
      else if (paragraph.startsWith('## ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-primary/90 mt-5 mb-2">
            {paragraph.substring(3)}
          </h3>
        );
      }
      // Styliser les sous-sous-titres
      else if (paragraph.startsWith('### ')) {
        return (
          <h4 key={index} className="text-lg font-medium text-primary/80 mt-4 mb-2">
            {paragraph.substring(4)}
          </h4>
        );
      }
      // Styliser les éléments de liste
      else if (paragraph.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-2">
            {paragraph.substring(2)}
          </li>
        );
      }
      // Styliser les éléments de liste numérotés
      else if (/^\d+\.\s/.test(paragraph)) {
        return (
          <li key={index} className="ml-4 list-decimal mb-2">
            {paragraph.substring(paragraph.indexOf('.') + 2)}
          </li>
        );
      }
      // Mettre en évidence les sections importantes
      else if (paragraph.includes('[IMPORTANT]') || paragraph.includes('[ALERTE]') || paragraph.includes('[CRITIQUE]')) {
        return (
          <div key={index} className="p-3 bg-destructive/10 border border-destructive/20 rounded-md my-3 text-destructive">
            {paragraph.replace(/\[(IMPORTANT|ALERTE|CRITIQUE)\]/g, '')}
          </div>
        );
      }
      // Style par défaut pour les paragraphes
      else {
        return <p key={index} className="mb-3">{paragraph}</p>;
      }
    });
  };

  return (
    <Card className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="prose dark:prose-invert max-w-none">
        {formatContent()}
      </div>
    </Card>
  );
};

export default CtiResultViewer;
