import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AcoesContato } from "../../components/admin/AcoesContato";
import { AdminGate } from "../../components/admin/AdminGate";
import { AccordionItem } from "../../components/ui/Accordion";
import {
    confirmarRecorrenciaAdmin,
    definirOrcamentoAdmin,
    listarAgendaAdmin,
    transicionarStatusAdmin,
    type AcaoDeStatus,
} from "../../services/agendamentoAdminService";
import { confirmarRecorrenciaDaTurma } from "../../services/turmaService";
import { transicionarStatusTurmaOcorrenciaAdmin, type AcaoDeStatusTurma } from "../../services/turmaOcorrenciaAdminService";
import { extrairMensagemErro } from "../../services/api";
import { CATEGORIA_LABELS, INSTRUMENTO_LABELS, STATUS_AGENDAMENTO_LABELS } from "../../types/labels";
import { chaveDoCompromisso, dataDoCompromisso, statusDoCompromisso } from "../../utils/compromisso";
import {
    NOMES_MESES,
    diaAnterior,
    formatarDataBr,
    gerarDiasDaSemana,
    gerarGradeDoMes,
    proximaSemana,
    proximoDia,
    semanaAnterior,
} from "../../utils/calendario";
import type { AgendamentoResponse, CompromissoResponse, EStatusAgendamento, TurmaOcorrenciaResponse } from "../../types/domain";

type ModoVisualizacao = "mes" | "semana" | "dia";

/** Espelha EStatusAgendamento.podeTransicionarPara (backend) - o servidor sempre revalida, isto é só para não mostrar botões que vão dar erro. */
const ACOES_POR_STATUS: Record<EStatusAgendamento, { acao: AcaoDeStatus; label: string }[]> = {
    AGENDADO: [
        { acao: "confirmar", label: "Confirmar" },
        { acao: "cancelar", label: "Cancelar" },
        { acao: "marcar-falta", label: "Marcar falta" },
    ],
    CONFIRMADO: [
        { acao: "check-in", label: "Check-in" },
        { acao: "cancelar", label: "Cancelar" },
        { acao: "marcar-falta", label: "Marcar falta" },
    ],
    CHECK_IN: [
        { acao: "iniciar", label: "Iniciar aula" },
        { acao: "cancelar", label: "Cancelar" },
    ],
    EM_ANDAMENTO: [{ acao: "finalizar", label: "Finalizar" }],
    FINALIZADO: [],
    CANCELADO: [],
    FALTOU: [],
};

/** Mesmas transições, sem "marcar falta" - não faz sentido sinalizar falta para a turma inteira, só para um aluno individual. */
const ACOES_TURMA_POR_STATUS: Record<EStatusAgendamento, { acao: AcaoDeStatusTurma; label: string }[]> = {
    AGENDADO: [
        { acao: "confirmar", label: "Confirmar" },
        { acao: "cancelar", label: "Cancelar" },
    ],
    CONFIRMADO: [
        { acao: "check-in", label: "Check-in" },
        { acao: "cancelar", label: "Cancelar" },
    ],
    CHECK_IN: [
        { acao: "iniciar", label: "Iniciar aula" },
        { acao: "cancelar", label: "Cancelar" },
    ],
    EM_ANDAMENTO: [{ acao: "finalizar", label: "Finalizar" }],
    FINALIZADO: [],
    CANCELADO: [],
    FALTOU: [],
};

export function AdminAgendaPage() {
    return <AdminGate titulo="Agenda">{(adminKey) => <Agenda adminKey={adminKey} />}</AdminGate>;
}

