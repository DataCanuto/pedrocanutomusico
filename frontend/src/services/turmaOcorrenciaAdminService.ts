import { api } from "./api";
import type { TurmaOcorrenciaResponse } from "../types/domain";

/** Transições de status da aula de uma Turma numa semana específica - sem "marcar-falta" (não faz sentido para a turma inteira). */
export type AcaoDeStatusTurma = "confirmar" | "check-in" | "iniciar" | "finalizar" | "cancelar";

export async function transicionarStatusTurmaOcorrenciaAdmin(
    turmaId: number,
    data: string,
    acao: AcaoDeStatusTurma,
    adminKey: string,
): Promise<TurmaOcorrenciaResponse> {
    const { data: resposta } = await api.post<TurmaOcorrenciaResponse>(
        `/admin/turmas/${turmaId}/ocorrencias/${data}/${acao}`,
        null,
        { headers: { "X-Admin-Key": adminKey } },
    );
    return resposta;
}

/** Move esta ocorrência (a turma só nesta semana) para nova data/hora, sem alterar o horário recorrente da turma - ver TurmaOcorrenciaService#reagendar no backend. */
export async function reagendarTurmaOcorrenciaAdmin(
    turmaId: number,
    data: string,
    novaData: string,
    novaHora: string,
    adminKey: string,
): Promise<TurmaOcorrenciaResponse> {
    const { data: resposta } = await api.put<TurmaOcorrenciaResponse>(
        `/admin/turmas/${turmaId}/ocorrencias/${data}/reagendar`,
        { data: novaData, hora: novaHora },
        { headers: { "X-Admin-Key": adminKey } },
    );
    return resposta;
}
