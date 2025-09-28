import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function Reports() {
  const { workOrders, technicians, clients, serviceTypes } = useData();

  // Relatório de Produtividade por Técnico
  const byTech = technicians.map((t) => ({
    name: t.nome,
    concluidas: workOrders.filter(
      (o) => o.tecnicoId === t.id && o.status === "Concluída"
    ).length,
    abertas: workOrders.filter(
      (o) =>
        o.tecnicoId === t.id &&
        o.status !== "Concluída" &&
        o.status !== "Cancelada"
    ).length,
    total: workOrders.filter((o) => o.tecnicoId === t.id).length,
  }));

  // Relatório de Status das OS
  const statusData = [
    {
      name: "Abertas",
      value: workOrders.filter((o) => o.status === "Aberta").length,
    },
    {
      name: "Em Andamento",
      value: workOrders.filter((o) => o.status === "Em Andamento").length,
    },
    {
      name: "Aguardando Peça",
      value: workOrders.filter((o) => o.status === "Aguardando Peça").length,
    },
    {
      name: "Concluídas",
      value: workOrders.filter((o) => o.status === "Concluída").length,
    },
    {
      name: "Canceladas",
      value: workOrders.filter((o) => o.status === "Cancelada").length,
    },
  ].filter((item) => item.value > 0);

  // Relatório de Tipos de Serviço
  const serviceTypeData = serviceTypes
    .map((st) => ({
      name: st.nome,
      quantidade: workOrders.filter((o) => o.tipoServicoId === st.id).length,
    }))
    .filter((item) => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade);

  // Relatório de Clientes Mais Ativos
  const clientData = clients
    .map((c) => ({
      name: c.nome,
      quantidade: workOrders.filter((o) => o.clienteId === c.id).length,
    }))
    .filter((item) => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  // Métricas Gerais
  const totalOS = workOrders.length;
  const osAbertas = workOrders.filter(
    (o) => o.status !== "Concluída" && o.status !== "Cancelada"
  ).length;
  const osConcluidas = workOrders.filter(
    (o) => o.status === "Concluída"
  ).length;
  const taxaConclusao =
    totalOS > 0 ? ((osConcluidas / totalOS) * 100).toFixed(1) : "0";

  // Relatório de OS por Mês (últimos 6 meses)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = format(date, "MMM/yyyy", { locale: ptBR });
    const count = workOrders.filter((o) => {
      const orderDate = new Date(o.dataAbertura);
      return (
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    }).length;
    monthlyData.push({ month: monthYear, quantidade: count });
  }

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Função para adicionar cabeçalho
    const addHeader = () => {
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, pageWidth, 30, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("SERVICE PRO - RELATÓRIO GERENCIAL", pageWidth / 2, 20, {
        align: "center",
      });
      pdf.setTextColor(0, 0, 0);
    };

    // Função para adicionar rodapé
    const addFooter = (pageNum: number) => {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Página ${pageNum}`, pageWidth - margin, pageHeight - 10, {
        align: "right",
      });
      pdf.text(
        `Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
        margin,
        pageHeight - 10
      );
      pdf.setTextColor(0, 0, 0);
    };

    // Função para verificar se precisa de nova página
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 40) {
        pdf.addPage();
        addHeader();
        yPosition = 50;
        return true;
      }
      return false;
    };

    // Função para criar tabela
    const createTable = (headers: string[], data: any[][], startY: number) => {
      const colWidth = (pageWidth - 2 * margin) / headers.length;
      let currentY = startY;

      // Cabeçalho da tabela
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, currentY, pageWidth - 2 * margin, 10, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      headers.forEach((header, index) => {
        pdf.text(header, margin + index * colWidth + 2, currentY + 7);
      });
      currentY += 10;

      // Dados da tabela
      pdf.setFont("helvetica", "normal");
      data.forEach((row, rowIndex) => {
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, "F");
        }
        row.forEach((cell, cellIndex) => {
          pdf.text(
            String(cell),
            margin + cellIndex * colWidth + 2,
            currentY + 6
          );
        });
        currentY += 8;
      });

      return currentY;
    };

    // Primeira página
    addHeader();
    yPosition = 50;

    // Resumo Executivo
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("RESUMO EXECUTIVO", margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    // Box com métricas principais
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 40, 3, 3, "F");
    pdf.setDrawColor(200, 200, 200);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 40, 3, 3, "S");

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("INDICADORES PRINCIPAIS", margin + 10, yPosition + 12);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const metricsText = [
      `• Total de Ordens de Serviço: ${totalOS}`,
      `• Ordens em Aberto: ${osAbertas}`,
      `• Ordens Concluídas: ${osConcluidas}`,
      `• Taxa de Conclusão: ${taxaConclusao}%`,
    ];

    metricsText.forEach((text, index) => {
      pdf.text(text, margin + 10, yPosition + 22 + index * 6);
    });

    yPosition += 50;

    // Status das Ordens de Serviço
    checkNewPage(60);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("DISTRIBUIÇÃO POR STATUS", margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    if (statusData.length > 0) {
      const statusHeaders = ["Status", "Quantidade", "Percentual"];
      const statusRows = statusData.map((item) => [
        item.name,
        item.value.toString(),
        `${((item.value / totalOS) * 100).toFixed(1)}%`,
      ]);
      yPosition = createTable(statusHeaders, statusRows, yPosition) + 10;
    }

    // Produtividade por Técnico
    checkNewPage(80);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("PRODUTIVIDADE POR TÉCNICO", margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    if (byTech.length > 0) {
      const techHeaders = [
        "Técnico",
        "Concluídas",
        "Em Aberto",
        "Total",
        "Taxa Conclusão",
      ];
      const techRows = byTech.map((tech) => [
        tech.name,
        tech.concluidas.toString(),
        tech.abertas.toString(),
        tech.total.toString(),
        tech.total > 0
          ? `${((tech.concluidas / tech.total) * 100).toFixed(1)}%`
          : "0%",
      ]);
      yPosition = createTable(techHeaders, techRows, yPosition) + 10;
    }

    // Tipos de Serviço
    checkNewPage(80);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("TIPOS DE SERVIÇO MAIS SOLICITADOS", margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    if (serviceTypeData.length > 0) {
      const serviceHeaders = ["Tipo de Serviço", "Quantidade", "Percentual"];
      const serviceRows = serviceTypeData
        .slice(0, 10)
        .map((service) => [
          service.name,
          service.quantidade.toString(),
          `${((service.quantidade / totalOS) * 100).toFixed(1)}%`,
        ]);
      yPosition = createTable(serviceHeaders, serviceRows, yPosition) + 10;
    }

    // Clientes Mais Ativos
    checkNewPage(80);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("TOP 10 CLIENTES MAIS ATIVOS", margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    if (clientData.length > 0) {
      const clientHeaders = ["Cliente", "Quantidade de OS", "Percentual"];
      const clientRows = clientData
        .slice(0, 10)
        .map((client) => [
          client.name,
          client.quantidade.toString(),
          `${((client.quantidade / totalOS) * 100).toFixed(1)}%`,
        ]);
      yPosition = createTable(clientHeaders, clientRows, yPosition) + 10;
    }

    // Evolução Mensal
    checkNewPage(60);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("EVOLUÇÃO MENSAL (ÚLTIMOS 6 MESES)", margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    if (monthlyData.length > 0) {
      const monthHeaders = ["Mês/Ano", "Quantidade de OS"];
      const monthRows = monthlyData.map((month) => [
        month.month,
        month.quantidade.toString(),
      ]);
      yPosition = createTable(monthHeaders, monthRows, yPosition) + 10;
    }

    // Adicionar rodapé em todas as páginas
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i);
    }

    // Salvar PDF
    pdf.save(
      `relatorio-service-pro-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`
    );
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Service PRO — Relatórios"
        description="Produtividade e estatísticas"
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <Button onClick={exportToPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium opacity-90">
                  Total de OS
                </p>
                <p className="text-white text-3xl font-bold mt-2">{totalOS}</p>
              </div>
              <FileText className="text-white h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium opacity-90">
                  OS Abertas
                </p>
                <p className="text-white text-3xl font-bold mt-2">
                  {osAbertas}
                </p>
              </div>
              <Clock className="text-white h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium opacity-90">
                  OS Concluídas
                </p>
                <p className="text-white text-3xl font-bold mt-2">
                  {osConcluidas}
                </p>
              </div>
              <CheckCircle className="text-white h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium opacity-90">
                  Taxa de Conclusão
                </p>
                <p className="text-white text-3xl font-bold mt-2">
                  {taxaConclusao}%
                </p>
              </div>
              <TrendingUp className="text-white h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtividade por Técnico */}
        <Card>
          <CardHeader>
            <CardTitle>Produtividade por Técnico</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTech}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="concluidas"
                  stackId="a"
                  fill="hsl(var(--primary))"
                  name="Concluídas"
                />
                <Bar
                  dataKey="abertas"
                  stackId="a"
                  fill="hsl(var(--muted-foreground))"
                  name="Abertas"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status das OS */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Ordens de Serviço</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tipos de Serviço Mais Solicitados */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Serviço Mais Solicitados</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceTypeData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, "Quantidade"]}
                  labelFormatter={(label) => `Serviço: ${label}`}
                />
                <Bar
                  dataKey="quantidade"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Clientes Mais Ativos */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, "Ordens de Serviço"]}
                  labelFormatter={(label) => `Cliente: ${label}`}
                />
                <Bar
                  dataKey="quantidade"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de OS nos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="quantidade"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
