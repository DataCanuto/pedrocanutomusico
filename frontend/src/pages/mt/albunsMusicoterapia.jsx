import onda2 from '../../assets/web/galeria-musicoterapia/onda-de-afeto-2.webp'
import onda3 from '../../assets/web/galeria-musicoterapia/onda-de-afeto-3.webp'
import domicilio1 from '../../assets/web/galeria-musicoterapia/domicilio-1.webp'

// Cada álbum é uma moldura; o primeiro item é a capa.
export const ALBUNS_MUSICOTERAPIA = [
    {
        tag: 'Onda de Afeto',
        etiquetaAmarela: true,
        legenda: (
            <>
                Ação voluntária com o grupo Onda de Afeto no Lar Santo Expedito, Salvador BA.{' '}
                <a href="https://www.instagram.com/ondadeafeto/" target="_blank" rel="noreferrer" className="font-bold text-marca hover:underline">
                    @ondadeafeto
                </a>
            </>
        ),
        fotos: [
            { src: onda2, alt: 'Pedro toca sanfona enquanto uma moradora do lar, enrolada numa manta de crochê, se aproxima e toca o instrumento' },
            { src: onda3, alt: 'Pedro de óculos e microfone de cabeça tocando uma sanfona vermelha' },
        ],
    },
    {
        tag: 'Em domicílio',
        legenda: 'Musicoterapia em domicílio com paciente idosa: sorrisos e suspiros mostram a resposta à música.',
        fotos: [{ src: domicilio1, alt: 'Pedro sentado no sofá toca um instrumento de sopro para a paciente, sentada de costas para a câmera' }],
    },
]
