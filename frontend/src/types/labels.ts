import type {
    ECategoriaServico,
    EDiaSemana,
    EInstrumento,
    EModalidadeServico,
    EStatusAgendamento,
    EStatusMatricula,
    ETipoContratacao,
    ETipoEvento,
} from "./domain";

export const CATEGORIA_LABELS: Record<ECategoriaServico, string> = {
    MUSICALIZACAO_INFANTIL: "Musicalização Infantil",
    MUSICOTERAPIA: "Musicoterapia",
    AULA_INSTRUMENTO: "Aula de Instrumento",
    EVENTO: "Evento",
};

export const MODALIDADE_LABELS: Record<EModalidadeServico, string> = {
    INDIVIDUAL: "Individual",
    GRUPO: "Grupo",
};

/** Nem toda categoria oferece todos os pacotes (ex.: Instrumento não tem PACOTE_2/PACOTE_3) - a lista de opções disponíveis vem sempre do catálogo (GET /api/precos), nunca fixa no frontend. */
export const CONTRATACAO_LABELS: Record<ETipoContratacao, string> = {
    AVULSO: "Aula avulsa",
    PACOTE_2: "Pacote de 2 aulas",
    PACOTE_3: "Pacote de 3 aulas",
    PACOTE_4: "Pacote de 4 aulas",
    PACOTE_12: "Pacote de 12 aulas",
};

/** Espelha ETipoContratacao.quantidadeAulas (backend) - quantas datas o cliente precisa escolher para fechar cada pacote. */
export const QUANTIDADE_AULAS: Record<ETipoContratacao, number> = {
    AVULSO: 1,
    PACOTE_2: 2,
    PACOTE_3: 3,
    PACOTE_4: 4,
    PACOTE_12: 12,
};

export const INSTRUMENTO_LABELS: Record<EInstrumento, string> = {
    VIOLAO: "Violão",
    UKULELE: "Ukulele",
    BAIXO: "Baixo",
    CAJON: "Cajón",
    PANDEIRO: "Pandeiro",
    FLAUTA_DOCE: "Flauta Doce",
    CANTO: "Canto",
};

export const TIPO_EVENTO_LABELS: Record<ETipoEvento, string> = {
    ANIVERSARIO: "Aniversário",
    CASAMENTO: "Casamento",
    EVENTO_CORPORATIVO: "Evento Corporativo",
    CARNAVAL: "Carnaval",
    SAO_JOAO: "São João",
    MUSICOTERAPIA_EVENTO: "Musicoterapia (evento)",
};

export const DIA_SEMANA_LABELS: Record<EDiaSemana, string> = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

export const STATUS_AGENDAMENTO_LABELS: Record<EStatusAgendamento, string> = {
    AGENDADO: "Agendado",
    CONFIRMADO: "Confirmado",
    CHECK_IN: "Check-in feito",
    EM_ANDAMENTO: "Em andamento",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
    FALTOU: "Faltou",
};

/** ATIVA/CANCELADA de uma Matricula de Turma - ver AlunoDaTurma. */
export const STATUS_MATRICULA_LABELS: Record<EStatusMatricula, string> = {
    ATIVA: "Ativo",
    CANCELADA: "Inativo",
};

export function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
