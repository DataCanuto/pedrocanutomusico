import imagem from '../../assets/web/musicalizacao-servicos.webp'
import bannerImg from '../../assets/web/musicalizacao-hero.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import Citacao from '../../components/ui/Citacao'
import ListaMarcada from '../../components/ui/ListaMarcada'
import TabelaPrecos from '../../components/ui/TabelaPrecos'
import ChamadaFinal from '../../components/ui/ChamadaFinal'

const ESTIMULOS = [
    'Imaginação',
    'Percepção musical',
    'Coordenação motora',
    'Desenvolvimento da fala',
    'Atenção compartilhada',
    'Autonomia',
    'Socialização',
    'Vínculo entre criança e família',
]

const MODALIDADES = [
    { titulo: 'Aulas individuais', texto: 'Planejamento sob medida para o momento de cada criança.' },
    { titulo: 'Pequenos grupos', texto: 'Irmãos, vizinhos ou amigos aprendendo juntos.' },
    { titulo: 'Turmas para bebês', texto: 'Vivências sensoriais e afetivas com a família.' },
    { titulo: '6 meses a 3 anos', texto: 'Exploração de sons, movimento e canções da infância.' },
    { titulo: '4 a 6 anos', texto: 'Ritmo, canto, instrumentos e criação em grupo.' },
]

function Musicalizacao() {
    return (
        <>
            <HeroPagina
                rotulo="Musicalização Infantil"
                titulo="Crianças curiosas, confiantes e felizes"
                descricao="Cantar, brincar, dançar e explorar instrumentos viram oportunidades para desenvolver linguagem, coordenação, criatividade, atenção, memória e habilidades socioemocionais. As aulas acontecem em domicílio, no ambiente em que a criança já se sente segura."
                imagem={imagem}
                imagemAlt="Ilustração de Pedro tocando violão com crianças"
                agendar="/agendar?servico=MUSICALIZACAO_INFANTIL"
                textoAgendar="Agendar aula"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre a musicalização infantil."
            />

            <section className="secao pb-0">
                <div className="container-site">
                    <Citacao texto="Brincar é a forma mais elevada de pesquisa." autor="Atribuído a Albert Einstein" />
                </div>
            </section>

            <section className="secao">
                <div className="container-site">
                    <BlocoTexto rotulo="A proposta" titulo="Não formamos pequenos músicos. Formamos crianças." imagem={bannerImg} imagemAlt="Ilustração de crianças tocando instrumentos ao ar livre" imagemLarga>
                        <p>
                            A infância é o momento em que o cérebro estabelece algumas das conexões mais importantes para toda a vida, e a musicalização potencializa esse processo de maneira natural.
                        </p>
                        <p>
                            A Musicalização Infantil é uma forma de iniciação e alfabetização musical por meio de vivências lúdicas, afetivas e estruturadas. As vivências usam um kit diversificado de instrumentos de percussão, cordas, teclado, sanfoninha e outros recursos sonoros.
                        </p>
                        <p>A metodologia respeita o ritmo individual de cada criança, e as atividades são adaptadas conforme a faixa etária e o desenvolvimento de cada aluno.</p>
                    </BlocoTexto>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Cada encontro estimula" titulo="O que a criança desenvolve" />
                    <div className="mt-8">
                        <ListaMarcada itens={ESTIMULOS} icone="bi-stars" colunas="sm:grid-cols-2 lg:grid-cols-4" />
                    </div>
                </div>
            </section>

            <section className="secao">
                <div className="container-site">
                    <CabecalhoSecao
                        rotulo="Modalidades"
                        titulo="Para cada idade, um jeito de brincar com a música"
                        descricao="Também atendo crianças com desafios no desenvolvimento global, em um ambiente acolhedor, respeitoso e individualizado."
                    />
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {MODALIDADES.map((modalidade) => (
                            <div key={modalidade.titulo} className="cartao">
                                <h3 className="text-lg">{modalidade.titulo}</h3>
                                <p className="mt-1 text-sm text-tinta-suave">{modalidade.texto}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Investimento" titulo="Valores" descricao="Aula avulsa para conhecer, ou pacote de 4 aulas com dia e horário fixos na semana." />
                    <div className="mt-8">
                        <TabelaPrecos categoria="MUSICALIZACAO_INFANTIL" />
                    </div>
                </div>
            </section>

            <ChamadaFinal
                titulo="Vamos fazer música em família?"
                agendar="/agendar?servico=MUSICALIZACAO_INFANTIL"
                textoAgendar="Agendar aula"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre a musicalização infantil."
            />
        </>
    )
}

export default Musicalizacao
