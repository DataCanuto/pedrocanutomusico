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
