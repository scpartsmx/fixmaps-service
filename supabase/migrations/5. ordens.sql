
-- Create a table for work orders (OS)
CREATE TABLE public.work_orders (
  id TEXT NOT NULL PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clients(id),
  tipo_servico_id UUID NOT NULL REFERENCES public.service_types(id),
  descricao_problema TEXT NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente')),
  status TEXT NOT NULL CHECK (status IN ('Aberta', 'Em Andamento', 'Aguardando Peças', 'Concluída', 'Cancelada')),
  data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previsao_conclusao TIMESTAMP WITH TIME ZONE,
  tecnico_id UUID REFERENCES public.technicians(id),
  historico JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view work orders" 
  ON public.work_orders 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert work orders" 
  ON public.work_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update work orders" 
  ON public.work_orders 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete work orders" 
  ON public.work_orders 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER set_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_work_orders_cliente_id ON public.work_orders(cliente_id);
CREATE INDEX idx_work_orders_tipo_servico_id ON public.work_orders(tipo_servico_id);
CREATE INDEX idx_work_orders_tecnico_id ON public.work_orders(tecnico_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_work_orders_data_abertura ON public.work_orders(data_abertura);
