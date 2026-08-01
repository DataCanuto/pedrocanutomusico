import { useQuery } from "@tanstack/react-query";
import { AdminGate } from "../../components/admin/AdminGate";
import { AcoesContato } from "../../components/admin/AcoesContato";
import { AccordionItem } from "../../components/ui/Accordion";
import { BotaoCopiar } from "../../components/ui/BotaoCopiar";
import { extrairMensagemErro } from "../../services/api";
import { listarTurmasComAlunos } from "../../services/turmaService";
import { CATEGORIA_LABELS, DIA_SEMANA_LABELS, INSTRUMENTO_LABELS } from "../../types/labels";
import type { TurmaComAlunos } from "../../types/domain";

const STATUS_TURMA_LABELS: Record<TurmaComAlunos["status"], string> = {
    ATIVA: "Ativa",
    ENCERRADA: "Encerrada",
    CANCELADA: "Cancelada",
};

export function AdminVerTurmasPage() {
    return <AdminGate titulo="Turmas">{(adminKey) => <ListaDeTurmas adminKey={adminKey} />}</AdminGate>;
}

function ListaDeTurmas({ adminKey }: { adminKey: string }) {
    const turmasQuery = useQuery({ queryKey: ["admin-turmas"], queryFn: () => listarTurmasComAlunos(adminKey) });

    return (
        <>
            {turmasQuery.isLoading && <p>Carregando...</p>}
            {turmasQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(turmasQuery.error, "Não foi possível carregar as turmas.")}</p>
            )}
            {turmasQuery.data && turmasQuery.data.length === 0 && <p>Nenhuma turma cadastrada ainda.</p>}

            {turmasQuery.data && turmasQuery.data.length > 0 && (
                <div className="accordion-grupo">
                    {turmasQuery.data.map((turma) => (
                        <AccordionItem key={turma.id} className="servico-card" titulo={tituloTurma(turma)} subtitulo={subtituloTurma(turma)}>
                            <p className="codigo-turma">
                                Código: <strong>{turma.codigo}</strong>
                                <BotaoCopiar valor={turma.codigo} label="Copiar código" />
                            </p>
                            <TabelaDeAlunos turma={turma} />
                        </AccordionItem>
                    ))}
                </div>
            )}
        </>
    );
}

function tituloTurma(turma: TurmaComAlunos): string {
    const servico = turma.instrumento
        ? `${CATEGORIA_LABELS[turma.categoria]} - ${INSTRUMENTO_LABELS[turma.instrumento]}`
        : CATEGORIA_LABELS[turma.categoria];
    return `${servico} (${turma.codigo})`;
}

function subtituloTurma(turma: TurmaComAlunos): string {
    const quantidade = turma.alunos.length === 1 ? "1 aluno" : `${turma.alunos.length} alunos`;
    // turma.hora chega como "HH:mm:ss" (serialização padrão de LocalTime) - só HH:mm interessa aqui.
    return `${DIA_SEMANA_LABELS[turma.diaSemana]} às ${turma.hora.slice(0, 5)} - ${turma.local} - ${quantidade} - ${STATUS_TURMA_LABELS[turma.status]}`;
}

function TabelaDeAlunos({ turma }: { turma: TurmaComAlunos }) {
    if (turma.alunos.length === 0) {
        return <p>Nenhum aluno matriculado nesta turma ainda.</p>;
    }

    return (
        <table className="tabela-precos">
            <thead>
                <tr>
                    <th>Aluno</th>
                    <th>Idade</th>
                    <th>Endereço</th>
                    <th>Telefone</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {turma.alunos.map((aluno) => (
                    <tr key={aluno.id}>
                        <td>{aluno.nomeAluno}</td>
                        <td>{aluno.idade}</td>
                        <td>{aluno.endereco ?? "-"}</td>
                        <td>{aluno.telefone}</td>
                        <td className="admin-lista-acoes">
                            <AcoesContato telefone={aluno.telefone} enderecoResumo={aluno.endereco} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
