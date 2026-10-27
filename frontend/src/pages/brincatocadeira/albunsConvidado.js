import cantarolou1 from '../../assets/web/galeria-cantarolou/cantarolou-1.webp'
import cantarolou2 from '../../assets/web/galeria-cantarolou/cantarolou-2.webp'
import cantarolou3 from '../../assets/web/galeria-cantarolou/cantarolou-3.webp'
import cantarolou4 from '../../assets/web/galeria-cantarolou/cantarolou-4.webp'

// Projetos de outros grupos em que Pedro tocou como músico convidado. A primeira foto é a capa;
// álbuns sem fotos aparecem como "Fotos em breve" até a próxima parceria ser publicada.
export const ALBUNS_CONVIDADO = [
    {
        tag: 'Cantarolou',
        etiquetaAmarela: true,
        legenda: 'Pedro como músico convidado do Cantarolou, na percussão e no violão',
        fotos: [
            { src: cantarolou1, alt: 'Pedro de casaco vinho e as duas artistas do Cantarolou, figurinadas, sorrindo juntos com a guitarra' },
            { src: cantarolou2, alt: 'Pedro no cajón e a cantora do Cantarolou no violão, tocando no gramado da festa' },
            { src: cantarolou3, alt: 'Pedro de óculos escuros tocando caxixi sentado no cajón' },
            { src: cantarolou4, alt: 'Pedro tocando cajón e caxixi ao lado do microfone' },
        ],
    },
    { tag: 'Em breve', fotos: [] },
]
