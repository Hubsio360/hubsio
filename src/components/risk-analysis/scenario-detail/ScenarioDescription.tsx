
import React from 'react';
import { RiskScenario } from '@/types';

interface ScenarioDescriptionProps {
  description: string | undefined;
}

const ScenarioDescription: React.FC<ScenarioDescriptionProps> = ({ description }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Description</h3>
      <p className="text-gray-700 dark:text-gray-300">
        {description || "Aucune description fournie."}
      </p>
    </div>
  );
};

export default ScenarioDescription;
