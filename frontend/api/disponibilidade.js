// GET /api/disponibilidade?data=AAAA-MM-DD
// Devolve só os intervalos ocupados do dia (em minutos desde 00h, horário de
// Salvador), sem nenhum detalhe dos compromissos, para o formulário esconder
// horários que já não cabem na agenda.

import { OFFSET_FUSO, somarDias } from '../src/agendamento/regras.js'
import { buscarOcupados, configuracaoGoogle } from './_lib/googleCalendar.js'

export default async function handler(req, res, dependencias = { buscarOcupados, configuracaoGoogle }) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ erro: 'Método não permitido.' })
    }

    const data = String(req.query?.data ?? '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return res.status(400).json({ erro: 'Informe a data no formato AAAA-MM-DD.' })
    }

    const config = dependencias.configuracaoGoogle()
    if (!config) {
        return res.status(503).json({ erro: 'Agenda indisponível.' })
    }

    try {
        const inicioDia = new Date(`${data}T00:00:00${OFFSET_FUSO}`)
        const fimDia = new Date(`${somarDias(data, 1)}T00:00:00${OFFSET_FUSO}`)
        const ocupados = await dependencias.buscarOcupados(config, inicioDia.toISOString(), fimDia.toISOString())
        const paraMinutos = (momento) => Math.round((momento.getTime() - inicioDia.getTime()) / 60_000)

        res.setHeader('Cache-Control', 'no-store')
        return res.status(200).json({
            data,
            ocupados: ocupados.map((o) => ({
                inicio: Math.max(0, paraMinutos(o.inicio)),
                fim: Math.min(24 * 60, paraMinutos(o.fim)),
            })),
        })
    } catch (erro) {
        console.error('Disponibilidade: falha no Google Agenda', erro)
        return res.status(502).json({ erro: 'Agenda indisponível.' })
    }
}
