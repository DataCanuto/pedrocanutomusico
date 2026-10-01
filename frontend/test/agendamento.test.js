import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync } from 'node:crypto'
import { conflita, gerarDatasRecorrentes, horariosDoDia, normalizarPedido, validarPedido } from '../src/agendamento/regras.js'
import { slotsEmConflito } from '../api/_lib/evento.js'
import agendamentos from '../api/agendamentos.js'
import disponibilidade from '../api/disponibilidade.js'

const HOJE = '2026-10-01' // quinta-feira

const BASE = {
    cliente: { nome: 'Maria Souza', telefone: '(71) 98888-7777', email: '' },
    endereco: { cep: '40150-000', rua: 'Rua A', numero: '10', complemento: '', bairro: 'Barra', cidade: 'Salvador', estado: 'BA' },
    aluno: { nome: 'Lia', idade: '5' },
}

function respostaFalsa() {
    return {
        statusCode: 0, corpo: null, headers: {},
        status(codigo) { this.statusCode = codigo; return this },
        json(corpo) { this.corpo = corpo; return this },
        setHeader(nome, valor) { this.headers[nome] = valor },
    }
}

test('expediente de aulas: sem domingo, sábado até 13h, grade de 15 min', () => {
    assert.deepEqual(horariosDoDia('MUSICOTERAPIA', '2026-10-04'), [])
    const sabado = horariosDoDia('MUSICOTERAPIA', '2026-10-03')
    assert.equal(sabado.at(0), '08:00')
    assert.equal(sabado.at(-1), '13:00')
    assert.equal(horariosDoDia('MUSICOTERAPIA', '2026-10-05').at(-1), '18:00')
    assert.equal(horariosDoDia('EVENTO', '2026-10-04').length, 41)
})

test('conflito respeita 15 min de deslocamento', () => {
    // existente 09:00-09:50; novo às 10:00 fica a só 10 min
    assert.equal(conflita(600, 50, 540, 590), true)
    assert.equal(conflita(605, 50, 540, 590), false)
})

test('pacote gera datas intercaladas e respeita a janela de 31 dias', () => {
    const slots = gerarDatasRecorrentes([{ diaSemana: 3, hora: '10:00' }, { diaSemana: 1, hora: '14:00' }], 4, '2026-10-02')
    assert.deepEqual(slots.map((s) => `${s.data} ${s.hora}`), [
        '2026-10-05 14:00', '2026-10-07 10:00', '2026-10-12 14:00', '2026-10-14 10:00',
    ])
    assert.throws(() => gerarDatasRecorrentes([{ diaSemana: 1, hora: '10:00' }], 12, '2026-10-02'), /31 dias/)
})

test('valida aula avulsa', () => {
    const pedido = normalizarPedido({ ...BASE, categoria: 'MUSICALIZACAO_INFANTIL', modalidade: 'INDIVIDUAL', tipoContratacao: 'AVULSO', data: '2026-10-05', hora: '09:00' })
    const { erros, slots } = validarPedido(pedido, HOJE)
    assert.deepEqual(erros, [])
    assert.deepEqual(slots, [{ data: '2026-10-05', hora: '09:00', duracaoMinutos: 30 }])
})

test('rejeita domingo, data passada, pacote inexistente e evento sem pacote', () => {
    const domingo = validarPedido(normalizarPedido({ ...BASE, categoria: 'MUSICOTERAPIA', modalidade: 'INDIVIDUAL', tipoContratacao: 'AVULSO', data: '2026-10-04', hora: '09:00' }), HOJE)
    assert.match(domingo.erros.join(), /domingos/)
    const hoje = validarPedido(normalizarPedido({ ...BASE, categoria: 'MUSICOTERAPIA', modalidade: 'INDIVIDUAL', tipoContratacao: 'AVULSO', data: HOJE, hora: '09:00' }), HOJE)
    assert.match(hoje.erros.join(), /amanhã/)
    const pacote12 = validarPedido(normalizarPedido({ ...BASE, categoria: 'AULA_INSTRUMENTO', modalidade: 'INDIVIDUAL', tipoContratacao: 'PACOTE_12', instrumento: 'VIOLAO' }), HOJE)
    assert.match(pacote12.erros.join(), /pacote/)
    const evento = validarPedido(normalizarPedido({ ...BASE, categoria: 'EVENTO', tipoEvento: 'CASAMENTO', data: '2026-10-04', hora: '16:00' }), HOJE)
    assert.match(evento.erros.join(), /pacote/)
})

test('evento sob consulta reserva 120 min, inclusive aos domingos', () => {
    const { erros, slots } = validarPedido(normalizarPedido({ ...BASE, categoria: 'EVENTO', tipoEvento: 'CASAMENTO', pacoteEventoId: 'casamento', data: '2026-10-04', hora: '16:00' }), HOJE)
    assert.deepEqual(erros, [])
    assert.equal(slots[0].duracaoMinutos, 120)
})

test('slotsEmConflito compara em horário de Salvador', () => {
    const slot = { data: '2026-10-05', hora: '09:00', duracaoMinutos: 50 }
    const ocupado = { inicio: new Date('2026-10-05T13:00:00Z'), fim: new Date('2026-10-05T14:00:00Z') } // 10h-11h em Salvador
    assert.equal(slotsEmConflito([slot], [ocupado]).length, 1)
    assert.equal(slotsEmConflito([{ ...slot, hora: '08:00' }], [ocupado]).length, 0)
})

