// Monta o evento do Google Agenda a partir de um pedido validado.
// O evento nasce PENDENTE (amarelo, "tentative"): Pedro, ou o agente que
// acompanha a agenda, confirma depois e o compromisso vira definitivo.

import {
    CATEGORIAS,
    INSTRUMENTOS,
    MODALIDADES,
    TIPOS_CONTRATACAO,
    TIPOS_EVENTO,
    WHATSAPP_NUMERO,
    buscarPacoteEvento,
    buscarPrecoAula,
    formatarValor,
} from '../../src/agendamento/catalogo.js'
import { DIAS_SEMANA, FUSO_HORARIO, INTERVALO_ENTRE_COMPROMISSOS_MINUTOS, OFFSET_FUSO, ehCategoriaDeAula } from '../../src/agendamento/regras.js'

export const COR_PENDENTE = '5' // "Banana" na paleta do Google Agenda
export const PREFIXO_PENDENTE = '⏳ PENDENTE'

export function inicioDoSlot(slot) {
    return new Date(`${slot.data}T${slot.hora}:00${OFFSET_FUSO}`)
}

export function fimDoSlot(slot) {
    return new Date(inicioDoSlot(slot).getTime() + slot.duracaoMinutos * 60_000)
}

/** Slots que batem com algum horário ocupado, contando o intervalo de deslocamento. */
export function slotsEmConflito(slots, ocupados) {
    const intervalo = INTERVALO_ENTRE_COMPROMISSOS_MINUTOS * 60_000
    return slots.filter((slot) => {
        const inicio = inicioDoSlot(slot).getTime()
        const fim = fimDoSlot(slot).getTime()
        return ocupados.some((o) => o.inicio.getTime() < fim + intervalo && inicio < o.fim.getTime() + intervalo)
    })
}

function formatarEndereco(endereco) {
    const complemento = endereco.complemento ? `, ${endereco.complemento}` : ''
    return `${endereco.rua}, ${endereco.numero}${complemento} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, ${endereco.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}`
}

function telefoneComDdi(telefone) {
    return telefone.startsWith('55') && telefone.length > 11 ? telefone : `55${telefone}`
}

function descreverServico(pedido) {
    if (ehCategoriaDeAula(pedido.categoria)) {
        const preco = buscarPrecoAula(pedido.categoria, pedido.modalidade, pedido.tipoContratacao)
        const instrumento = pedido.instrumento ? ` - ${INSTRUMENTOS[pedido.instrumento]}` : ''
        return {
            titulo: `${CATEGORIAS[pedido.categoria].nome}${instrumento} · ${pedido.aluno.nome}`,
            linhas: [
                `Aluno(a): ${pedido.aluno.nome}${pedido.aluno.idade ? ` (${pedido.aluno.idade} anos)` : ''}`,
                `Modalidade: ${MODALIDADES[pedido.modalidade]}`,
                `Pacote: ${TIPOS_CONTRATACAO[pedido.tipoContratacao].nome} - ${formatarValor(preco.valor)}`,
            ],
        }
    }
    const pacote = buscarPacoteEvento(pedido.pacoteEventoId)
    return {
        titulo: `${TIPOS_EVENTO[pedido.tipoEvento]} · ${pacote.nome} · ${pedido.cliente.nome}`,
        linhas: [`Evento: ${TIPOS_EVENTO[pedido.tipoEvento]}`, `Pacote: ${pacote.nome} - ${formatarValor(pacote.valor)}`],
    }
}

export function montarEventos(pedido, slots, agendamentoId) {
    const servico = descreverServico(pedido)
    const endereco = formatarEndereco(pedido.endereco)
    const telefone = telefoneComDdi(pedido.cliente.telefone)
    const recorrencia = slots.length > 1 && pedido.recorrencias.length
        ? pedido.recorrencias.map((r) => `${DIAS_SEMANA[r.diaSemana]} ${r.hora}`).join(', ')
        : ''

    return slots.map((slot, indice) => {
        const descricao = [
            `Pedido feito pelo site, aguardando confirmação.`,
            ``,
            `Cliente: ${pedido.cliente.nome}`,
            `Telefone: ${pedido.cliente.telefone}`,
            pedido.cliente.email ? `E-mail: ${pedido.cliente.email}` : null,
            ...servico.linhas,
            slots.length > 1 ? `Aula ${indice + 1} de ${slots.length}` : null,
            recorrencia ? `Recorrência pedida: ${recorrencia}` : null,
            pedido.observacoes ? `Observações: ${pedido.observacoes}` : null,
            ``,
            `Endereço: ${endereco}`,
            `WhatsApp: https://wa.me/${telefone}`,
            `Waze: https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`,
            `Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`,
        ].filter((linha) => linha !== null).join('\n')

        return {
            summary: `${PREFIXO_PENDENTE} · ${servico.titulo}${slots.length > 1 ? ` (${indice + 1}/${slots.length})` : ''}`,
            location: endereco,
            description: descricao,
            start: { dateTime: inicioDoSlot(slot).toISOString(), timeZone: FUSO_HORARIO },
            end: { dateTime: fimDoSlot(slot).toISOString(), timeZone: FUSO_HORARIO },
            status: 'tentative',
            colorId: COR_PENDENTE,
            extendedProperties: {
                private: {
                    origem: 'site',
                    statusAgendamento: 'PENDENTE',
                    agendamentoId,
                    categoria: pedido.categoria,
                    tipoContratacao: pedido.tipoContratacao || 'EVENTO',
                    recorrencias: JSON.stringify(pedido.recorrencias),
                    clienteNome: pedido.cliente.nome,
                    clienteTelefone: telefone,
                    aulaNumero: String(indice + 1),
                    totalAulas: String(slots.length),
                },
            },
        }
    })
}

export function whatsappDoPedro(mensagem) {
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`
}
