export type Priority = "Baixa" | "Média" | "Alta" | "Urgente";
export type Status =
  | "Aberta"
  | "Em Andamento"
  | "Aguardando Peças"
  | "Concluída"
  | "Cancelada";

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
}

export interface Technician {
  id: string;
  nome: string;
  especialidade?: string;
}

export interface ServiceType {
  id: string;
  nome: string;
  precoBase?: number;
  precoMinimo?: number;
  precoMaximo?: number;
  descricao?: string;
  ativo?: boolean;
}

export interface OrderUpdate {
  data: string; // ISO
  descricao: string;
  status?: Status;
}

export interface WorkOrder {
  id: string; // OS number
  clienteId: string;
  tipoServicoId: string; // Mantido para compatibilidade
  tiposServico?: Array<{
    id: string;
    nome: string;
    valor: number;
  }>;
  descricaoProblema: string;
  prioridade: Priority;
  status: Status;
  dataAbertura: string; // ISO
  previsaoConclusao?: string; // ISO
  tecnicoId?: string;
  historico: OrderUpdate[];
  valorServico?: number;
  valorPecas?: number;
  valorDeslocamento?: number;
  valorTotal?: number;
  desconto?: number;
  formaPagamento?: string;
  statusPagamento?: 'Pendente' | 'Pago' | 'Parcial' | 'Cancelado';
  dataPagamento?: string; // ISO
  observacoesFinanceiras?: string;
}

export interface CompanyData {
  id?: string;
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}
