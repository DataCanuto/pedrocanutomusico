import { useState } from "react";

/**
 * Pedro vai adicionando as fotos aos poucos em public/imagens/servicos/<slug>.jpg - até lá, o
 * slot some (sem ícone de imagem quebrada) em vez de reservar espaço vazio.
 */
export function ImagemServico({ slug, alt }: { slug: string; alt: string }) {
    const [falhou, setFalhou] = useState(false);

    if (falhou) {
        return null;
    }

    return <img className="servico-imagem" src={`/imagens/servicos/${slug}.jpg`} alt={alt} loading="lazy" onError={() => setFalhou(true)} />;
}
