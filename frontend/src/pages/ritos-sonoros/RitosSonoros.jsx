import imagem from '../../assets/web/musicoterapia-card.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import ListaMarcada from '../../components/ui/ListaMarcada'
import ChamadaFinal from '../../components/ui/ChamadaFinal'

const ONDE = ['Aulas de yoga', 'Retiros', 'Celebrações', 'Grupos terapêuticos', 'Empresas', 'Encontros de desenvolvimento humano']
const INSTRUMENTOS = ['Flauta xamânica', 'Sinos', 'Tigelas tibetanas', 'Instrumentos de percussão']

function RitosSonoros() {
    return (
        <>
            <HeroPagina
                rotulo="Ritos Sonoros · Sound Healing"
                titulo="Há sons que entretêm. Há sons que acolhem."
                descricao="Experiências de imersão e escuta que usam o som como elemento de relaxamento, presença e conexão, integrando práticas como yoga, sound healing e outros rituais sonoros."
                imagem={imagem}
                imagemAlt="Ilustração de uma roda de pessoas meditando ao som de violão e tigelas"
                agendar="/agendar?servico=EVENTO&tipo=MUSICOTERAPIA_EVENTO&pacote=soundhealing"
                textoAgendar="Pedir orçamento"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre os Ritos Sonoros e o sound healing."
            />

            <section className="secao">
                <div className="container-site">
                    <BlocoTexto rotulo="A experiência" titulo="Escuta, desaceleração e bem-estar">
                        <p>
                            As sessões utilizam instrumentos de diversas tradições para criar ambientes de relaxamento profundo, meditação e reconexão,
                            a partir de estudos sobre as características sonoras de cada instrumento e suas possibilidades de aplicação.
                        </p>
                        <p>Uma experiência na qual o som conduz momentos de contemplação e percepção. Cada sessão é construída respeitando o propósito do grupo.</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {INSTRUMENTOS.map((instrumento) => (
                                <span key={instrumento} className="rounded-full bg-areia px-4 py-1.5 text-sm font-semibold text-tinta">{instrumento}</span>
                            ))}
                        </div>
                    </BlocoTexto>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Onde acontece" titulo="Sessões para grupos e espaços diversos" />
                    <div className="mt-8">
                        <ListaMarcada itens={ONDE} icone="bi-flower1" colunas="sm:grid-cols-2 lg:grid-cols-3" />
                    </div>
                </div>
            </section>

            <ChamadaFinal
                titulo="Quer uma sessão para o seu grupo?"
                texto="Conte o propósito do encontro, o local e o número de pessoas para montarmos a experiência."
                agendar="/agendar?servico=EVENTO&tipo=MUSICOTERAPIA_EVENTO&pacote=soundhealing"
                textoAgendar="Pedir orçamento"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre os Ritos Sonoros e o sound healing."
            />
        </>
    )
}

export default RitosSonoros
