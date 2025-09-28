import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { WorkOrder } from "@/types";

const schema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  tipoServicoId: z.string().min(1, "Tipo é obrigatório"),
  descricaoProblema: z.string().min(5, "Descreva o problema"),
  prioridade: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  status: z.enum([
    "Aberta",
    "Em Andamento",
    "Aguardando Peças",
    "Concluída",
    "Cancelada",
  ]),
  previsaoConclusao: z.date().optional(),
  tecnicoId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OrderEdit() {
  const { id } = useParams();
  const { clients, serviceTypes, technicians, workOrders, updateOrder } =
    useData();
  const navigate = useNavigate();
  const order = workOrders.find((o) => o.id === id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prioridade: "Média", status: "Aberta" },
  });

  useEffect(() => {
    if (order) {
      reset({
        clienteId: order.clienteId,
        tipoServicoId: order.tipoServicoId,
        descricaoProblema: order.descricaoProblema,
        prioridade: order.prioridade,
        status: order.status,
        previsaoConclusao: order.previsaoConclusao
          ? new Date(order.previsaoConclusao)
          : undefined,
        tecnicoId: order.tecnicoId || undefined,
      });
    }
  }, [order, reset]);

  if (!order) {
    return <div>OS não encontrada</div>;
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const updateData: any = {
        clienteId: data.clienteId,
        tipoServicoId: data.tipoServicoId,
        descricaoProblema: data.descricaoProblema,
        prioridade: data.prioridade,
        status: data.status,
        tecnicoId: data.tecnicoId || undefined,
      };

      if (data.previsaoConclusao) {
        // Corrigir UTC handling similar ao OrderNew
        const localDate = new Date(data.previsaoConclusao);
        localDate.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de timezone
        updateData.previsaoConclusao = localDate.toISOString();
      }

      await updateOrder(order.id, updateData);
      navigate(`/ordens/${order.id}`);
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
    }
  };

  const date = watch("previsaoConclusao");

  return (
    <div>
      <SEO
        title={`Service PRO — Editar OS ${order.id}`}
        description="Editar ordem de serviço"
      />
      <h1 className="text-2xl font-semibold mb-4">Editar OS #{order.id}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados da OS</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Cliente</Label>
            <Select
              value={watch("clienteId")}
              onValueChange={(v) => setValue("clienteId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clienteId && (
              <p className="text-sm text-destructive mt-1">
                {errors.clienteId.message}
              </p>
            )}
          </div>
          <div>
            <Label>Tipo de Serviço</Label>
            <Select
              value={watch("tipoServicoId")}
              onValueChange={(v) => setValue("tipoServicoId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoServicoId && (
              <p className="text-sm text-destructive mt-1">
                {errors.tipoServicoId.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label>Descrição do Problema</Label>
            <Textarea
              {...register("descricaoProblema")}
              rows={4}
              placeholder="Detalhe o problema"
            />
            {errors.descricaoProblema && (
              <p className="text-sm text-destructive mt-1">
                {errors.descricaoProblema.message}
              </p>
            )}
          </div>
          <div>
            <Label>Prioridade</Label>
            <Select
              value={watch("prioridade")}
              onValueChange={(v) => setValue("prioridade", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Baixa", "Média", "Alta", "Urgente"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Aberta",
                  "Em Andamento",
                  "Aguardando Peças",
                  "Concluída",
                  "Cancelada",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Previsão de Conclusão</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? (
                    format(date, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecionar</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => setValue("previsaoConclusao", d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Técnico Responsável</Label>
            <Select
              value={watch("tecnicoId") || ""}
              onValueChange={(v) => setValue("tecnicoId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/ordens/${order.id}`)}
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Salvar Alterações</Button>
      </div>
    </div>
  );
}
