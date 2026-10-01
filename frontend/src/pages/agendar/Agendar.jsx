import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    CATEGORIAS,
    INSTRUMENTOS,
    MODALIDADES,
    PACOTES_EVENTO,
    PRECOS_AULAS,
    TIPOS_CONTRATACAO,
    TIPOS_EVENTO,
    WHATSAPP_NUMERO,
    buscarPacoteEvento,
    buscarPrecoAula,
    formatarValor,
} from '../../agendamento/catalogo.js'
import {
    DIAS_SEMANA,
    MAXIMO_RECORRENCIAS,
    calcularHorarios,
    conflita,
    duracaoDoPedido,
    ehCategoriaDeAula,
    formatarData,
    hojeEmSalvador,
    horaParaMinutos,
    horariosDoDia,
    horariosDoDiaDaSemana,
    normalizarPedido,
    somarDias,
    validarPedido,
} from '../../agendamento/regras.js'
import { buscarEnderecoPorCep } from '../../services/cepService.js'
import { buscarOcupadosDoDia, enviarAgendamento } from '../../services/agendamentoService.js'

const DIAS_DE_AULA = [1, 2, 3, 4, 5, 6]
const SEM_OCUPADOS = []

const PEDIDO_INICIAL = {
    categoria: '',
    modalidade: 'INDIVIDUAL',
    tipoContratacao: 'AVULSO',
    instrumento: '',
    tipoEvento: '',
    pacoteEventoId: '',
    data: '',
    hora: '',
    recorrencias: [{ diaSemana: 1, hora: '' }],
    aluno: { nome: '', idade: '' },
    cliente: { nome: '', telefone: '', email: '' },
    endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'Salvador', estado: 'BA' },
    observacoes: '',
    site: '',
}

/** Pré-seleciona serviço, modalidade, tipo de evento e pacote vindos dos links das páginas (?servico=...&pacote=...). */
function pedidoDosParametros(parametros) {
    const categoria = parametros.get('servico')
    if (!CATEGORIAS[categoria]) return PEDIDO_INICIAL
    const pedido = { ...PEDIDO_INICIAL, categoria }
    const modalidade = parametros.get('modalidade')
    if (MODALIDADES[modalidade]) pedido.modalidade = modalidade
    const tipoEvento = parametros.get('tipo')
    if (categoria === 'EVENTO' && TIPOS_EVENTO[tipoEvento]) {
        pedido.tipoEvento = tipoEvento
        const pacote = buscarPacoteEvento(parametros.get('pacote'))
        if (pacote?.tipoEvento === tipoEvento) pedido.pacoteEventoId = pacote.id
    }
    return pedido
}

