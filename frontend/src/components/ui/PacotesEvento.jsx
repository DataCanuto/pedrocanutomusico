import { Link } from 'react-router-dom'
import { MENSAGEM_JORNADA_PERCUSSIVA, PACOTES_EVENTO, TIPOS_COM_PUBLICO, TIPOS_EVENTO, formatarValor } from '../../agendamento/catalogo.js'
import { whatsappComMensagem } from '../../data/servicos.js'

/**
 * Cartões dos pacotes de evento do catálogo, cada um levando ao agendamento já preenchido.
 * `publico` (INFANTIL ou GERAL) já vai no link dos tipos que pedem essa escolha.
 */
function PacotesEvento({ tipos, publico }) {
    const pacotes = PACOTES_EVENTO.filter((pacote) => tipos.includes(pacote.tipoEvento))
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pacotes.map((pacote) => (
                <article key={pacote.id} className="cartao flex flex-col">
                    <p className="rotulo text-laranja">{TIPOS_EVENTO[pacote.tipoEvento]}</p>
                    <h3 className="mt-1 text-2xl">{pacote.nome}</h3>
                    <p className="mt-2 flex-1 text-tinta-suave">{pacote.descricao}</p>
                    <p className="mt-4 flex items-baseline justify-between">
                        <span className="font-display text-2xl font-extrabold text-marca">{formatarValor(pacote.valor)}</span>
                        {pacote.duracaoMinutos && <span className="text-sm text-tinta-suave">{pacote.duracaoMinutos} min</span>}
                    </p>
                    {pacote.soContato ? (
                        <a href={whatsappComMensagem(MENSAGEM_JORNADA_PERCUSSIVA)} className="btn-secundario mt-4 w-full" target="_blank" rel="noopener noreferrer">
                            Falar com o Pedro
                        </a>
                    ) : (
                        <Link
                            to={`/agendar?servico=EVENTO&tipo=${pacote.tipoEvento}&pacote=${pacote.id}${
                                publico && TIPOS_COM_PUBLICO.includes(pacote.tipoEvento) ? `&publico=${publico}` : ''
                            }`}
                            className="btn-secundario mt-4 w-full"
                        >
                            {pacote.valor == null ? 'Pedir orçamento' : 'Reservar data'}
                        </Link>
                    )}
                </article>
            ))}
        </div>
    )
}

export default PacotesEvento
