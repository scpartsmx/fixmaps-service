-- Atualização da tabela service_types para incluir campos de precificação
-- Esta migração adiciona os campos de preço que foram definidos na migração 7

-- Adicionar campos de precificação à tabela service_types
ALTER TABLE public.service_types 
ADD COLUMN IF NOT EXISTS preco_base DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS preco_minimo DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS preco_maximo DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.service_types.preco_base IS 'Preço base padrão para este tipo de serviço';
COMMENT ON COLUMN public.service_types.preco_minimo IS 'Preço mínimo permitido para este tipo de serviço';
COMMENT ON COLUMN public.service_types.preco_maximo IS 'Preço máximo sugerido para este tipo de serviço';
COMMENT ON COLUMN public.service_types.descricao IS 'Descrição detalhada do tipo de serviço';
COMMENT ON COLUMN public.service_types.ativo IS 'Indica se o tipo de serviço está ativo para uso';

-- Criar índice para melhorar performance em consultas por status ativo
CREATE INDEX IF NOT EXISTS idx_service_types_ativo ON public.service_types(ativo);

-- Criar índice para consultas por faixa de preço
CREATE INDEX IF NOT EXISTS idx_service_types_preco_base ON public.service_types(preco_base);

-- Atualizar tipos de serviço existentes com valores padrão (opcional)
-- Você pode descomentar e ajustar os valores conforme necessário
/*
UPDATE public.service_types 
SET 
  preco_base = 100.00,
  preco_minimo = 50.00,
  preco_maximo = 200.00,
  descricao = 'Preço base para ' || nome,
  ativo = true
WHERE preco_base IS NULL;
*/

-- Adicionar constraint para garantir que preço mínimo <= preço base <= preço máximo
ALTER TABLE public.service_types 
ADD CONSTRAINT check_preco_range 
CHECK (
  (preco_minimo IS NULL OR preco_base IS NULL OR preco_minimo <= preco_base) AND
  (preco_base IS NULL OR preco_maximo IS NULL OR preco_base <= preco_maximo)
);

-- Adicionar constraint para garantir que preços sejam positivos
ALTER TABLE public.service_types 
ADD CONSTRAINT check_preco_positivo 
CHECK (
  (preco_base IS NULL OR preco_base >= 0) AND
  (preco_minimo IS NULL OR preco_minimo >= 0) AND
  (preco_maximo IS NULL OR preco_maximo >= 0)
);