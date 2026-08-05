import { api } from "./api";
import type { PacienteMusicoterapia } from "../types/domain";

/** Painel "pacientes de musicoterapia" (ver AdminVerAnamnesesPage) - cada paciente já vem com a anamnese completa embutida. */
export async function listarPacientesMusicoterapia(adminKey: string): Promise<PacienteMusicoterapia[]> {
    const { data } = await api.get<PacienteMusicoterapia[]>("/admin/anamneses", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
