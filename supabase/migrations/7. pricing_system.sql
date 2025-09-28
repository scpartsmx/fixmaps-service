-- Migration to add pricing system to service types and work orders

-- Add pricing fields to service_types table
ALTER TABLE public.service_types 
ADD COLUMN preco_base DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN preco_minimo DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN preco_maximo DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN descricao TEXT,
ADD COLUMN ativo BOOLEAN DEFAULT true;

-- Add financial fields to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN valor_servico DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN valor_pecas DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN valor_deslocamento DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN valor_total DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN desconto DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN forma_pagamento TEXT,
ADD COLUMN status_pagamento TEXT DEFAULT 'Pendente' CHECK (status_pagamento IN ('Pendente', 'Pago', 'Parcial', 'Cancelado')),
ADD COLUMN data_pagamento TIMESTAMP WITH TIME ZONE,
ADD COLUMN observacoes_financeiras TEXT;

-- Create function to calculate total value
CREATE OR REPLACE FUNCTION calculate_work_order_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.valor_total = COALESCE(NEW.valor_servico, 0) + 
                   COALESCE(NEW.valor_pecas, 0) + 
                   COALESCE(NEW.valor_deslocamento, 0) - 
                   COALESCE(NEW.desconto, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate total
CREATE TRIGGER calculate_total_trigger
  BEFORE INSERT OR UPDATE OF valor_servico, valor_pecas, valor_deslocamento, desconto
  ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_work_order_total();

-- Create indexes for better performance on financial queries
CREATE INDEX idx_work_orders_valor_total ON public.work_orders(valor_total);
CREATE INDEX idx_work_orders_status_pagamento ON public.work_orders(status_pagamento);
CREATE INDEX idx_work_orders_data_pagamento ON public.work_orders(data_pagamento);
CREATE INDEX idx_service_types_preco_base ON public.service_types(preco_base);
CREATE INDEX idx_service_types_ativo ON public.service_types(ativo);

-- Insert some sample pricing data for existing service types (optional)
-- UPDATE public.service_types SET 
--   preco_base = 50.00,
--   preco_minimo = 30.00,
--   preco_maximo = 100.00,
--   descricao = 'Preço base para ' || nome
-- WHERE preco_base = 0.00;

COMMENT ON COLUMN public.service_types.preco_base IS 'Preço base do serviço';
COMMENT ON COLUMN public.service_types.preco_minimo IS 'Preço mínimo do serviço';
COMMENT ON COLUMN public.service_types.preco_maximo IS 'Preço máximo do serviço';
COMMENT ON COLUMN public.service_types.descricao IS 'Descrição detalhada do serviço';
COMMENT ON COLUMN public.service_types.ativo IS 'Se o tipo de serviço está ativo';

COMMENT ON COLUMN public.work_orders.valor_servico IS 'Valor cobrado pelo serviço';
COMMENT ON COLUMN public.work_orders.valor_pecas IS 'Valor das peças utilizadas';
COMMENT ON COLUMN public.work_orders.valor_deslocamento IS 'Valor do deslocamento/visita';
COMMENT ON COLUMN public.work_orders.valor_total IS 'Valor total da OS (calculado automaticamente)';
COMMENT ON COLUMN public.work_orders.desconto IS 'Desconto aplicado';
COMMENT ON COLUMN public.work_orders.forma_pagamento IS 'Forma de pagamento (Dinheiro, Cartão, PIX, etc.)';
COMMENT ON COLUMN public.work_orders.status_pagamento IS 'Status do pagamento';
COMMENT ON COLUMN public.work_orders.data_pagamento IS 'Data do pagamento';
COMMENT ON COLUMN public.work_orders.observacoes_financeiras IS 'Observações sobre o pagamento';