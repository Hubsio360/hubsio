
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  action?: React.ReactNode;
};

export function useToast() {
  const toast = ({ title, description, variant, ...props }: ToastProps) => {
    sonnerToast(title, {
      description,
      className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : 
                variant === "success" ? "bg-green-500 text-white" : undefined,
      ...props,
    });
  };

  return {
    toast,
  };
}

export { useToast as toast };