function hojeIso(): string {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

/** Compromisso CANCELADO não ocupa mais o horário (ver validarDisponibilidade no backend) - contagens de "quão ocupado" um dia está devem ignorá-lo, mesmo que ele continue listado no dia para histórico. */
function contarAtivos(compromissos: CompromissoResponse[]): number {
    return compromissos.filter((c) => statusDoCompromisso(c) !== "CANCELADO").length;
}

function Agenda({ adminKey }: { adminKey: string }) {
    const [modo, setModo] = useState<ModoVisualizacao>("mes");
    const hoje = new Date();
    const [ano, setAno] = useState(hoje.getFullYear());
    const [mes, setMes] = useState(hoje.getMonth());
    const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
    const [dataReferencia, setDataReferencia] = useState(hojeIso());
    const queryClient = useQueryClient();

    const agendaQuery = useQuery({
        queryKey: ["admin-agenda"],
        queryFn: () => listarAgendaAdmin(adminKey),
    });

    const acaoMutation = useMutation({
        mutationFn: ({ id, acao }: { id: number; acao: AcaoDeStatus }) => transicionarStatusAdmin(id, acao, adminKey),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-agenda"] }),
    });

    const acaoTurmaMutation = useMutation({
        mutationFn: ({ turmaId, data, acao }: { turmaId: number; data: string; acao: AcaoDeStatusTurma }) =>
            transicionarStatusTurmaOcorrenciaAdmin(turmaId, data, acao, adminKey),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-agenda"] }),
    });

    const orcamentoMutation = useMutation({
        mutationFn: ({ id, valor }: { id: number; valor: number }) => definirOrcamentoAdmin(id, valor, adminKey),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-agenda"] }),
    });

    const recorrenciaMutation = useMutation({
        mutationFn: ({ matriculaId }: { matriculaId: number; agendamentoId: number }) =>
            confirmarRecorrenciaAdmin(matriculaId, adminKey),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-agenda"] }),
    });

    const recorrenciaTurmaMutation = useMutation({
        mutationFn: ({ turmaId }: { turmaId: number }) => confirmarRecorrenciaDaTurma(turmaId, adminKey),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-agenda"] }),
    });

    const chavePendente = acaoMutation.isPending
        ? `ag-${acaoMutation.variables?.id}`
        : acaoTurmaMutation.isPending
          ? `turma-${acaoTurmaMutation.variables?.turmaId}-${acaoTurmaMutation.variables?.data}`
          : orcamentoMutation.isPending
            ? `ag-${orcamentoMutation.variables?.id}`
            : recorrenciaMutation.isPending
              ? `ag-${recorrenciaMutation.variables?.agendamentoId}`
              : recorrenciaTurmaMutation.isPending
                ? `turma-recorrencia-${recorrenciaTurmaMutation.variables?.turmaId}`
                : null;

    const acoes: AcoesAgendamento = {
        onAcao: (id, acao) => acaoMutation.mutate({ id, acao }),
        onAcaoTurma: (turmaId, data, acao) => acaoTurmaMutation.mutate({ turmaId, data, acao }),
        onDefinirOrcamento: (id, valor) => orcamentoMutation.mutate({ id, valor }),
        onConfirmarRecorrencia: (matriculaId, agendamentoId) => recorrenciaMutation.mutate({ matriculaId, agendamentoId }),
        onConfirmarRecorrenciaTurma: (turmaId) => recorrenciaTurmaMutation.mutate({ turmaId }),
        chavePendente,
        erro: acaoMutation.isError
            ? extrairMensagemErro(acaoMutation.error, "Não foi possível atualizar o status.")
            : acaoTurmaMutation.isError
              ? extrairMensagemErro(acaoTurmaMutation.error, "Não foi possível atualizar o status da turma.")
              : orcamentoMutation.isError
                ? extrairMensagemErro(orcamentoMutation.error, "Não foi possível definir o orçamento.")
                : recorrenciaMutation.isError
                  ? extrairMensagemErro(recorrenciaMutation.error, "Não foi possível confirmar a recorrência.")
                  : recorrenciaTurmaMutation.isError
                    ? extrairMensagemErro(recorrenciaTurmaMutation.error, "Não foi possível confirmar a recorrência da turma.")
                    : null,
    };

    const porDia = useMemo(() => {
        const mapa = new Map<string, CompromissoResponse[]>();
        for (const compromisso of agendaQuery.data ?? []) {
            const data = dataDoCompromisso(compromisso);
            const lista = mapa.get(data) ?? [];
            lista.push(compromisso);
            mapa.set(data, lista);
        }
        for (const lista of mapa.values()) {
            lista.sort((a, b) => dataDoCompromisso(a).localeCompare(dataDoCompromisso(b)));
        }
        return mapa;
    }, [agendaQuery.data]);

    return (
        <>
            <div className="agenda-modos">
                {(["mes", "semana", "dia"] as ModoVisualizacao[]).map((m) => (
                    <button
                        key={m}
                        className={modo === m ? "agenda-modo-ativo" : ""}
                        onClick={() => {
                            setModo(m);
                            setDiaSelecionado(null);
                        }}
                    >
                        {m === "mes" ? "Mês" : m === "semana" ? "Semana" : "Dia"}
                    </button>
                ))}
            </div>

            {agendaQuery.isLoading && <p>Carregando agenda...</p>}
            {agendaQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(agendaQuery.error, "Não foi possível carregar a agenda.")}</p>
            )}

            {agendaQuery.isSuccess && modo === "mes" && (
                <VisaoMes
                    ano={ano}
                    mes={mes}
                    porDia={porDia}
                    diaSelecionado={diaSelecionado}
                    onSelecionarDia={setDiaSelecionado}
                    onMudarMes={(novoAno, novoMes) => {
                        setAno(novoAno);
                        setMes(novoMes);
                        setDiaSelecionado(null);
                    }}
                    acoes={acoes}
                />
            )}

            {agendaQuery.isSuccess && modo === "semana" && (
                <VisaoSemana dataReferencia={dataReferencia} porDia={porDia} onMudarData={setDataReferencia} acoes={acoes} />
            )}

            {agendaQuery.isSuccess && modo === "dia" && (
                <VisaoDia dataReferencia={dataReferencia} porDia={porDia} onMudarData={setDataReferencia} acoes={acoes} />
            )}
        </>
    );
}

