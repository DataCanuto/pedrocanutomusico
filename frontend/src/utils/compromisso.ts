import type { CompromissoResponse, EStatusAgendamento } from "../types/domain";

/**
 * Helpers compartilhados para ler campos de um CompromissoResponse sem precisar checar `tipo` em
 * todo lugar que só quer a data/hora/status - usado por AdminAgendaPage e AdminHomePage.
 */
export function dataDoCompromisso(c: CompromissoResponse): string {
    return c.tipo === "AGENDAMENTO" ? c.agendamento!.data : c.turmaOcorrencia!.data;
}

export function horaDoCompromisso(c: CompromissoResponse): string {
    return c.tipo === "AGENDAMENTO" ? c.agendamento!.hora : c.turmaOcorrencia!.hora;
}

export function statusDoCompromisso(c: CompromissoResponse): EStatusAgendamento {
    return c.tipo === "AGENDAMENTO" ? c.agendamento!.status : c.turmaOcorrencia!.status;
}

/** Identificador único de linha para key de lista - ocorrência de turma virtual não tem id, então usa turmaId+data. */
export function chaveDoCompromisso(c: CompromissoResponse): string {
    if (c.tipo === "AGENDAMENTO") {
        return `ag-${c.agendamento!.id}`;
    }
    return `turma-${c.turmaOcorrencia!.turmaId}-${c.turmaOcorrencia!.data}`;
}
