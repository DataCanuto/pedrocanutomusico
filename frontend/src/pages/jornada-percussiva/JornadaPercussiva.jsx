import imagem from '../../assets/web/jornada-service.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import ListaMarcada from '../../components/ui/ListaMarcada'
import ChamadaFinal from '../../components/ui/ChamadaFinal'

const DESENVOLVE = ['Ritmo', 'Coordenação', 'Percepção', 'Presença', 'Escuta coletiva', 'Expressão musical']
const INSTRUMENTOS = ['Djembê', 'Pandeiro', 'Cajón', 'Atabaque', 'Agogô', 'Derbak']

function JornadaPercussiva() {
    return (
        <>
            <HeroPagina
                rotulo="Jornada Percussiva"
                titulo="A percussão como encontro"
                descricao="Uma experiência de imersão no universo da percussão, construída a partir da exploração de ritmos, instrumentos, corpo e escuta coletiva."
                imagem={imagem}
                imagemAlt="Ilustração de tambores, maracas e agogô"
                agendar="/agendar?servico=EVENTO"
                textoAgendar="Pedir orçamento"
                mensagemWhatsapp="Olá, Pedro! Quero levar a Jornada Percussiva para o meu grupo."
            />

            <section className="secao">
                <div className="container-site">
                    <BlocoTexto rotulo="A vivência" titulo="Descobrir a música no fazer, tocar e compartilhar">
                        <p>
                            Por meio da prática de diferentes instrumentos de percussão e de dinâmicas musicais, os participantes experimentam ritmos,
                            desenvolvem coordenação, percepção e presença, descobrindo a música através do fazer, tocar e compartilhar.
                        </p>
                        <p>Uma experiência que transforma a percussão em encontro, aprendizado e expressão musical.</p>
                    </BlocoTexto>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site grid gap-12 md:grid-cols-2">
                    <div>
                        <CabecalhoSecao rotulo="O que se trabalha" titulo="Corpo, ritmo e escuta" />
                        <div className="mt-6">
                            <ListaMarcada itens={DESENVOLVE} icone="bi-soundwave" />
                        </div>
                    </div>
                    <div>
                        <CabecalhoSecao rotulo="Na roda" titulo="Alguns dos instrumentos" />
                        <ul className="mt-6 flex flex-wrap gap-2">
                            {INSTRUMENTOS.map((instrumento) => (
                                <li key={instrumento} className="rounded-full bg-areia px-4 py-2 font-semibold">{instrumento}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <ChamadaFinal
                titulo="Leve a Jornada Percussiva para o seu grupo"
                texto="Escolas, empresas, festas e encontros: conte o formato e o número de participantes para montarmos a vivência."
                agendar="/agendar?servico=EVENTO"
                textoAgendar="Pedir orçamento"
                mensagemWhatsapp="Olá, Pedro! Quero levar a Jornada Percussiva para o meu grupo."
            />
        </>
    )
}

export default JornadaPercussiva
