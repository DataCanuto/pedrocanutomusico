import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../../assets/web/hero.webp'
import { SERVICOS } from '../../data/servicos.js'
import CabecalhoSecao from '../../components/ui/CabecalhoSecao'
import Citacao from '../../components/ui/Citacao'
import ChamadaFinal from '../../components/ui/ChamadaFinal'
import ListaMarcada from '../../components/ui/ListaMarcada'

const NUMEROS = [
    { valor: 'Desde 2016', texto: 'quase 10 anos de atuação' },
    { valor: 'Centenas', texto: 'de crianças acompanhadas' },
    { valor: 'Milhares', texto: 'de aulas realizadas' },
    { valor: 'Dezenas', texto: 'de escolas, empresas e instituições' },
]

const METODOLOGIA = [
    'Desenvolvimento infantil',
    'Musicalização baseada na ludicidade',
    'Escuta ativa',
    'Improvisação musical',
    'Aprendizagem através do brincar',
    'Respeito ao tempo de cada criança',
]

const ESCOLAS = [
    { nome: 'Escola de Música Canela Fina', periodo: '2016–2019' },
    { nome: 'Escola Dorilândia', periodo: '2018' },
    { nome: 'Escola Pernalonga', periodo: '2018–2020' },
    { nome: 'OCA – Infância Viva na Natureza', periodo: '2018–2023' },
    { nome: 'Escola Cresça e Apareça', periodo: '2020–2022' },
    { nome: 'Colégio Miró', periodo: '2021–2024' },
]

const HISTORIAS = [
    {
        titulo: 'Multi-instrumentista autodidata',
        subtitulo: 'Mais de 10 anos de pesquisa, prática e vivência musical.',
        paragrafos: [
            'Minha trajetória musical começou aos 12 anos, quando ganhei meu primeiro violão. A partir daí, a curiosidade me levou a explorar diferentes instrumentos, linguagens e tradições musicais. Passei pela guitarra e pelo baixo elétrico, instrumento que se tornou um dos meus favoritos durante minha experiência com bandas de rock. Ao longo dos anos, também me aproximei de outros instrumentos de cordas, sopros, teclas e uma grande variedade de instrumentos de percussão.',
            'A experiência profissional e o interesse pessoal ampliaram essa pesquisa e me aproximaram ainda mais da percussão, do movimento e das diferentes possibilidades de interação com o público. Na faculdade e em diversas vivências práticas, passei a reunir instrumentos como violão, guitarra, baixo, ukulelê, cavaquinho, bandolim, teclado, pífano, bansuri, flauta xamânica, djembê, pandeiro, cajón, atabaque, agogô, derbak e outros em uma prática musical bastante diversa.',
        ],
    },
    {
        titulo: 'Experiência e embasamento',
        subtitulo: '8 anos de experiência formal em aulas de musicalização infantil.',
        paragrafos: [
            'Minha trajetória com a musicalização infantil começou em 2016, quando acompanhei meu sobrinho, ainda recém-nascido, em uma aula na Escola de Música Canela Fina. A experiência despertou meu interesse pela relação entre música, infância e desenvolvimento. Durante a conclusão do Bacharelado Interdisciplinar em Artes, estagiei na escola e, depois, passei a atuar como professor efetivo.',
            'Minha prática é fundamentada em diferentes referências da educação musical e das culturas populares, incluindo princípios da abordagem Orff-Schulwerk, experiências com capoeira e outras manifestações da cultura brasileira, além de estudos e vivências com ritmo, percussão, canto, movimento e exploração de instrumentos.',
        ],
    },
    {
        titulo: 'Minha trajetória musical',
        subtitulo: 'Momentos marcantes da minha relação com a música.',
        paragrafos: [
            'Dos 14 aos 20 anos, atuei como baixista em bandas de rock, participando de shows, festivais, eventos independentes e projetos contemplados por editais culturais. Além de tocar, participei dos processos de criação, composição e gravação de discos, desenvolvendo uma visão prática sobre ensaios, repertório, arranjos e apresentação ao vivo.',
            'Essa vivência na cena independente de Salvador, especialmente no Rio Vermelho, ampliou minha compreensão sobre produção cultural, organização de eventos e relação com o público, conhecimentos que hoje fazem parte do meu trabalho com música ao vivo, eventos, educação musical e projetos autorais.',
        ],
    },
]

