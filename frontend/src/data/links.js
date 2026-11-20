import { whatsappComMensagem } from './servicos.js'

/**
 * Links do Brincatocadeira (página /brincatocadeira#links, usada como "link na bio" do Instagram).
 * Para trocar ou acrescentar um link, edite só esta lista. Itens com `href` vazio não aparecem.
 */
export const SPOTIFY_BRINCATOCADEIRA = 'https://open.spotify.com/artist/4JgXIYOuyDR6qSVBaHq9r5'

// Canal do YouTube do Brincatocadeira.
export const YOUTUBE_BRINCATOCADEIRA = 'https://www.youtube.com/@brincatocadeira'

export const LANCAMENTO = {
    titulo: 'Brincatocadeira',
    selo: 'Single novo',
    descricao: 'A música que dá nome à turminha. Aperte o play e dance junto!',
    botoes: [
        { id: 'spotify', texto: 'Ouvir no Spotify', icone: 'bi-spotify', cor: 'bg-[#1db954]', href: SPOTIFY_BRINCATOCADEIRA },
        { id: 'youtube', texto: 'Ver no YouTube', icone: 'bi-youtube', cor: 'bg-[#ff0033]', href: YOUTUBE_BRINCATOCADEIRA },
    ],
}

export const LINKS_BRINCA = [
    {
        id: 'spotify',
        titulo: 'Ouça no Spotify',
        detalhe: 'Todas as músicas da turminha',
        icone: 'bi-spotify',
        cor: 'bg-[#1db954]',
        href: SPOTIFY_BRINCATOCADEIRA,
        externo: true,
    },
    {
        id: 'youtube',
        titulo: 'Veja os clipes no YouTube',
        detalhe: 'Desenhos animados com a turminha',
        icone: 'bi-youtube',
        cor: 'bg-[#ff0033]',
        href: YOUTUBE_BRINCATOCADEIRA,
        externo: true,
    },
    {
        id: 'festa',
        titulo: 'Brincatocadeira na sua festa',
        detalhe: 'Peça um orçamento pelo WhatsApp',
        icone: 'bi-whatsapp',
        cor: 'bg-[#25d366]',
        href: whatsappComMensagem('Olá, Pedro! Vim pelo Instagram do Brincatocadeira e quero a turminha na minha festa.'),
        externo: true,
    },
    {
        id: 'agendar',
        titulo: 'Reservar uma data',
        detalhe: 'Aniversários, Carnaval e São João',
        icone: 'bi-calendar-heart',
        cor: 'bg-marca',
        href: '/agendar?servico=EVENTO&tipo=ANIVERSARIO&pacote=brincatocadeira&publico=INFANTIL',
    },
    {
        id: 'pedro',
        titulo: 'Conheça o Pedro Canuto',
        detalhe: '@pedrocanutomusico no Instagram',
        icone: 'bi-instagram',
        cor: 'bg-linear-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]',
        href: 'https://www.instagram.com/pedrocanutomusico/',
        externo: true,
    },
]
