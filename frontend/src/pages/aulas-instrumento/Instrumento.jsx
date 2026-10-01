import imagem from '../../assets/web/instrumentos-service.webp'
import bannerImg from '../../assets/web/instrumentos-hero.webp'
import HeroPagina from '../../components/ui/HeroPagina'
import BlocoTexto from '../../components/ui/BlocoTexto'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import ListaMarcada from '../../components/ui/ListaMarcada'
import TabelaPrecos from '../../components/ui/TabelaPrecos'
import ChamadaFinal from '../../components/ui/ChamadaFinal'

const FAMILIAS = [
    { nome: 'Cordas', icone: 'bi-music-note', instrumentos: ['Violão', 'Guitarra', 'Ukulele', 'Cavaquinho', 'Bandolim', 'Baixo'] },
    { nome: 'Percussão', icone: 'bi-vinyl', instrumentos: ['Cajón', 'Pandeiro'] },
    { nome: 'Sopro', icone: 'bi-wind', instrumentos: ['Flauta doce'] },
    { nome: 'Voz', icone: 'bi-mic', instrumentos: ['Canto'] },
]

const PUBLICO_CANTO = ['Iniciantes', 'Cantores', 'Professores', 'Músicos', 'Quem deseja vencer a timidez ao falar ou cantar']

function Instrumento() {
    return (
        <>
            <HeroPagina
                rotulo="Aulas de Instrumento e Canto"
                titulo="Aprender a tocar é muito mais do que executar músicas"
                descricao="É desenvolver disciplina, criatividade, concentração e expressão artística. As aulas são totalmente personalizadas, para iniciantes ou avançados, e o repertório é construído junto com você."
                imagem={imagem}
                imagemAlt="Ilustração de violões, ukulele, guitarra e uma cantora"
                agendar="/agendar?servico=AULA_INSTRUMENTO"
                textoAgendar="Agendar aula"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre as aulas de instrumento."
            />

            <section className="secao">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Instrumentos" titulo="O que você quer aprender?" descricao="Cordas, percussão, sopro e voz, respeitando o ritmo e os objetivos de cada aluno." />
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FAMILIAS.map((familia) => (
                            <div key={familia.nome} className="cartao">
                                <i className={`bi ${familia.icone} text-3xl text-marca`} aria-hidden="true"></i>
                                <h3 className="mt-2 text-2xl">{familia.nome}</h3>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {familia.instrumentos.map((instrumento) => (
                                        <li key={instrumento} className="rounded-full bg-areia px-3 py-1 text-sm font-semibold">{instrumento}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <BlocoTexto rotulo="Aulas de canto" titulo="A voz é o instrumento que carregamos a vida toda" imagem={bannerImg} imagemAlt="Ilustração de pessoas cantando e tocando juntas" imagemLarga invertido>
                        <p>Nas aulas de canto trabalhamos técnica vocal, respiração, percepção musical, afinação, interpretação e expressão artística.</p>
                        <p>O objetivo não é apenas cantar melhor. É cantar com liberdade, consciência e identidade.</p>
                        <div className="pt-2">
                            <ListaMarcada itens={PUBLICO_CANTO} icone="bi-mic" colunas="" />
                        </div>
                    </BlocoTexto>
                </div>
            </section>

            <section className="secao">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Investimento" titulo="Valores" descricao="Aulas de 50 minutos. Escolha uma aula avulsa ou um pacote de 4 aulas com dia e horário fixos." />
                    <div className="mt-8">
                        <TabelaPrecos categoria="AULA_INSTRUMENTO" />
                    </div>
                </div>
            </section>

            <ChamadaFinal
                titulo="Qual música você sempre quis tocar?"
                agendar="/agendar?servico=AULA_INSTRUMENTO"
                textoAgendar="Agendar aula"
                mensagemWhatsapp="Olá, Pedro! Quero saber mais sobre as aulas de instrumento."
            />
        </>
    )
}

export default Instrumento
