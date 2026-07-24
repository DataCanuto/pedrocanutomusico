import { api } from "./api";
import type { ClienteListItem } from "../types/domain";

export async function listarClientesAdmin(adminKey: string): Promise<ClienteListItem[]> {
    const { data } = await api.get<ClienteListItem[]>("/admin/clientes", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
