import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { listarClientesAdmin } from "../../services/clienteAdminService";
import { extrairMensagemErro } from "../../services/api";
import { montarLinkWhatsAppPara } from "../../services/whatsapp";

export function AdminClientesPage() {
    return <AdminGate titulo="Clientes">{(adminKey) => <ListaDeClientes adminKey={adminKey} />}</AdminGate>;
}

function ListaDeClientes({ adminKey }: { adminKey: string }) {
    const clientesQuery = useQuery({ queryKey: ["admin-clientes"], queryFn: () => listarClientesAdmin(adminKey) });
    const [enderecoCopiado, setEnderecoCopiado] = useState<number | null>(null);

    async function copiarEndereco(clienteId: number, enderecoResumo: string) {
        await navigator.clipboard.writeText(enderecoResumo);
        setEnderecoCopiado(clienteId);
        setTimeout(() => setEnderecoCopiado(null), 2000);
    }

    return (
        <>
            {clientesQuery.isLoading && <p>Carregando...</p>}
            {clientesQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(clientesQuery.error, "Não foi possível carregar os clientes.")}</p>
            )}

            {clientesQuery.data && (
                <table className="tabela-precos">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Endereço</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesQuery.data.map((cliente) => (
                            <tr key={cliente.id}>
                                <td>{cliente.nome}</td>
                                <td>{cliente.telefone}</td>
                                <td>{cliente.enderecoResumo ?? "-"}</td>
                                <td className="admin-lista-acoes">
                                    <a href={montarLinkWhatsAppPara(cliente.telefone)} target="_blank" rel="noreferrer">
                                        <button type="button">WhatsApp</button>
                                    </a>
                                    {cliente.enderecoResumo && (
                                        <button type="button" onClick={() => copiarEndereco(cliente.id, cliente.enderecoResumo!)}>
                                            {enderecoCopiado === cliente.id ? "Copiado!" : "Copiar endereço"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}
