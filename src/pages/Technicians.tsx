import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TechnicianForm } from "@/components/forms/TechnicianForm";
import { EditTechnicianForm } from "@/components/forms/EditTechnicianForm";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  Wrench,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Technicians() {
  const { technicians, workOrders, deleteTechnician } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const { toast } = useToast();

  // Métricas dos técnicos
  const totalTechnicians = technicians.length;
  const activeTechnicians = technicians.filter((t) =>
    workOrders.some(
      (o) =>
        o.tecnicoId === t.id &&
        o.status !== "Concluída" &&
        o.status !== "Cancelada"
    )
  ).length;

  const totalActiveOrders = workOrders.filter(
    (o) => o.status !== "Concluída" && o.status !== "Cancelada"
  ).length;

  const totalCompletedOrders = workOrders.filter(
    (o) => o.status === "Concluída"
  ).length;

  const technicianStats = [
    {
      title: "Total de Técnicos",
      value: totalTechnicians.toString(),
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      textColor: "text-white",
    },
    {
      title: "Técnicos Ativos",
      value: activeTechnicians.toString(),
      icon: UserCheck,
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      textColor: "text-white",
    },
    {
      title: "OS em Andamento",
      value: totalActiveOrders.toString(),
      icon: Wrench,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      textColor: "text-white",
    },
    {
      title: "OS Concluídas",
      value: totalCompletedOrders.toString(),
      icon: CheckCircle,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      textColor: "text-white",
    },
  ];

  const handleEdit = (technician) => {
    setEditingTechnician(technician);
    setEditDialogOpen(true);
  };

  const handleDelete = async (technician) => {
    try {
      await deleteTechnician(technician.id);
      toast({
        title: "Técnico removido",
        description: `${technician.nome} foi removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o técnico.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <SEO
        title="Service PRO — Técnicos"
        description="Gestão de técnicos e atribuições"
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Técnicos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Técnico
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Técnico</DialogTitle>
            </DialogHeader>
            <TechnicianForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {technicianStats.map((stat, index) => (
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

      <div className="grid md:grid-cols-3 gap-4">
        {technicians.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum técnico cadastrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Adicione técnicos à sua equipe para começar a atribuir ordens
                  de serviço.
                </p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Primeiro Técnico
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Técnico</DialogTitle>
                    </DialogHeader>
                    <TechnicianForm onSuccess={() => setDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        ) : (
          technicians.map((t) => {
            const os = workOrders.filter((o) => o.tecnicoId === t.id);
            const ab = os.filter(
              (o) => o.status !== "Concluída" && o.status !== "Cancelada"
            ).length;
            const done = os.filter((o) => o.status === "Concluída").length;
            return (
              <Card key={t.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t.nome}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(t)}
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
                              Tem certeza que deseja excluir o técnico {t.nome}?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(t)}>
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
                    {t.especialidade}
                  </div>
                  <div className="mt-2 text-sm">Total OS: {os.length}</div>
                  <div className="mt-1 text-sm">Em aberto: {ab}</div>
                  <div className="mt-1 text-sm">Concluídas: {done}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {editingTechnician && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Técnico</DialogTitle>
            </DialogHeader>
            <EditTechnicianForm
              technician={editingTechnician}
              onSuccess={() => {
                setEditDialogOpen(false);
                setEditingTechnician(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