interface AcoesAgendamento {
    onAcao: (id: number, acao: AcaoDeStatus) => void;
    onAcaoTurma: (turmaId: number, data: string, acao: AcaoDeStatusTurma) => void;
    onDefinirOrcamento: (id: number, valor: number) => void;
    onConfirmarRecorrencia: (matriculaId: number, agendamentoId: number) => void;
    onConfirmarRecorrenciaTurma: (turmaId: number) => void;
    chavePendente: string | null;
    erro: string | null;
}

function OrcamentoForm({ agendamento, acoes }: { agendamento: AgendamentoResponse; acoes: AcoesAgendamento }) {
    const [valor, setValor] = useState("");
    const pendente = acoes.chavePendente === `ag-${agendamento.id}`;

    return (
        <span className="agenda-orcamento-form">
            <input
                type="number"
                min={0.01}
                step="0.01"
                placeholder="Valor (R$)"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
            />
            <button
                type="button"
                disabled={pendente || !valor}
                onClick={() => acoes.onDefinirOrcamento(agendamento.id, Number(valor))}
            >
                Definir orçamento
            </button>
        </span>
    );
}

function LinhaAgendamento({ agendamento, acoes }: { agendamento: AgendamentoResponse; acoes: AcoesAgendamento }) {
    const pendente = acoes.chavePendente === `ag-${agendamento.id}`;
    const acoesDisponiveis = ACOES_POR_STATUS[agendamento.status];
    const nomeExibido = agendamento.alunoNome ?? agendamento.clienteNome;
    const responsavelDiferente = agendamento.alunoNome != null && agendamento.alunoNome !== agendamento.clienteNome;
    const matriculaId = agendamento.matriculaId;

    return (
        <li className={agendamento.status === "CANCELADO" ? "agenda-item-cancelado" : undefined}>
            <div>
                <strong>{agendamento.hora}</strong> - {CATEGORIA_LABELS[agendamento.categoria]} - {nomeExibido}
                {responsavelDiferente && <> (responsável: {agendamento.clienteNome})</>} - {agendamento.clienteTelefone} -{" "}
                {STATUS_AGENDAMENTO_LABELS[agendamento.status]}
            </div>
            <div className="agenda-acoes">
                <AcoesContato telefone={agendamento.clienteTelefone} enderecoResumo={agendamento.enderecoResumo} />
                {acoesDisponiveis.map(({ acao, label }) => (
                    <button key={acao} type="button" disabled={pendente} onClick={() => acoes.onAcao(agendamento.id, acao)}>
                        {label}
                    </button>
                ))}
                {agendamento.categoria === "EVENTO" && agendamento.valorCobrado == null && (
                    <OrcamentoForm agendamento={agendamento} acoes={acoes} />
                )}
                {agendamento.categoria !== "EVENTO" && matriculaId != null && (
                    <button type="button" disabled={pendente} onClick={() => acoes.onConfirmarRecorrencia(matriculaId, agendamento.id)}>
                        Confirmar recorrência (próx. mês)
                    </button>
                )}
            </div>
        </li>
    );
}

