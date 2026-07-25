import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate } from "../../components/admin/AdminGate";
import { AcoesContato } from "../../components/admin/AcoesContato";
import { deletarClienteAdmin, listarClientesAdmin } from "../../services/clienteAdminService";
import { extrairMensagemErro } from "../../services/api";
import { CATEGORIA_LABELS } from "../../types/labels";

export function AdminClientesPage() {
    return <AdminGate titulo="Clientes">{(adminKey) => <ListaDeClientes adminKey={adminKey} />}</AdminGate>;
}

function ListaDeClientes({ adminKey }: { adminKey: string }) {
    const queryClient = useQueryClient();
    const clientesQuery = useQuery({ queryKey: ["admin-clientes"], queryFn: () => listarClientesAdmin(adminKey) });

    const deletarMutation = useMutation({
        mutationFn: (clienteId: number) => deletarClienteAdmin(clienteId, adminKey),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-clientes"] }),
    });

    function confirmarEDeletar(clienteId: number, nome: string) {
        const confirmado = window.confirm(
            `Excluir ${nome}? Isso remove o cliente e TODOS os agendamentos, aulas e matrículas vinculados a ele. Essa ação não pode ser desfeita.`,
        );
        if (confirmado) {
            deletarMutation.mutate(clienteId);
        }
    }

    return (
        <>
            {clientesQuery.isLoading && <p>Carregando...</p>}
            {clientesQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(clientesQuery.error, "Não foi possível carregar os clientes.")}</p>
            )}
            {deletarMutation.isError && (
                <p className="erro-campo">{extrairMensagemErro(deletarMutation.error, "Não foi possível excluir o cliente.")}</p>
            )}

            {clientesQuery.data && (
                <table className="tabela-precos">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Endereço</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesQuery.data.map((cliente) => (
                            <tr key={cliente.id}>
                                <td>{cliente.categoriaServico ? CATEGORIA_LABELS[cliente.categoriaServico] : "-"}</td>
                                <td>{cliente.nome}</td>
                                <td>{cliente.telefone}</td>
                                <td>{cliente.enderecoResumo ?? "-"}</td>
                                <td className="admin-lista-acoes">
                                    <AcoesContato telefone={cliente.telefone} enderecoResumo={cliente.enderecoResumo} />
                                    <button
                                        type="button"
                                        disabled={deletarMutation.isPending}
                                        onClick={() => confirmarEDeletar(cliente.id, cliente.nome)}
                                    >
                                        Deletar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}
