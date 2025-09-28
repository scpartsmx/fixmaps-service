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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ServiceTypeForm } from "@/components/forms/ServiceTypeForm";
import { EditServiceTypeForm } from "@/components/forms/EditServiceTypeForm";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import {
  Plus,
  Settings,
  Edit,
  Trash2,
  Layers,
  CheckCircle,
  DollarSign,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ServiceTypes() {
  const { serviceTypes, workOrders, deleteServiceType } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { toast } = useToast();

  // Métricas dos tipos de serviço
  const totalServiceTypes = serviceTypes.length;
  const activeServiceTypes = serviceTypes.filter(
    (s) => s.ativo !== false
  ).length;

  const totalOrdersFromTypes = workOrders.filter((o) =>
    serviceTypes.some((s) => s.id === o.tipoServicoId)
  ).length;

  const typesWithPricing = serviceTypes.filter(
    (s) => s.precoBase || s.precoMinimo || s.precoMaximo
  ).length;

  const serviceTypeStats = [
    {
      title: "Total de Tipos",
      value: totalServiceTypes.toString(),
      icon: Layers,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      textColor: "text-white",
    },
    {
      title: "Tipos Ativos",
      value: activeServiceTypes.toString(),
      icon: CheckCircle,
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      textColor: "text-white",
    },
    {
      title: "OS Vinculadas",
      value: totalOrdersFromTypes.toString(),
      icon: Activity,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      textColor: "text-white",
    },
    {
      title: "Com Precificação",
      value: typesWithPricing.toString(),
      icon: DollarSign,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      textColor: "text-white",
    },
  ];

  const selectedType = serviceTypes.find((s) => s.id === selected) || null;

  const handleDelete = async (id: string) => {
    await deleteServiceType(id);
    toast({
      title: "Tipo de serviço excluído",
      description: "O tipo de serviço foi removido com sucesso.",
    });
  };

  return (
    <div>
      <SEO
        title="Service PRO — Tipos de Serviço"
        description="Gestão de tipos de serviço"
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tipos de Serviço</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Tipo de Serviço</DialogTitle>
            </DialogHeader>
            <ServiceTypeForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {serviceTypeStats.map((stat, index) => (
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
        {serviceTypes.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum tipo de serviço cadastrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro tipo de serviço para organizar
                  melhor suas ordens.
                </p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Primeiro Tipo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Tipo de Serviço</DialogTitle>
                    </DialogHeader>
                    <ServiceTypeForm onSuccess={() => setDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        ) : (
          serviceTypes.map((s) => {
            const os = workOrders.filter((o) => o.tipoServicoId === s.id);
            return (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      {s.nome}
                    </span>
                    <div className="flex gap-1">
                      <Dialog
                        open={editDialogOpen && selected === s.id}
                        onOpenChange={(open) => {
                          setEditDialogOpen(open);
                          if (!open) setSelected(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelected(s.id);
                              setEditDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Tipo de Serviço</DialogTitle>
                          </DialogHeader>
                          {selectedType && (
                            <EditServiceTypeForm
                              serviceType={selectedType}
                              onSuccess={() => {
                                setEditDialogOpen(false);
                                setSelected(null);
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir este tipo de serviço?
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="text-sm text-muted-foreground">
                            Esta ação não poderá ser desfeita. Isso excluirá
                            permanentemente o tipo de serviço "{s.nome}".
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(s.id)}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Total OS: {os.length}
                    </div>

                    {s.descricao && (
                      <p className="text-sm text-muted-foreground">
                        {s.descricao}
                      </p>
                    )}

                    {(s.precoBase || s.precoMinimo || s.precoMaximo) && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-primary">
                          Precificação:
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {s.precoMinimo && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Mínimo:
                              </span>
                              <span className="font-medium">
                                R$ {s.precoMinimo.toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                          )}
                          {s.precoBase && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Base:
                              </span>
                              <span className="font-medium text-primary">
                                R$ {s.precoBase.toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                          )}
                          {s.precoMaximo && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Máximo:
                              </span>
                              <span className="font-medium">
                                R$ {s.precoMaximo.toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          s.ativo !== false
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {s.ativo !== false ? "Ativo" : "Inativo"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