const PASSOS = [
    { icone: 'bi-grid', titulo: 'Escolha o serviço', texto: 'Aula avulsa, pacote mensal ou evento, com o valor à vista.' },
    { icone: 'bi-calendar2-check', titulo: 'Reserve o horário', texto: 'Você vê só os horários livres da agenda e informa o endereço.' },
    { icone: 'bi-whatsapp', titulo: 'Confirmação', texto: 'O Pedro confirma com você pelo WhatsApp e o encontro está marcado.' },
]

function Home() {
    const [historia, setHistoria] = useState(0)

    return (
        <>
            <section className="relative overflow-hidden bg-linear-to-br from-areia via-creme to-creme">
                <div className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-girassol/25 blur-3xl" aria-hidden="true"></div>
                <div className="pointer-events-none absolute bottom-0 -left-32 size-80 rounded-full bg-laranja/15 blur-3xl" aria-hidden="true"></div>
                <div className="container-site relative grid items-center gap-8 pt-10 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-16 md:pb-24">
                    <div>
                        <p className="text-sm text-tinta-suave italic">
                            “A música exprime aquilo que não pode ser dito em palavras e aquilo sobre o qual é impossível permanecer em silêncio.” — Victor Hugo
                        </p>
                        <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl">
                            Música que <span className="text-marca">educa</span>, <span className="text-laranja">acolhe</span> e transforma.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg text-tinta-suave">
                            Sou <strong className="text-tinta">Pedro Canuto</strong>, músico, multi-instrumentista, compositor, educador musical e musicoterapeuta.
                            Há quase uma década crio experiências musicais para crianças, famílias, escolas, empresas e eventos em Salvador.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/agendar" className="btn-primario">Agendar agora</Link>
                            <a href="#servicos" className="btn-secundario">Conhecer os serviços</a>
                        </div>
                    </div>
                    <img src={heroImg} alt="Ilustração de Pedro Canuto cercado de notas musicais" className="mx-auto w-full max-w-sm md:max-w-md" fetchPriority="high" />
                </div>
                <div className="container-site relative pb-12">
                    <dl className="grid grid-cols-2 gap-3 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-tinta/5 backdrop-blur md:grid-cols-4 md:p-6">
                        {NUMEROS.map((numero) => (
                            <div key={numero.texto} className="text-center">
                                <dt className="font-display text-2xl font-extrabold text-marca sm:text-3xl">{numero.valor}</dt>
                                <dd className="text-sm text-tinta-suave">{numero.texto}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            <section id="servicos" className="secao">
                <div className="container-site">
                    <CabecalhoSecao
                        rotulo="Serviços"
                        titulo="Escolha a sua experiência musical"
                        descricao="Cada serviço foi pensado para um momento da vida, sempre com a música como ferramenta de desenvolvimento, expressão e conexão."
                        centralizado
                    />
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {SERVICOS.filter((servico) => servico.principal).map((servico) => <CartaoServico key={servico.caminho} servico={servico} />)}
                    </div>
                    <h3 className="mt-16 text-center text-2xl">Projetos especiais</h3>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {SERVICOS.filter((servico) => !servico.principal).map((servico) => <CartaoServico key={servico.caminho} servico={servico} />)}
                    </div>
                </div>
            </section>

            <section className="secao bg-white">
                <div className="container-site">
                    <CabecalhoSecao rotulo="Como funciona" titulo="Agendar é simples assim" centralizado />
                    <ol className="mt-12 grid gap-6 md:grid-cols-3">
                        {PASSOS.map((passo, indice) => (
                            <li key={passo.titulo} className="relative rounded-3xl bg-creme p-6 text-center">
                                <span className="absolute top-4 left-5 font-display text-5xl font-extrabold text-tinta/5">{indice + 1}</span>
                                <i className={`bi ${passo.icone} text-4xl text-marca`} aria-hidden="true"></i>
                                <h3 className="mt-3 text-xl">{passo.titulo}</h3>
                                <p className="mt-2 text-tinta-suave">{passo.texto}</p>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-10 text-center">
                        <Link to="/agendar" className="btn-primario">Ver horários livres</Link>
                    </div>
                </div>
            </section>

            <section id="sobre" className="secao">
                <div className="container-site grid gap-12 lg:grid-cols-2">
                    <div>
                        <CabecalhoSecao rotulo="Sobre" titulo="Arte, educação e cuidado no mesmo compasso" />
                        <div className="mt-4 space-y-4 text-lg text-tinta-suave">
                            <p>
                                A música acompanha a humanidade desde antes da escrita. Ela organiza emoções, fortalece vínculos, desperta memórias e amplia nossa capacidade de aprender.
                            </p>
                            <p>
                                Atuo desde 2016 em escolas, atendimentos particulares, eventos e projetos culturais. Ao longo desses anos desenvolvi uma metodologia própria que combina:
                            </p>
                        </div>
                        <div className="mt-6">
                            <ListaMarcada itens={METODOLOGIA} icone="bi-check2-circle" />
                        </div>
                        <p className="mt-6 text-lg font-semibold">Mais do que ensinar música, busco criar experiências que permanecem na memória.</p>
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Minha história">
                            {HISTORIAS.map((item, indice) => (
                                <button
                                    key={item.titulo}
                                    type="button"
                                    role="tab"
                                    aria-selected={historia === indice}
                                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${historia === indice ? 'bg-tinta text-white' : 'bg-white text-tinta-suave ring-1 ring-tinta/10 hover:text-tinta'}`}
                                    onClick={() => setHistoria(indice)}
                                >
                                    {item.titulo}
                                </button>
                            ))}
                        </div>
                        <article className="cartao mt-4" role="tabpanel">
                            <h3 className="text-2xl">{HISTORIAS[historia].titulo}</h3>
                            <p className="font-semibold text-marca">{HISTORIAS[historia].subtitulo}</p>
                            <div className="mt-4 space-y-4 text-tinta-suave">
                                {HISTORIAS[historia].paragrafos.map((paragrafo) => <p key={paragrafo.slice(0, 20)}>{paragrafo}</p>)}
                            </div>
                        </article>

                        <h3 className="mt-10 text-xl">Experiência em educação musical</h3>
                        <ol className="mt-4 space-y-3 border-l-2 border-laranja/40 pl-6">
                            {ESCOLAS.map((escola) => (
                                <li key={escola.nome} className="relative">
                                    <span className="absolute top-2 -left-[1.95rem] size-3 rounded-full bg-laranja" aria-hidden="true"></span>
                                    <span className="font-semibold">{escola.nome}</span>
                                    <span className="ml-2 text-sm text-tinta-suave">{escola.periodo}</span>
                                </li>
                            ))}
                        </ol>
                        <p className="mt-4 text-tinta-suave">Desde 2020 também realizo atendimentos particulares, apresentações, produção artística e projetos para famílias e empresas.</p>
                    </div>
                </div>
            </section>

            <section className="secao bg-tinta text-white">
                <div className="container-site grid items-center gap-10 md:grid-cols-2">
                    <div>
                        <p className="rotulo text-girassol">Nossa filosofia</p>
                        <h2 className="titulo-secao text-white">A música não pertence apenas aos palcos.</h2>
                    </div>
                    <p className="text-xl leading-relaxed text-white/80">
                        Ela pertence às famílias, à escola, à infância, à saúde, ao brincar e ao silêncio. Cria vínculos onde antes existia distância,
                        memórias onde antes existia rotina, e transforma pequenos encontros em experiências que permanecem por toda a vida.
                    </p>
                </div>
            </section>

            <section className="secao pb-0">
                <div className="container-site">
                    <Citacao texto="Onde as palavras terminam, começa a música." autor="Heinrich Heine" />
                </div>
            </section>

            <ChamadaFinal
                texto="Se você procura uma experiência musical construída com sensibilidade, conhecimento e propósito, será um prazer caminhar junto com sua família, sua escola, sua empresa ou seu evento."
            />
        </>
    )
}

function CartaoServico({ servico }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-tinta/5 transition hover:-translate-y-1 hover:shadow-xl">
            <Link to={servico.caminho} className="block aspect-[4/3] overflow-hidden bg-areia" tabIndex={-1} aria-hidden="true">
                <img src={servico.imagem} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
            </Link>
            <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl">
                    <Link to={servico.caminho} className="hover:text-marca">{servico.nome}</Link>
                </h3>
                <p className="mt-2 flex-1 text-tinta-suave">{servico.resumo}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={servico.agendar} className="btn-primario px-4 py-2 text-base">Agendar</Link>
                    <Link to={servico.caminho} className="btn-secundario px-4 py-2 text-base">Saiba mais</Link>
                </div>
            </div>
        </article>
    )
}

export default Home
