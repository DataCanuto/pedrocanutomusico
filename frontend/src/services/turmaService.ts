import { api } from "./api";
import type { AgendamentoResponse, InscricaoTurmaRequest, Turma, TurmaRequest } from "../types/domain";

export async function buscarTurmaPorCodigo(codigo: string): Promise<Turma> {
    const { data } = await api.get<Turma>(`/turmas/${codigo}`);
    return data;
}

export async function inscreverEmTurma(codigo: string, dto: InscricaoTurmaRequest): Promise<AgendamentoResponse> {
    const { data } = await api.post<AgendamentoResponse>(`/turmas/${codigo}/inscricoes`, dto);
    return data;
}

export async function criarTurma(dto: TurmaRequest, adminKey: string): Promise<Turma> {
    const { data } = await api.post<Turma>("/admin/turmas", dto, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
