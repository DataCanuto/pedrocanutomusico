import { useEffect, useState } from "react";

/** Exibida até a janela terminar de carregar (imagens e demais mídias inclusas). */
export function TelaCarregamento() {
    const [carregando, setCarregando] = useState(document.readyState !== "complete");

    useEffect(() => {
        if (!carregando) return;

        const finalizar = () => setCarregando(false);
        window.addEventListener("load", finalizar);
        return () => window.removeEventListener("load", finalizar);
    }, [carregando]);

    if (!carregando) return null;

    return (
        <div className="tela-carregamento" role="status" aria-live="polite">
            <span className="tela-carregamento-spinner" />
            <p>Carregando...</p>
        </div>
    );
}
