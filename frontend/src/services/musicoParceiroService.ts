import { api } from "./api";
import type { MusicoParceiro, MusicoParceiroRequest } from "../types/domain";

export async function listarMusicosParceiros(adminKey: string): Promise<MusicoParceiro[]> {
    const { data } = await api.get<MusicoParceiro[]>("/admin/musicos", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

export async function criarMusicoParceiro(dto: MusicoParceiroRequest, adminKey: string): Promise<MusicoParceiro> {
    const { data } = await api.post<MusicoParceiro>("/admin/musicos", dto, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
