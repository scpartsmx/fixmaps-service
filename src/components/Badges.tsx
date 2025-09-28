import { Badge } from "@/components/ui/badge";
import { Priority, Status } from "@/types";

export const StatusBadge = ({ status }: { status: Status }) => {
  const map: Record<Status, string> = {
    Aberta: "bg-accent text-foreground",
    "Em Andamento": "bg-primary/15 text-primary",
    "Aguardando Peças": "bg-muted text-muted-foreground",
    Concluída: "bg-green-500/15 text-green-700 dark:text-green-300",
    Cancelada: "bg-destructive/15 text-destructive",
  };
  return <Badge className={map[status]}>{status}</Badge>;
};

export const PriorityBadge = ({ prioridade }: { prioridade: Priority }) => {
  const map: Record<Priority, string> = {
    Baixa: "bg-green-500/15 text-green-700 dark:text-green-300",
    Média: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
    Alta: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    Urgente: "bg-red-500/15 text-red-700 dark:text-red-300",
  };
  return <Badge className={map[prioridade]}>{prioridade}</Badge>;
};
