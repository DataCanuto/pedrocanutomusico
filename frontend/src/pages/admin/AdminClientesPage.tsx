import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { AcoesContato } from "../../components/admin/AcoesContato";
import { AdminGate } from "../../components/admin/AdminGate";
import { ReagendarForm } from "../../components/admin/ReagendarForm";
import { AccordionItem } from "../../components/ui/Accordion";
import { BotaoCopiar } from "../../components/ui/BotaoCopiar";
import { reagendarAdmin } from "../../services/agendamentoAdminService";
import { extrairMensagemErro } from "../../services/api";
import {
    buscarClienteAdmin,
    deletarClienteAdmin,
    listarAgendamentosDoClienteAdmin,
    listarClientesAdmin,
} from "../../services/clienteAdminService";
import {
    CATEGORIA_LABELS,
    INSTRUMENTO_LABELS,
    MODALIDADE_LABELS,
    STATUS_AGENDAMENTO_LABELS,
    TIPO_EVENTO_LABELS,
    formatarMoeda,
} from "../../types/labels";
import { formatarDataBr } from "../../utils/calendario";
import { STATUS_TERMINAIS } from "../../utils/compromisso";
import type {
    AgendamentoResponse,
    ClienteListItem,
    ClienteResponse,
    ECategoriaServico,
    EnderecoResponse,
} from "../../types/domain";

/** Ordem fixa de exibição das seções de agendamento dentro de cada cliente. */
const CATEGORIAS_ORDENADAS: ECategoriaServico[] = ["EVENTO", "MUSICALIZACAO_INFANTIL", "AULA_INSTRUMENTO", "MUSICOTERAPIA"];

type Coluna = "nome" | "categoria";
type Direcao = "asc" | "desc";

export function AdminClientesPage() {
    return <AdminGate titulo="Clientes">{(adminKey) => <ListaDeClientes adminKey={adminKey} />}</AdminGate>;
}

function ListaDeClientes({ adminKey }: { adminKey: string }) {
    const clientesQuery = useQuery({ queryKey: ["admin-clientes"], queryFn: () => listarClientesAdmin(adminKey) });

    const [filtroTexto, setFiltroTexto] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState<ECategoriaServico | "">("");
    const [ordenacao, setOrdenacao] = useState<{ coluna: Coluna; direcao: Direcao }>({ coluna: "nome", direcao: "asc" });

    function alternarOrdenacao(coluna: Coluna) {
        setOrdenacao((atual) =>
            atual.coluna === coluna ? { coluna, direcao: atual.direcao === "asc" ? "desc" : "asc" } : { coluna, direcao: "asc" },
        );
    }

    /**
     * Filtra e ordena só o array já carregado por listarClientesAdmin - nunca dispara uma nova
     * requisição nem altera o cache do React Query, é pura derivação local do que já está na tela.
     */
    const clientesExibidos = useMemo(() => {
        const texto = filtroTexto.trim().toLowerCase();
        const filtrados = (clientesQuery.data ?? []).filter((cliente) => {
            const combinaTexto = texto === "" || cliente.nome.toLowerCase().includes(texto) || cliente.telefone.includes(texto);
            const combinaCategoria = filtroCategoria === "" || cliente.categoriaServico === filtroCategoria;
            return combinaTexto && combinaCategoria;
        });
        const sinal = ordenacao.direcao === "asc" ? 1 : -1;
        return [...filtrados].sort((a, b) => {
            if (ordenacao.coluna === "nome") {
                return sinal * a.nome.localeCompare(b.nome, "pt-BR");
            }
            const categoriaA = a.categoriaServico ? CATEGORIA_LABELS[a.categoriaServico] : "";
            const categoriaB = b.categoriaServico ? CATEGORIA_LABELS[b.categoriaServico] : "";
            return sinal * categoriaA.localeCompare(categoriaB, "pt-BR");
        });
    }, [clientesQuery.data, filtroTexto, filtroCategoria, ordenacao]);

    return (
        <>
            <div className="admin-filtros">
                <input
                    type="search"
                    placeholder="Buscar por nome ou telefone..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                />
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value as ECategoriaServico | "")}>
                    <option value="">Todas as categorias</option>
                    {CATEGORIAS_ORDENADAS.map((categoria) => (
                        <option key={categoria} value={categoria}>
                            {CATEGORIA_LABELS[categoria]}
                        </option>
                    ))}
                </select>
                <button type="button" className="botao-secundario" onClick={() => alternarOrdenacao("nome")}>
                    Nome {ordenacao.coluna === "nome" ? (ordenacao.direcao === "asc" ? "▲" : "▼") : ""}
                </button>
                <button type="button" className="botao-secundario" onClick={() => alternarOrdenacao("categoria")}>
                    Categoria {ordenacao.coluna === "categoria" ? (ordenacao.direcao === "asc" ? "▲" : "▼") : ""}
                </button>
            </div>

            {clientesQuery.isLoading && <p>Carregando...</p>}
            {clientesQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(clientesQuery.error, "Não foi possível carregar os clientes.")}</p>
            )}
            {clientesQuery.data && clientesQuery.data.length === 0 && <p>Nenhum cliente cadastrado ainda.</p>}
            {clientesQuery.data && clientesQuery.data.length > 0 && clientesExibidos.length === 0 && (
                <p>Nenhum cliente encontrado para esse filtro.</p>
            )}

            {clientesExibidos.length > 0 && (
                <div className="accordion-grupo">
                    {clientesExibidos.map((cliente) => (
                        <ClienteAccordionRow key={cliente.id} cliente={cliente} adminKey={adminKey} />
                    ))}
                </div>
            )}
        </>
    );
}

