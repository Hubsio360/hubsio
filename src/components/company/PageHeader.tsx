
import { Link } from 'react-router-dom';
import { Plus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Company } from '@/types';

interface PageHeaderProps {
  company: Company;
}

const PageHeader = ({ company }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <div className="flex items-center mb-2">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
          >
            Clients
          </Link>
          <span className="text-muted-foreground text-sm mr-2">/</span>
          <h1 className="text-2xl font-bold">{company.name}</h1>
        </div>
        <p className="text-muted-foreground">{company.activity}</p>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link to={`/risk-analysis/${company.id}`}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Analyse des risques
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/new-audit/${company.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel audit
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
