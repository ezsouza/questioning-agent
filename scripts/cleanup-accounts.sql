-- Script para limpar dados antigos da tabela account
-- Execute este script apenas se houver problemas com dados antigos

-- Verificar registros existentes
SELECT id, user_id, account_id, provider_id FROM account;

-- Se necessário, limpar dados antigos (cuidado em produção!)
-- DELETE FROM account;

-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'account'
ORDER BY 
    ordinal_position;
