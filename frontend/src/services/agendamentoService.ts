import { api } from "./api";
import type { AgendamentoRequest, AgendamentoResponse } from "../types/domain";

export async function criarAgendamento(dto: AgendamentoRequest): Promise<AgendamentoResponse> {
    const { data } = await api.post<AgendamentoResponse>("/agendamentos", dto);
    return data;
}
