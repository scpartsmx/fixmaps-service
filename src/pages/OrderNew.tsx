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
import { useNavigate } from "react-router-dom";

const schema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  tiposServico: z.array(z.object({
    id: z.string(),
    nome: z.string(),
    valor: z.number()
  })).min(1, "Pelo menos um tipo de serviço é obrigatório"),
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
  valorServico: z.number().min(0, "Valor deve ser positivo").optional(),
  valorPecas: z.number().min(0, "Valor deve ser positivo").optional(),
  valorDeslocamento: z.number().min(0, "Valor deve ser positivo").optional(),
  desconto: z.number().min(0, "Desconto deve ser positivo").optional(),
  formaPagamento: z.string().optional(),
  statusPagamento: z.enum(["Pendente", "Pago", "Parcial", "Cancelado"]).optional(),
  observacoesFinanceiras: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OrderNew() {
  const { clients, serviceTypes, technicians, addOrder } = useData();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prioridade: "Média", status: "Aberta", tiposServico: [] },
  });

  const tiposServicoSelecionados = watch("tiposServico") || [];
  const valorTotalServicos = tiposServicoSelecionados.reduce((total, tipo) => total + tipo.valor, 0);

  const adicionarTipoServico = (tipoServicoId: string) => {
    const tipoServico = serviceTypes.find(t => t.id === tipoServicoId);
    if (tipoServico && !tiposServicoSelecionados.find(t => t.id === tipoServico.id)) {
      const novoTipo = {
        id: tipoServico.id,
        nome: tipoServico.nome,
        valor: tipoServico.precoBase || 0
      };
      const novosTipos = [...tiposServicoSelecionados, novoTipo];
      setValue("tiposServico", novosTipos);
      setValue("valorServico", novosTipos.reduce((total, tipo) => total + tipo.valor, 0));
    }
  };

  const removerTipoServico = (tipoId: string) => {
    const novosTipos = tiposServicoSelecionados.filter(t => t.id !== tipoId);
    setValue("tiposServico", novosTipos);
    setValue("valorServico", novosTipos.reduce((total, tipo) => total + tipo.valor, 0));
  };

  const atualizarValorTipoServico = (tipoId: string, novoValor: number) => {
    const novosTipos = tiposServicoSelecionados.map(t => 
      t.id === tipoId ? { ...t, valor: novoValor } : t
    );
    setValue("tiposServico", novosTipos);
    setValue("valorServico", novosTipos.reduce((total, tipo) => total + tipo.valor, 0));
  };

  const onSubmit = (data: FormValues) => {
    const newId = String(
      Math.max(1000, ...Array.from({ length: 1 }).map(() => 0)) +
        Math.floor(Math.random() * 900) +
        1
    );

    // Garantir que a data de previsão seja tratada corretamente em UTC
    let previsaoConclusaoISO: string | undefined;
    if (data.previsaoConclusao) {
      // Criar uma nova data com o horário local ajustado para UTC
      const localDate = new Date(data.previsaoConclusao);
      // Definir horário para meio-dia para evitar problemas de fuso horário
      localDate.setHours(12, 0, 0, 0);
      previsaoConclusaoISO = localDate.toISOString();
    }

    addOrder({
      id: newId,
      clienteId: data.clienteId,
      tipoServicoId: data.tiposServico[0]?.id || "", // Para compatibilidade com o sistema atual
      tiposServico: data.tiposServico,
      descricaoProblema: data.descricaoProblema,
      prioridade: data.prioridade,
      status: data.status,
      dataAbertura: new Date().toISOString(),
      previsaoConclusao: previsaoConclusaoISO,
      tecnicoId: data.tecnicoId,
      valorServico: data.valorServico,
      valorPecas: data.valorPecas,
      valorDeslocamento: data.valorDeslocamento,
      desconto: data.desconto,
      formaPagamento: data.formaPagamento,
      statusPagamento: data.statusPagamento || "Pendente",
      observacoesFinanceiras: data.observacoesFinanceiras,
    });
    navigate(`/ordens/${newId}`);
  };

  const date = watch("previsaoConclusao");

  return (
    <div>
      <SEO
        title="Service PRO — Nova OS"
        description="Criar nova ordem de serviço"
      />
      <h1 className="text-2xl font-semibold mb-4">Criar Nova OS</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados da OS</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Cliente</Label>
            <Select onValueChange={(v) => setValue("clienteId", v)}>
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
          <div className="md:col-span-2">
            <Label>Tipos de Serviço</Label>
            <Select onValueChange={adicionarTipoServico}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo de serviço para adicionar" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes
                  .filter(t => !tiposServicoSelecionados.find(ts => ts.id === t.id))
                  .map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome} {t.precoBase ? `- R$ ${t.precoBase.toFixed(2)}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tiposServico && (
              <p className="text-sm text-destructive mt-1">
                {errors.tiposServico.message}
              </p>
            )}
            
            {/* Lista de tipos de serviço selecionados */}
            {tiposServicoSelecionados.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium">Serviços Selecionados:</Label>
                {tiposServicoSelecionados.map((tipo) => (
                  <div key={tipo.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <span className="font-medium">{tipo.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tipo.valor}
                        onChange={(e) => atualizarValorTipoServico(tipo.id, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removerTipoServico(tipo.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 border-t border-border bg-muted/30 rounded-lg font-semibold">
                  <span>Total dos Serviços:</span>
                  <span>R$ {valorTotalServicos.toFixed(2)}</span>
                </div>
              </div>
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
              onValueChange={(v) => setValue("prioridade", v as any)}
              defaultValue={"Média"}
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
              onValueChange={(v) => setValue("status", v as any)}
              defaultValue={"Aberta"}
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
            <Select onValueChange={(v) => setValue("tecnicoId", v)}>
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

      <Card className="mt-4">
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
              placeholder="0,00"
              value={watch("valorServico") || valorTotalServicos}
              {...register("valorServico", { valueAsNumber: true })}
              className="bg-muted/50"
              readOnly
            />
            <p className="text-xs text-muted-foreground mt-1">
              Valor calculado automaticamente com base nos serviços selecionados
            </p>
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
              placeholder="0,00"
              {...register("valorPecas", { valueAsNumber: true })}
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
              placeholder="0,00"
              {...register("valorDeslocamento", { valueAsNumber: true })}
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
              placeholder="0,00"
              {...register("desconto", { valueAsNumber: true })}
            />
            {errors.desconto && (
              <p className="text-sm text-destructive mt-1">
                {errors.desconto.message}
              </p>
            )}
          </div>
          <div>
            <Label>Forma de Pagamento</Label>
            <Select onValueChange={(v) => setValue("formaPagamento", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {["Dinheiro", "Cartão de Débito", "Cartão de Crédito", "PIX", "Transferência", "Boleto"].map((forma) => (
                  <SelectItem key={forma} value={forma}>
                    {forma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status do Pagamento</Label>
            <Select
              onValueChange={(v) => setValue("statusPagamento", v as any)}
              defaultValue="Pendente"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Pendente", "Pago", "Parcial", "Cancelado"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Observações Financeiras</Label>
            <Textarea
              {...register("observacoesFinanceiras")}
              rows={3}
              placeholder="Observações sobre pagamento, condições especiais, etc."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit(onSubmit)}>Salvar OS</Button>
      </div>
    </div>
  );
}
