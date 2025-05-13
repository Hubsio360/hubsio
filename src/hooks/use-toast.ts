
import { toast as sonnerToast, type ToastOptions } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  [key: string]: any;
};

const useToast = () => {
  const toast = ({ title, description, variant, ...props }: ToastProps) => {
    sonnerToast(title, {
      description,
      ...props,
    });
  };

  return { toast };
};

export { useToast, sonnerToast as toast };
