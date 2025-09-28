import { Client, Technician, ServiceType, WorkOrder } from '@/types';
import { addDays, subDays, formatISO } from 'date-fns';

// Helpers
const today = new Date();
const iso = (d: Date) => formatISO(d, { representation: 'complete' });

export const clients: Client[] = [
  { id: 'c1', nome: 'Maria Silva', telefone: '(11) 99999-1111', email: 'maria@example.com', endereco: 'Rua das Flores, 123 - SP' },
  { id: 'c2', nome: 'João Souza', telefone: '(11) 98888-2222', email: 'joao@example.com', endereco: 'Av. Paulista, 1000 - SP' },
  { id: 'c3', nome: 'Ana Oliveira', telefone: '(21) 97777-3333', email: 'ana@example.com', endereco: 'Rua Copacabana, 50 - RJ' },
  { id: 'c4', nome: 'Carlos Pereira', telefone: '(31) 96666-4444', email: 'carlos@example.com', endereco: 'Praça da Liberdade, 10 - BH' },
  { id: 'c5', nome: 'Fernanda Lima', telefone: '(41) 95555-5555', email: 'fernanda@example.com', endereco: 'Rua XV de Novembro, 80 - CTBA' },
  { id: 'c6', nome: 'Ricardo Santos', telefone: '(51) 94444-6666', email: 'ricardo@example.com', endereco: 'Rua dos Andradas, 700 - POA' },
  { id: 'c7', nome: 'Paula Costa', telefone: '(85) 93333-7777', email: 'paula@example.com', endereco: 'Av. Beira Mar, 200 - FOR' },
  { id: 'c8', nome: 'Bruno Almeida', telefone: '(62) 92222-8888', email: 'bruno@example.com', endereco: 'Rua 24, 300 - GYN' },
  { id: 'c9', nome: 'Luciana Rocha', telefone: '(47) 91111-9999', email: 'luciana@example.com', endereco: 'Rua Blumenau, 15 - BLU' },
  { id: 'c10', nome: 'Rafael Gomes', telefone: '(19) 90000-1010', email: 'rafael@example.com', endereco: 'Av. Campinas, 55 - CAMP' },
  { id: 'c11', nome: 'Aline Ferreira', telefone: '(11) 91234-5678', email: 'aline@example.com', endereco: 'Rua Aurora, 12 - SP' },
  { id: 'c12', nome: 'Marcelo Dias', telefone: '(21) 99876-5432', email: 'marcelo@example.com', endereco: 'Rua Atlântica, 300 - RJ' },
  { id: 'c13', nome: 'Bianca Nunes', telefone: '(31) 98765-4321', email: 'bianca@example.com', endereco: 'Av. Contorno, 500 - BH' },
  { id: 'c14', nome: 'Gustavo Melo', telefone: '(41) 97654-3210', email: 'gustavo@example.com', endereco: 'Rua Curitiba, 90 - CTBA' },
  { id: 'c15', nome: 'Patrícia Mendes', telefone: '(51) 96543-2109', email: 'patricia@example.com', endereco: 'Av. Ipiranga, 1200 - POA' },
];

export const technicians: Technician[] = [
  { id: 't1', nome: 'Eduardo Lima', especialidade: 'Eletricista' },
  { id: 't2', nome: 'Juliana Castro', especialidade: 'Informática' },
  { id: 't3', nome: 'Felipe Araújo', especialidade: 'Hidráulica' },
  { id: 't4', nome: 'Carolina Prado', especialidade: 'Refrigeração' },
  { id: 't5', nome: 'Thiago Martins', especialidade: 'Instalação' },
];

export const serviceTypes: ServiceType[] = [
  { id: 's1', nome: 'Manutenção' },
  { id: 's2', nome: 'Reparo' },
  { id: 's3', nome: 'Instalação' },
  { id: 's4', nome: 'Atualização' },
  { id: 's5', nome: 'Inspeção' },
];

const statuses = ['Aberta','Em Andamento','Aguardando Peças','Concluída','Cancelada'] as const;
const priorities = ['Baixa','Média','Alta','Urgente'] as const;

const sampleDesc = [
  'Equipamento não liga após queda de energia.',
  'Vazamento identificado no encanamento do banheiro.',
  'Computador com lentidão e travamentos constantes.',
  'Ar-condicionado não resfria adequadamente.',
  'Instalação de novos pontos de rede.',
  'Atualização de firmware pendente.',
];

function pick<T>(arr: readonly T[]) { return arr[Math.floor(Math.random()*arr.length)]; }

export const workOrders: WorkOrder[] = Array.from({ length: 22 }).map((_, i) => {
  const created = subDays(today, Math.floor(Math.random()*25));
  const due = addDays(created, Math.floor(Math.random()*10)+2);
  const status = pick(statuses);
  const priority = pick(priorities);
  const cli = clients[Math.floor(Math.random()*clients.length)];
  const tech = technicians[Math.floor(Math.random()*technicians.length)];
  const type = serviceTypes[Math.floor(Math.random()*serviceTypes.length)];
  return {
    id: String(1000 + i),
    clienteId: cli.id,
    tipoServicoId: type.id,
    descricaoProblema: pick(sampleDesc),
    prioridade: priority,
    status,
    dataAbertura: iso(created),
    previsaoConclusao: iso(due),
    tecnicoId: tech.id,
    historico: [
      { data: iso(created), descricao: 'OS criada', status: 'Aberta' },
      { data: iso(addDays(created, 1)), descricao: 'Análise inicial realizada', status: status === 'Aberta' ? 'Em Andamento' : status },
    ],
  };
});
