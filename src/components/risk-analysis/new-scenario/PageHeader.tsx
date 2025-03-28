
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

interface PageHeaderProps {
  companyId: string;
  companyName: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ companyId, companyName }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Link
          to={`/company/${companyId}`}
          className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
        >
          {companyName}
        </Link>
        <span className="text-muted-foreground text-sm mr-2">/</span>
        <Link
          to={`/risk-analysis/${companyId}`}
          className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
        >
          Analyse des risques
        </Link>
        <span className="text-muted-foreground text-sm mr-2">/</span>
        <h1 className="text-2xl font-bold flex items-center">
          <ShieldAlert className="mr-2 h-6 w-6 text-amber-500" />
          Nouveau scénario de risque
        </h1>
      </div>
    </div>
  );
};

export default PageHeader;
