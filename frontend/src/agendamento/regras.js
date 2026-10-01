// Regras de negócio do agendamento, portadas do antigo AgendamentoValidator /
// GeradorDeDatasRecorrentes / AgendamentoService. Funções puras, sem DOM nem
// rede: o formulário usa para guiar o cliente e a função da Vercel usa de novo
// para não confiar no que chega do navegador.

import {
    CATEGORIAS,
    DURACAO_EVENTO_SOB_CONSULTA,
    INSTRUMENTOS,
    MODALIDADES,
    TIPOS_CONTRATACAO,
    TIPOS_EVENTO,
    buscarPacoteEvento,
    buscarPrecoAula,
} from './catalogo.js'

export const FUSO_HORARIO = 'America/Bahia'
export const OFFSET_FUSO = '-03:00'
export const GRADE_MINUTOS = 15
export const INTERVALO_ENTRE_COMPROMISSOS_MINUTOS = 15
export const JANELA_PACOTE_DIAS = 31
export const MAXIMO_RECORRENCIAS = 3

const INICIO_EXPEDIENTE = 8 * 60
const FIM_EXPEDIENTE = 18 * 60
const FIM_EXPEDIENTE_SABADO = 13 * 60

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function minutosParaHora(minutos) {
    const horas = String(Math.floor(minutos / 60)).padStart(2, '0')
    const resto = String(minutos % 60).padStart(2, '0')
    return `${horas}:${resto}`
}

export function horaParaMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number)
    return horas * 60 + minutos
}

function ehDataValida(dataIso) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dataIso ?? '') && !Number.isNaN(Date.parse(`${dataIso}T00:00:00Z`))
}

function ehHoraValida(hora) {
    return /^\d{2}:\d{2}$/.test(hora ?? '')
}

/** 0 = domingo ... 6 = sábado. Calculado em UTC para não depender do fuso do navegador/servidor. */
export function diaDaSemana(dataIso) {
    return new Date(`${dataIso}T00:00:00Z`).getUTCDay()
}

export function somarDias(dataIso, dias) {
    const data = new Date(`${dataIso}T00:00:00Z`)
    data.setUTCDate(data.getUTCDate() + dias)
    return data.toISOString().slice(0, 10)
}

