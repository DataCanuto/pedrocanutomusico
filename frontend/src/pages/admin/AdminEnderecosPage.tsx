import { useQuery } from "@tanstack/react-query";
import { AdminGate } from "../../components/admin/AdminGate";
import { listarEnderecosAdmin } from "../../services/enderecoAdminService";
import { extrairMensagemErro } from "../../services/api";

export function AdminEnderecosPage() {
    return <AdminGate titulo="Endereços">{(adminKey) => <ListaDeEnderecos adminKey={adminKey} />}</AdminGate>;
}

function ListaDeEnderecos({ adminKey }: { adminKey: string }) {
    const enderecosQuery = useQuery({ queryKey: ["admin-enderecos"], queryFn: () => listarEnderecosAdmin(adminKey) });

    return (
        <>
            {enderecosQuery.isLoading && <p>Carregando...</p>}
            {enderecosQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(enderecosQuery.error, "Não foi possível carregar os endereços.")}</p>
            )}

            {enderecosQuery.data && (
                <table className="tabela-precos">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Rua</th>
                            <th>Número</th>
                            <th>Bairro</th>
                            <th>Complemento</th>
                            <th>CEP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enderecosQuery.data.map((endereco) => (
                            <tr key={endereco.id}>
                                <td>{endereco.clienteNome}</td>
                                <td>{endereco.rua}</td>
                                <td>{endereco.numero}</td>
                                <td>{endereco.bairro}</td>
                                <td>{endereco.complemento ?? "-"}</td>
                                <td>{endereco.cep}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}
