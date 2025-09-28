import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ClientForm } from "@/components/forms/ClientForm";
import { EditClientForm } from "@/components/forms/EditClientForm";
import { useData } from "@/context/DataContext";
import { useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserPlus,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Clients() {
  const { clients, workOrders, deleteClient } = useData();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filtered = useMemo(
    () =>
      clients.filter((c) =>
        `${c.nome} ${c.email} ${c.telefone}`
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [q, clients]
  );

  // Métricas dos clientes
  const totalClients = clients.length;
  const activeClients = clients.filter((c) =>
    workOrders.some((o) => o.clienteId === c.id && o.status !== "Cancelada")
  ).length;

  const currentMonth = new Date();
  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);

  const newClientsThisMonth = clients.filter((c) => {
    const clientDate = new Date(c.createdAt || c.id); // Fallback para ID se não tiver createdAt
    return clientDate >= startMonth && clientDate <= endMonth;
  }).length;

  const clientsWithMultipleOrders = clients.filter(
    (c) => workOrders.filter((o) => o.clienteId === c.id).length > 1
  ).length;

  const clientStats = [
    {
      title: "Total de Clientes",
      value: totalClients.toString(),
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      textColor: "text-white",
    },
    {
      title: "Clientes Ativos",
      value: activeClients.toString(),
      icon: UserCheck,
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      textColor: "text-white",
    },
    {
      title: "Novos este Mês",
      value: newClientsThisMonth.toString(),
      icon: UserPlus,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      textColor: "text-white",
    },
    {
      title: "Clientes Recorrentes",
      value: clientsWithMultipleOrders.toString(),
      icon: Calendar,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      textColor: "text-white",
    },
  ];

  const handleDelete = async (client: Client) => {
    try {
      await deleteClient(client.id);
      toast({
        title: "Cliente excluído",
        description: `${client.nome} foi excluído com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setEditDialogOpen(true);
  };

  return (
    <div>
      <SEO title="Service PRO — Clientes" description="Gestão de clientes" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {clientStats.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.color} border-0 shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`${stat.textColor} text-sm font-medium opacity-90`}
                  >
                    {stat.title}
                  </p>
                  <p className={`${stat.textColor} text-3xl font-bold mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon
                  className={`${stat.textColor} h-12 w-12 opacity-80`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-md mb-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {clients.length === 0
                    ? "Nenhum cliente cadastrado"
                    : "Nenhum cliente encontrado"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {clients.length === 0
                    ? "Comece adicionando seus primeiros clientes para gerenciar ordens de serviço."
                    : "Tente ajustar os termos da busca ou limpar o filtro."}
                </p>
                {clients.length === 0 && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar Primeiro Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                      </DialogHeader>
                      <ClientForm onSuccess={() => setDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filtered.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{c.nome}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(c)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o cliente "{c.nome}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(c)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {c.email} • {c.telefone}
                </div>
                <div className="mt-2 text-sm">Endereço: {c.endereco}</div>
                <div className="mt-2 text-sm font-medium">
                  OS: {workOrders.filter((o) => o.clienteId === c.id).length}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para editar cliente */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <EditClientForm
              client={editingClient}
              onSuccess={() => {
                setEditDialogOpen(false);
                setEditingClient(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
