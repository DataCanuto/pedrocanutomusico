import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminGate } from "../../components/admin/AdminGate";
import { listarAgendaAdmin } from "../../services/agendamentoAdminService";
import { statusDoCompromisso } from "../../utils/compromisso";

const ACOES = [
    { to: "/admin/turmas", titulo: "Cadastrar turma", descricao: "Abre uma nova turma de aula em grupo e gera o código para compartilhar." },
    { to: "/admin/precos/novo-evento", titulo: "Cadastrar novo evento", descricao: "Adiciona um novo pacote de evento ao catálogo." },
    { to: "/admin/musicos", titulo: "Cadastrar músico parceiro", descricao: "Cadastra músicos parceiros disponíveis para eventos e turmas." },
    { to: "/admin/precos", titulo: "Ver tabela de preços", descricao: "Consulta e ajusta os valores/durações já cadastrados." },
    { to: "/admin/agenda", titulo: "Ver agenda", descricao: "Calendário com os agendamentos - por mês, semana ou dia." },
    {
        to: "/admin/clientes",
        titulo: "Ver clientes",
        descricao: "Lista de clientes com agendamentos, filtros/ordenação e atalhos para WhatsApp/Waze.",
    },
    { to: "/admin/turmas/ver", titulo: "Ver turmas", descricao: "Turmas ativas com os alunos matriculados em cada uma." },
    { to: "/admin/anamneses", titulo: "Ver anamneses", descricao: "Pacientes de musicoterapia com a anamnese preenchida no primeiro agendamento." },
];

export function AdminHomePage() {
    return (
        <AdminGate titulo="Área do professor" destinoVoltar="/">
            {(adminKey) => <PainelAcoes adminKey={adminKey} />}
        </AdminGate>
    );
}

/**
 * A contagem de "AGENDADO" reaproveita a mesma queryKey ["admin-agenda"] usada pela
 * página de Agenda - assim o hub avisa quantos compromissos ainda não foram confirmados sem
 * precisar de um endpoint novo, e o cache já fica quente quando o professor entra na agenda.
 */
function PainelAcoes({ adminKey }: { adminKey: string }) {
    const agendaQuery = useQuery({
        queryKey: ["admin-agenda"],
        queryFn: () => listarAgendaAdmin(adminKey),
    });

    const pendentes = agendaQuery.data?.filter((c) => statusDoCompromisso(c) === "AGENDADO").length ?? 0;

    return (
        <div className="admin-hub">
            {ACOES.map((acao) => (
                <Link key={acao.to} to={acao.to} className="admin-hub-card">
                    <strong>
                        {acao.titulo}
                        {acao.to === "/admin/agenda" && pendentes > 0 && (
                            <span className="admin-hub-badge">{pendentes}</span>
                        )}
                    </strong>
                    <span>{acao.descricao}</span>
                </Link>
            ))}
        </div>
    );
}
