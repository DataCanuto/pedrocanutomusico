import { api } from "./api";
import type { ClienteListItem } from "../types/domain";

export async function listarClientesAdmin(adminKey: string): Promise<ClienteListItem[]> {
    const { data } = await api.get<ClienteListItem[]>("/admin/clientes", {
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
