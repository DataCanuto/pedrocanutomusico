import imagem from '../../assets/web/eventos-service.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import PacotesEvento from '../../components/ui/PacotesEvento'
import ChamadaFinal from '../../components/ui/ChamadaFinal'

const ATENDEMOS = ['Aniversários', 'Mensários', 'Batizados', 'Escolas', 'Condomínios', 'Shoppings', 'Eventos culturais', 'Festas temáticas']
const ESPECIAIS = ['Carnaval', 'São João', 'Natal', 'Princesas', 'Super-heróis', 'Capoeira', 'Folclore brasileiro', 'Musicalização para bebês']

function Eventos() {
    return (
        <>
            <HeroPagina
                rotulo="Eventos Musicais"
                titulo="Cada evento tem uma identidade própria"
                descricao="Nossas apresentações nunca são só um repertório de músicas. Misturamos música ao vivo, interação, brincadeiras e participação do público para transformar cada celebração em uma lembrança afetiva."
                imagem={imagem}
                imagemAlt="Ilustração de Pedro tocando violão em uma festa com crianças"
                agendar="/agendar?servico=EVENTO"
                textoAgendar="Reservar data"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre música para eventos."
            />

            <section className="secao">
                <div className="container-site grid gap-10 md:grid-cols-2">
                    <div className="cartao">
                        <h2 className="text-2xl">Atendemos</h2>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {ATENDEMOS.map((item) => <li key={item} className="rounded-full bg-areia px-4 py-1.5 font-semibold">{item}</li>)}
                        </ul>
                    </div>
                    <div className="cartao">
                        <h2 className="text-2xl">Apresentações especiais</h2>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {ESPECIAIS.map((item) => <li key={item} className="rounded-full bg-girassol/25 px-4 py-1.5 font-semibold">{item}</li>)}
                        </ul>
                    </div>
                </div>
                <p className="container-site mt-8 text-center font-display text-2xl font-bold">
                    Nosso diferencial é a interação: as crianças deixam de ser espectadoras e passam a fazer parte do espetáculo.
                </p>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Festas infantis" titulo="Aniversários, Carnaval e São João" descricao="Escolha o pacote e reserve a data. O Pedro confirma os detalhes com você pelo WhatsApp." />
                    <div className="mt-8">
                        <PacotesEvento tipos={['ANIVERSARIO', 'CARNAVAL', 'SAO_JOAO']} />
                    </div>
                </div>
            </section>

            <section className="secao">
                <div className="container-site">
                    <BlocoTexto rotulo="Casamentos" titulo="A trilha dos momentos mais importantes">
                        <p>
                            Cada cerimônia recebe um repertório escolhido junto ao casal. As apresentações em voz e violão unem sensibilidade,
                            elegância e personalização para transformar cada entrada, voto e celebração em uma memória inesquecível.
                        </p>
                    </BlocoTexto>
                    <div className="mt-8">
                        <PacotesEvento tipos={['CASAMENTO', 'EVENTO_CORPORATIVO', 'MUSICOTERAPIA_EVENTO']} />
                    </div>
                </div>
            </section>

            <ChamadaFinal
                titulo="Vamos criar um evento com música, identidade e experiência?"
                agendar="/agendar?servico=EVENTO"
                textoAgendar="Reservar data"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre música para eventos."
            />
        </>
    )
}

export default Eventos
