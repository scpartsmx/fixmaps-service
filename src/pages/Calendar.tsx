import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, TrendingUp } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

export default function Calendar() {
  const { workOrders, clients, technicians, serviceTypes } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Obter todas as datas relevantes do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filtrar OS por datas de abertura e previsão
  const getOrdersForDate = (date: Date) => {
    return workOrders.filter((order) => {
      const openingDate = new Date(order.dataAbertura);
      const dueDate = order.previsaoConclusao
        ? new Date(order.previsaoConclusao)
        : null;

      return (
        isSameDay(openingDate, date) || (dueDate && isSameDay(dueDate, date))
      );
    });
  };

  // Obter OS para a data selecionada
  const selectedDateOrders = getOrdersForDate(selectedDate);
  const openingOrders = selectedDateOrders.filter((order) =>
    isSameDay(new Date(order.dataAbertura), selectedDate)
  );
  const dueOrders = selectedDateOrders.filter(
    (order) =>
      order.previsaoConclusao &&
      isSameDay(new Date(order.previsaoConclusao), selectedDate)
  );

  // Estatísticas do mês
  const monthOrders = workOrders.filter((order) => {
    const openingDate = new Date(order.dataAbertura);
    return openingDate >= monthStart && openingDate <= monthEnd;
  });

  const monthDueOrders = workOrders.filter((order) => {
    if (!order.previsaoConclusao) return false;
    const dueDate = new Date(order.previsaoConclusao);
    return dueDate >= monthStart && dueDate <= monthEnd;
  });

  // Função para customizar os dias no calendário
  const modifiers = {
    hasOpening: (date: Date) => {
      return workOrders.some((order) =>
        isSameDay(new Date(order.dataAbertura), date)
      );
    },
    hasDue: (date: Date) => {
      return workOrders.some(
        (order) =>
          order.previsaoConclusao &&
          isSameDay(new Date(order.previsaoConclusao), date)
      );
    },
    hasBoth: (date: Date) => {
      const hasOpening = workOrders.some((order) =>
        isSameDay(new Date(order.dataAbertura), date)
      );
      const hasDue = workOrders.some(
        (order) =>
          order.previsaoConclusao &&
          isSameDay(new Date(order.previsaoConclusao), date)
      );
      return hasOpening && hasDue;
    },
  };

  const modifiersStyles = {
    hasOpening: {
      backgroundColor: "#3b82f6",
      color: "white",
      borderRadius: "50%",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
      fontWeight: "500",
    },
    hasDue: {
      backgroundColor: "#f59e0b",
      color: "white",
      borderRadius: "50%",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
      fontWeight: "500",
    },
    hasBoth: {
      background: "linear-gradient(45deg, #3b82f6 50%, #f59e0b 50%)",
      color: "white",
      borderRadius: "50%",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
      fontWeight: "500",
      border: "2px solid white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
  };

  return (
    <div>
      <SEO
        title="Service PRO — Calendário"
        description="Calendário de ordens de serviço"
      />
      <h1 className="text-2xl font-semibold mb-4">
        Calendário de Ordens de Serviço
      </h1>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium opacity-90">
                  OS Abertas no Mês
                </p>
                <p className="text-white text-3xl font-bold mt-2">
                  {monthOrders.length}
                </p>
              </div>
              <CalendarDays className="text-white h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium opacity-90">
                  Previsões no Mês
                </p>
                <p className="text-white text-3xl font-bold mt-2">
                  {monthDueOrders.length}
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
                  Técnicos Ativos
                </p>
                <p className="text-white text-3xl font-bold mt-2">
                  {technicians.length}
                </p>
              </div>
              <Users className="text-white h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium opacity-90">
                  Concluídas
                </p>
                <p className="text-white text-3xl font-bold mt-2">
                  {workOrders.filter((o) => o.status === "Concluída").length}
                </p>
              </div>
              <TrendingUp className="text-white h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendário */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>OS Abertas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <span>Previsão de Conclusão</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    background:
                      "linear-gradient(45deg, #3b82f6 50%, #f59e0b 50%)",
                  }}
                ></div>
                <span>Ambos</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full h-full flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                onMonthChange={setCurrentMonth}
                locale={ptBR}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="w-full max-w-none scale-110 transform-gpu"
                classNames={{
                  months:
                    "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                  month: "space-y-4 w-full flex-1",
                  table: "w-full h-full border-collapse space-y-1",
                  head_row: "flex w-full",
                  head_cell:
                    "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 flex items-center justify-center h-12",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent [&:has([aria-selected].day-outside)]:bg-transparent [&:has([aria-selected].day-range-end)]:rounded-full flex-1 h-12",
                  day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground mx-auto",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full h-12 w-12 mx-auto",
                  day_today:
                    "bg-accent text-accent-foreground font-semibold rounded-full h-12 w-12 mx-auto",
                  day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  caption:
                    "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-lg font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do dia selecionado */}
        <Card className="h-fit max-h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>
              {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto flex-1">
            {selectedDateOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma OS para esta data
              </p>
            ) : (
              <>
                {openingOrders.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">
                      OS Abertas ({openingOrders.length})
                    </h4>
                    <div className="space-y-2">
                      {openingOrders.map((order) => {
                        const cliente =
                          clients.find((c) => c.id === order.clienteId)?.nome ||
                          "Cliente não encontrado";
                        const tecnico =
                          technicians.find((t) => t.id === order.tecnicoId)
                            ?.nome || "Não atribuído";
                        return (
                          <div
                            key={`opening-${order.id}`}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">
                                OS #{order.id}
                              </span>
                              <div className="flex gap-1">
                                <StatusBadge status={order.status} />
                                <PriorityBadge prioridade={order.prioridade} />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Cliente: {cliente}
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                              Técnico: {tecnico}
                            </p>
                            <p className="text-sm">{order.descricaoProblema}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {dueOrders.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-amber-600 mb-2">
                      Previsão de Conclusão ({dueOrders.length})
                    </h4>
                    <div className="space-y-2">
                      {dueOrders.map((order) => {
                        const cliente =
                          clients.find((c) => c.id === order.clienteId)?.nome ||
                          "Cliente não encontrado";
                        const tecnico =
                          technicians.find((t) => t.id === order.tecnicoId)
                            ?.nome || "Não atribuído";
                        return (
                          <div
                            key={`due-${order.id}`}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">
                                OS #{order.id}
                              </span>
                              <div className="flex gap-1">
                                <StatusBadge status={order.status} />
                                <PriorityBadge prioridade={order.prioridade} />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Cliente: {cliente}
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                              Técnico: {tecnico}
                            </p>
                            <p className="text-sm">{order.descricaoProblema}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
