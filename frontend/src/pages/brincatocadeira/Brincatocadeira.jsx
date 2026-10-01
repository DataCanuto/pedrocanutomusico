import { Link } from 'react-router-dom'
import imagem from '../../assets/web/brincatocadeira-servicos.webp'
import logo from '../../assets/web/brinca-hero.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import PacotesEvento from '../../components/ui/PacotesEvento'
import ChamadaFinal from '../../components/ui/ChamadaFinal'

const APRESENTACOES = [
    { titulo: 'Show “Que Brincadeira!”', texto: 'O show autoral do Brincatocadeira, com canções, brincadeiras musicadas, coreografia e desafios.', agendar: '/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=brincatocadeira' },
    { titulo: 'Bailinho da Brincadeira', texto: 'Carnaval para o público infantil, solo, com músico convidado ou com a banda completa.', agendar: '/agendar?servico=EVENTO&tipo=CARNAVAL' },
    { titulo: 'Quadrilha do Brinca', texto: 'Quadrilha junina para o público infantil, solo, com músico convidado ou com a banda completa.', agendar: '/agendar?servico=EVENTO&tipo=SAO_JOAO' },
    { titulo: 'Brincatocadeira no Natal', texto: 'Apresentação temática de fim de ano, montada sob consulta.', agendar: '/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=monte-seu-show' },
]

function Brincatocadeira() {
    return (
        <>
            <HeroPagina
                rotulo="Brincatocadeira"
                titulo="Música e diversão para a família inteira"
                descricao="Um projeto de música e musicalização que transforma canções, brincadeiras e experiências sonoras em momentos de alegria, interação e descoberta."
                imagem={imagem}
                imagemAlt="Ilustração do Brincatocadeira com Pedro e crianças tocando"
                agendar="/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=brincatocadeira"
                textoAgendar="Reservar data"
                mensagemWhatsapp="Olá, Pedro! Quero o Brincatocadeira na minha festa."
            />

            <section className="secao">
                <div className="container-site">
                    <BlocoTexto rotulo="O projeto" titulo="A criança no centro do espetáculo" imagem={logo} imagemAlt="Logotipo do Brincatocadeira" imagemLarga>
                        <p>
                            Além do show autoral “Que Brincadeira!”, realizamos apresentações temáticas de temporada, como Carnaval e São João,
                            levando música, movimento e ludicidade para diferentes espaços e eventos.
                        </p>
                        <p>
                            Nas apresentações também promovemos oficinas de construção e experimentação de instrumentos musicais, aproximando as crianças dos sons
                            e do fazer musical de forma criativa e participativa.
                        </p>
                    </BlocoTexto>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Apresentações" titulo="Um Brinca para cada época do ano" />
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                        {APRESENTACOES.map((apresentacao) => (
                            <article key={apresentacao.titulo} className="cartao flex flex-col">
                                <h3 className="text-2xl">{apresentacao.titulo}</h3>
                                <p className="mt-2 flex-1 text-tinta-suave">{apresentacao.texto}</p>
                                <Link to={apresentacao.agendar} className="mt-4 font-bold text-marca hover:underline">
                                    Ver pacotes e reservar <i className="bi bi-arrow-right" aria-hidden="true"></i>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="secao">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Pacotes" titulo="Valores" />
                    <div className="mt-8">
                        <PacotesEvento tipos={['ANIVERSARIO', 'CARNAVAL', 'SAO_JOAO']} />
                    </div>
                </div>
            </section>

            <ChamadaFinal
                titulo="Que tal uma festa com Brincatocadeira?"
                agendar="/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=brincatocadeira"
                textoAgendar="Reservar data"
                mensagemWhatsapp="Olá, Pedro! Quero o Brincatocadeira na minha festa."
            />
        </>
    )
}

export default Brincatocadeira
