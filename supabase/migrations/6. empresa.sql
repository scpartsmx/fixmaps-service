-- Tabela para armazenar dados da empresa
CREATE TABLE IF NOT EXISTS empresa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18),
    inscricao_estadual VARCHAR(50),
    inscricao_municipal VARCHAR(50),
    endereco TEXT,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_empresa_cnpj ON empresa(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresa_nome ON empresa(nome);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_empresa_updated_at
    BEFORE UPDATE ON empresa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - permitir acesso apenas para usuários autenticados
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT, INSERT, UPDATE para usuários autenticados
CREATE POLICY "Usuários autenticados podem gerenciar dados da empresa" ON empresa
    FOR ALL USING (auth.role() = 'authenticated');

-- Inserir registro inicial (opcional - pode ser removido se não desejar)
INSERT INTO empresa (nome, razao_social, cnpj, endereco, cidade, estado, telefone, email)
VALUES (
    'Sua Empresa Ltda',
    'Sua Empresa de Serviços Técnicos Ltda',
    '00.000.000/0001-00',
    'Rua Principal, 123',
    'Sua Cidade',
    'SP',
    '(11) 1234-5678',
    'contato@suaempresa.com.br'
)
ON CONFLICT DO NOTHING;