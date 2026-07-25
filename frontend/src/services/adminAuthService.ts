import { api } from "./api";

/** Retorna `true` (em vez de void) porque o queryFn do React Query trata retorno undefined como erro. */
export async function verificarAdminKey(adminKey: string): Promise<true> {
    await api.get("/admin/auth/verificar", { headers: { "X-Admin-Key": adminKey } });
    return true;
}
