import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Users, Wrench, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { workOrders, clients } = useData();
  const total = workOrders.length;
  const abertas = workOrders.filter((o) => o.status === "Aberta").length;
  const andamento = workOrders.filter(
    (o) => o.status === "Em Andamento"
  ).length;
  const concluidas = workOrders.filter((o) => o.status === "Concluída").length;

  const recent = workOrders.slice(0, 6);

  // Gráfico dos últimos 30 dias - agrupado por dia
  const getLast30DaysData = () => {
    const last30Days = [];
    const today = new Date();

    // Gerar os últimos 30 dias
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayKey = format(date, "dd/MM", { locale: ptBR });
      const fullDate = format(date, "yyyy-MM-dd");

      // Contar ordens para este dia
      const count = workOrders.filter((o) => {
        const orderDate = format(new Date(o.dataAbertura), "yyyy-MM-dd");
        return orderDate === fullDate;
      }).length;

      last30Days.push({ day: dayKey, count, fullDate });
    }

    return last30Days;
  };

  const byDay = getLast30DaysData();

  // Métricas dos últimos 30 dias
  const totalLast30Days = byDay.reduce((sum, day) => sum + day.count, 0);
  const avgPerDay = (totalLast30Days / 30).toFixed(1);
  const maxDay = byDay.reduce((max, day) => day.count > max.count ? day : max, byDay[0]);
  const last7Days = byDay.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const previous7Days = byDay.slice(-14, -7).reduce((sum, day) => sum + day.count, 0);
  const growthRate = previous7Days > 0 ? (((last7Days - previous7Days) / previous7Days) * 100).toFixed(1) : '0';

  const stats = [
    {
      title: "Total de OS",
      value: total.toString(),
      icon: FileText,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      textColor: "text-white",
    },
    {
      title: "Abertas",
      value: abertas.toString(),
      icon: Users,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      textColor: "text-white",
    },
    {
      title: "Em Andamento",
      value: andamento.toString(),
      icon: Wrench,
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      textColor: "text-white",
    },
    {
      title: "Concluídas",
      value: concluidas.toString(),
      icon: CheckCircle,
      color: "bg-gradient-to-br from-red-500 to-pink-500",
      textColor: "text-white",
    },
  ];

  return (
    <div>
      <SEO
        title="Service PRO — Dashboard"
        description="Visão geral das ordens de serviço"
      />
      <h1 className="text-2xl font-semibold mb-4">Dashboard — Service PRO</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
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

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço - Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="day"
                  fontSize={11}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value, name) => [value, "Ordens de Serviço"]}
                  labelFormatter={(label) => {
                    const item = byDay.find((d) => d.day === label);
                    return item ? `Data: ${label}` : label;
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Quantidade"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground">Média Diária</div>
                <div className="text-lg font-semibold">{avgPerDay} OS/dia</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground">Total (30 dias)</div>
                <div className="text-lg font-semibold">{totalLast30Days} OS</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground">Pico</div>
                <div className="text-lg font-semibold">{maxDay.count} OS ({maxDay.day})</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground">Tendência (7 dias)</div>
                <div className={`text-lg font-semibold ${parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(growthRate) >= 0 ? '+' : ''}{growthRate}%
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimas Ordens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div>
                    <div className="font-medium">OS #{o.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {clients.find((c) => c.id === o.clienteId)?.nome}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={o.status} />
                    <PriorityBadge prioridade={o.prioridade} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
