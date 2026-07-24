import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { listarAgendamentosAdmin } from "../../services/agendamentoAdminService";
import { extrairMensagemErro } from "../../services/api";
import { CATEGORIA_LABELS, STATUS_AGENDAMENTO_LABELS } from "../../types/labels";
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
import type { AgendamentoResponse } from "../../types/domain";

type ModoVisualizacao = "mes" | "semana" | "dia";

export function AdminAgendaPage() {
    return <AdminGate titulo="Agenda">{(adminKey) => <Agenda adminKey={adminKey} />}</AdminGate>;
}

function hojeIso(): string {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function Agenda({ adminKey }: { adminKey: string }) {
    const [modo, setModo] = useState<ModoVisualizacao>("mes");
    const hoje = new Date();
    const [ano, setAno] = useState(hoje.getFullYear());
    const [mes, setMes] = useState(hoje.getMonth());
    const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
    const [dataReferencia, setDataReferencia] = useState(hojeIso());

    const agendamentosQuery = useQuery({
        queryKey: ["admin-agendamentos"],
        queryFn: () => listarAgendamentosAdmin(adminKey),
    });

    const porDia = useMemo(() => {
        const mapa = new Map<string, AgendamentoResponse[]>();
        for (const agendamento of agendamentosQuery.data ?? []) {
            const lista = mapa.get(agendamento.data) ?? [];
            lista.push(agendamento);
            mapa.set(agendamento.data, lista);
        }
        for (const lista of mapa.values()) {
            lista.sort((a, b) => a.hora.localeCompare(b.hora));
        }
        return mapa;
    }, [agendamentosQuery.data]);

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

            {agendamentosQuery.isLoading && <p>Carregando agenda...</p>}
            {agendamentosQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(agendamentosQuery.error, "Não foi possível carregar a agenda.")}</p>
            )}

            {agendamentosQuery.isSuccess && modo === "mes" && (
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
                />
            )}

            {agendamentosQuery.isSuccess && modo === "semana" && (
                <VisaoSemana dataReferencia={dataReferencia} porDia={porDia} onMudarData={setDataReferencia} />
            )}

            {agendamentosQuery.isSuccess && modo === "dia" && (
                <VisaoDia dataReferencia={dataReferencia} porDia={porDia} onMudarData={setDataReferencia} />
            )}
        </>
    );
}

function ListaDoDia({ dia }: { dia: AgendamentoResponse[] }) {
    if (dia.length === 0) {
        return <p>Nenhum agendamento nesse dia.</p>;
    }
    return (
        <ul className="agenda-lista-dia">
            {dia.map((agendamento) => (
                <li key={agendamento.id}>
                    <strong>{agendamento.hora}</strong> - {CATEGORIA_LABELS[agendamento.categoria]} -{" "}
                    {agendamento.alunoNome ?? agendamento.clienteNome} ({agendamento.clienteNome}, {agendamento.clienteTelefone}) -{" "}
                    {STATUS_AGENDAMENTO_LABELS[agendamento.status]}
                </li>
            ))}
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
}: {
    ano: number;
    mes: number;
    porDia: Map<string, AgendamentoResponse[]>;
    diaSelecionado: string | null;
    onSelecionarDia: (dia: string) => void;
    onMudarMes: (ano: number, mes: number) => void;
}) {
    const semanas = gerarGradeDoMes(ano, mes);
    const agendamentosDoDia = diaSelecionado ? (porDia.get(diaSelecionado) ?? []) : [];

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
                                const agendamentosDoDiaCelula = diaIso ? (porDia.get(diaIso) ?? []) : [];
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
                                                {agendamentosDoDiaCelula.length > 0 && (
                                                    <span className="agenda-dia-contagem">{agendamentosDoDiaCelula.length}</span>
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
                        {formatarDataBr(diaSelecionado)} - {agendamentosDoDia.length} agendamento{agendamentosDoDia.length === 1 ? "" : "s"}
                    </h2>
                    <ListaDoDia dia={agendamentosDoDia} />
                </div>
            )}
        </>
    );
}

function VisaoSemana({
    dataReferencia,
    porDia,
    onMudarData,
}: {
    dataReferencia: string;
    porDia: Map<string, AgendamentoResponse[]>;
    onMudarData: (data: string) => void;
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
                    const agendamentosDoDia = porDia.get(diaIso) ?? [];
                    return (
                        <div key={diaIso} className="agenda-semana-dia">
                            <h3>{formatarDataBr(diaIso)}</h3>
                            <ListaDoDia dia={agendamentosDoDia} />
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
}: {
    dataReferencia: string;
    porDia: Map<string, AgendamentoResponse[]>;
    onMudarData: (data: string) => void;
}) {
    const agendamentosDoDia = porDia.get(dataReferencia) ?? [];

    return (
        <>
            <div className="agenda-navegacao">
                <button onClick={() => onMudarData(diaAnterior(dataReferencia))}>&larr; Dia anterior</button>
                <strong>{formatarDataBr(dataReferencia)}</strong>
                <button onClick={() => onMudarData(proximoDia(dataReferencia))}>Próximo dia &rarr;</button>
            </div>

            <div className="agenda-detalhe-dia">
                <h2>
                    {agendamentosDoDia.length} agendamento{agendamentosDoDia.length === 1 ? "" : "s"}
                </h2>
                <ListaDoDia dia={agendamentosDoDia} />
            </div>
        </>
    );
}
