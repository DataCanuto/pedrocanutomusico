-- Ate aqui, o endereco estruturado informado na criacao da turma (TurmaRequestDTO.endereco) era
-- descartado: so a string formatada (turma.local) era gravada, sem CEP nem complemento, com
-- rua/numero/bairro/cidade/estado irreversivelmente concatenados. Colunas nulaveis porque turmas
-- ja existentes nao tem esse dado (foi perdido antes desta migration) - turmas novas sempre
-- preenchem, via TurmaMapper.
ALTER TABLE turma ADD COLUMN endereco_cep VARCHAR(9);
ALTER TABLE turma ADD COLUMN endereco_rua VARCHAR(255);
ALTER TABLE turma ADD COLUMN endereco_numero VARCHAR(255);
ALTER TABLE turma ADD COLUMN endereco_bairro VARCHAR(255);
ALTER TABLE turma ADD COLUMN endereco_cidade VARCHAR(255);
ALTER TABLE turma ADD COLUMN endereco_estado VARCHAR(2);
ALTER TABLE turma ADD COLUMN endereco_complemento VARCHAR(255);
