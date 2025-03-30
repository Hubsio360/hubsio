
import React from 'react';
import { RiskLevel } from '@/types';

interface ColorScaleProps {
  value: RiskLevel;
  title?: string;
  description?: string;
  showDescription?: boolean;
}

interface LevelConfig {
  label: string;
  color: string;
  description: string;
}

const ColorScale: React.FC<ColorScaleProps> = ({ 
  value, 
  title, 
  description,
  showDescription = true
}) => {
  // Configuration des niveaux avec leurs couleurs et descriptions
  const levels: Record<RiskLevel, LevelConfig> = {
    'low': {
      label: 'Négligeable',
      color: '#8AE25E', // vert clair
      description: 'Impact négligeable avec conséquence minime sur l\'organisation'
    },
    'medium': {
      label: 'Faible',
      color: '#F9B938', // orange clair
      description: 'Impact faible avec conséquence limitée sur l\'organisation'
    },
    'high': {
      label: 'Significatif',
      color: '#9D7AF8', // violet
      description: 'Impact significatif avec des conséquences notables sur l\'organisation'
    },
    'critical': {
      label: 'Majeur',
      color: '#F56565', // rouge
      description: 'Impact majeur avec des conséquences graves sur l\'organisation'
    }
  };

  // Déterminer la position active basée sur la valeur
  const positions = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };

  const currentPosition = positions[value];
  const currentLevel = levels[value];

  return (
    <div className="space-y-4">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>}
      
      <div className="relative pt-5 pb-10">
        {/* Barre horizontale */}
        <div className="h-1 bg-gray-700 dark:bg-gray-600 w-full absolute top-8"></div>
        
        {/* Points de la barre */}
        <div className="relative flex justify-between">
          {Object.entries(levels).map(([levelKey, level], index) => {
            const isActive = levelKey === value;
            const position = positions[levelKey as RiskLevel];
            
            return (
              <div key={levelKey} className="flex flex-col items-center relative" style={{ flex: '1' }}>
                <div 
                  className={`w-6 h-6 rounded-full z-10 ${isActive ? 'ring-4 ring-opacity-30' : ''}`}
                  style={{ 
                    backgroundColor: level.color,
                    boxShadow: isActive ? `0 0 0 4px ${level.color}33` : 'none'
                  }}
                ></div>
                <p className={`mt-3 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`} style={{ color: isActive ? level.color : '' }}>
                  {level.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description détaillée du niveau sélectionné */}
      {showDescription && (
        <div 
          className="p-6 rounded-lg mt-4" 
          style={{ backgroundColor: `${currentLevel.color}22`, borderColor: currentLevel.color }}
        >
          <h4 className="text-xl font-bold mb-2" style={{ color: currentLevel.color }}>
            {currentLevel.label}
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            {currentLevel.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ColorScale;
