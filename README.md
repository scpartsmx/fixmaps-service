# Service PRO

## 📋 Descrição

O **Service PRO** é uma aplicação web moderna para gestão de ordens de serviço, desenvolvida especificamente para empresas de assistência técnica. O sistema permite gerenciar clientes, técnicos, tipos de serviço e ordens de trabalho de forma eficiente e organizada.

## 🚀 Tecnologias

### Frontend

- **React 18.3.1** com TypeScript
- **Vite** - Build tool e servidor de desenvolvimento
- **React Router DOM** - Roteamento
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Sistema de componentes (Radix UI)
- **React Hook Form** + **Zod** - Formulários e validação
- **Recharts** - Gráficos e relatórios
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas
- **Sonner** - Notificações
- **React Hook Form** + **Zod** - Formulários e validação avançada
- **React Calendar** - Componente de calendário
- **React Print** - Funcionalidades de impressão

### Backend/Banco de Dados

- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança
- **React Query** - Gerenciamento de estado servidor

## 🏗️ Estrutura do Projeto

```
src/
├── auth/           # Autenticação e proteção de rotas
├── components/     # Componentes reutilizáveis
│   ├── forms/      # Formulários específicos (Cliente, Técnico, Tipo de Serviço)
│   ├── ui/         # Componentes shadcn/ui
│   ├── PrintableOS.tsx  # Componente para impressão de OS
│   ├── Badges.tsx       # Badges de status e prioridade
│   └── StatsCards.tsx   # Cards de estatísticas
├── context/        # Context API para estado global
├── data/           # Dados mock para desenvolvimento
├── hooks/          # Hooks customizados (tema, toast, mobile)
├── integrations/   # Integrações (Supabase)
├── layout/         # Layout da aplicação com sidebar
├── lib/            # Utilitários
├── pages/          # Páginas da aplicação
│   ├── Financeiro.tsx   # Módulo financeiro
│   ├── Calendar.tsx     # Calendário de ordens
│   └── OrderEditFinanceiro.tsx  # Edição financeira de OS
└── types.ts        # Definições de tipos TypeScript
```

## ✨ Funcionalidades

### Dashboard

- Visão geral com estatísticas de ordens de serviço
- Gráficos de produtividade dos últimos 30 dias
- Cards com métricas (total, em andamento, concluídas, canceladas)
- Indicadores visuais de progresso

### Gestão de Ordens de Serviço

- Criação, edição e exclusão de ordens
- Status: Aberta, Em Andamento, Aguardando Peças, Concluída, Cancelada
- Prioridades: Baixa, Média, Alta, Urgente
- Histórico de atualizações
- Atribuição de técnicos
- **Múltiplos tipos de serviço por ordem**
- **Impressão de OS com layout profissional**
- **Edição financeira dedicada**

### Gestão de Clientes

- CRUD completo de clientes
- Informações: nome, telefone, email, endereço
- Busca e filtros

### Gestão de Técnicos

- Cadastro de técnicos com especialidades
- Atribuição a ordens de serviço
- **Estatísticas de produtividade por técnico**

### Tipos de Serviço

- Categorização de serviços
- Vinculação com ordens de trabalho
- **Sistema de precificação avançado**
- **Preços base, mínimo e máximo**
- **Descrições detalhadas**
- **Status ativo/inativo**

### **Módulo Financeiro** 🆕

- **Controle completo de receitas e pagamentos**
- **Múltiplas formas de pagamento** (Dinheiro, PIX, Cartão, Boleto)
- **Status de pagamento** (Pendente, Pago, Parcial, Cancelado)
- **Cálculo automático de valores** (serviço + peças + deslocamento - desconto)
- **Filtros por período, cliente e status**
- **Métricas financeiras em tempo real**
- **Relatórios de receita detalhados**

### **Calendário de Ordens** 🆕

- **Visualização mensal de ordens de serviço**
- **Marcação de datas de abertura e previsão**
- **Estatísticas do mês atual**
- **Interface intuitiva com indicadores visuais**
- **Detalhes das OS por data selecionada**

### Relatórios

- Gráficos de produtividade por técnico
- Estatísticas de ordens concluídas vs abertas
- **Relatórios financeiros detalhados**
- **Análise de receitas por período**

### **Sistema de Impressão** 🆕

- **Impressão profissional de OS** com layout otimizado
- **Cabeçalho personalizado da empresa**
- **Informações completas do cliente e técnico**
- **Detalhamento de serviços e valores**
- **Histórico de status da ordem**
- **Observações técnicas e financeiras**
- **Formato A4 otimizado para impressão**

### **Melhorias na Interface** 🆕

- **Sidebar responsiva** com navegação intuitiva
- **Tema claro/escuro** persistente
- **Componentes de formulário** padronizados e validados
- **Badges visuais** para status e prioridades
- **Cards de estatísticas** interativos
- **Feedback visual** com toasts e animações

## 🛠️ Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

### Passos

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd service-pro
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure o Supabase**

   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute as migrações SQL da pasta `supabase/migrations/`
   - Configure as variáveis de ambiente (veja seção abaixo)

4. **Configure as variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz do projeto:

   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

5. **Execute o projeto**

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

   O projeto estará disponível em `http://localhost:8080`

## 🗄️ Banco de Dados

### Tabelas Principais

- `profiles` - Perfis de usuário
- `clients` - Clientes
- `technicians` - Técnicos
- `service_types` - Tipos de serviço **com sistema de precificação**
- `work_orders` - Ordens de serviço **com campos financeiros completos**
- **Campos financeiros**: valor_servico, valor_pecas, valor_deslocamento, desconto, valor_total
- **Controle de pagamento**: forma_pagamento, status_pagamento, data_pagamento
- **Múltiplos serviços**: tipos_servico (JSONB) para suporte a vários tipos por OS

### Características

- Row Level Security habilitado
- Triggers automáticos para `updated_at`
- Políticas de acesso baseadas em autenticação
- Relacionamentos com chaves estrangeiras
- **Triggers para cálculo automático de valores totais**
- **Índices otimizados para consultas financeiras**
- **Suporte a JSONB para múltiplos tipos de serviço**
- **Campos de precificação avançada**

### Migrações Recentes

- **7. pricing_system.sql** - Sistema de precificação para tipos de serviço
- **8. update_service_types_pricing.sql** - Atualização de campos de preço
- **9. add_tipos_servico_column.sql** - Suporte a múltiplos tipos de serviço
- **10. dados_ficticios.sql** - Dados de exemplo para desenvolvimento

## 🔒 Segurança

- Autenticação obrigatória para todas as funcionalidades
- Row Level Security (RLS) no banco de dados
- Validação tanto no frontend quanto backend
- Políticas de acesso granulares

## 📱 Interface

- Design responsivo com Tailwind CSS
- Tema claro/escuro
- Componentes acessíveis com Radix UI
- Animações suaves
- Feedback visual com toasts
- **Sidebar moderna e intuitiva**
- **Componentes de impressão otimizados**
- **Calendário interativo**
- **Dashboards financeiros**

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

## 📄 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

---

**Desenvolvido com ❤️ pelo Club do Software**
