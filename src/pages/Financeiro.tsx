import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";

interface WorkOrderFinancial {
  id: string;
  cliente_nome: string;
  valor_total: number;
  status_pagamento: string;
  forma_pagamento: string;
  data_pagamento: string | null;
  data_criacao: string;
  status: string;
}

interface FinancialMetrics {
  receitaTotal: number;
  receitaPaga: number;
  receitaPendente: number;
  totalOrdens: number;
}

export default function Financeiro() {
  const [workOrders, setWorkOrders] = useState<WorkOrderFinancial[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    receitaTotal: 0,
    receitaPaga: 0,
    receitaPendente: 0,
    totalOrdens: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  useEffect(() => {
    loadFinancialData();
  }, [filtroStatus, filtroCliente, dataInicio, dataFim]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Query base
      let query = supabase.from("work_orders").select(`
          id,
          valor_total,
          status_pagamento,
          forma_pagamento,
          data_pagamento,
          created_at,
          status,
          clients!inner(nome)
        `);

      // Aplicar filtros
      if (filtroStatus !== "todos") {
        query = query.eq("status_pagamento", filtroStatus);
      }

      if (filtroCliente) {
        query = query.ilike("clients.nome", `%${filtroCliente}%`);
      }

      if (dataInicio) {
        query = query.gte("created_at", dataInicio);
      }

      if (dataFim) {
        query = query.lte("created_at", dataFim + "T23:59:59");
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Erro ao carregar dados financeiros:", error);
        return;
      }

      // Transformar dados
      const transformedData: WorkOrderFinancial[] =
        data?.map((order) => ({
          id: order.id,
          cliente_nome: order.clients?.nome || "Cliente não encontrado",
          valor_total: order.valor_total || 0,
          status_pagamento: order.status_pagamento || "Pendente",
          forma_pagamento: order.forma_pagamento || "Não informado",
          data_pagamento: order.data_pagamento,
          data_criacao: order.created_at,
          status: order.status,
        })) || [];

      setWorkOrders(transformedData);

      // Calcular métricas
      const receitaTotal = transformedData.reduce(
        (sum, order) => sum + order.valor_total,
        0
      );
      const receitaPaga = transformedData
        .filter((order) => order.status_pagamento === "Pago")
        .reduce((sum, order) => sum + order.valor_total, 0);
      const receitaPendente = receitaTotal - receitaPaga;

      setMetrics({
        receitaTotal,
        receitaPaga,
        receitaPendente,
        totalOrdens: transformedData.length,
      });
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      Pago: { label: "Pago", className: "bg-green-100 text-green-800" },
      Pendente: {
        label: "Pendente",
        className: "bg-yellow-100 text-yellow-800",
      },
      Parcial: { label: "Parcial", className: "bg-blue-100 text-blue-800" },
      Cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status] || statusMap["Pendente"];
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const clearFilters = () => {
    setFiltroStatus("todos");
    setFiltroCliente("");
    setDataInicio("");
    setDataFim("");
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <SEO
        title="Financeiro - Service PRO"
        description="Gestão financeira e controle de receitas"
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Financeiro</h1>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium opacity-90">
                  Receita Total
                </p>
                <p className="text-white text-2xl sm:text-3xl font-bold mt-2 truncate">
                  {formatCurrency(metrics.receitaTotal)}
                </p>
                <p className="text-white text-xs opacity-75 mt-1">
                  {metrics.totalOrdens} ordens de serviço
                </p>
              </div>
              <DollarSign className="text-white h-8 w-8 sm:h-12 sm:w-12 opacity-80 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium opacity-90">
                  Receita Paga
                </p>
                <p className="text-white text-2xl sm:text-3xl font-bold mt-2 truncate">
                  {formatCurrency(metrics.receitaPaga)}
                </p>
                <p className="text-white text-xs opacity-75 mt-1">
                  {(
                    (metrics.receitaPaga / metrics.receitaTotal) * 100 || 0
                  ).toFixed(1)}
                  % do total
                </p>
              </div>
              <CheckCircle className="text-white h-8 w-8 sm:h-12 sm:w-12 opacity-80 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium opacity-90">
                  Receita Pendente
                </p>
                <p className="text-white text-2xl sm:text-3xl font-bold mt-2 truncate">
                  {formatCurrency(metrics.receitaPendente)}
                </p>
                <p className="text-white text-xs opacity-75 mt-1">
                  {(
                    (metrics.receitaPendente / metrics.receitaTotal) * 100 || 0
                  ).toFixed(1)}
                  % do total
                </p>
              </div>
              <Clock className="text-white h-8 w-8 sm:h-12 sm:w-12 opacity-80 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium opacity-90">
                  Ticket Médio
                </p>
                <p className="text-white text-2xl sm:text-3xl font-bold mt-2 truncate">
                  {formatCurrency(
                    metrics.totalOrdens > 0
                      ? metrics.receitaTotal / metrics.totalOrdens
                      : 0
                  )}
                </p>
                <p className="text-white text-xs opacity-75 mt-1">
                  Valor médio por OS
                </p>
              </div>
              <TrendingUp className="text-white h-8 w-8 sm:h-12 sm:w-12 opacity-80 ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="status">Status do Pagamento</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Parcial">Parcial</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                placeholder="Nome do cliente"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Ordens */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <>
              {/* Tabela para desktop */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status Pagamento</TableHead>
                      <TableHead>Forma Pagamento</TableHead>
                      <TableHead>Data Pagamento</TableHead>
                      <TableHead>Data Criação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.cliente_nome}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.valor_total)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status_pagamento)}
                        </TableCell>
                        <TableCell>{order.forma_pagamento}</TableCell>
                        <TableCell>
                          {order.data_pagamento
                            ? format(new Date(order.data_pagamento), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.data_criacao), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cards para mobile */}
              <div className="md:hidden space-y-4">
                {workOrders.map((order) => (
                  <Card key={order.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">#{order.id}</p>
                          <p className="text-sm text-gray-600">{order.cliente_nome}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(order.valor_total)}
                          </p>
                          {getStatusBadge(order.status_pagamento)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Forma Pagamento:</p>
                          <p className="font-medium">{order.forma_pagamento}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Data Pagamento:</p>
                          <p className="font-medium">
                            {order.data_pagamento
                              ? format(new Date(order.data_pagamento), "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "-"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Data Criação:</p>
                          <p className="font-medium">
                            {format(new Date(order.data_criacao), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!loading && workOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma ordem de serviço encontrada com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
