import { Link } from 'react-router-dom'
import imagem from '../../assets/web/brincatocadeira-servicos.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import ChamadaFinal from '../../components/ui/ChamadaFinal'
import GaleriaTemporadas from './GaleriaTemporadas'
import CarrosselCards from './CarrosselCards'

function Brincatocadeira() {
    return (
        <>
            <HeroPagina
                rotulo="Brincatocadeira"
                titulo="Música e diversão para a família inteira"
                descricao="Um projeto de música e musicalização que transforma canções, brincadeiras e experiências sonoras em momentos de alegria, interação e descoberta."
                imagem={imagem}
                imagemAlt="Ilustração de Pedro tocando violão com crianças em volta da logomarca do Brincatocadeira"
                agendar="/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=brincatocadeira&publico=INFANTIL"
                textoAgendar="Reservar data"
                mensagemWhatsapp="Olá, Pedro! Quero o Brincatocadeira na minha festa."
            />

            <section className="secao">
                <div className="container-site">
                    <BlocoTexto
                        rotulo="O projeto"
                        titulo="A criança no centro do espetáculo"
                        midia={<CarrosselCards />}
                    >
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
                    <CabecalhoSecao
                        rotulo="Galeria"
                        titulo="A turma toda no palco"
                        descricao="Natal, Carnaval, aniversários, São João e férias: escolha uma época do ano e veja como fica o Brincatocadeira."
                        centralizado
                    />
                    <GaleriaTemporadas />
                </div>
            </section>

            <section className="secao">
                <div className="container-site">
                    <CabecalhoSecao
                        rotulo="Pacotes"
                        titulo="Pacotes e orçamento"
                        descricao="Os pacotes do Brincatocadeira para aniversários, Carnaval e São João, estão na página de eventos. Os valores são sob consulta: escolha o formato e o Pedro monta o orçamento com você."
                        centralizado
                    />
                    <div className="mt-8 text-center">
                        <Link to="/eventos" className="btn-primario">
                            Ver pacotes em Eventos
                        </Link>
                    </div>
                </div>
            </section>

            <ChamadaFinal
                titulo="Que tal uma festa com Brincatocadeira?"
                agendar="/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=brincatocadeira&publico=INFANTIL"
                textoAgendar="Reservar data"
                mensagemWhatsapp="Olá, Pedro! Quero o Brincatocadeira na minha festa."
            />
        </>
    )
}

export default Brincatocadeira
