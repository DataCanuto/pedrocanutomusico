import { api } from "./api";
import type { AgendamentoCriadoResponse, AgendamentoResponse } from "../types/domain";

export async function listarAgendamentosAdmin(adminKey: string): Promise<AgendamentoResponse[]> {
    const { data } = await api.get<AgendamentoResponse[]>("/admin/agendamentos", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

/** Transições de status nomeadas - cada uma valida seu próprio estado-anterior legal no backend (ver EStatusAgendamento). */
export type AcaoDeStatus = "confirmar" | "check-in" | "iniciar" | "finalizar" | "cancelar" | "marcar-falta";

export async function transicionarStatusAdmin(id: number, acao: AcaoDeStatus, adminKey: string): Promise<AgendamentoResponse> {
    const { data } = await api.post<AgendamentoResponse>(`/admin/agendamentos/${id}/${acao}`, null, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

export async function definirOrcamentoAdmin(id: number, valor: number, adminKey: string): Promise<AgendamentoResponse> {
    const { data } = await api.put<AgendamentoResponse>(
        `/admin/agendamentos/${id}/orcamento`,
        { valor },
        { headers: { "X-Admin-Key": adminKey } },
    );
    return data;
}

/** Sem body - dia da semana, horário e valor são inferidos da última aula da matrícula (ver AgendamentoService#confirmarRecorrencia no backend). */
export async function confirmarRecorrenciaAdmin(matriculaId: number, adminKey: string): Promise<AgendamentoCriadoResponse> {
    const { data } = await api.post<AgendamentoCriadoResponse>(
        `/admin/matriculas/${matriculaId}/confirmar-recorrencia`,
        null,
        { headers: { "X-Admin-Key": adminKey } },
    );
    return data;
}
