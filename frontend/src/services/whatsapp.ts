const NUMERO_WHATSAPP = "5571999588950";

export function montarLinkWhatsApp(mensagem: string): string {
    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

/** Link pra falar com um número específico (ex.: um cliente, na área do professor) - não com o WhatsApp fixo do professor. */
export function montarLinkWhatsAppPara(telefone: string, mensagem?: string): string {
    const digitos = telefone.replace(/\D/g, "");
    const numeroComPais = digitos.startsWith("55") ? digitos : `55${digitos}`;
    const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
    return `https://wa.me/${numeroComPais}${texto}`;
}
