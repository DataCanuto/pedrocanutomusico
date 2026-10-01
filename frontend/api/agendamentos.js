// POST /api/agendamentos
// Recebe o pedido do formulário, revalida as regras de negócio, confere a
// agenda do Pedro e cria os compromissos como PENDENTES no Google Agenda.

import { randomUUID } from 'node:crypto'
import { hojeEmSalvador, montarMensagemWhatsapp, normalizarPedido, validarPedido } from '../src/agendamento/regras.js'
import { buscarOcupados, configuracaoGoogle, criarEvento } from './_lib/googleCalendar.js'
import { fimDoSlot, inicioDoSlot, montarEventos, slotsEmConflito, whatsappDoPedro } from './_lib/evento.js'

export default async function handler(req, res, dependencias = { buscarOcupados, criarEvento, configuracaoGoogle }) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ erro: 'Método não permitido.' })
    }

    const corpo = typeof req.body === 'string' ? safeJson(req.body) : req.body
    if (!corpo || typeof corpo !== 'object') {
        return res.status(400).json({ erro: 'Pedido inválido.' })
    }

    // Campo invisível no formulário: robôs preenchem, pessoas não.
    if (corpo.site) {
        return res.status(201).json({ agendamentoId: 'ok', slots: [] })
    }

    const pedido = normalizarPedido(corpo)
    const { erros, slots } = validarPedido(pedido, hojeEmSalvador())
    if (erros.length) {
        return res.status(400).json({ erro: erros[0], erros })
    }

    const config = dependencias.configuracaoGoogle()
    if (!config) {
        console.error('Agendamento: variáveis GOOGLE_* não configuradas')
        return res.status(503).json({ erro: 'Agendamento on-line indisponível no momento. Fale com o Pedro pelo WhatsApp.' })
    }

    try {
        const inicio = new Date(Math.min(...slots.map((s) => inicioDoSlot(s).getTime())) - 60 * 60_000)
        const fim = new Date(Math.max(...slots.map((s) => fimDoSlot(s).getTime())) + 60 * 60_000)
        const ocupados = await dependencias.buscarOcupados(config, inicio.toISOString(), fim.toISOString())
        const conflitos = slotsEmConflito(slots, ocupados)
        if (conflitos.length) {
            return res.status(409).json({
                erro: 'Algum horário escolhido acabou de ficar indisponível. Escolha outro horário.',
                conflitos: conflitos.map(({ data, hora }) => ({ data, hora })),
            })
        }

        const agendamentoId = randomUUID()
        for (const evento of montarEventos(pedido, slots, agendamentoId)) {
            await dependencias.criarEvento(config, evento)
        }

        return res.status(201).json({
            agendamentoId,
            slots: slots.map(({ data, hora, duracaoMinutos }) => ({ data, hora, duracaoMinutos })),
            whatsapp: whatsappDoPedro(montarMensagemWhatsapp(pedido, slots)),
        })
    } catch (erro) {
        console.error('Agendamento: falha no Google Agenda', erro)
        return res.status(502).json({ erro: 'Não foi possível registrar o agendamento agora. Fale com o Pedro pelo WhatsApp.' })
    }
}

function safeJson(texto) {
    try {
        return JSON.parse(texto)
    } catch {
        return null
    }
}
