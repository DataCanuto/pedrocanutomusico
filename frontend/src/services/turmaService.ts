import { api } from "./api";
import type {
    AgendamentoCriadoResponse,
    EnderecoRequest,
    InscricaoTurmaRequest,
    Turma,
    TurmaComAlunos,
    TurmaRequest,
} from "../types/domain";

export async function buscarTurmaPorCodigo(codigo: string): Promise<Turma> {
    const { data } = await api.get<Turma>(`/turmas/${codigo}`);
    return data;
}

/** Gera uma aula por semana no pacote escolhido - mesmo contrato de resposta de POST /agendamentos (lista de aulas). */
export async function inscreverEmTurma(codigo: string, dto: InscricaoTurmaRequest): Promise<AgendamentoCriadoResponse> {
    const { data } = await api.post<AgendamentoCriadoResponse>(`/turmas/${codigo}/inscricoes`, dto);
    return data;
}

export async function criarTurma(dto: TurmaRequest, adminKey: string): Promise<Turma> {
    const { data } = await api.post<Turma>("/admin/turmas", dto, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

export async function listarTurmasComAlunos(adminKey: string): Promise<TurmaComAlunos[]> {
    const { data } = await api.get<TurmaComAlunos[]>("/admin/turmas", {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}

/** Completa/corrige o endereço estruturado de uma turma já existente (ver AdminVerTurmasPage). */
export async function atualizarEnderecoTurma(id: number, dto: EnderecoRequest, adminKey: string): Promise<Turma> {
    const { data } = await api.patch<Turma>(`/admin/turmas/${id}/endereco`, dto, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
