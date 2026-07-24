import type {
    ECategoriaServico,
    EInstrumento,
    EModalidadeServico,
    EStatusAgendamento,
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

export const STATUS_AGENDAMENTO_LABELS: Record<EStatusAgendamento, string> = {
    AGENDADO: "Agendado",
    CONFIRMADO: "Confirmado",
    CHECK_IN: "Check-in feito",
    EM_ANDAMENTO: "Em andamento",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
    FALTOU: "Faltou",
};

export function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