const CONFIG = { email: 'x', chave: 'y', calendarId: 'agenda' }

test('API cria um evento pendente por encontro do pacote', async () => {
    const criados = []
    const res = respostaFalsa()
    await agendamentos(
        { method: 'POST', body: { ...BASE, categoria: 'AULA_INSTRUMENTO', modalidade: 'INDIVIDUAL', tipoContratacao: 'PACOTE_4', instrumento: 'VIOLAO', data: '2099-01-05', recorrencias: [{ diaSemana: 1, hora: '10:00' }, { diaSemana: 3, hora: '15:00' }] } },
        res,
        { configuracaoGoogle: () => CONFIG, buscarOcupados: async () => [], criarEvento: async (_c, e) => criados.push(e) }
    )
    assert.equal(res.statusCode, 201, JSON.stringify(res.corpo))
    assert.equal(criados.length, 4)
    assert.equal(criados[0].status, 'tentative')
    assert.match(criados[0].summary, /PENDENTE · Aulas de Instrumento - Violão · Lia \(1\/4\)/)
    assert.equal(criados[0].start.dateTime, '2099-01-05T13:00:00.000Z')
    assert.match(criados[0].description, /Waze: https:\/\/waze\.com/)
    assert.equal(criados[0].extendedProperties.private.clienteTelefone, '5571988887777')
    assert.match(res.corpo.whatsapp, /^https:\/\/wa\.me\/5571999958950\?text=/)
})

test('API recusa horário ocupado com 409 e pedido inválido com 400', async () => {
    const corpo = { ...BASE, categoria: 'MUSICOTERAPIA', modalidade: 'INDIVIDUAL', tipoContratacao: 'AVULSO', data: '2099-01-05', hora: '10:00' }
    const ocupado = [{ inicio: new Date('2099-01-05T13:30:00Z'), fim: new Date('2099-01-05T14:00:00Z') }]
    const res = respostaFalsa()
    await agendamentos({ method: 'POST', body: corpo }, res, { configuracaoGoogle: () => CONFIG, buscarOcupados: async () => ocupado, criarEvento: async () => assert.fail('não deveria criar') })
    assert.equal(res.statusCode, 409)

    const invalido = respostaFalsa()
    await agendamentos({ method: 'POST', body: { ...corpo, hora: '19:00' } }, invalido, { configuracaoGoogle: () => CONFIG })
    assert.equal(invalido.statusCode, 400)
})

test('API sem credenciais responde 503 e honeypot é ignorado', async () => {
    const corpo = { ...BASE, categoria: 'MUSICOTERAPIA', modalidade: 'INDIVIDUAL', tipoContratacao: 'AVULSO', data: '2099-01-05', hora: '10:00' }
    const res = respostaFalsa()
    await agendamentos({ method: 'POST', body: corpo }, res, { configuracaoGoogle: () => null })
    assert.equal(res.statusCode, 503)
    const robo = respostaFalsa()
    await agendamentos({ method: 'POST', body: { ...corpo, site: 'spam' } }, robo, { configuracaoGoogle: () => assert.fail() })
    assert.equal(robo.statusCode, 201)
})

test('disponibilidade devolve só minutos ocupados do dia', async () => {
    const res = respostaFalsa()
    await disponibilidade({ method: 'GET', query: { data: '2099-01-05' } }, res, {
        configuracaoGoogle: () => CONFIG,
        buscarOcupados: async () => [{ inicio: new Date('2099-01-05T13:00:00Z'), fim: new Date('2099-01-05T14:30:00Z') }],
    })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.corpo.ocupados, [{ inicio: 600, fim: 690 }])
})

test('cliente Google assina o JWT e chama freeBusy', async () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' })
    const { configuracaoGoogle, buscarOcupados } = await import('../api/_lib/googleCalendar.js')
    const config = configuracaoGoogle({ GOOGLE_SERVICE_ACCOUNT_EMAIL: 'sa@x.iam.gserviceaccount.com', GOOGLE_PRIVATE_KEY: pem.replace(/\n/g, '\\n'), GOOGLE_CALENDAR_ID: 'agenda@x' })
    const chamadas = []
    const fetchOriginal = globalThis.fetch
    globalThis.fetch = async (url, opcoes) => {
        chamadas.push({ url, opcoes })
        if (url.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }))
        return new Response(JSON.stringify({ calendars: { 'agenda@x': { busy: [{ start: '2099-01-05T13:00:00Z', end: '2099-01-05T14:00:00Z' }] } } }))
    }
    try {
        const ocupados = await buscarOcupados(config, '2099-01-05T03:00:00Z', '2099-01-06T03:00:00Z')
        assert.equal(ocupados.length, 1)
        const assertion = chamadas[0].opcoes.body.get('assertion')
        assert.equal(assertion.split('.').length, 3)
        assert.equal(chamadas[1].opcoes.headers.Authorization, 'Bearer tok')
    } finally {
        globalThis.fetch = fetchOriginal
    }
})
