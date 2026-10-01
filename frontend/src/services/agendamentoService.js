// Comunicação com as funções da Vercel em /api.

export async function enviarAgendamento(pedido) {
    const resposta = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido),
    })
    const corpo = await resposta.json().catch(() => ({}))
    if (!resposta.ok) {
        throw new Error(corpo.erro ?? 'Não foi possível registrar o agendamento agora.')
    }
    return corpo
}

/** Intervalos ocupados do dia em minutos desde 00h; lista vazia se a agenda não responder. */
export async function buscarOcupadosDoDia(data) {
    try {
        const resposta = await fetch(`/api/disponibilidade?data=${data}`)
        if (!resposta.ok) {
            return []
        }
        const corpo = await resposta.json()
        return corpo.ocupados ?? []
    } catch {
        return []
    }
}
