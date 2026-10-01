import imagem from '../../assets/web/mt-servicos.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import Citacao from '../../components/ui/Citacao'
import ListaMarcada from '../../components/ui/ListaMarcada'
import TabelaPrecos from '../../components/ui/TabelaPrecos'
import ChamadaFinal from '../../components/ui/ChamadaFinal'

const INDICACOES = [
    'Atrasos no desenvolvimento',
    'Transtorno do Espectro Autista (TEA)',
    'TDAH',
    'Ansiedade',
    'Dificuldades emocionais',
    'Fortalecimento de vínculos familiares',
    'Reabilitação',
    'Promoção de qualidade de vida',
]

const RECURSOS = ['Improvisação', 'Prática instrumental', 'Musicalização', 'Escuta receptiva']

function Mt() {
    return (
        <>
            <HeroPagina
                rotulo="Musicoterapia"
                titulo="Quando as palavras falham, a música fala"
                descricao="A musicoterapia usa experiências musicais para promover saúde, desenvolvimento e qualidade de vida. Cada sessão é construída a partir dos objetivos terapêuticos de cada pessoa, e não é preciso ter conhecimento musical."
                imagem={imagem}
                imagemAlt="Ilustração de Pedro, de jaleco, tocando ukulele"
                agendar="/agendar?servico=MUSICOTERAPIA"
                textoAgendar="Agendar sessão"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre a musicoterapia."
            />

            <section className="secao">
                <div className="container-site">
                    <BlocoTexto rotulo="Abordagem" titulo="A escuta é sempre o ponto de partida">
                        <p>
                            A música se torna um recurso para facilitar comunicação, expressão emocional, autorregulação, interação social e desenvolvimento cognitivo.
                            A partir de uma abordagem individualizada, desenvolvo experiências que consideram a identidade sonora, as necessidades e as possibilidades de cada pessoa.
                        </p>
                        <p>
                            Minha experiência inclui atendimentos com crianças com autismo e Síndrome de Down, jovens e adultos com demandas de ansiedade, concentração e depressão,
                            e idosos, incluindo casos de Alzheimer, Parkinson e solidão, sempre buscando favorecer o desenvolvimento, a autonomia, a comunicação e o bem-estar.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {RECURSOS.map((recurso) => (
                                <span key={recurso} className="rounded-full bg-areia px-4 py-1.5 text-sm font-semibold text-tinta">{recurso}</span>
                            ))}
                        </div>
                    </BlocoTexto>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Para quem" titulo="Os atendimentos podem contribuir em situações como" descricao="Cada processo é único." />
                    <div className="mt-8">
                        <ListaMarcada itens={INDICACOES} icone="bi-heart-pulse" colunas="sm:grid-cols-2 lg:grid-cols-4" />
                    </div>
                </div>
            </section>

            <section className="secao">
                <div className="container-site">
                    <CabecalhoSecao
                        rotulo="Investimento"
                        titulo="Valores das sessões"
                        descricao="Sessões de 50 minutos, individuais ou em grupo. Os pacotes mantêm dia e horário fixos na semana, o que ajuda na continuidade do processo."
                    />
                    <div className="mt-8">
                        <TabelaPrecos categoria="MUSICOTERAPIA" />
                    </div>
                </div>
            </section>

            <section className="secao pt-0">
                <div className="container-site">
                    <Citacao texto="Quando as palavras falham, a música fala." autor="Hans Christian Andersen" />
                </div>
            </section>

            <ChamadaFinal
                titulo="Vamos conversar sobre o seu processo?"
                texto="Se preferir, conte um pouco da situação pelo WhatsApp antes de agendar a primeira sessão."
                agendar="/agendar?servico=MUSICOTERAPIA"
                textoAgendar="Agendar sessão"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre a musicoterapia."
            />
        </>
    )
}

export default Mt