function Agendar() {
    const [parametros] = useSearchParams()
    const [pedido, setPedido] = useState(() => pedidoDosParametros(parametros))
    const [ocupadosDoDia, setOcupadosDoDia] = useState({ data: '', intervalos: [] })
    const [buscandoCep, setBuscandoCep] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState('')
    const [mostrarErros, setMostrarErros] = useState(false)
    const [confirmacao, setConfirmacao] = useState(null)

    const hoje = hojeEmSalvador()
    const amanha = somarDias(hoje, 1)
    const ehAula = ehCategoriaDeAula(pedido.categoria)
    const ehPacote = ehAula && TIPOS_CONTRATACAO[pedido.tipoContratacao]?.quantidadeAulas > 1
    const duracao = duracaoDoPedido(pedido)

    const { erros } = useMemo(() => validarPedido(normalizarPedido(pedido), hoje), [pedido, hoje])
    const agenda = useMemo(
        () => (pedido.categoria ? calcularHorarios(normalizarPedido(ehPacote ? pedido : { ...pedido, recorrencias: [] }), hoje) : { erros: [], slots: [] }),
        [pedido, ehPacote, hoje]
    )
    const slots = agenda.slots

    useEffect(() => {
        if (!pedido.data || ehPacote) return
        let ativo = true
        buscarOcupadosDoDia(pedido.data).then((intervalos) => {
            if (ativo) setOcupadosDoDia({ data: pedido.data, intervalos })
        })
        return () => {
            ativo = false
        }
    }, [pedido.data, ehPacote])
    const ocupados = ocupadosDoDia.data === pedido.data ? ocupadosDoDia.intervalos : SEM_OCUPADOS

    const horariosLivres = useMemo(() => {
        if (!pedido.categoria || !pedido.data || ehPacote) return []
        return horariosDoDia(pedido.categoria, pedido.data).filter((hora) =>
            !ocupados.some((o) => conflita(horaParaMinutos(hora), duracao ?? 60, o.inicio, o.fim))
        )
    }, [pedido.categoria, pedido.data, ehPacote, ocupados, duracao])

    function atualizar(campo, valor) {
        setPedido((atual) => ({ ...atual, [campo]: valor }))
    }

    function atualizarGrupo(grupo, campo, valor) {
        setPedido((atual) => ({ ...atual, [grupo]: { ...atual[grupo], [campo]: valor } }))
    }

    function escolherCategoria(categoria) {
        setPedido((atual) => ({
            ...atual,
            categoria,
            tipoContratacao: 'AVULSO',
            instrumento: '',
            tipoEvento: '',
            pacoteEventoId: '',
            hora: '',
        }))
    }

    function atualizarRecorrencia(indice, campo, valor) {
        setPedido((atual) => ({
            ...atual,
            recorrencias: atual.recorrencias.map((r, i) => (i === indice ? { ...r, [campo]: valor } : r)),
        }))
    }

    async function preencherPorCep(cep) {
        atualizarGrupo('endereco', 'cep', cep)
        if (cep.replace(/\D/g, '').length !== 8) return
        setBuscandoCep(true)
        const endereco = await buscarEnderecoPorCep(cep)
        setBuscandoCep(false)
        if (endereco) {
            setPedido((atual) => ({ ...atual, endereco: { ...atual.endereco, ...endereco } }))
        }
    }

    async function enviar(evento) {
        evento.preventDefault()
        setMostrarErros(true)
        setErro('')
        if (erros.length) return

        setEnviando(true)
        try {
            const corpo = ehPacote ? pedido : { ...pedido, recorrencias: [] }
            const resposta = await enviarAgendamento(corpo)
            setConfirmacao(resposta)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (falha) {
            setErro(falha.message)
        } finally {
            setEnviando(false)
        }
    }

    if (confirmacao) {
        return <Confirmacao confirmacao={confirmacao} pedido={pedido} />
    }

    const precosDaCategoria = PRECOS_AULAS[pedido.categoria]?.[pedido.modalidade] ?? {}
    const pacotesDoEvento = PACOTES_EVENTO.filter((p) => p.tipoEvento === pedido.tipoEvento)
    const valor = ehAula
        ? buscarPrecoAula(pedido.categoria, pedido.modalidade, pedido.tipoContratacao)?.valor
        : buscarPacoteEvento(pedido.pacoteEventoId)?.valor

    return (
        <section className="container-site secao">
            <header className="mx-auto max-w-2xl text-center">
                <p className="rotulo">Agendamento on-line</p>
                <h1 className="mt-2 text-4xl sm:text-5xl">Agende seu horário</h1>
                <p className="mt-4 text-lg text-tinta-suave">Escolha o serviço, o horário e onde vai ser. O Pedro confirma pelo WhatsApp.</p>
            </header>

            <form onSubmit={enviar} noValidate className="mt-12 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
                <div className="grid gap-6">
                    <Etapa numero={1} titulo="Serviço">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {Object.entries(CATEGORIAS).map(([chave, categoria]) => (
                                <button
                                    type="button"
                                    key={chave}
                                    className={`${opcao(pedido.categoria === chave)} px-2 font-display text-base leading-tight font-bold sm:text-lg`}
                                    onClick={() => escolherCategoria(chave)}
                                    aria-pressed={pedido.categoria === chave}
                                >
                                    {categoria.nome}
                                </button>
                            ))}
                        </div>

                        {ehAula && (
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <Campo rotulo="Modalidade" id="modalidade">
                                    <select
                                        id="modalidade"
                                        className="campo"
                                        value={pedido.modalidade}
                                        onChange={(e) => setPedido((a) => ({ ...a, modalidade: e.target.value, tipoContratacao: 'AVULSO' }))}
                                    >
                                        {Object.entries(MODALIDADES).map(([chave, nome]) => <option key={chave} value={chave}>{nome}</option>)}
                                    </select>
                                </Campo>
                                <Campo rotulo="Pacote" id="pacote">
                                    <select id="pacote" className="campo" value={pedido.tipoContratacao} onChange={(e) => atualizar('tipoContratacao', e.target.value)}>
                                        {Object.entries(precosDaCategoria).map(([chave, preco]) => (
                                            <option key={chave} value={chave}>
                                                {TIPOS_CONTRATACAO[chave].nome} · {formatarValor(preco.valor)} · {preco.duracaoMinutos} min
                                            </option>
                                        ))}
                                    </select>
                                </Campo>
                                {pedido.categoria === 'AULA_INSTRUMENTO' && (
                                    <Campo rotulo="Instrumento" id="instrumento">
                                        <select id="instrumento" className="campo" value={pedido.instrumento} onChange={(e) => atualizar('instrumento', e.target.value)}>
                                            <option value="">Escolha</option>
                                            {Object.entries(INSTRUMENTOS).map(([chave, nome]) => <option key={chave} value={chave}>{nome}</option>)}
                                        </select>
                                    </Campo>
                                )}
                                <Campo rotulo="Nome de quem vai fazer a aula" id="aluno-nome">
                                    <input id="aluno-nome" className="campo" value={pedido.aluno.nome} onChange={(e) => atualizarGrupo('aluno', 'nome', e.target.value)} />
                                </Campo>
                                <Campo rotulo="Idade" id="aluno-idade">
                                    <input id="aluno-idade" className="campo" inputMode="numeric" value={pedido.aluno.idade} onChange={(e) => atualizarGrupo('aluno', 'idade', e.target.value.replace(/\D/g, ''))} />
                                </Campo>
                            </div>
                        )}

                        {pedido.categoria === 'EVENTO' && (
                            <div className="mt-6 grid gap-4">
                                <Campo rotulo="Tipo de evento" id="tipo-evento">
                                    <select
                                        id="tipo-evento"
                                        className="campo sm:max-w-sm"
                                        value={pedido.tipoEvento}
                                        onChange={(e) => setPedido((a) => ({ ...a, tipoEvento: e.target.value, pacoteEventoId: '' }))}
                                    >
                                        <option value="">Escolha</option>
                                        {Object.entries(TIPOS_EVENTO).map(([chave, nome]) => <option key={chave} value={chave}>{nome}</option>)}
                                    </select>
                                </Campo>
                                {pacotesDoEvento.length > 0 && (
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {pacotesDoEvento.map((pacote) => (
                                            <button
                                                type="button"
                                                key={pacote.id}
                                                className={`${opcao(pedido.pacoteEventoId === pacote.id)} flex flex-col gap-1 text-left`}
                                                onClick={() => atualizar('pacoteEventoId', pacote.id)}
                                                aria-pressed={pedido.pacoteEventoId === pacote.id}
                                            >
                                                <strong className="font-display text-lg">{pacote.nome}</strong>
                                                <span className="text-sm text-tinta-suave">{pacote.descricao}</span>
                                                <span className="mt-auto pt-1 font-bold text-marca">
                                                    {formatarValor(pacote.valor)}{pacote.duracaoMinutos ? ` · ${pacote.duracaoMinutos} min` : ''}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Etapa>

                    {pedido.categoria && (
                        <Etapa numero={2} titulo="Data e horário">
                            {ehPacote ? (
                                <>
                                    <p className="text-sm text-tinta-suave">
                                        Escolha até {MAXIMO_RECORRENCIAS} dias fixos na semana. Aulas de segunda a sexta das 08h às 18h e sábado das 08h às 13h.
                                    </p>
                                    <div className="mt-4 grid gap-3">
                                        {pedido.recorrencias.map((recorrencia, indice) => (
                                            <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3" key={indice}>
                                                <Campo rotulo="Dia" id={`dia-${indice}`}>
                                                    <select id={`dia-${indice}`} className="campo" value={recorrencia.diaSemana} onChange={(e) => atualizarRecorrencia(indice, 'diaSemana', Number(e.target.value))}>
                                                        {DIAS_DE_AULA.map((dia) => <option key={dia} value={dia}>{DIAS_SEMANA[dia]}</option>)}
                                                    </select>
                                                </Campo>
                                                <Campo rotulo="Horário" id={`hora-${indice}`}>
                                                    <select id={`hora-${indice}`} className="campo" value={recorrencia.hora} onChange={(e) => atualizarRecorrencia(indice, 'hora', e.target.value)}>
                                                        <option value="">--:--</option>
                                                        {horariosDoDiaDaSemana(pedido.categoria, recorrencia.diaSemana).map((hora) => <option key={hora} value={hora}>{hora}</option>)}
                                                    </select>
                                                </Campo>
                                                <button
                                                    type="button"
                                                    className={`mb-0.5 inline-flex size-11 items-center justify-center rounded-xl border border-tinta/15 text-tinta-suave hover:border-marca hover:text-marca ${pedido.recorrencias.length > 1 ? '' : 'invisible'}`}
                                                    aria-label="Remover dia"
                                                    onClick={() => atualizar('recorrencias', pedido.recorrencias.filter((_, i) => i !== indice))}
                                                >
                                                    <i className="bi bi-x-lg" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {pedido.recorrencias.length < MAXIMO_RECORRENCIAS && (
                                        <button type="button" className="mt-3 font-bold text-marca hover:underline" onClick={() => atualizar('recorrencias', [...pedido.recorrencias, { diaSemana: 1, hora: '' }])}>
                                            + Adicionar outro dia
                                        </button>
                                    )}
                                    {pedido.recorrencias.every((r) => r.hora) && agenda.erros.length > 0 && (
                                        <p className="mt-3 rounded-xl bg-girassol/20 px-4 py-3 text-sm" role="alert">{agenda.erros[0]}</p>
                                    )}
                                    <div className="mt-4 sm:max-w-xs">
                                        <Campo rotulo="Começar a partir de (opcional)" id="inicio-pacote">
                                            <input id="inicio-pacote" type="date" className="campo" min={amanha} value={pedido.data} onChange={(e) => atualizar('data', e.target.value)} />
                                        </Campo>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="sm:max-w-xs">
                                        <Campo rotulo="Data" id="data">
                                            <input id="data" type="date" className="campo" min={amanha} value={pedido.data} onChange={(e) => setPedido((a) => ({ ...a, data: e.target.value, hora: '' }))} />
                                        </Campo>
                                    </div>
                                    {pedido.data && (
                                        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2" role="group" aria-label="Horários disponíveis">
                                            {horariosLivres.length === 0 && (
                                                <p className="col-span-full text-tinta-suave">
                                                    {ehAula && new Date(`${pedido.data}T00:00:00Z`).getUTCDay() === 0
                                                        ? 'Não há aulas aos domingos. Escolha outro dia.'
                                                        : 'Sem horários livres nesse dia. Escolha outra data.'}
                                                </p>
                                            )}
                                            {horariosLivres.map((hora) => (
                                                <button
                                                    type="button"
                                                    key={hora}
                                                    className={`${opcao(pedido.hora === hora)} px-2 py-2 font-bold`}
                                                    onClick={() => atualizar('hora', hora)}
                                                    aria-pressed={pedido.hora === hora}
                                                >
                                                    {hora}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </Etapa>
                    )}

                    {pedido.categoria && (
                        <Etapa numero={3} titulo="Seus dados e endereço">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                                <Campo rotulo="Seu nome" id="cliente-nome" classe="col-span-2 sm:col-span-3">
                                    <input id="cliente-nome" className="campo" autoComplete="name" value={pedido.cliente.nome} onChange={(e) => atualizarGrupo('cliente', 'nome', e.target.value)} />
                                </Campo>
                                <Campo rotulo="WhatsApp com DDD" id="cliente-telefone" classe="col-span-2 sm:col-span-3">
                                    <input id="cliente-telefone" className="campo" type="tel" autoComplete="tel" placeholder="(71) 90000-0000" value={pedido.cliente.telefone} onChange={(e) => atualizarGrupo('cliente', 'telefone', e.target.value)} />
                                </Campo>
                                <Campo rotulo="E-mail (opcional)" id="cliente-email" classe="col-span-2 sm:col-span-3">
                                    <input id="cliente-email" className="campo" type="email" autoComplete="email" value={pedido.cliente.email} onChange={(e) => atualizarGrupo('cliente', 'email', e.target.value)} />
                                </Campo>
                                <Campo rotulo={buscandoCep ? 'CEP (buscando…)' : 'CEP'} id="cep" classe="col-span-2 sm:col-span-3">
                                    <input id="cep" className="campo" inputMode="numeric" autoComplete="postal-code" placeholder="40000-000" value={pedido.endereco.cep} onChange={(e) => preencherPorCep(e.target.value)} />
                                </Campo>
                                <Campo rotulo="Rua" id="rua" classe="col-span-2 sm:col-span-4">
                                    <input id="rua" className="campo" value={pedido.endereco.rua} onChange={(e) => atualizarGrupo('endereco', 'rua', e.target.value)} />
                                </Campo>
                                <Campo rotulo="Número" id="numero" classe="sm:col-span-2">
                                    <input id="numero" className="campo" value={pedido.endereco.numero} onChange={(e) => atualizarGrupo('endereco', 'numero', e.target.value)} />
                                </Campo>
                                <Campo rotulo="Complemento" id="complemento" classe="sm:col-span-2">
                                    <input id="complemento" className="campo" value={pedido.endereco.complemento} onChange={(e) => atualizarGrupo('endereco', 'complemento', e.target.value)} />
                                </Campo>
                                <Campo rotulo="Bairro" id="bairro" classe="col-span-2 sm:col-span-2">
                                    <input id="bairro" className="campo" value={pedido.endereco.bairro} onChange={(e) => atualizarGrupo('endereco', 'bairro', e.target.value)} />
                                </Campo>
                                <Campo rotulo="Cidade" id="cidade" classe="sm:col-span-1">
                                    <input id="cidade" className="campo" value={pedido.endereco.cidade} onChange={(e) => atualizarGrupo('endereco', 'cidade', e.target.value)} />
                                </Campo>
                                <Campo rotulo="UF" id="estado" classe="sm:col-span-1">
                                    <input id="estado" className="campo" maxLength={2} value={pedido.endereco.estado} onChange={(e) => atualizarGrupo('endereco', 'estado', e.target.value.toUpperCase())} />
                                </Campo>
                                <Campo rotulo="Observações (opcional)" id="observacoes" classe="col-span-2 sm:col-span-6">
                                    <textarea id="observacoes" className="campo" rows={3} placeholder="Algo que o Pedro deva saber antes do encontro?" value={pedido.observacoes} onChange={(e) => atualizar('observacoes', e.target.value)} />
                                </Campo>
                                <div className="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
                                    <label htmlFor="site">Site</label>
                                    <input id="site" tabIndex={-1} autoComplete="off" value={pedido.site} onChange={(e) => atualizar('site', e.target.value)} />
                                </div>
                            </div>
                        </Etapa>
                    )}
                </div>

                <aside className="rounded-3xl bg-areia p-6 lg:sticky lg:top-24">
                    <h2 className="text-2xl">Resumo</h2>
                    {!pedido.categoria && <p className="mt-2 text-tinta-suave">Escolha um serviço para começar.</p>}
                    {pedido.categoria && (
                        <dl className="mt-2 grid gap-3">
                            <Item rotulo="Serviço">{CATEGORIAS[pedido.categoria].nome}</Item>
                            {ehAula && <Item rotulo="Pacote">{TIPOS_CONTRATACAO[pedido.tipoContratacao]?.nome} · {MODALIDADES[pedido.modalidade]}</Item>}
                            {pedido.pacoteEventoId && <Item rotulo="Pacote">{buscarPacoteEvento(pedido.pacoteEventoId)?.nome}</Item>}
                            {(ehAula || pedido.pacoteEventoId) && <Item rotulo="Valor"><span className="font-display text-xl font-bold text-marca">{formatarValor(valor)}</span></Item>}
                            {slots.length > 0 && (
                                <Item rotulo={slots.length > 1 ? `${slots.length} encontros` : 'Quando'}>
                                    <ul>
                                        {slots.map((slot) => (
                                            <li key={`${slot.data}-${slot.hora}`}>
                                                {DIAS_SEMANA[new Date(`${slot.data}T00:00:00Z`).getUTCDay()].slice(0, 3)}, {formatarData(slot.data)} às {slot.hora}
                                            </li>
                                        ))}
                                    </ul>
                                </Item>
                            )}
                        </dl>
                    )}

                    {mostrarErros && erros.length > 0 && (
                        <ul className="mt-4 list-disc rounded-xl bg-girassol/25 py-3 pr-4 pl-8 text-sm" role="alert">
                            {erros.map((mensagem) => <li key={mensagem}>{mensagem}</li>)}
                        </ul>
                    )}
                    {erro && <p className="mt-4 rounded-xl bg-marca/10 px-4 py-3 text-sm text-marca-escura" role="alert">{erro}</p>}

                    <button type="submit" className="btn-primario mt-6 w-full" disabled={enviando || !pedido.categoria}>
                        {enviando ? 'Enviando…' : 'Solicitar agendamento'}
                    </button>
                    <p className="mt-3 text-sm text-tinta-suave">
                        O horário fica reservado como pendente até o Pedro confirmar. Prefere conversar antes?{' '}
                        <a href={`https://wa.me/${WHATSAPP_NUMERO}`} target="_blank" rel="noopener noreferrer" className="font-bold text-marca hover:underline">Chame no WhatsApp</a>.
                    </p>
                </aside>
            </form>
        </section>
    )
}

const OPCAO_BASE = 'rounded-2xl border-2 p-4 text-tinta transition'
const OPCAO_INATIVA = `${OPCAO_BASE} border-tinta/10 bg-white hover:border-laranja`
const OPCAO_ATIVA = `${OPCAO_BASE} border-marca bg-marca/5 ring-4 ring-marca/10`

function opcao(ativa) {
    return ativa ? OPCAO_ATIVA : OPCAO_INATIVA
}

function Etapa({ numero, titulo, children }) {
    return (
        <section className="cartao sm:p-8">
            <h2 className="mb-5 flex items-center gap-3 text-2xl">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-marca text-lg text-white">{numero}</span>
                {titulo}
            </h2>
            {children}
        </section>
    )
}

function Campo({ rotulo, id, classe = '', children }) {
    return (
        <div className={classe}>
            <label className="campo-rotulo" htmlFor={id}>{rotulo}</label>
            {children}
        </div>
    )
}

function Item({ rotulo, children }) {
    return (
        <div>
            <dt className="text-xs font-bold tracking-wider text-tinta-suave uppercase">{rotulo}</dt>
            <dd>{children}</dd>
        </div>
    )
}

function Confirmacao({ confirmacao, pedido }) {
    return (
        <section className="container-site secao">
            <div className="cartao mx-auto max-w-xl text-center sm:p-10">
                <i className="bi bi-check-circle-fill text-6xl text-folha" aria-hidden="true"></i>
                <h1 className="mt-4 text-4xl">Pedido recebido!</h1>
                <p className="mt-4 text-lg text-tinta-suave">
                    Obrigado, {pedido.cliente.nome.split(' ')[0]}. Seu horário de {CATEGORIAS[pedido.categoria].nome.toLowerCase()} ficou reservado
                    {confirmacao.slots.length > 1 ? ` para ${confirmacao.slots.length} encontros` : ''} e o Pedro vai confirmar com você.
                </p>
                <ul className="mt-4 font-semibold">
                    {confirmacao.slots.map((slot) => <li key={`${slot.data}-${slot.hora}`}>{formatarData(slot.data)} às {slot.hora}</li>)}
                </ul>
                {confirmacao.whatsapp && (
                    <a href={confirmacao.whatsapp} className="btn-whatsapp mt-8" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-whatsapp" aria-hidden="true"></i> Avisar o Pedro no WhatsApp
                    </a>
                )}
            </div>
        </section>
    )
}

export default Agendar
