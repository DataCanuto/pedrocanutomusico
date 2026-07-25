import { api } from "./api";
import type { AgendamentoCriadoResponse, AgendamentoRequest } from "../types/domain";

export async function criarAgendamento(dto: AgendamentoRequest): Promise<AgendamentoCriadoResponse> {
    const { data } = await api.post<AgendamentoCriadoResponse>("/agendamentos", dto);
    return data;
}
