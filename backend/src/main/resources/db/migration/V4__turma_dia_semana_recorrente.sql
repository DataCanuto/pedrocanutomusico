-- Turma passa de "data única" para "dia da semana recorrente": o professor fixa um dia da
-- semana + horário (não mais uma data), e cada família que se matricula com um pacote
-- (PACOTE_2/3/4) recebe automaticamente todas as aulas do pacote nesse dia/horário, geradas
-- pela mesma regra usada no agendamento individual recorrente (GeradorDeDatasRecorrentes,
-- janela de 31 dias corridos a partir de hoje).
--
-- Projeto ainda não foi para produção - não há dado real de turma a preservar, então a coluna é
-- trocada direto em vez de migrada. O DEFAULT abaixo é só para não quebrar em cima de turmas de
-- teste já existentes no banco local; é removido em seguida para não mascarar um dia_semana
-- ausente em inserts futuros (a coluna continua NOT NULL sem valor implícito).
ALTER TABLE turma DROP COLUMN data;
ALTER TABLE turma ADD COLUMN dia_semana VARCHAR(10) NOT NULL DEFAULT 'MONDAY';
ALTER TABLE turma ALTER COLUMN dia_semana DROP DEFAULT;
