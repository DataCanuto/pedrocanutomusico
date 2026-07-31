import { Link } from "react-router-dom";
import { ImagemServico } from "../components/home/ImagemServico";
import { AccordionItem } from "../components/ui/Accordion";
import { SERVICOS, type BlocoServico } from "../data/servicos";

const KPIS = [
    "Mais de 10 anos de atuação como músico",
    "Milhares de aulas realizadas",
    "Centenas de familias atendidas em eventos",
    "Dezenas de escolas e empresas atendidas em Salvador",
];

export function HomePage() {
    return (
        <div className="pagina-home">
            <section className="hero" id="topo">
                <p className="hero-eyebrow">Aulas de música e musicoterapia em Salvador, para todas as idades</p>
                <h1>Música que educa, acolhe e transforma.</h1>
                <p className="hero-lead">
                    Sou <strong>Pedro Canuto</strong>, músico, educador musical e musicoterapeuta. Há quase uma década crio experiências
                    musicais para crianças, famílias, escolas, empresas e eventos - sempre com o mesmo propósito:{" "}
                    <strong>fazer da música um encontro entre pessoas.</strong>
                </p>
                <Link className="botao-principal" to="/agendar">
                    Agendar agora
                </Link>
            </section>

            <section className="sobre" id="sobre">
                <h2>Sobre</h2>
                <p>
                    Músico, compositor, multi-instrumentista, educador musical e especialista em Musicoterapia, atuando desde 2016 em
                    escolas, atendimentos particulares, eventos e projetos culturais em Salvador (BA). Mais do que ensinar música, busco
                    criar experiências que permanecem na memória.
                </p>

                <div className="accordion-grupo">
                    <AccordionItem titulo="Resumo e trajetória">
                        <p>
                            Ao longo da trajetória, tive a oportunidade de atuar em importantes instituições de educação infantil da
                            Bahia, além de atendimentos particulares, apresentações musicais e produção artística.
                        </p>
                        <ul>
                            <li>Escola de Música Canela Fina (2016–2019)</li>
                            <li>Escola Dorilândia (2018)</li>
                            <li>Escola Pernalonga (2018–2020)</li>
                            <li>OCA – Infância Viva na Natureza (2018–2023)</li>
                            <li>Escola Cresça e Apareça (2020–2022)</li>
                            <li>Colégio Miró (2021–2024)</li>
                        </ul>
                        <p>Desde 2020, atendo também famílias e empresas com projetos personalizados.</p>
                    </AccordionItem>

                    <AccordionItem titulo="Experiências e diferenciais">
                        <p>Uma metodologia própria, construída ao longo de quase 10 anos de prática, combinando:</p>
                        <ul>
                            <li>desenvolvimento infantil e escuta ativa</li>
                            <li>musicalização baseada na ludicidade e na improvisação</li>
                            <li>aprendizagem através do brincar</li>
                            <li>respeito ao tempo de cada criança</li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem titulo="Missão e filosofia de trabalho">
                        <p>
                            <strong>Missão:</strong> transformar cada encontro musical em desenvolvimento, cuidado e conexão humana - para
                            crianças, famílias, escolas e empresas em Salvador e região.
                        </p>
                        <p>
                            <strong>Filosofia:</strong> a música não pertence só aos palcos - pertence à família, à escola, à infância e à
                            saúde. Ela cria vínculo onde havia distância e memória onde havia rotina. É esse valor que orienta cada
                            serviço da vitrine abaixo.
                        </p>
                    </AccordionItem>
                </div>
            </section>

            <section className="servicos" id="servicos">
                <h2>Vitrine de Serviços</h2>
                <p>Clique em um serviço para ver os detalhes.</p>

                <div className="servicos-vitrine">
                    {SERVICOS.map((servico) => (
                        <AccordionItem key={servico.slug} className="servico-card" titulo={`${servico.icone} ${servico.titulo}`} subtitulo={servico.resumo}>
                            <ImagemServico slug={servico.slug} alt={servico.titulo} />
                            {servico.blocos.map((bloco, i) => (
                                <BlocoServicoView key={i} bloco={bloco} />
                            ))}
                            <Link className="botao-secundario" to="/agendar">
                                Agendar {servico.titulo.toLowerCase()}
                            </Link>
                        </AccordionItem>
                    ))}
                </div>
            </section>

            <section className="kpis">
                <ul>
                    {KPIS.map((kpi) => (
                        <li key={kpi}>{kpi}</li>
                    ))}
                </ul>
            </section>

            <section className="chamada-final">
                <h2>Vamos construir essa experiência juntos?</h2>
                <p>Se você procura uma experiência musical com sensibilidade, conhecimento e propósito, será um prazer caminhar com você.</p>
                <Link className="botao-principal" to="/agendar">
                    Agendar agora
                </Link>
            </section>
        </div>
    );
}

function BlocoServicoView({ bloco }: { bloco: BlocoServico }) {
    if (bloco.tipo === "paragrafo") {
        return <p>{bloco.texto}</p>;
    }
    return (
        <>
            {bloco.titulo && <p className="servico-lista-titulo">{bloco.titulo}</p>}
            <ul>
                {bloco.itens.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </>
    );
}