/** Mesmo formato de EnderecoFormatter.resumo (backend): "rua, numero - bairro, cidade/estado". */
function formatarEnderecoResumo(endereco: EnderecoResponse): string {
    return `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`;
}

/**
 * Um cliente do acordeão: busca o detalhe (endereços/alunos) e os agendamentos dele assim que a
 * linha é montada. São buscas indexadas por FK (uma por cliente visível), não um endpoint em lote -
 * troca deliberada por simplicidade em vez de criar um DTO "clientes com agendamentos" novo.
 */
function ClienteAccordionRow({ cliente, adminKey }: { cliente: ClienteListItem; adminKey: string }) {
    const queryClient = useQueryClient();

    const detalheQuery = useQuery({
        queryKey: ["admin-cliente-detalhe", cliente.id],
        queryFn: () => buscarClienteAdmin(cliente.id, adminKey),
    });
    const agendamentosQuery = useQuery({
        queryKey: ["admin-cliente-agendamentos", cliente.id],
        queryFn: () => listarAgendamentosDoClienteAdmin(cliente.id, adminKey),
    });

    const deletarMutation = useMutation({
        mutationFn: () => deletarClienteAdmin(cliente.id, adminKey),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-clientes"] }),
    });

    function confirmarEDeletar() {
        const confirmado = window.confirm(
            `Excluir ${cliente.nome}? Isso remove o cliente e TODOS os agendamentos, aulas e matrículas vinculados a ele. Essa ação não pode ser desfeita.`,
        );
        if (confirmado) {
            deletarMutation.mutate();
        }
    }

    const subtitulo = [cliente.categoriaServico ? CATEGORIA_LABELS[cliente.categoriaServico] : null, cliente.telefone]
        .filter(Boolean)
        .join(" - ");

    return (
        <AccordionItem className="servico-card" titulo={cliente.nome} subtitulo={subtitulo}>
            {(detalheQuery.isLoading || agendamentosQuery.isLoading) && <p>Carregando dados do cliente...</p>}
            {detalheQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(detalheQuery.error, "Não foi possível carregar o cliente.")}</p>
            )}
            {agendamentosQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(agendamentosQuery.error, "Não foi possível carregar os agendamentos.")}</p>
            )}

            {detalheQuery.data && <DetalheCliente cliente={detalheQuery.data} />}

            {agendamentosQuery.data && (
                <AgendamentosDoCliente clienteId={cliente.id} agendamentos={agendamentosQuery.data} adminKey={adminKey} />
            )}

            {deletarMutation.isError && (
                <p className="erro-campo">{extrairMensagemErro(deletarMutation.error, "Não foi possível excluir o cliente.")}</p>
            )}
            <div className="admin-lista-acoes">
                <button type="button" className="botao-secundario" disabled={deletarMutation.isPending} onClick={confirmarEDeletar}>
                    {deletarMutation.isPending ? "Excluindo..." : "Deletar cliente"}
                </button>
            </div>
        </AccordionItem>
    );
}

