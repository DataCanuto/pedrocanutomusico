import { api } from "./api";
import type { AgendamentoResponse } from "../types/domain";

export async function listarAgendamentosAdmin(adminKey: string): Promise<AgendamentoResponse[]> {
    const { data } = await api.get<AgendamentoResponse[]>("/admin/agendamentos", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
