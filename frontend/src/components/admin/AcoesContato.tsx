import { montarLinkWhatsAppPara } from "../../services/whatsapp";
import { BotaoCopiar } from "../ui/BotaoCopiar";

/** EnderecoFormatter.resumo (backend) monta "rua, numero - bairro, cidade/estado" - só rua+numero é o suficiente pro Waze localizar o endereço. */
function montarLinkWaze(enderecoResumo: string): string {
    const ruaNumero = enderecoResumo.split(" - ")[0];
    return `https://waze.com/ul?q=${encodeURIComponent(ruaNumero)}&navigate=yes`;
}

/** Botões de WhatsApp + copiar endereço + Waze, reaproveitados em qualquer listagem admin que mostre contato de um responsável (clientes, roster de turma, agenda). */
export function AcoesContato({ telefone, enderecoResumo }: { telefone: string; enderecoResumo: string | null }) {
    return (
        <>
            <a href={montarLinkWhatsAppPara(telefone)} target="_blank" rel="noreferrer">
                <button type="button">WhatsApp</button>
            </a>
            {enderecoResumo && <BotaoCopiar valor={enderecoResumo} label="Copiar endereço" />}
            {enderecoResumo && (
                <a href={montarLinkWaze(enderecoResumo)} target="_blank" rel="noreferrer">
                    <button type="button">Abrir no Waze</button>
                </a>
            )}
        </>
    );
}
