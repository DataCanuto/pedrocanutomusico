import { useState } from 'react'
import CarrosselModal from '../../components/ui/CarrosselModal'
import { GradeMolduras, Moldura } from '../../components/ui/Moldura'
import foto1 from '../../assets/web/galeria-musicalizacao/musicalizacao-1.webp'
import foto2 from '../../assets/web/galeria-musicalizacao/musicalizacao-2.webp'
import foto3 from '../../assets/web/galeria-musicalizacao/musicalizacao-3.webp'
import capaVideo1 from '../../assets/web/galeria-musicalizacao/musicalizacao-video-1-capa.webp'
import video1 from '../../assets/web/galeria-musicalizacao/musicalizacao-video-1.mp4'
import capaVideo2 from '../../assets/web/galeria-musicalizacao/musicalizacao-video-2-capa.webp'
import video2 from '../../assets/web/galeria-musicalizacao/musicalizacao-video-2.mp4'

// Feed: cada moldura é uma foto ou um vídeo, sem álbuns. Ao tocar, o carrossel abre nesse item
// e segue pelo feed inteiro. Regra do projeto: rosto de criança sempre desfocado ou fora do quadro.
const FEED = [
    { src: foto1, alt: 'Duas crianças sentadas na grama descobrindo um violão' },
    { src: capaVideo1, video: video1, alt: 'Vídeo: criança tocando a escaleta durante a aula' },
    { src: foto2, alt: 'Criança sentada no tapete tocando um ukulele' },
    { src: capaVideo2, video: video2, alt: 'Vídeo: mãos de uma criança tocando o teclado' },
    { src: foto3, alt: 'Criança mexendo num balde de arroz e milho, numa atividade sensorial' },
]

function GaleriaMusicalizacao() {
    const [atual, setAtual] = useState(null)

    return (
        <>
            <GradeMolduras>
                {FEED.map((item, i) => (
                    <Moldura
                        key={item.src}
                        capa={item.src}
                        video={Boolean(item.video)}
                        onClick={() => setAtual(i)}
                        rotuloAcao={item.alt}
                        indice={i}
                        total={FEED.length}
                    />
                ))}
            </GradeMolduras>
            <p className="mt-8 text-center text-sm text-tinta-suave">Momentos reais das aulas. Toque numa foto ou vídeo para ver maior.</p>

            {atual !== null && <CarrosselModal titulo="Musicalização infantil" fotos={FEED} inicio={atual} onFechar={() => setAtual(null)} />}
        </>
    )
}

export default GaleriaMusicalizacao
