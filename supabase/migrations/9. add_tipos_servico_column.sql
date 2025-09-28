-- Add tipos_servico column to work_orders table to support multiple service types
ALTER TABLE public.work_orders 
ADD COLUMN tipos_servico JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN public.work_orders.tipos_servico IS 'Array of service types with their individual values: [{id: string, nome: string, valor: number}]';

-- Create index for better performance on JSONB queries
CREATE INDEX idx_work_orders_tipos_servico ON public.work_orders USING GIN (tipos_servico);