function DetalheCliente({ cliente }: { cliente: ClienteResponse }) {
    const [primeiroEndereco, ...demaisEnderecos] = cliente.enderecos;

    return (
        <div className="cliente-detalhe">
            <div className="admin-lista-acoes">
                <AcoesContato
                    telefone={cliente.telefone}
                    enderecoResumo={primeiroEndereco ? formatarEnderecoResumo(primeiroEndereco) : null}
                />
            </div>
            {cliente.email && (
                <p>
                    <strong>E-mail:</strong> {cliente.email}
                </p>
            )}
            {demaisEnderecos.length > 0 && (
                <div>
                    <strong>Outros endereços:</strong>
                    <ul>
                        {demaisEnderecos.map((endereco) => (
                            <li key={endereco.id}>
                                {formatarEnderecoResumo(endereco)} <BotaoCopiar valor={formatarEnderecoResumo(endereco)} label="Copiar" />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {cliente.alunos.length > 0 && (
                <div>
                    <strong>Alunos:</strong>
                    <ul>
                        {cliente.alunos.map((aluno) => (
                            <li key={aluno.id}>
                                {aluno.nome} ({aluno.idade} anos){aluno.observacoes && <> - Obs.: {aluno.observacoes}</>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

interface ColunaAgendamento {
    header: string;
    cell: (agendamento: AgendamentoResponse) => ReactNode;
}

const COLUNA_DATA: ColunaAgendamento = { header: "Data", cell: (a) => formatarDataBr(a.data) };
const COLUNA_HORA: ColunaAgendamento = { header: "Hora", cell: (a) => a.hora.slice(0, 5) };
const COLUNA_ALUNO: ColunaAgendamento = { header: "Aluno", cell: (a) => a.alunoNome ?? "-" };
const COLUNA_STATUS: ColunaAgendamento = { header: "Status", cell: (a) => STATUS_AGENDAMENTO_LABELS[a.status] };
const COLUNA_VALOR: ColunaAgendamento = {
    header: "Valor",
    cell: (a) => (a.valorCobrado != null ? formatarMoeda(a.valorCobrado) : "Sob consulta"),
};
const COLUNA_OBSERVACOES: ColunaAgendamento = { header: "Observações", cell: (a) => a.observacoes ?? "-" };

/**
 * Colunas por categoria (ver switch(categoriaServico) do pedido original): cada categoria expõe um
 * subconjunto diferente de campos do mesmo AgendamentoResponse - null vira "-" na célula em vez de
 * esconder a coluna inteira, pra manter a tabela alinhada.
 */
const COLUNAS_POR_CATEGORIA: Record<ECategoriaServico, ColunaAgendamento[]> = {
    EVENTO: [
        { header: "Tipo de evento", cell: (a) => (a.tipoEvento ? TIPO_EVENTO_LABELS[a.tipoEvento] : "-") },
        { header: "Aniversariante", cell: (a) => a.alunoNome ?? "-" },
        COLUNA_DATA,
        COLUNA_HORA,
        { header: "Local", cell: (a) => a.local ?? "-" },
        { header: "Duração", cell: (a) => `${a.duracaoMinutos} min` },
        { header: "Músicas", cell: (a) => (a.musicasObrigatorias.length > 0 ? a.musicasObrigatorias.join(", ") : "-") },
        COLUNA_VALOR,
        COLUNA_STATUS,
        COLUNA_OBSERVACOES,
    ],
    MUSICALIZACAO_INFANTIL: [
        { header: "Modalidade", cell: (a) => (a.modalidade ? MODALIDADE_LABELS[a.modalidade] : "-") },
        COLUNA_ALUNO,
        COLUNA_DATA,
        COLUNA_HORA,
        COLUNA_VALOR,
        COLUNA_STATUS,
        COLUNA_OBSERVACOES,
    ],
    MUSICOTERAPIA: [
        { header: "Modalidade", cell: (a) => (a.modalidade ? MODALIDADE_LABELS[a.modalidade] : "-") },
        COLUNA_ALUNO,
        COLUNA_DATA,
        COLUNA_HORA,
        COLUNA_VALOR,
        COLUNA_STATUS,
        COLUNA_OBSERVACOES,
    ],
    AULA_INSTRUMENTO: [
        { header: "Instrumento", cell: (a) => (a.instrumento ? INSTRUMENTO_LABELS[a.instrumento] : "-") },
        COLUNA_ALUNO,
        COLUNA_DATA,
        COLUNA_HORA,
        COLUNA_STATUS,
        COLUNA_OBSERVACOES,
    ],
};

function AgendamentosDoCliente({
    clienteId,
    agendamentos,
    adminKey,
}: {
    clienteId: number;
    agendamentos: AgendamentoResponse[];
    adminKey: string;
}) {
    if (agendamentos.length === 0) {
        return <p className="aviso">Nenhum agendamento registrado para este cliente ainda.</p>;
    }

    return (
        <>
            {CATEGORIAS_ORDENADAS.map((categoria) => {
                const doCategoria = agendamentos.filter((a) => a.categoria === categoria);
                if (doCategoria.length === 0) {
                    return null;
                }
                const colunas = COLUNAS_POR_CATEGORIA[categoria];
                return (
                    <div key={categoria} className="cliente-categoria-grupo">
                        <h3>{CATEGORIA_LABELS[categoria]}</h3>
                        <table className="tabela-precos">
                            <thead>
                                <tr>
                                    {colunas.map((coluna) => (
                                        <th key={coluna.header}>{coluna.header}</th>
                                    ))}
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {doCategoria.map((agendamento) => (
                                    <LinhaAgendamentoCliente
                                        key={agendamento.id}
                                        clienteId={clienteId}
                                        agendamento={agendamento}
                                        colunas={colunas}
                                        adminKey={adminKey}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </>
    );
}

/**
 * Uma linha = uma data marcada. "Reagendar" chama o PUT existente uma vez, só para essa linha - não
 * existe um "reagendar em lote" (ver plano): cada data do mesmo pacote é seu próprio agendamento.
 */
function LinhaAgendamentoCliente({
    clienteId,
    agendamento,
    colunas,
    adminKey,
}: {
    clienteId: number;
    agendamento: AgendamentoResponse;
    colunas: ColunaAgendamento[];
    adminKey: string;
}) {
    const [reagendando, setReagendando] = useState(false);
    const queryClient = useQueryClient();

    const reagendarMutation = useMutation({
        mutationFn: ({ data, hora }: { data: string; hora: string }) => reagendarAdmin(agendamento.id, data, hora, adminKey),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-cliente-agendamentos", clienteId] });
            setReagendando(false);
        },
    });

    return (
        <>
            <tr>
                {colunas.map((coluna) => (
                    <td key={coluna.header}>{coluna.cell(agendamento)}</td>
                ))}
                <td className="admin-lista-acoes">
                    {!STATUS_TERMINAIS.includes(agendamento.status) && !reagendando && (
                        <button type="button" onClick={() => setReagendando(true)}>
                            Reagendar
                        </button>
                    )}
                </td>
            </tr>
            {reagendando && (
                <tr>
                    <td colSpan={colunas.length + 1}>
                        {reagendarMutation.isError && (
                            <p className="erro-campo">{extrairMensagemErro(reagendarMutation.error, "Não foi possível reagendar.")}</p>
                        )}
                        <ReagendarForm
                            duracaoMinutos={agendamento.duracaoMinutos}
                            pendente={reagendarMutation.isPending}
                            ehEvento={agendamento.categoria === "EVENTO"}
                            onReagendar={(data, hora) => reagendarMutation.mutate({ data, hora })}
                            onCancelar={() => setReagendando(false)}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}
