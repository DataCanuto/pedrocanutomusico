import { useState } from "react";
import { montarLinkWhatsAppPara } from "../../services/whatsapp";

/** Botões de WhatsApp + copiar endereço, reaproveitados em qualquer listagem admin que mostre contato de um responsável (clientes, roster de turma). */
export function AcoesContato({ telefone, enderecoResumo }: { telefone: string; enderecoResumo: string | null }) {
    const [copiado, setCopiado] = useState(false);

    async function copiarEndereco() {
        if (!enderecoResumo) return;
        await navigator.clipboard.writeText(enderecoResumo);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }

    return (
        <>
            <a href={montarLinkWhatsAppPara(telefone)} target="_blank" rel="noreferrer">
                <button type="button">WhatsApp</button>
            </a>
            {enderecoResumo && (
                <button type="button" onClick={copiarEndereco}>
                    {copiado ? "Copiado!" : "Copiar endereço"}
                </button>
            )}
        </>
    );
}
