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
  
  const displayMap: Record<Status, string> = {
    Aberta: "Abierta",
    "Em Andamento": "En Proceso",
    "Aguardando Peças": "Esperando Piezas",
    Concluída: "Concluida",
    Cancelada: "Cancelada",
  };
  
  return <Badge className={map[status]}>{displayMap[status]}</Badge>;
};

export const PriorityBadge = ({ prioridade }: { prioridade: Priority }) => {
  const map: Record<Priority, string> = {
    Baixa: "bg-green-500/15 text-green-700 dark:text-green-300",
    Média: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
    Alta: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    Urgente: "bg-red-500/15 text-red-700 dark:text-red-300",
  };
  
  const displayMap: Record<Priority, string> = {
    Baixa: "Baja",
    Média: "Media",
    Alta: "Alta",
    Urgente: "Urgente",
  };
  
  return <Badge className={map[prioridade]}>{displayMap[prioridade]}</Badge>;
};
