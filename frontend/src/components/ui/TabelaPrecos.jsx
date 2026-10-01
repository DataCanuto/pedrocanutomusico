import { Link } from 'react-router-dom'
import { MODALIDADES, PRECOS_AULAS, TIPOS_CONTRATACAO, formatarValor } from '../../agendamento/catalogo.js'

/** Preços de uma categoria de aula, lidos do mesmo catálogo usado pelo agendamento. */
function TabelaPrecos({ categoria }) {
    const modalidades = PRECOS_AULAS[categoria]
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(modalidades).map(([modalidade, pacotes]) => (
                <div key={modalidade} className="cartao">
                    <h3 className="text-2xl">{MODALIDADES[modalidade]}</h3>
                    <ul className="mt-4 divide-y divide-tinta/10">
                        {Object.entries(pacotes).map(([tipo, preco]) => (
                            <li key={tipo} className="flex items-baseline justify-between gap-4 py-3">
                                <span>
                                    <span className="font-semibold">{TIPOS_CONTRATACAO[tipo].nome}</span>
                                    <span className="block text-sm text-tinta-suave">{preco.duracaoMinutos} min por encontro</span>
                                </span>
                                <span className="font-display text-xl font-bold text-marca">{formatarValor(preco.valor)}</span>
                            </li>
                        ))}
                    </ul>
                    <Link to={`/agendar?servico=${categoria}&modalidade=${modalidade}`} className="btn-secundario mt-4 w-full">
                        Agendar {MODALIDADES[modalidade].toLowerCase()}
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default TabelaPrecos