function LinhaTurmaOcorrencia({ ocorrencia, acoes }: { ocorrencia: TurmaOcorrenciaResponse; acoes: AcoesAgendamento }) {
    const pendente = acoes.chavePendente === `turma-${ocorrencia.turmaId}-${ocorrencia.data}`;
    const pendenteRecorrencia = acoes.chavePendente === `turma-recorrencia-${ocorrencia.turmaId}`;
    const acoesDisponiveis = ACOES_TURMA_POR_STATUS[ocorrencia.status];
    const servico = ocorrencia.instrumento
        ? `${CATEGORIA_LABELS[ocorrencia.categoria]} - ${INSTRUMENTO_LABELS[ocorrencia.instrumento]}`
        : CATEGORIA_LABELS[ocorrencia.categoria];
    const titulo = `${ocorrencia.hora.slice(0, 5)} - Turma ${ocorrencia.turmaCodigo} - ${servico}`;
    const quantidade = ocorrencia.alunosAtivos.length === 1 ? "1 aluno" : `${ocorrencia.alunosAtivos.length} alunos`;
    const subtitulo = `${quantidade} - ${STATUS_AGENDAMENTO_LABELS[ocorrencia.status]}`;

    return (
        <li className={ocorrencia.status === "CANCELADO" ? "agenda-item-cancelado" : undefined}>
            <AccordionItem titulo={titulo} subtitulo={subtitulo}>
                <div className="agenda-acoes">
                    {acoesDisponiveis.map(({ acao, label }) => (
                        <button
                            key={acao}
                            type="button"
                            disabled={pendente}
                            onClick={() => acoes.onAcaoTurma(ocorrencia.turmaId, ocorrencia.data, acao)}
                        >
                            {label}
                        </button>
                    ))}
                    <button
                        type="button"
                        disabled={pendenteRecorrencia}
                        onClick={() => acoes.onConfirmarRecorrenciaTurma(ocorrencia.turmaId)}
                    >
                        Confirmar recorrência (todos os alunos)
                    </button>
                </div>
            </AccordionItem>
        </li>
    );
}

function ListaDoDia({ dia, acoes }: { dia: CompromissoResponse[]; acoes: AcoesAgendamento }) {
    if (dia.length === 0) {
        return <p>Nenhum agendamento nesse dia.</p>;
    }
    return (
        <ul className="agenda-lista-dia">
            {dia.map((compromisso) =>
                compromisso.tipo === "AGENDAMENTO" ? (
                    <LinhaAgendamento key={chaveDoCompromisso(compromisso)} agendamento={compromisso.agendamento!} acoes={acoes} />
                ) : (
                    <LinhaTurmaOcorrencia
                        key={chaveDoCompromisso(compromisso)}
                        ocorrencia={compromisso.turmaOcorrencia!}
                        acoes={acoes}
                    />
                ),
            )}
            {acoes.erro && <p className="erro-campo">{acoes.erro}</p>}
        </ul>
    );
}

