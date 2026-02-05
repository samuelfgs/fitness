"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "@/components/ui/Button";

interface SubmitButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" loading={pending} disabled={pending || props.disabled}>
      {children}
    </Button>
  );
}
