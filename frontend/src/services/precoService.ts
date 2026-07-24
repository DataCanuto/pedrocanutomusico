import { api } from "./api";
import type { PrecoServico, PrecoServicoRequest } from "../types/domain";

export async function listarPrecos(): Promise<PrecoServico[]> {
    const { data } = await api.get<PrecoServico[]>("/precos");
    return data;
}

export async function criarPreco(dto: PrecoServicoRequest, adminKey: string): Promise<PrecoServico> {
    const { data } = await api.post<PrecoServico>("/admin/precos", dto, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

export async function atualizarPreco(id: number, dto: PrecoServicoRequest, adminKey: string): Promise<PrecoServico> {
    const { data } = await api.put<PrecoServico>(`/admin/precos/${id}`, dto, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