function VisaoMes({
    ano,
    mes,
    porDia,
    diaSelecionado,
    onSelecionarDia,
    onMudarMes,
    acoes,
}: {
    ano: number;
    mes: number;
    porDia: Map<string, CompromissoResponse[]>;
    diaSelecionado: string | null;
    onSelecionarDia: (dia: string) => void;
    onMudarMes: (ano: number, mes: number) => void;
    acoes: AcoesAgendamento;
}) {
    const semanas = gerarGradeDoMes(ano, mes);
    const compromissosDoDia = diaSelecionado ? (porDia.get(diaSelecionado) ?? []) : [];

    return (
        <>
            <div className="agenda-navegacao">
                <button onClick={() => onMudarMes(mes === 0 ? ano - 1 : ano, mes === 0 ? 11 : mes - 1)}>&larr; Mês anterior</button>
                <strong>
                    {NOMES_MESES[mes]} de {ano}
                </strong>
                <button onClick={() => onMudarMes(mes === 11 ? ano + 1 : ano, mes === 11 ? 0 : mes + 1)}>Próximo mês &rarr;</button>
            </div>

            <table className="agenda-calendario">
                <thead>
                    <tr>
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                            <th key={dia}>{dia}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {semanas.map((semana, i) => (
                        <tr key={i}>
                            {semana.map((diaIso, j) => {
                                const compromissosDoDiaCelula = diaIso ? (porDia.get(diaIso) ?? []) : [];
                                return (
                                    <td
                                        key={j}
                                        className={diaIso ? "agenda-dia" : "agenda-dia-vazio"}
                                        onClick={() => diaIso && onSelecionarDia(diaIso)}
                                        aria-selected={diaIso === diaSelecionado}
                                    >
                                        {diaIso && (
                                            <>
                                                <span className="agenda-dia-numero">{diaIso.split("-")[2]}</span>
                                                {contarAtivos(compromissosDoDiaCelula) > 0 && (
                                                    <span className="agenda-dia-contagem">{contarAtivos(compromissosDoDiaCelula)}</span>
                                                )}
                                            </>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {diaSelecionado && (
                <div className="agenda-detalhe-dia">
                    <h2>
                        {formatarDataBr(diaSelecionado)} - {contarAtivos(compromissosDoDia)} agendamento
                        {contarAtivos(compromissosDoDia) === 1 ? "" : "s"}
                    </h2>
                    <ListaDoDia dia={compromissosDoDia} acoes={acoes} />
                </div>
            )}
        </>
    );
}

function VisaoSemana({
    dataReferencia,
    porDia,
    onMudarData,
    acoes,
}: {
    dataReferencia: string;
    porDia: Map<string, CompromissoResponse[]>;
    onMudarData: (data: string) => void;
    acoes: AcoesAgendamento;
}) {
    const dias = gerarDiasDaSemana(dataReferencia);

    return (
        <>
            <div className="agenda-navegacao">
                <button onClick={() => onMudarData(semanaAnterior(dataReferencia))}>&larr; Semana anterior</button>
                <strong>
                    {formatarDataBr(dias[0])} a {formatarDataBr(dias[6])}
                </strong>
                <button onClick={() => onMudarData(proximaSemana(dataReferencia))}>Próxima semana &rarr;</button>
            </div>

            <div className="agenda-semana">
                {dias.map((diaIso) => {
                    const compromissosDoDia = porDia.get(diaIso) ?? [];
                    return (
                        <div key={diaIso} className="agenda-semana-dia">
                            <h3>{formatarDataBr(diaIso)}</h3>
                            <ListaDoDia dia={compromissosDoDia} acoes={acoes} />
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function VisaoDia({
    dataReferencia,
    porDia,
    onMudarData,
    acoes,
}: {
    dataReferencia: string;
    porDia: Map<string, CompromissoResponse[]>;
    onMudarData: (data: string) => void;
    acoes: AcoesAgendamento;
}) {
    const compromissosDoDia = porDia.get(dataReferencia) ?? [];

    return (
        <>
            <div className="agenda-navegacao">
                <button onClick={() => onMudarData(diaAnterior(dataReferencia))}>&larr; Dia anterior</button>
                <strong>{formatarDataBr(dataReferencia)}</strong>
                <button onClick={() => onMudarData(proximoDia(dataReferencia))}>Próximo dia &rarr;</button>
            </div>

            <div className="agenda-detalhe-dia">
                <h2>
                    {contarAtivos(compromissosDoDia)} agendamento{contarAtivos(compromissosDoDia) === 1 ? "" : "s"}
                </h2>
                <ListaDoDia dia={compromissosDoDia} acoes={acoes} />
            </div>
        </>
    );
}
