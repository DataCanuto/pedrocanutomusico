import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { AcoesContato } from "../../components/admin/AcoesContato";
import { AccordionItem } from "../../components/ui/Accordion";
import { BotaoCopiar } from "../../components/ui/BotaoCopiar";
import { extrairMensagemErro } from "../../services/api";
import { buscarEnderecoPorCep } from "../../services/cepService";
import { atualizarEnderecoTurma, listarTurmasComAlunos } from "../../services/turmaService";
import { CATEGORIA_LABELS, DIA_SEMANA_LABELS, INSTRUMENTO_LABELS } from "../../types/labels";
import type { EnderecoRequest, TurmaComAlunos } from "../../types/domain";

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
                            <EnderecoDaTurma turma={turma} adminKey={adminKey} />
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

/**
 * Turmas criadas antes do endereço estruturado existir (ver Turma#enderecoCep no backend) ficaram
 * só com `local` (string formatada) preenchido - o endereço estruturado usado para matricular um
 * aluno (ver TurmaService#comEnderecoDaTurmaSeAusente) fica nulo para sempre nelas, bloqueando
 * matrícula até o professor completar aqui.
 */
function EnderecoDaTurma({ turma, adminKey }: { turma: TurmaComAlunos; adminKey: string }) {
    const queryClient = useQueryClient();
    const [editando, setEditando] = useState(false);

    if (!editando) {
        return (
            <p className="aviso">
                {turma.endereco ? (
                    <>Endereço estruturado cadastrado. </>
                ) : (
                    <>
                        <strong>Esta turma não tem endereço estruturado cadastrado</strong> - a matrícula por código vai falhar até
                        preencher.{" "}
                    </>
                )}
                <button type="button" onClick={() => setEditando(true)}>
                    {turma.endereco ? "Editar endereço" : "Completar endereço"}
                </button>
            </p>
        );
    }

    return (
        <FormularioEnderecoTurma
            turma={turma}
            adminKey={adminKey}
            onCancelar={() => setEditando(false)}
            onSalvo={async () => {
                await queryClient.invalidateQueries({ queryKey: ["admin-turmas"] });
                setEditando(false);
            }}
        />
    );
}

function FormularioEnderecoTurma({
    turma,
    adminKey,
    onCancelar,
    onSalvo,
}: {
    turma: TurmaComAlunos;
    adminKey: string;
    onCancelar: () => void;
    onSalvo: () => Promise<void>;
}) {
    const [cep, setCep] = useState(turma.endereco?.cep ?? "");
    const [rua, setRua] = useState(turma.endereco?.rua ?? "");
    const [numero, setNumero] = useState(turma.endereco?.numero ?? "");
    const [bairro, setBairro] = useState(turma.endereco?.bairro ?? "");
    const [cidade, setCidade] = useState(turma.endereco?.cidade ?? "");
    const [estado, setEstado] = useState(turma.endereco?.estado ?? "");
    const [complemento, setComplemento] = useState(turma.endereco?.complemento ?? "");
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function preencherEnderecoPeloCep(valorCep: string) {
        if (valorCep.replace(/\D/g, "").length !== 8) {
            return;
        }
        setBuscandoCep(true);
        try {
            const endereco = await buscarEnderecoPorCep(valorCep);
            if (endereco) {
                setRua(endereco.rua);
                setBairro(endereco.bairro);
                setCidade(endereco.cidade);
                setEstado(endereco.estado);
            }
        } finally {
            setBuscandoCep(false);
        }
    }

    async function salvar() {
        setErro(null);
        setSalvando(true);
        try {
            const dto: EnderecoRequest = { cep, rua, numero, bairro, cidade, estado, complemento: complemento || undefined };
            await atualizarEnderecoTurma(turma.id, dto, adminKey);
            await onSalvo();
        } catch (e) {
            setErro(extrairMensagemErro(e, "Não foi possível salvar o endereço."));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <form
            className="form-section"
            onSubmit={(e) => {
                e.preventDefault();
                salvar();
            }}
        >
            <label htmlFor={`cep-${turma.id}`}>CEP</label>
            <input
                id={`cep-${turma.id}`}
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onBlur={(e) => preencherEnderecoPeloCep(e.target.value)}
                required
            />
            {buscandoCep && <small>Buscando endereço...</small>}

            <label htmlFor={`rua-${turma.id}`}>Rua</label>
            <input id={`rua-${turma.id}`} value={rua} onChange={(e) => setRua(e.target.value)} required />

            <label htmlFor={`numero-${turma.id}`}>Número</label>
            <input id={`numero-${turma.id}`} value={numero} onChange={(e) => setNumero(e.target.value)} required />

            <label htmlFor={`bairro-${turma.id}`}>Bairro</label>
            <input id={`bairro-${turma.id}`} value={bairro} onChange={(e) => setBairro(e.target.value)} required />

            <label htmlFor={`cidade-${turma.id}`}>Cidade</label>
            <input id={`cidade-${turma.id}`} value={cidade} onChange={(e) => setCidade(e.target.value)} required />

            <label htmlFor={`estado-${turma.id}`}>Estado (UF)</label>
            <input id={`estado-${turma.id}`} maxLength={2} value={estado} onChange={(e) => setEstado(e.target.value)} required />

            <label htmlFor={`complemento-${turma.id}`}>Complemento (opcional)</label>
            <input id={`complemento-${turma.id}`} value={complemento} onChange={(e) => setComplemento(e.target.value)} />

            {erro && <p className="erro-campo">{erro}</p>}

            <div className="admin-lista-acoes">
                <button type="submit" disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar endereço"}
                </button>
                <button type="button" onClick={onCancelar} disabled={salvando}>
                    Cancelar
                </button>
            </div>
        </form>
    );
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
