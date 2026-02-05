"use client";

import { Trash2 } from "lucide-react";
import { deleteWaterLog } from "@/app/actions/water";
import { useTransition } from "react";

interface DeleteWaterLogButtonProps {
  id: string;
}

export function DeleteWaterLogButton({ id }: DeleteWaterLogButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      startTransition(async () => {
        try {
          await deleteWaterLog(id);
        } catch (error) {
          console.error("Failed to delete water log:", error);
          alert("Erro ao excluir o registro.");
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10 disabled:opacity-50"
      title="Excluir registro"
    >
      <Trash2 size={18} className={isPending ? "animate-pulse" : ""} />
    </button>
  );
}
