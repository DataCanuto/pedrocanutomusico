import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
});

export function extrairMensagemErro(erro: unknown, mensagemPadrao: string): string {
    if (axios.isAxiosError(erro) && erro.response?.data?.message) {
        return erro.response.data.message as string;
    }
    return mensagemPadrao;
}
