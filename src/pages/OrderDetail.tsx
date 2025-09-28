import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useData } from "@/context/DataContext";
import { useParams, useNavigate } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { useState, useRef, useEffect } from "react";
import { Edit, Trash2, Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { useReactToPrint } from "react-to-print";
import PrintableOS from "@/components/PrintableOS";
import { supabase } from "@/integrations/supabase/client";
import { CompanyData } from "@/types";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    workOrders,
    clients,
    technicians,
    serviceTypes,
    updateOrderStatus,
    deleteOrder,
  } = useData();
  const order = workOrders.find((o) => o.id === id);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Todos os hooks devem estar antes de qualquer return condicional
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `OS-${order?.id || 'unknown'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const { data, error } = await supabase
          .from('empresa')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar dados da empresa:', error);
        } else if (data) {
          setCompanyData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };

    loadCompanyData();
  }, []);

  // Verificação condicional após todos os hooks
  if (!order) return <div>OS não encontrada</div>;

  const clienteObj = clients.find((c) => c.id === order.clienteId);
  const cliente = clienteObj?.nome;
  const tecnicoObj = technicians.find((t) => t.id === order.tecnicoId);
  const tecnico = tecnicoObj?.nome || "-";
  const tipoServicoObj = serviceTypes.find((ts) => ts.id === order.tipoServicoId);
  const tipoServico = tipoServicoObj?.nome || "-";
  
  // Obter todos os tipos de serviço para múltiplos serviços
  const tiposServicoArray = serviceTypes.filter(ts => 
    order.tiposServico?.some(tipo => tipo.id === ts.id) || ts.id === order.tipoServicoId
  );

  const handleEdit = () => {
    navigate(`/ordens/${order.id}/editar`);
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(order.id);
      navigate("/ordens");
    } catch (error) {
      console.error("Erro ao excluir OS:", error);
    }
  };

  return (
    <div>
      <SEO
        title={`Service PRO — OS ${order.id}`}
        description="Detalhes da ordem de serviço"
      />
      <h1 className="text-2xl font-semibold mb-4">OS #{order.id}</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informações da OS</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a OS #{order.id}? Esta
                      ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
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
        <CardContent className="space-y-3">
          <div>
            <span className="text-muted-foreground">Cliente:</span> {cliente}
          </div>
          <div>
            <span className="text-muted-foreground">Técnico:</span> {tecnico}
          </div>
          <div>
            <span className="text-muted-foreground">Tipo(s) de Serviço:</span>
            <div className="mt-1">
              {order.tiposServico && order.tiposServico.length > 0 ? (
                order.tiposServico.map((tipo, index) => (
                  <div key={index} className="text-sm">
                    • {serviceTypes.find(st => st.id === tipo.id)?.nome || 'Serviço não encontrado'}
                    {tipo.valor && ` - R$ ${tipo.valor.toFixed(2).replace('.', ',')}`}
                  </div>
                ))
              ) : (
                <div className="text-sm">• {tipoServico}</div>
              )}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Problema:</span>{" "}
            {order.descricaoProblema}
          </div>
          <div>
            <span className="text-muted-foreground">
              Previsão de Conclusão:
            </span>{" "}
            {order.previsaoConclusao
              ? format(new Date(order.previsaoConclusao), "dd/MM/yyyy", {
                  locale: ptBR,
                })
              : "Não definida"}
          </div>
          <div className="flex gap-2">
            <StatusBadge status={order.status} />
            <PriorityBadge prioridade={order.prioridade} />
          </div>
        </CardContent>
      </Card>
      
      {/* Card de Informações Financeiras */}
      <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações Financeiras</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/ordens/${order.id}/editar-financeiro`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Valor do(s) Serviço(s):</span>
                <div className="font-medium">
                  {order.tiposServico && order.tiposServico.length > 0 ? (
                    <div className="space-y-1">
                      {order.tiposServico.map((tipo, index) => {
                        const serviceName = serviceTypes.find(st => st.id === tipo.id)?.nome || 'Serviço';
                        const valor = tipo.valor || (order.valorServico ? order.valorServico / order.tiposServico.length : 0);
                        return (
                          <div key={index} className="text-sm">
                            {serviceName}: R$ {valor.toFixed(2).replace('.', ',')}
                          </div>
                        );
                      })}
                      <div className="border-t pt-1 font-semibold">
                        Total: {order.valorServico ? `R$ ${order.valorServico.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                      </div>
                    </div>
                  ) : (
                    order.valorServico ? `R$ ${order.valorServico.toFixed(2).replace('.', ',')}` : 'Não informado'
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Valor das Peças:</span>
                <div className="font-medium">
                  {order.valorPecas ? `R$ ${order.valorPecas.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Valor do Deslocamento:</span>
                <div className="font-medium">
                  {order.valorDeslocamento ? `R$ ${order.valorDeslocamento.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Desconto:</span>
                <div className="font-medium">
                  {order.desconto ? `R$ ${order.desconto.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                </div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Valor Total:</span>
                <span className="text-green-600">
                  {order.valorTotal ? `R$ ${order.valorTotal.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-muted-foreground">Forma de Pagamento:</span>
                <div className="font-medium">
                  {order.formaPagamento || 'Não informado'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Status do Pagamento:</span>
                <div className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.statusPagamento === 'Pago' ? 'bg-green-100 text-green-800' :
                    order.statusPagamento === 'Parcial' ? 'bg-yellow-100 text-yellow-800' :
                    order.statusPagamento === 'Cancelado' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.statusPagamento || 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
            {order.dataPagamento && (
              <div>
                <span className="text-muted-foreground">Data do Pagamento:</span>
                <div className="font-medium">
                  {format(new Date(order.dataPagamento), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </div>
            )}
            {order.observacoesFinanceiras && (
              <div>
                <span className="text-muted-foreground">Observações Financeiras:</span>
                <div className="font-medium mt-1 p-2 bg-gray-50 rounded">
                  {order.observacoesFinanceiras}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Card de Atualizar Status */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Atualizar Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="mb-3 block">Status Atual</Label>
            <div className="mb-4">
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div>
            <Label className="mb-3 block">Clique para alterar o status</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Aberta",
                "Em Andamento",
                "Aguardando Peças",
                "Concluída",
                "Cancelada",
              ].map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => {
                    updateOrderStatus(order.id, statusOption as any);
                  }}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80 cursor-pointer ${
                    statusOption === "Aberta" ? "bg-accent text-foreground" :
                    statusOption === "Em Andamento" ? "bg-primary/15 text-primary" :
                    statusOption === "Aguardando Peças" ? "bg-muted text-muted-foreground" :
                    statusOption === "Concluída" ? "bg-green-500/15 text-green-700 dark:text-green-300" :
                    "bg-destructive/15 text-destructive"
                  } ${
                    statusOption === order.status ? "ring-2 ring-primary" : ""
                  }`}
                  disabled={statusOption === order.status}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {order.historico.map((h, idx) => (
              <li key={idx} className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">
                  {new Date(h.data).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}
                </div>
                <div>{h.descricao}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Componente oculto para impressão */}
      <div className="hidden">
        {clienteObj && (tiposServicoArray.length > 0 || tipoServicoObj) && (
          <PrintableOS
            ref={printRef}
            order={order}
            client={clienteObj}
            technician={tecnicoObj}
            serviceType={tipoServicoObj}
            serviceTypes={tiposServicoArray}
            companyInfo={companyData ? {
              name: companyData.nome,
              address: `${companyData.endereco}, ${companyData.numero} - ${companyData.bairro}, ${companyData.cidade}/${companyData.estado} - CEP: ${companyData.cep}`,
              phone: companyData.telefone,
              email: companyData.email,
              cnpj: companyData.cnpj
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}
