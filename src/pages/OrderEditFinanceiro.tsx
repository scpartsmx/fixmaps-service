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

const schema = z.object({
  valorServico: z.number().min(0, "Valor deve ser positivo").optional(),
  valorPecas: z.number().min(0, "Valor deve ser positivo").optional(),
  valorDeslocamento: z.number().min(0, "Valor deve ser positivo").optional(),
  desconto: z.number().min(0, "Desconto deve ser positivo").optional(),
  formaPagamento: z.string().optional(),
  statusPagamento: z.enum(["Pendente", "Pago", "Parcial", "Cancelado"]).optional(),
  dataPagamento: z.date().optional(),
  observacoesFinanceiras: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OrderEditFinanceiro() {
  const { id } = useParams();
  const { workOrders, updateOrder } = useData();
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
    defaultValues: {
      statusPagamento: "Pendente",
    },
  });

  useEffect(() => {
    if (order) {
      reset({
        valorServico: order.valorServico || 0,
        valorPecas: order.valorPecas || 0,
        valorDeslocamento: order.valorDeslocamento || 0,
        desconto: order.desconto || 0,
        formaPagamento: order.formaPagamento || "",
        statusPagamento: order.statusPagamento || "Pendente",
        dataPagamento: order.dataPagamento ? new Date(order.dataPagamento) : undefined,
        observacoesFinanceiras: order.observacoesFinanceiras || "",
      });
    }
  }, [order, reset]);

  if (!order) {
    return <div>OS não encontrada</div>;
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const valorTotal = 
        (data.valorServico || 0) +
        (data.valorPecas || 0) +
        (data.valorDeslocamento || 0) -
        (data.desconto || 0);

      const updateData: any = {
        valorServico: data.valorServico || 0,
        valorPecas: data.valorPecas || 0,
        valorDeslocamento: data.valorDeslocamento || 0,
        desconto: data.desconto || 0,
        valorTotal,
        formaPagamento: data.formaPagamento || null,
        statusPagamento: data.statusPagamento || "Pendente",
        observacoesFinanceiras: data.observacoesFinanceiras || null,
      };

      if (data.dataPagamento) {
        const localDate = new Date(data.dataPagamento);
        localDate.setHours(12, 0, 0, 0);
        updateData.dataPagamento = localDate.toISOString();
      } else {
        updateData.dataPagamento = null;
      }

      await updateOrder(order.id, updateData);
      navigate(`/ordens/${order.id}`);
    } catch (error) {
      console.error("Erro ao atualizar informações financeiras:", error);
    }
  };

  const date = watch("dataPagamento");
  const valorServico = watch("valorServico") || 0;
  const valorPecas = watch("valorPecas") || 0;
  const valorDeslocamento = watch("valorDeslocamento") || 0;
  const desconto = watch("desconto") || 0;
  const valorTotal = valorServico + valorPecas + valorDeslocamento - desconto;

  return (
    <div>
      <SEO
        title={`Service PRO — Editar Financeiro OS ${order.id}`}
        description="Editar informações financeiras da ordem de serviço"
      />
      <h1 className="text-2xl font-semibold mb-4">
        Editar Informações Financeiras - OS #{order.id}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações Financeiras</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Valor do Serviço (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("valorServico", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.valorServico && (
              <p className="text-sm text-destructive mt-1">
                {errors.valorServico.message}
              </p>
            )}
          </div>
          <div>
            <Label>Valor das Peças (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("valorPecas", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.valorPecas && (
              <p className="text-sm text-destructive mt-1">
                {errors.valorPecas.message}
              </p>
            )}
          </div>
          <div>
            <Label>Valor do Deslocamento (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("valorDeslocamento", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.valorDeslocamento && (
              <p className="text-sm text-destructive mt-1">
                {errors.valorDeslocamento.message}
              </p>
            )}
          </div>
          <div>
            <Label>Desconto (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("desconto", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.desconto && (
              <p className="text-sm text-destructive mt-1">
                {errors.desconto.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-lg font-semibold">Valor Total</Label>
              <div className="text-2xl font-bold text-green-600">
                R$ {valorTotal.toFixed(2).replace(".", ",")}
              </div>
            </div>
          </div>
          <div>
            <Label>Forma de Pagamento</Label>
            <Select
              value={watch("formaPagamento") || ""}
              onValueChange={(v) => setValue("formaPagamento", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status do Pagamento</Label>
            <Select
              value={watch("statusPagamento") || "Pendente"}
              onValueChange={(v) => setValue("statusPagamento", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Parcial">Parcial</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data do Pagamento</Label>
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
                    <span>Selecionar data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => setValue("dataPagamento", d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="md:col-span-2">
            <Label>Observações Financeiras</Label>
            <Textarea
              {...register("observacoesFinanceiras")}
              rows={3}
              placeholder="Observações sobre o pagamento, condições especiais, etc."
            />
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