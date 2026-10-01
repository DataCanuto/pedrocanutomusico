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
import './agendar.css'

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

function Agendar() {
    const [parametros] = useSearchParams()
    const [pedido, setPedido] = useState(() => {
        const servico = parametros.get('servico')
        return CATEGORIAS[servico] ? { ...PEDIDO_INICIAL, categoria: servico } : PEDIDO_INICIAL
    })
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
        <main className="agendar container my-5">
            <header className="text-center mb-5">
                <h1 className="agendar-titulo">Agende seu horário</h1>
                <p className="text-muted">Escolha o serviço, o horário e onde vai ser. O Pedro confirma pelo WhatsApp.</p>
            </header>

            <form onSubmit={enviar} noValidate>
                <div className="row g-4">
                    <div className="col-12 col-lg-8">
                        <section className="agendar-etapa">
                            <h2><span>1</span> Serviço</h2>
                            <div className="agendar-opcoes">
                                {Object.entries(CATEGORIAS).map(([chave, categoria]) => (
                                    <button
                                        type="button"
                                        key={chave}
                                        className={`agendar-opcao ${pedido.categoria === chave ? 'ativa' : ''}`}
                                        onClick={() => escolherCategoria(chave)}
                                        aria-pressed={pedido.categoria === chave}
                                    >
                                        {categoria.nome}
                                    </button>
                                ))}
                            </div>

                            {ehAula && (
                                <div className="row g-3 mt-2">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="modalidade">Modalidade</label>
                                        <select
                                            id="modalidade"
                                            className="form-select"
                                            value={pedido.modalidade}
                                            onChange={(e) => setPedido((a) => ({ ...a, modalidade: e.target.value, tipoContratacao: 'AVULSO' }))}
                                        >
                                            {Object.entries(MODALIDADES).map(([chave, nome]) => <option key={chave} value={chave}>{nome}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="pacote">Pacote</label>
                                        <select id="pacote" className="form-select" value={pedido.tipoContratacao} onChange={(e) => atualizar('tipoContratacao', e.target.value)}>
                                            {Object.entries(precosDaCategoria).map(([chave, preco]) => (
                                                <option key={chave} value={chave}>
                                                    {TIPOS_CONTRATACAO[chave].nome} · {formatarValor(preco.valor)} · {preco.duracaoMinutos} min
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {pedido.categoria === 'AULA_INSTRUMENTO' && (
                                        <div className="col-12 col-md-6">
                                            <label className="form-label" htmlFor="instrumento">Instrumento</label>
                                            <select id="instrumento" className="form-select" value={pedido.instrumento} onChange={(e) => atualizar('instrumento', e.target.value)}>
                                                <option value="">Escolha</option>
                                                {Object.entries(INSTRUMENTOS).map(([chave, nome]) => <option key={chave} value={chave}>{nome}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="aluno-nome">Nome de quem vai fazer a aula</label>
                                        <input id="aluno-nome" className="form-control" value={pedido.aluno.nome} onChange={(e) => atualizarGrupo('aluno', 'nome', e.target.value)} />
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label" htmlFor="aluno-idade">Idade</label>
                                        <input id="aluno-idade" className="form-control" inputMode="numeric" value={pedido.aluno.idade} onChange={(e) => atualizarGrupo('aluno', 'idade', e.target.value.replace(/\D/g, ''))} />
                                    </div>
                                </div>
                            )}

                            {pedido.categoria === 'EVENTO' && (
                                <div className="row g-3 mt-2">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="tipo-evento">Tipo de evento</label>
                                        <select
                                            id="tipo-evento"
                                            className="form-select"
                                            value={pedido.tipoEvento}
                                            onChange={(e) => setPedido((a) => ({ ...a, tipoEvento: e.target.value, pacoteEventoId: '' }))}
                                        >
                                            <option value="">Escolha</option>
                                            {Object.entries(TIPOS_EVENTO).map(([chave, nome]) => <option key={chave} value={chave}>{nome}</option>)}
                                        </select>
                                    </div>
                                    {pacotesDoEvento.length > 0 && (
                                        <div className="col-12">
                                            <div className="agendar-pacotes">
                                                {pacotesDoEvento.map((pacote) => (
                                                    <button
                                                        type="button"
                                                        key={pacote.id}
                                                        className={`agendar-pacote ${pedido.pacoteEventoId === pacote.id ? 'ativa' : ''}`}
                                                        onClick={() => atualizar('pacoteEventoId', pacote.id)}
                                                        aria-pressed={pedido.pacoteEventoId === pacote.id}
                                                    >
                                                        <strong>{pacote.nome}</strong>
                                                        <span>{pacote.descricao}</span>
                                                        <em>{formatarValor(pacote.valor)}{pacote.duracaoMinutos ? ` · ${pacote.duracaoMinutos} min` : ''}</em>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {pedido.categoria && (
                            <section className="agendar-etapa">
                                <h2><span>2</span> Data e horário</h2>
                                {ehPacote ? (
                                    <>
                                        <p className="text-muted small">
                                            Escolha até {MAXIMO_RECORRENCIAS} dias fixos na semana. Aulas de segunda a sexta das 08h às 18h e sábado das 08h às 13h.
                                        </p>
                                        {pedido.recorrencias.map((recorrencia, indice) => (
                                            <div className="row g-2 align-items-end mb-2" key={indice}>
                                                <div className="col-5">
                                                    <label className="form-label small" htmlFor={`dia-${indice}`}>Dia</label>
                                                    <select id={`dia-${indice}`} className="form-select" value={recorrencia.diaSemana} onChange={(e) => atualizarRecorrencia(indice, 'diaSemana', Number(e.target.value))}>
                                                        {DIAS_DE_AULA.map((dia) => <option key={dia} value={dia}>{DIAS_SEMANA[dia]}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-5">
                                                    <label className="form-label small" htmlFor={`hora-${indice}`}>Horário</label>
                                                    <select id={`hora-${indice}`} className="form-select" value={recorrencia.hora} onChange={(e) => atualizarRecorrencia(indice, 'hora', e.target.value)}>
                                                        <option value="">--:--</option>
                                                        {horariosDoDiaDaSemana(pedido.categoria, recorrencia.diaSemana).map((hora) => <option key={hora} value={hora}>{hora}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-2">
                                                    {pedido.recorrencias.length > 1 && (
                                                        <button type="button" className="btn btn-outline-secondary w-100" aria-label="Remover dia" onClick={() => atualizar('recorrencias', pedido.recorrencias.filter((_, i) => i !== indice))}>
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {pedido.recorrencias.length < MAXIMO_RECORRENCIAS && (
                                            <button type="button" className="btn btn-link px-0" onClick={() => atualizar('recorrencias', [...pedido.recorrencias, { diaSemana: 1, hora: '' }])}>
                                                + Adicionar outro dia
                                            </button>
                                        )}
                                        {pedido.recorrencias.every((r) => r.hora) && agenda.erros.length > 0 && (
                                            <div className="alert alert-warning small mt-2" role="alert">{agenda.erros[0]}</div>
                                        )}
                                        <div className="col-12 col-md-6 mt-3">
                                            <label className="form-label" htmlFor="inicio-pacote">Começar a partir de (opcional)</label>
                                            <input id="inicio-pacote" type="date" className="form-control" min={amanha} value={pedido.data} onChange={(e) => atualizar('data', e.target.value)} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label" htmlFor="data">Data</label>
                                            <input id="data" type="date" className="form-control" min={amanha} value={pedido.data} onChange={(e) => setPedido((a) => ({ ...a, data: e.target.value, hora: '' }))} />
                                        </div>
                                        {pedido.data && (
                                            <div className="agendar-horarios mt-3" role="group" aria-label="Horários disponíveis">
                                                {horariosLivres.length === 0 && (
                                                    <p className="text-muted">
                                                        {ehAula && new Date(`${pedido.data}T00:00:00Z`).getUTCDay() === 0
                                                            ? 'Não há aulas aos domingos. Escolha outro dia.'
                                                            : 'Sem horários livres nesse dia. Escolha outra data.'}
                                                    </p>
                                                )}
                                                {horariosLivres.map((hora) => (
                                                    <button
                                                        type="button"
                                                        key={hora}
                                                        className={`agendar-horario ${pedido.hora === hora ? 'ativa' : ''}`}
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
                            </section>
                        )}

                        {pedido.categoria && (
                            <section className="agendar-etapa">
                                <h2><span>3</span> Seus dados e endereço</h2>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="cliente-nome">Seu nome</label>
                                        <input id="cliente-nome" className="form-control" autoComplete="name" value={pedido.cliente.nome} onChange={(e) => atualizarGrupo('cliente', 'nome', e.target.value)} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="cliente-telefone">WhatsApp com DDD</label>
                                        <input id="cliente-telefone" className="form-control" type="tel" autoComplete="tel" placeholder="(71) 90000-0000" value={pedido.cliente.telefone} onChange={(e) => atualizarGrupo('cliente', 'telefone', e.target.value)} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="cliente-email">E-mail (opcional)</label>
                                        <input id="cliente-email" className="form-control" type="email" autoComplete="email" value={pedido.cliente.email} onChange={(e) => atualizarGrupo('cliente', 'email', e.target.value)} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="cep">CEP {buscandoCep && <small className="text-muted">buscando…</small>}</label>
                                        <input id="cep" className="form-control" inputMode="numeric" autoComplete="postal-code" placeholder="40000-000" value={pedido.endereco.cep} onChange={(e) => preencherPorCep(e.target.value)} />
                                    </div>
                                    <div className="col-12 col-md-8">
                                        <label className="form-label" htmlFor="rua">Rua</label>
                                        <input id="rua" className="form-control" value={pedido.endereco.rua} onChange={(e) => atualizarGrupo('endereco', 'rua', e.target.value)} />
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <label className="form-label" htmlFor="numero">Número</label>
                                        <input id="numero" className="form-control" value={pedido.endereco.numero} onChange={(e) => atualizarGrupo('endereco', 'numero', e.target.value)} />
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label" htmlFor="complemento">Complemento</label>
                                        <input id="complemento" className="form-control" value={pedido.endereco.complemento} onChange={(e) => atualizarGrupo('endereco', 'complemento', e.target.value)} />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label" htmlFor="bairro">Bairro</label>
                                        <input id="bairro" className="form-control" value={pedido.endereco.bairro} onChange={(e) => atualizarGrupo('endereco', 'bairro', e.target.value)} />
                                    </div>
                                    <div className="col-8 col-md-3">
                                        <label className="form-label" htmlFor="cidade">Cidade</label>
                                        <input id="cidade" className="form-control" value={pedido.endereco.cidade} onChange={(e) => atualizarGrupo('endereco', 'cidade', e.target.value)} />
                                    </div>
                                    <div className="col-4 col-md-2">
                                        <label className="form-label" htmlFor="estado">UF</label>
                                        <input id="estado" className="form-control" maxLength={2} value={pedido.endereco.estado} onChange={(e) => atualizarGrupo('endereco', 'estado', e.target.value.toUpperCase())} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="observacoes">Observações (opcional)</label>
                                        <textarea id="observacoes" className="form-control" rows={3} placeholder="Algo que o Pedro deva saber antes do encontro?" value={pedido.observacoes} onChange={(e) => atualizar('observacoes', e.target.value)} />
                                    </div>
                                    <div className="agendar-armadilha" aria-hidden="true">
                                        <label htmlFor="site">Site</label>
                                        <input id="site" tabIndex={-1} autoComplete="off" value={pedido.site} onChange={(e) => atualizar('site', e.target.value)} />
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="col-12 col-lg-4">
                        <div className="agendar-resumo">
                            <h2>Resumo</h2>
                            {!pedido.categoria && <p className="text-muted">Escolha um serviço para começar.</p>}
                            {pedido.categoria && (
                                <dl>
                                    <dt>Serviço</dt>
                                    <dd>{CATEGORIAS[pedido.categoria].nome}</dd>
                                    {ehAula && (<><dt>Pacote</dt><dd>{TIPOS_CONTRATACAO[pedido.tipoContratacao]?.nome} · {MODALIDADES[pedido.modalidade]}</dd></>)}
                                    {pedido.pacoteEventoId && (<><dt>Pacote</dt><dd>{buscarPacoteEvento(pedido.pacoteEventoId)?.nome}</dd></>)}
                                    {(ehAula || pedido.pacoteEventoId) && (<><dt>Valor</dt><dd>{formatarValor(valor)}</dd></>)}
                                    {slots.length > 0 && (
                                        <>
                                            <dt>{slots.length > 1 ? `${slots.length} encontros` : 'Quando'}</dt>
                                            <dd>
                                                <ul className="list-unstyled mb-0">
                                                    {slots.map((slot) => (
                                                        <li key={`${slot.data}-${slot.hora}`}>
                                                            {DIAS_SEMANA[new Date(`${slot.data}T00:00:00Z`).getUTCDay()].slice(0, 3)}, {formatarData(slot.data)} às {slot.hora}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </dd>
                                        </>
                                    )}
                                </dl>
                            )}

                            {mostrarErros && erros.length > 0 && (
                                <div className="alert alert-warning small" role="alert">
                                    <ul className="mb-0 ps-3">{erros.map((mensagem) => <li key={mensagem}>{mensagem}</li>)}</ul>
                                </div>
                            )}
                            {erro && <div className="alert alert-danger small" role="alert">{erro}</div>}

                            <button type="submit" className="btn btn-action w-100 mx-0" disabled={enviando || !pedido.categoria}>
                                {enviando ? 'Enviando…' : 'Solicitar agendamento'}
                            </button>
                            <p className="small text-muted mt-2 mb-0">
                                O horário fica reservado como pendente até o Pedro confirmar. Prefere conversar antes?{' '}
                                <a href={`https://wa.me/${WHATSAPP_NUMERO}`} target="_blank" rel="noopener noreferrer">Chame no WhatsApp</a>.
                            </p>
                        </div>
                    </aside>
                </div>
            </form>
        </main>
    )
}

function Confirmacao({ confirmacao, pedido }) {
    return (
        <main className="agendar container my-5 text-center">
            <i className="bi bi-check-circle agendar-sucesso-icone" aria-hidden="true"></i>
            <h1 className="agendar-titulo mt-3">Pedido recebido!</h1>
            <p>
                Obrigado, {pedido.cliente.nome.split(' ')[0]}. Seu horário de {CATEGORIAS[pedido.categoria].nome.toLowerCase()} ficou reservado
                {confirmacao.slots.length > 1 ? ` para ${confirmacao.slots.length} encontros` : ''} e o Pedro vai confirmar com você.
            </p>
            <ul className="list-unstyled">
                {confirmacao.slots.map((slot) => <li key={`${slot.data}-${slot.hora}`}>{formatarData(slot.data)} às {slot.hora}</li>)}
            </ul>
            {confirmacao.whatsapp && (
                <a href={confirmacao.whatsapp} className="btn btn-action d-inline-flex mx-auto" target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-whatsapp me-2"></i> Avisar o Pedro no WhatsApp
                </a>
            )}
        </main>
    )
}

export default Agendar
