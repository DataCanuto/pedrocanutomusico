import { useState, type ReactNode } from "react";

interface AccordionItemProps {
    titulo: ReactNode;
    subtitulo?: ReactNode;
    children: ReactNode;
    abertoPorPadrao?: boolean;
    className?: string;
}

/** Seção expansível controlada por clique - abre e recolhe para manter a página enxuta. */
export function AccordionItem({ titulo, subtitulo, children, abertoPorPadrao = false, className }: AccordionItemProps) {
    const [aberto, setAberto] = useState(abertoPorPadrao);

    return (
        <div className={`accordion-item ${className ?? ""}`.trim()} data-aberto={aberto}>
            <button type="button" className="accordion-gatilho" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
                <span className="accordion-gatilho-texto">
                    <span className="accordion-titulo">{titulo}</span>
                    {subtitulo && <span className="accordion-subtitulo">{subtitulo}</span>}
                </span>
                <span className="accordion-icone" aria-hidden="true">
                    {aberto ? "–" : "+"}
                </span>
            </button>
            <div className="accordion-painel">
                <div className="accordion-painel-inner">{children}</div>
            </div>
        </div>
    );
}
