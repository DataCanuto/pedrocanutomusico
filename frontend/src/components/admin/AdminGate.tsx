import { useState, type ReactNode } from "react";
import { useAdminKey } from "../../hooks/useAdminKey";

/**
 * Pede a chave de admin uma vez e, depois de autenticado, desenha o cabeçalho padrão (título +
 * botão "Trocar chave") de forma consistente em toda página admin - antes cada página repetia
 * esse mesmo cabeçalho, dando a impressão de que "Trocar chave" era uma ação local da página.
 */
export function AdminGate({ titulo, children }: { titulo: string; children: (adminKey: string) => ReactNode }) {
    const { adminKey, setAdminKey, temChave } = useAdminKey();
    const [chaveDigitada, setChaveDigitada] = useState("");

    if (!temChave) {
        return (
            <div className="pagina-admin">
                <h1>Área do professor</h1>
                <p>
                    Informe a chave de administrador para acessar: <strong>{titulo}</strong>
                </p>
                <input
                    type="password"
                    value={chaveDigitada}
                    onChange={(e) => setChaveDigitada(e.target.value)}
                    placeholder="Chave de admin"
                />
                <button onClick={() => setAdminKey(chaveDigitada)} disabled={!chaveDigitada}>
                    Entrar
                </button>
            </div>
        );
    }

    return (
        <div className="pagina-admin">
            <div className="admin-header">
                <h1>{titulo}</h1>
                <button onClick={() => setAdminKey("")}>Trocar chave</button>
            </div>
            {children(adminKey)}
        </div>
    );
}
