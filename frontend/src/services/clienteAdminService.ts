import { api } from "./api";
import type { AgendamentoResponse, ClienteListItem, ClienteResponse } from "../types/domain";

export async function listarClientesAdmin(adminKey: string): Promise<ClienteListItem[]> {
    const { data } = await api.get<ClienteListItem[]>("/admin/clientes", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

export async function buscarClienteAdmin(id: number, adminKey: string): Promise<ClienteResponse> {
    const { data } = await api.get<ClienteResponse>(`/admin/clientes/${id}`, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

/** Todos os agendamentos do cliente, do mais próximo para o mais distante - ver AgendamentoService#listarPorCliente no backend. */
export async function listarAgendamentosDoClienteAdmin(id: number, adminKey: string): Promise<AgendamentoResponse[]> {
    const { data } = await api.get<AgendamentoResponse[]>(`/admin/clientes/${id}/agendamentos`, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

/** Exclusão definitiva: remove o cliente e, em cascata, todos os seus agendamentos/aulas/matrículas (ver ClienteService#deletar no backend). */
export async function deletarClienteAdmin(id: number, adminKey: string): Promise<void> {
    await api.delete(`/admin/clientes/${id}`, {
        headers: { "X-Admin-Key": adminKey },
    });
}
