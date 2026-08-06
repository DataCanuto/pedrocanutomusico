/**
 * Conteúdo da landing page ("Vitrine de Serviços"), baseado em about.txt. Puramente informativo -
 * não tem relação com o catálogo de preços (PrecoServico) do backend, que é dado de negócio.
 * Cada serviço tem um slot de imagem opcional em /imagens/servicos/<slug>.jpg - ver ImagemServico.
 */

export type BlocoServico = { tipo: "paragrafo"; texto: string } | { tipo: "lista"; titulo?: string; itens: string[] };

export interface Servico {
    slug: string;
    titulo: string;
    icone: string;
    /** Frase curta exibida no card fechado - o "gancho" que convence a abrir. */
    resumo: string;
    blocos: BlocoServico[];
}

export const SERVICOS: Servico[] = [
    {
        slug: "musicalizacao-infantil",
        titulo: "Musicalização Infantil",
        icone: "🎶",
        resumo: "Aulas de música em Salvador para bebês e crianças de 0 a 6 anos, estimulando fala, coordenação e criatividade através do brincar.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "A infância é o momento em que o cérebro forma as conexões mais importantes para toda a vida. Cantar, brincar e explorar instrumentos transformam cada aula em estímulo para linguagem, atenção, memória e desenvolvimento socioemocional - sempre no ritmo de cada criança.",
            },
            {
                tipo: "lista",
                titulo: "Cada encontro estimula:",
                itens: ["imaginação e percepção musical", "coordenação motora e fala", "atenção e autonomia", "socialização e vínculo com a família"],
            },
            {
                tipo: "lista",
                titulo: "Modalidades",
                itens: ["aulas individuais", "pequenos grupos", "turmas de bebês (6 meses a 3 anos)", "turmas de 4 a 6 anos"],
            },
            {
                tipo: "paragrafo",
                texto: "Também recebemos crianças com desafios no desenvolvimento global, em um ambiente acolhedor e individualizado.",
            },
        ],
    },
    {
        slug: "musicoterapia",
        titulo: "Musicoterapia",
        icone: "💜",
        resumo: "Sessões terapêuticas com música para todas as idades em Salvador - não é necessário ter conhecimento musical.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "A musicoterapia usa experiências musicais para promover saúde, desenvolvimento e qualidade de vida. Cada sessão parte dos objetivos terapêuticos da pessoa, facilitando comunicação, expressão emocional, autorregulação e interação social.",
            },
            {
                tipo: "lista",
                titulo: "Pode contribuir em situações como:",
                itens: [
                    "Atrasos no desenvolvimento",
                    "Transtorno do Espectro Autista (TEA), TDAH",
                    "Ansiedade e dificuldades emocionais",
                    "Reabilitação e promoção de qualidade de vida"
                ],
            },
            { tipo: "paragrafo", texto: "Cada processo é único. A escuta é sempre o ponto de partida." },
        ],
    },
    {
        slug: "aulas-de-instrumento",
        titulo: "Aulas de Instrumento",
        icone: "🎸",
        resumo: "Violão, ukulele, cavaquinho, bandolim, contrabaixo, guitarra, cajón, pandeiro, djembê, atabaque - aulas individuais para iniciantes e avançados.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "Aprender um instrumento vai muito além de tocar músicas: desenvolve disciplina, criatividade, concentração e expressão artística. As aulas são personalizadas conforme o objetivo de cada aluno.",
            },
            {
                tipo: "lista",
                titulo: "Instrumentos disponíveis",
                itens: ["Violão", "Ukulele", "Cavaquinho", "Bandolim", "Contrabaixo", "Guitarra", "Cajón", "Pandeiro","Djembê","Atabaque"],
            },
            { tipo: "paragrafo", texto: "O repertório é construído junto com o estudante, tornando o aprendizado mais prazeroso e significativo." },
        ],
    },
    {
        slug: "aulas-de-canto",
        titulo: "Aulas de Canto",
        icone: "🎤",
        resumo: "Técnica vocal, respiração e afinação para cantar com liberdade e identidade - de iniciantes a profissionais da voz.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "A voz é o instrumento que carregamos a vida toda. Trabalhamos técnica vocal, respiração, percepção musical, afinação e interpretação - o objetivo não é só cantar melhor, é cantar com liberdade e consciência.",
            },
            {
                tipo: "lista",
                titulo: "As aulas atendem",
                itens: ["iniciantes e cantores", "professores e músicos", "quem deseja vencer a timidez ao falar ou cantar em público"],
            },
        ],
    },
    {
        slug: "eventos-musicais",
        titulo: "Eventos Musicais",
        icone: "🎉",
        resumo: "Música ao vivo e interativa para aniversários, escolas e empresas - eventos em Salvador e na Bahia que viram memória afetiva.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "Cada evento tem identidade própria, por isso nossas apresentações nunca são só um repertório de músicas: misturamos música ao vivo, interação e brincadeiras para que as crianças deixem de ser plateia e virem parte do espetáculo.",
            },
            {
                tipo: "lista",
                titulo: "Atendemos",
                itens: ["aniversários e batizados", "escolas, condomínios e shoppings", "eventos culturais e festas temáticas"],
            },
            {
                tipo: "lista",
                titulo:"Brincatocadeira \nMúsica e Animação para a Família Inteira!",
                itens: ["Carnaval e São João", "Natal, princesas e super-heróis","Animação em festa infantil", "Capoeira e folclore brasileiro", "Roda de musicalização para bebês"],
            },
        ],
    },
    {
        slug: "casamentos",
        titulo: "Casamentos",
        icone: "💍",
        resumo: "Voz e violão com repertório escolhido a dois, para transformar cada entrada e voto em memória inesquecível.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "A música marca os momentos mais importantes da vida. Cada cerimônia recebe um repertório cuidadosamente escolhido junto ao casal, unindo sensibilidade, elegância e personalização em voz e violão.",
            },
        ],
    },
    {
        slug: "sound-healing",
        titulo: "Sound Healing",
        icone: "🌿",
        resumo: "Instrumentos de diversas tradições para sessões de relaxamento profundo, meditação e reconexão.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "Há sons que entretêm e sons que acolhem. As sessões de Sound Healing criam ambientes de relaxamento e meditação, respeitando o propósito de cada grupo.",
            },
            {
                tipo: "lista",
                titulo: "Realizamos em",
                itens: ["aulas de yoga e retiros", "celebrações e grupos terapêuticos", "empresas e encontros de desenvolvimento humano"],
            },
        ],
    },
    {
        slug: "roda-tambores",
        titulo: "Roda de Tambores",
        icone: "🥁",
        resumo: "A Roda de Tambores é uma experiência coletiva que utiliza a percussão como instrumento de integração, expressão, criatividade e desenvolvimento.",
        blocos: [
            {
                tipo: "paragrafo",
                texto: "Meu Trabalho de Conclusão de Curso em Musicoterapia teve como tema a utilização da Roda de Tambores como setting musicoterapêutico, investigando seu potencial para favorecer processos de comunicação, vínculo, escuta, cooperação e bem-estar em diferentes contextos.",
            }
        ],
    },
];
