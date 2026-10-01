// Cliente mínimo da Google Calendar API usando uma conta de serviço.
// Sem dependências: o token OAuth é obtido assinando um JWT com node:crypto.
//
// Variáveis de ambiente (configuradas na Vercel):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL  e-mail da conta de serviço
//   GOOGLE_PRIVATE_KEY            chave privada da conta de serviço (PEM)
//   GOOGLE_CALENDAR_ID            id da agenda do Pedro, compartilhada com a conta de serviço

import { createSign } from 'node:crypto'

const ESCOPO = 'https://www.googleapis.com/auth/calendar'
const URL_TOKEN = 'https://oauth2.googleapis.com/token'
const URL_API = 'https://www.googleapis.com/calendar/v3'

let tokenEmCache = null

export function configuracaoGoogle(env = process.env) {
    const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const chave = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const calendarId = env.GOOGLE_CALENDAR_ID
    if (!email || !chave || !calendarId) {
        return null
    }
    return { email, chave, calendarId }
}

function base64Url(valor) {
    return Buffer.from(typeof valor === 'string' ? valor : JSON.stringify(valor)).toString('base64url')
}

async function obterToken({ email, chave }) {
    const agora = Math.floor(Date.now() / 1000)
    if (tokenEmCache && tokenEmCache.expiraEm - 60 > agora) {
        return tokenEmCache.token
    }

    const cabecalho = base64Url({ alg: 'RS256', typ: 'JWT' })
    const conteudo = base64Url({ iss: email, scope: ESCOPO, aud: URL_TOKEN, iat: agora, exp: agora + 3600 })
    const assinatura = createSign('RSA-SHA256').update(`${cabecalho}.${conteudo}`).sign(chave, 'base64url')

    const resposta = await fetch(URL_TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${cabecalho}.${conteudo}.${assinatura}`,
        }),
    })
    if (!resposta.ok) {
        throw new Error(`Falha ao autenticar no Google (${resposta.status}): ${await resposta.text()}`)
    }
    const { access_token: token, expires_in: expiraEmSegundos } = await resposta.json()
    tokenEmCache = { token, expiraEm: agora + expiraEmSegundos }
    return token
}

async function chamarApi(config, caminho, opcoes = {}) {
    const token = await obterToken(config)
    const resposta = await fetch(`${URL_API}${caminho}`, {
        ...opcoes,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opcoes.headers },
    })
    if (!resposta.ok) {
        throw new Error(`Google Calendar respondeu ${resposta.status}: ${await resposta.text()}`)
    }
    return resposta.json()
}

/** Intervalos ocupados na agenda entre inicio e fim (ISO 8601). Não expõe detalhes dos eventos. */
export async function buscarOcupados(config, inicioIso, fimIso) {
    const corpo = await chamarApi(config, '/freeBusy', {
        method: 'POST',
        body: JSON.stringify({ timeMin: inicioIso, timeMax: fimIso, timeZone: 'America/Bahia', items: [{ id: config.calendarId }] }),
    })
    const agenda = corpo.calendars?.[config.calendarId]
    if (agenda?.errors?.length) {
        throw new Error(`Sem acesso à agenda: ${JSON.stringify(agenda.errors)}`)
    }
    return (agenda?.busy ?? []).map(({ start, end }) => ({ inicio: new Date(start), fim: new Date(end) }))
}

export async function criarEvento(config, evento) {
    return chamarApi(config, `/calendars/${encodeURIComponent(config.calendarId)}/events`, {
        method: 'POST',
        body: JSON.stringify(evento),
    })
}
