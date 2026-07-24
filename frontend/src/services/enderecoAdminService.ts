import { api } from "./api";
import type { EnderecoListItem } from "../types/domain";

export async function listarEnderecosAdmin(adminKey: string): Promise<EnderecoListItem[]> {
    const { data } = await api.get<EnderecoListItem[]>("/admin/enderecos", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
