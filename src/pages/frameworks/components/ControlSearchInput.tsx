
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ControlSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ControlSearchInput = ({
  value,
  onChange,
  placeholder = "Rechercher un contrôle..."
}: ControlSearchInputProps) => {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};
