import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useAdminKey } from "../../hooks/useAdminKey";
import { BotaoVoltar } from "../layout/BotaoVoltar";
import { extrairMensagemErro } from "../../services/api";
import { verificarAdminKey } from "../../services/adminAuthService";

/**
 * Pede a chave de admin uma vez e, depois de autenticado, desenha o cabeçalho padrão (título +
 * botão "Trocar chave") de forma consistente em toda página admin - antes cada página repetia
 * esse mesmo cabeçalho, dando a impressão de que "Trocar chave" era uma ação local da página.
 *
 * A chave é validada contra o backend (GET /admin/auth/verificar) antes de liberar acesso.
 * Sem isso, uma chave errada ou desatualizada em sessionStorage deixava o professor "entrar" e
 * só descobrir o problema depois, com cada página (turmas, eventos, clientes...) falhando
 * separadamente e sem deixar claro que a causa era a mesma chave inválida em todas elas.
 */
export function AdminGate({
    titulo,
    destinoVoltar = "/admin",
    children,
}: {
    titulo: string;
    destinoVoltar?: string;
    children: (adminKey: string) => ReactNode;
}) {
    const { adminKey, setAdminKey, temChave } = useAdminKey();
    const [chaveDigitada, setChaveDigitada] = useState("");
    const [erroChave, setErroChave] = useState<string | null>(null);

    const verificacao = useQuery({
        queryKey: ["admin-key-verificacao", adminKey],
        queryFn: () => verificarAdminKey(adminKey),
        enabled: temChave,
        retry: false,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (verificacao.isError) {
            setErroChave(extrairMensagemErro(verificacao.error, "Chave de admin inválida."));
            setAdminKey("");
        }
    }, [verificacao.isError, verificacao.error, setAdminKey]);

    function tentarEntrar() {
        setErroChave(null);
        setAdminKey(chaveDigitada);
    }

    if (!temChave) {
        return (
            <div className="pagina-admin">
                <BotaoVoltar destino="/" />
                <h1>Área do professor</h1>
                <p>
                    Informe a chave de administrador para acessar: <strong>{titulo}</strong>
                </p>
                <input
                    type="password"
                    value={chaveDigitada}
                    onChange={(e) => setChaveDigitada(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && chaveDigitada && tentarEntrar()}
                    placeholder="Chave de admin"
                />
                <button onClick={tentarEntrar} disabled={!chaveDigitada}>
                    Entrar
                </button>
                {erroChave && <p className="erro-campo">{erroChave}</p>}
            </div>
        );
    }

    if (verificacao.isLoading) {
        return <p>Verificando chave...</p>;
    }

    return (
        <div className="pagina-admin">
            <BotaoVoltar destino={destinoVoltar} />
            <div className="admin-header">
                <h1>{titulo}</h1>
                <button onClick={() => setAdminKey("")}>Trocar chave</button>
            </div>
            {children(adminKey)}
        </div>
    );
}
