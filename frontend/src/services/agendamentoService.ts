import { api } from "./api";
import type { AgendamentoCriadoResponse, AgendamentoRequest, HorarioOcupado } from "../types/domain";

export async function criarAgendamento(dto: AgendamentoRequest): Promise<AgendamentoCriadoResponse> {
    const { data } = await api.post<AgendamentoCriadoResponse>("/agendamentos", dto);
    return data;
}

/** Alimenta a pré-visualização de horários indisponíveis no formulário (ver HorarioFields) - a validação que vale de verdade continua sendo a do backend ao criar. */
export async function listarHorariosOcupados(data: string): Promise<HorarioOcupado[]> {
    const { data: resposta } = await api.get<HorarioOcupado[]>("/agendamentos/horarios-ocupados", { params: { data } });
    return resposta;
}
