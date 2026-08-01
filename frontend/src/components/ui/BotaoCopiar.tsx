import { useState } from "react";

/** Botão genérico de copiar para a área de transferência, com feedback "Copiado!" por 2s. */
export function BotaoCopiar({ valor, label = "Copiar" }: { valor: string; label?: string }) {
    const [copiado, setCopiado] = useState(false);

    async function copiar() {
        await navigator.clipboard.writeText(valor);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }

    return (
        <button type="button" onClick={copiar}>
            {copiado ? "Copiado!" : label}
        </button>
    );
}
