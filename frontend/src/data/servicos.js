// Serviços exibidos no menu, na home e nas chamadas para agendar.
// `categoria` liga o serviço ao formulário de agendamento (ver agendamento/catalogo.js).
import musicalizacaoImg from '../assets/web/musicalizacao-servicos.webp'
import brincatocadeiraImg from '../assets/web/brincatocadeira-servicos.webp'
import musicoterapiaImg from '../assets/web/mt-servicos.webp'
import ritosImg from '../assets/web/musicoterapia-card.webp'
import instrumentoImg from '../assets/web/instrumentos-service.webp'
import jornadaImg from '../assets/web/jornada-service.webp'
import eventosImg from '../assets/web/eventos-service.webp'

export const SERVICOS = [
    {
        caminho: '/musicalizacao',
        nome: 'Musicalização Infantil',
        principal: true,
        resumo: 'Vivências lúdicas com canções, brincadeiras e instrumentos, no ambiente em que a criança já se sente segura.',
        imagem: musicalizacaoImg,
        agendar: '/agendar?servico=MUSICALIZACAO_INFANTIL',
    },
    {
        caminho: '/musicoterapia',
        nome: 'Musicoterapia',
        principal: true,
        resumo: 'A música como recurso terapêutico para comunicação, expressão emocional, autorregulação e qualidade de vida.',
        imagem: musicoterapiaImg,
        agendar: '/agendar?servico=MUSICOTERAPIA',
    },
    {
        caminho: '/instrumento',
        nome: 'Aulas de Instrumento e Canto',
        principal: true,
        resumo: 'Cordas, percussão e voz em aulas personalizadas, do primeiro acorde ao repertório que você sempre quis tocar.',
        imagem: instrumentoImg,
        agendar: '/agendar?servico=AULA_INSTRUMENTO',
    },
    {
        caminho: '/eventos',
        nome: 'Eventos Musicais',
        principal: true,
        resumo: 'Música ao vivo, interação e brincadeiras para aniversários, escolas, casamentos, Carnaval e São João.',
        imagem: eventosImg,
        agendar: '/agendar?servico=EVENTO',
    },
    {
        caminho: '/brincatocadeira',
        nome: 'Brincatocadeira',
        resumo: 'O show “Que Brincadeira!” e apresentações temáticas que transformam a criança em parte do espetáculo.',
        imagem: brincatocadeiraImg,
        agendar: '/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=brincatocadeira',
    },
    {
        caminho: '/jornadapercussiva',
        nome: 'Jornada Percussiva',
        resumo: 'Imersão em ritmos, instrumentos, corpo e escuta coletiva para grupos, escolas e empresas.',
        imagem: jornadaImg,
        agendar: '/agendar?servico=EVENTO',
    },
    {
        caminho: '/ritossonoros',
        nome: 'Ritos Sonoros',
        resumo: 'Sound healing, yoga e escuta: o som como caminho para relaxamento, presença e conexão.',
        imagem: ritosImg,
        agendar: '/agendar?servico=EVENTO&tipo=MUSICOTERAPIA_EVENTO&pacote=soundhealing',
    },
]

export const WHATSAPP_LINK = 'https://wa.me/5571999958950'

export function whatsappComMensagem(mensagem) {
    return `${WHATSAPP_LINK}?text=${encodeURIComponent(mensagem)}`
}
