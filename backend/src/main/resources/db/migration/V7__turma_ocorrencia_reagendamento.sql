-- Reagendamento de ocorrência de Turma: mover só esta semana para outra data/hora sem alterar o
-- horário recorrente da Turma (turma.dia_semana/hora continuam intocados - ver
-- TurmaOcorrenciaService#reagendar). data_original guarda o slot semanal natural que ficou vago,
-- só para AgendaAdminService não gerar uma ocorrência virtual fantasma nele; hora sobrescreve
-- turma.hora só quando a ocorrência foi reagendada para um horário diferente (nulo = usa o da turma).
ALTER TABLE turma_ocorrencia ADD COLUMN data_original DATE;
ALTER TABLE turma_ocorrencia ADD COLUMN hora TIME;
