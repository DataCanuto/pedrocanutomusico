import { api } from "./api";
import type {
    EnderecoRequest,
    InscricaoTurmaRequest,
    InscricaoTurmaResponse,
    MatriculaResponse,
    Turma,
    TurmaComAlunos,
    TurmaRequest,
} from "../types/domain";

export async function buscarTurmaPorCodigo(codigo: string): Promise<Turma> {
    const { data } = await api.get<Turma>(`/turmas/${codigo}`);
    return data;
}

/** Só registra o vínculo aluno<->turma - não gera aulas datadas (a turma já existe como compromisso fixo na agenda). */
export async function inscreverEmTurma(codigo: string, dto: InscricaoTurmaRequest): Promise<InscricaoTurmaResponse> {
    const { data } = await api.post<InscricaoTurmaResponse>(`/turmas/${codigo}/inscricoes`, dto);
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

/** "Aluno saiu da turma" - inativa a matrícula sem apagar histórico (ver AdminVerTurmasPage). */
export async function inativarMatriculaTurma(matriculaId: number, adminKey: string): Promise<MatriculaResponse> {
    const { data } = await api.patch<MatriculaResponse>(`/admin/turmas/matriculas/${matriculaId}/inativar`, null, {
        headers: { "X-Admin-Key": adminKey },
    });
    return data;
}
