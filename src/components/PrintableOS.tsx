import React from "react";
import { WorkOrder, Client, Technician, ServiceType } from "../types";

interface PrintableOSProps {
  order: WorkOrder;
  client: Client;
  technician?: Technician;
  serviceType?: ServiceType; // Mantido para compatibilidade
  serviceTypes?: ServiceType[]; // Array de tipos de serviço
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    cnpj?: string;
  };
}

const PrintableOS = React.forwardRef<HTMLDivElement, PrintableOSProps>(
  ({ order, client, technician, serviceType, serviceTypes, companyInfo }, ref) => {
    
    // Determinar quais tipos de serviço usar
    const tiposServico = serviceTypes || (serviceType ? [serviceType] : []);
    const tiposServicoOrder = order.tiposServico || [];
    
    // Se temos múltiplos serviços na order, usar eles; senão usar os tipos de serviço passados
    const servicosParaExibir = tiposServicoOrder.length > 0 ? tiposServicoOrder : 
      (tiposServico.length > 0 ? tiposServico.map((ts, index) => ({ 
        id: ts.id, 
        nome: ts.nome, 
        valor: tiposServico.length === 1 ? (order.valorServico || 0) : 
               Math.round(((order.valorServico || 0) / tiposServico.length) * 100) / 100
      })) : []);
    
    // Função para obter informações do tipo de serviço
    const obterInfoTipoServico = (tipoId: string) => {
      return tiposServico.find(t => t.id === tipoId) || { id: tipoId, nome: 'Serviço não encontrado' };
    };
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("pt-BR");
    };

    const formatDateTime = (dateString: string) => {
      return new Date(dateString).toLocaleString("pt-BR");
    };

    const defaultCompanyInfo = {
      name: "Service PRO",
      address: "Rua das Empresas, 123 - Centro",
      phone: "(11) 99999-9999",
      email: "contato@servicepro.com.br",
      cnpj: "12.345.678/0001-90",
    };

    const company = companyInfo || defaultCompanyInfo;

    return (
      <div
        ref={ref}
        className="printable-os bg-white text-black p-8 max-w-4xl mx-auto"
      >
        {/* Cabeçalho da Empresa */}
        <div className="border-b-2 border-gray-800 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {company.name}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{company.address}</p>
                <p>
                  Tel: {company.phone} | Email: {company.email}
                </p>
                {company.cnpj && <p>CNPJ: {company.cnpj}</p>}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gray-800 text-white px-4 py-2 rounded">
                <h2 className="text-xl font-bold">ORDEM DE SERVIÇO</h2>
                <p className="text-lg">Nº {order.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold bg-gray-100 p-3 border-l-4 border-blue-500 mb-3">
            DADOS DO CLIENTE
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <span className="font-semibold">Nome:</span> {client.nome}
              </p>
              <p>
                <span className="font-semibold">Telefone:</span>{" "}
                {client.telefone}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Email:</span> {client.email}
              </p>
              <p>
                <span className="font-semibold">Endereço:</span>{" "}
                {client.endereco}
              </p>
            </div>
          </div>
        </div>

        {/* Informações da OS */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold bg-gray-100 p-3 border-l-4 border-green-500 mb-3">
            INFORMAÇÕES DO SERVIÇO
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div>
                <span className="font-semibold">Tipo(s) de Serviço:</span>
                {servicosParaExibir.length > 0 ? (
                  <ul className="mt-1 ml-4">
                    {servicosParaExibir.map((tipo, index) => (
                      <li key={index} className="text-sm">
                        • {tipo.nome} - R$ {tipo.valor.toFixed(2).replace('.', ',')}
                      </li>
                    ))}
                  </ul>
                ) : serviceType ? (
                  <span className="ml-2">{serviceType.nome}</span>
                ) : (
                  <span className="ml-2 text-gray-500">Não informado</span>
                )}
              </div>
              <p>
                <span className="font-semibold">Prioridade:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-sm ${
                    order.prioridade === "Urgente"
                      ? "bg-red-100 text-red-800"
                      : order.prioridade === "Alta"
                      ? "bg-orange-100 text-orange-800"
                      : order.prioridade === "Média"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {order.prioridade}
                </span>
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Data de Abertura:</span>{" "}
                {formatDate(order.dataAbertura)}
              </p>
              {order.previsaoConclusao && (
                <p>
                  <span className="font-semibold">Previsão de Conclusão:</span>{" "}
                  {formatDate(order.previsaoConclusao)}
                </p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <p>
              <span className="font-semibold">Status:</span>
              <span
                className={`ml-2 px-2 py-1 rounded text-sm ${
                  order.status === "Concluída"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Em Andamento"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "Aguardando Peças"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "Cancelada"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </p>
            {technician && (
              <p>
                <span className="font-semibold">Técnico Responsável:</span>{" "}
                {technician.nome}
              </p>
            )}
          </div>
        </div>

        {/* Descrição do Problema */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold bg-gray-100 p-3 border-l-4 border-purple-500 mb-3">
            DESCRIÇÃO DO PROBLEMA
          </h3>
          <div className="border border-gray-300 p-4 min-h-24 bg-gray-50">
            <p className="whitespace-pre-wrap">{order.descricaoProblema}</p>
          </div>
        </div>

        {/* Histórico de Atualizações */}
        {order.historico && order.historico.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold bg-gray-100 p-3 border-l-4 border-indigo-500 mb-3">
              HISTÓRICO DE ATUALIZAÇÕES
            </h3>
            <div className="space-y-2">
              {order.historico.map((update, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-3 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-600">
                      {formatDateTime(update.data)}
                    </span>
                    {update.status && (
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {update.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{update.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Financeiras */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold bg-gray-100 p-3 border-l-4 border-green-500 mb-3">
            INFORMAÇÕES FINANCEIRAS
          </h3>
          <div className="border border-gray-300">
            {/* Cabeçalho da tabela */}
            <div className="bg-gray-50 border-b border-gray-300 p-3">
              <div className="grid grid-cols-4 gap-4 font-semibold text-sm">
                <div>DESCRIÇÃO</div>
                <div className="text-right">VALOR UNITÁRIO</div>
                <div className="text-center">QTD</div>
                <div className="text-right">VALOR TOTAL</div>
              </div>
            </div>
            
            {/* Linhas de serviços */}
            {servicosParaExibir.length > 0 ? (
              servicosParaExibir.map((tipo, index) => (
                <div key={index} className="p-3 border-b border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>Serviço: {tipo.nome}</div>
                    <div className="text-right">
                      R$ {tipo.valor.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-center">1</div>
                    <div className="text-right">
                      R$ {tipo.valor.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Serviço: {serviceType?.nome || 'Não informado'}</div>
                  <div className="text-right">
                    {order.valorServico ? `R$ ${order.valorServico.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                  </div>
                  <div className="text-center">1</div>
                  <div className="text-right">
                    {order.valorServico ? `R$ ${order.valorServico.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Linha de peças (se houver) */}
            {order.valorPecas && order.valorPecas > 0 && (
              <div className="p-3 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Peças e Materiais</div>
                  <div className="text-right">
                    R$ {order.valorPecas.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-center">1</div>
                  <div className="text-right">
                    R$ {order.valorPecas.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            )}
            
            {/* Linha de deslocamento (se houver) */}
            {order.valorDeslocamento && order.valorDeslocamento > 0 && (
              <div className="p-3 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Taxa de Deslocamento</div>
                  <div className="text-right">
                    R$ {order.valorDeslocamento.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-center">1</div>
                  <div className="text-right">
                    R$ {order.valorDeslocamento.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            )}
            
            {/* Subtotal e desconto */}
            <div className="bg-gray-50 p-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>
                    R$ {((order.valorServico || 0) + (order.valorPecas || 0) + (order.valorDeslocamento || 0)).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                {order.desconto && order.desconto > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Desconto:</span>
                    <span>- R$ {order.desconto.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>VALOR TOTAL:</span>
                  <span className="text-green-600">
                    R$ {(order.valorTotal || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informações de pagamento */}
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm">
                <span className="font-semibold">Forma de Pagamento:</span> {order.formaPagamento || 'Não informado'}
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold">Status do Pagamento:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  order.statusPagamento === 'Pago' ? 'bg-green-100 text-green-800' :
                  order.statusPagamento === 'Parcial' ? 'bg-yellow-100 text-yellow-800' :
                  order.statusPagamento === 'Cancelado' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.statusPagamento || 'Pendente'}
                </span>
              </p>
            </div>
            <div>
              {order.dataPagamento && (
                <p className="text-sm">
                  <span className="font-semibold">Data do Pagamento:</span> {formatDate(order.dataPagamento)}
                </p>
              )}
              {order.observacoesFinanceiras && (
                <p className="text-sm mt-1">
                  <span className="font-semibold">Observações:</span> {order.observacoesFinanceiras}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Campos de Assinatura */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
              <p className="font-semibold">ASSINATURA DO TÉCNICO</p>
              {technician && (
                <p className="text-sm text-gray-600 mt-1">{technician.nome}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Data: ___/___/______</p>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
              <p className="font-semibold">ASSINATURA DO CLIENTE</p>
              <p className="text-sm text-gray-600 mt-1">{client.nome}</p>
              <p className="text-sm text-gray-500 mt-2">Data: ___/___/______</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>
            Este documento foi gerado automaticamente pelo sistema Service PRO
            em {formatDateTime(new Date().toISOString())}
          </p>
        </div>
      </div>
    );
  }
);

PrintableOS.displayName = "PrintableOS";

export default PrintableOS;