/** Data de hoje no fuso de Salvador, independente do fuso de quem executa. */
export function hojeEmSalvador(agora = new Date()) {
    return new Date(agora.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function ehCategoriaDeAula(categoria) {
    return CATEGORIAS[categoria]?.tipo === 'AULA'
}

/**
 * Último horário de início permitido no dia, ou null se não há expediente.
 * Aulas: segunda a sexta 08h-18h, sábado 08h-13h, sem domingo.
 * Eventos: 08h-18h em qualquer dia.
 */
function fimDoExpediente(categoria, diaSemana) {
    if (!ehCategoriaDeAula(categoria)) {
        return FIM_EXPEDIENTE
    }
    if (diaSemana === 0) {
        return null
    }
    return diaSemana === 6 ? FIM_EXPEDIENTE_SABADO : FIM_EXPEDIENTE
}

export function horariosDoDiaDaSemana(categoria, diaSemana) {
    const fim = fimDoExpediente(categoria, diaSemana)
    if (fim == null) {
        return []
    }
    const horarios = []
    for (let minuto = INICIO_EXPEDIENTE; minuto <= fim; minuto += GRADE_MINUTOS) {
        horarios.push(minutosParaHora(minuto))
    }
    return horarios
}

export function horariosDoDia(categoria, dataIso) {
    return horariosDoDiaDaSemana(categoria, diaDaSemana(dataIso))
}

/**
 * Dois compromissos conflitam se não sobram INTERVALO_ENTRE_COMPROMISSOS_MINUTOS
 * entre o fim de um e o início do outro (tempo de deslocamento entre casas).
 */
export function conflita(inicioNovo, duracaoNovo, inicioExistente, fimExistente) {
    const intervalo = INTERVALO_ENTRE_COMPROMISSOS_MINUTOS
    return inicioNovo < fimExistente + intervalo && inicioExistente < inicioNovo + duracaoNovo + intervalo
}

/**
 * Gera as datas de um pacote a partir de 1 a 3 pares (dia da semana + hora).
 * Sempre emite a próxima data pendente mais próxima entre as recorrências e
 * avança aquela em 7 dias. O pacote precisa terminar em até JANELA_PACOTE_DIAS
 * dias a partir da primeira data possível.
 */
export function gerarDatasRecorrentes(recorrencias, quantidadeAulas, primeiraDataIso) {
    const proximas = recorrencias.map((recorrencia) => {
        const diferenca = (recorrencia.diaSemana - diaDaSemana(primeiraDataIso) + 7) % 7
        return somarDias(primeiraDataIso, diferenca)
    })

    const slots = []
    for (let aula = 0; aula < quantidadeAulas; aula++) {
        let indice = 0
        proximas.forEach((data, i) => {
            if (data < proximas[indice] || (data === proximas[indice] && recorrencias[i].hora < recorrencias[indice].hora)) {
                indice = i
            }
        })
        slots.push({ data: proximas[indice], hora: recorrencias[indice].hora })
        proximas[indice] = somarDias(proximas[indice], 7)
    }

    const limite = somarDias(primeiraDataIso, JANELA_PACOTE_DIAS)
    const ultima = slots[slots.length - 1].data
    if (ultima > limite) {
        throw new Error(
            `Com os dias escolhidos, o pacote terminaria em ${formatarData(ultima)}, depois do prazo de ${JANELA_PACOTE_DIAS} dias. Escolha mais dias na semana ou um pacote menor.`
        )
    }
    return slots
}

export function formatarData(dataIso) {
    const [ano, mes, dia] = dataIso.split('-')
    return `${dia}/${mes}/${ano}`
}

export function duracaoDoPedido(pedido) {
    if (pedido.categoria === 'EVENTO') {
        const pacote = buscarPacoteEvento(pedido.pacoteEventoId)
        return pacote?.duracaoMinutos ?? DURACAO_EVENTO_SOB_CONSULTA
    }
    return buscarPrecoAula(pedido.categoria, pedido.modalidade, pedido.tipoContratacao)?.duracaoMinutos ?? null
}

function texto(valor, limite = 200) {
    return typeof valor === 'string' ? valor.trim().slice(0, limite) : ''
}

/** Normaliza o corpo recebido: só os campos conhecidos, strings aparadas e limitadas. */
export function normalizarPedido(corpo = {}) {
    const cliente = corpo.cliente ?? {}
    const endereco = corpo.endereco ?? {}
    const aluno = corpo.aluno ?? {}
    return {
        categoria: texto(corpo.categoria, 40),
        modalidade: texto(corpo.modalidade, 20),
        tipoContratacao: texto(corpo.tipoContratacao, 20),
        instrumento: texto(corpo.instrumento, 20),
        tipoEvento: texto(corpo.tipoEvento, 40),
        pacoteEventoId: texto(corpo.pacoteEventoId, 40),
        data: texto(corpo.data, 10),
        hora: texto(corpo.hora, 5),
        recorrencias: Array.isArray(corpo.recorrencias)
            ? corpo.recorrencias.slice(0, MAXIMO_RECORRENCIAS + 1).map((r) => ({
                diaSemana: Number(r?.diaSemana),
                hora: texto(r?.hora, 5),
            }))
            : [],
        aluno: { nome: texto(aluno.nome, 120), idade: texto(String(aluno.idade ?? ''), 3) },
        cliente: {
            nome: texto(cliente.nome, 120),
            telefone: texto(cliente.telefone, 20).replace(/\D/g, ''),
            email: texto(cliente.email, 120),
        },
        endereco: {
            cep: texto(endereco.cep, 9).replace(/\D/g, ''),
            rua: texto(endereco.rua, 150),
            numero: texto(endereco.numero, 20),
            complemento: texto(endereco.complemento, 100),
            bairro: texto(endereco.bairro, 80),
            cidade: texto(endereco.cidade, 80),
            estado: texto(endereco.estado, 2).toUpperCase(),
        },
        observacoes: texto(corpo.observacoes, 1000),
    }
}

/**
 * Valida o pedido e devolve os horários que ele ocupa na agenda.
 * Retorna { erros: string[], slots: [{ data, hora, duracaoMinutos }] }.
 * hojeIso: data de hoje em Salvador; só aceita a partir de amanhã.
 */
export function validarPedido(pedido, hojeIso) {
    const erros = []

    if (!CATEGORIAS[pedido.categoria]) {
        return { erros: ['Escolha um serviço.'], slots: [] }
    }

    if (pedido.cliente.nome.length < 2) erros.push('Informe seu nome.')
    if (pedido.cliente.telefone.length < 10 || pedido.cliente.telefone.length > 13) erros.push('Informe um telefone com DDD.')
    if (pedido.cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pedido.cliente.email)) erros.push('E-mail inválido.')

    const { endereco } = pedido
    if (endereco.cep.length !== 8) erros.push('Informe um CEP válido.')
    if (!endereco.rua) erros.push('Informe a rua.')
    if (!endereco.numero) erros.push('Informe o número do endereço.')
    if (!endereco.bairro) erros.push('Informe o bairro.')
    if (!endereco.cidade) erros.push('Informe a cidade.')
    if (endereco.estado.length !== 2) erros.push('Informe o estado (UF).')

    if (ehCategoriaDeAula(pedido.categoria)) {
        if (pedido.aluno.nome.length < 2) erros.push('Informe o nome de quem vai fazer a aula.')
        if (pedido.categoria === 'AULA_INSTRUMENTO' && !INSTRUMENTOS[pedido.instrumento]) {
            erros.push('Escolha o instrumento.')
        }
    }

    const agenda = calcularHorarios(pedido, hojeIso)
    erros.push(...agenda.erros)
    return { erros, slots: erros.length ? [] : agenda.slots }
}

/**
 * Só a parte de agenda do pedido (serviço, pacote, data/hora ou recorrências).
 * O formulário usa para mostrar as datas antes de o resto estar preenchido.
 */
export function calcularHorarios(pedido, hojeIso) {
    const erros = []
    const primeiraDataPossivel = somarDias(hojeIso, 1)
    const slots = ehCategoriaDeAula(pedido.categoria)
        ? validarAula(pedido, primeiraDataPossivel, erros)
        : validarEvento(pedido, primeiraDataPossivel, erros)
    return { erros, slots: erros.length ? [] : slots }
}

function validarHorarioNoDia(categoria, data, hora, erros) {
    if (!horariosDoDia(categoria, data).includes(hora)) {
        const dia = diaDaSemana(data)
        if (ehCategoriaDeAula(categoria) && dia === 0) {
            erros.push('Não há aulas aos domingos.')
        } else {
            erros.push(`Horário ${hora} indisponível em ${formatarData(data)} (aulas: seg a sex 08h-18h, sáb 08h-13h).`)
        }
        return false
    }
    return true
}

function validarAula(pedido, primeiraDataPossivel, erros) {
    if (!MODALIDADES[pedido.modalidade]) erros.push('Escolha a modalidade (individual ou grupo).')
    const preco = buscarPrecoAula(pedido.categoria, pedido.modalidade, pedido.tipoContratacao)
    if (!preco) {
        erros.push('Escolha um pacote disponível para este serviço.')
        return []
    }

    const { quantidadeAulas } = TIPOS_CONTRATACAO[pedido.tipoContratacao]
    if (quantidadeAulas === 1) {
        if (!ehDataValida(pedido.data) || !ehHoraValida(pedido.hora)) {
            erros.push('Escolha a data e o horário da aula.')
            return []
        }
        if (pedido.data < primeiraDataPossivel) {
            erros.push('Escolha uma data a partir de amanhã.')
            return []
        }
        if (!validarHorarioNoDia(pedido.categoria, pedido.data, pedido.hora, erros)) return []
        return [{ data: pedido.data, hora: pedido.hora, duracaoMinutos: preco.duracaoMinutos }]
    }

    const recorrencias = pedido.recorrencias
    if (recorrencias.length < 1 || recorrencias.length > MAXIMO_RECORRENCIAS) {
        erros.push(`Escolha de 1 a ${MAXIMO_RECORRENCIAS} dias da semana com horário para o pacote.`)
        return []
    }
    const vistos = new Set()
    for (const recorrencia of recorrencias) {
        const chave = `${recorrencia.diaSemana}-${recorrencia.hora}`
        if (!Number.isInteger(recorrencia.diaSemana) || !horariosDoDiaDaSemana(pedido.categoria, recorrencia.diaSemana).includes(recorrencia.hora)) {
            erros.push('Algum dia/horário do pacote está fora do expediente (seg a sex 08h-18h, sáb 08h-13h).')
            return []
        }
        if (vistos.has(chave)) {
            erros.push('Há dia e horário repetidos no pacote.')
            return []
        }
        vistos.add(chave)
    }
    const inicio = ehDataValida(pedido.data) && pedido.data >= primeiraDataPossivel ? pedido.data : primeiraDataPossivel
    try {
        return gerarDatasRecorrentes(recorrencias, quantidadeAulas, inicio)
            .map((slot) => ({ ...slot, duracaoMinutos: preco.duracaoMinutos }))
    } catch (erro) {
        erros.push(erro.message)
        return []
    }
}

function validarEvento(pedido, primeiraDataPossivel, erros) {
    if (!TIPOS_EVENTO[pedido.tipoEvento]) erros.push('Escolha o tipo de evento.')
    const pacote = buscarPacoteEvento(pedido.pacoteEventoId)
    if (!pacote || pacote.tipoEvento !== pedido.tipoEvento) {
        erros.push('Escolha um pacote para o evento.')
        return []
    }
    if (!ehDataValida(pedido.data) || !ehHoraValida(pedido.hora)) {
        erros.push('Escolha a data e o horário do evento.')
        return []
    }
    if (pedido.data < primeiraDataPossivel) {
        erros.push('Escolha uma data a partir de amanhã.')
        return []
    }
    if (!validarHorarioNoDia(pedido.categoria, pedido.data, pedido.hora, erros)) return []
    return [{ data: pedido.data, hora: pedido.hora, duracaoMinutos: duracaoDoPedido(pedido) }]
}

/** Mensagem pronta para o WhatsApp do Pedro depois que o pedido é registrado. */
export function montarMensagemWhatsapp(pedido, slots) {
    const servico = CATEGORIAS[pedido.categoria].nome
    const linhas = [`Olá, Pedro! Acabei de pedir um agendamento pelo site.`, ``, `*Serviço:* ${servico}`]
    if (ehCategoriaDeAula(pedido.categoria)) {
        linhas.push(`*Aluno(a):* ${pedido.aluno.nome}`)
        linhas.push(`*Pacote:* ${TIPOS_CONTRATACAO[pedido.tipoContratacao].nome} (${MODALIDADES[pedido.modalidade]})`)
    } else {
        linhas.push(`*Evento:* ${buscarPacoteEvento(pedido.pacoteEventoId).nome}`)
    }
    linhas.push(`*Horário(s):* ${slots.map((s) => `${formatarData(s.data)} ${s.hora}`).join(', ')}`)
    linhas.push(`*Nome:* ${pedido.cliente.nome}`)
    return linhas.join('\n')
}
