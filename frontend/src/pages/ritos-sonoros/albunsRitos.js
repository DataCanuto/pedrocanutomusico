import yogaSonora1 from '../../assets/web/galeria-ritos-sonoros/yoga-sonora-1.webp'
import yogaSonora2 from '../../assets/web/galeria-ritos-sonoros/yoga-sonora-2.webp'
import yogaSonora3 from '../../assets/web/galeria-ritos-sonoros/yoga-sonora-3.webp'

// Cada álbum é uma moldura; a primeira foto é a capa. Álbuns sem fotos aparecem como "Fotos em breve".
export const ALBUNS_RITOS = [
    {
        tag: 'Yoga sonora',
        etiquetaAmarela: true,
        legenda: 'Prática de yoga sonora introspectiva no SESC Piatã, Salvador BA',
        fotos: [
            { src: yogaSonora1, alt: 'Turma da prática de yoga sonora reunida com Pedro, todos sorrindo na postura da árvore' },
            { src: yogaSonora2, alt: 'Pedro sentado no tapete com as mãos unidas, ao lado do tambor, da tigela tibetana e do violão' },
            { src: yogaSonora3, alt: 'Pedro sentado de pernas cruzadas diante dos instrumentos: flautas, tambor, tigela e handpan' },
        ],
    },
    { tag: 'Em breve', fotos: [] },
    { tag: 'Em breve', fotos: [] },
    { tag: 'Em breve', fotos: [] },
]
