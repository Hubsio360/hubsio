
import { toast as sonnerToast, type Toast } from "sonner";

export type ToastProps = Omit<Toast, "id"> & {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: ({ title, description, variant = "default", ...props }: ToastProps) => {
      sonnerToast[variant === "destructive" ? "error" : "success"](
        title,
        {
          description,
          ...props,
        }
      );
    }
  };
}

export { toast } from "sonner";
