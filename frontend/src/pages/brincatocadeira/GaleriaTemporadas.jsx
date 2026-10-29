import { useState } from 'react'
import CarrosselModal from '../../components/ui/CarrosselModal'
import { GradeMolduras, Moldura } from '../../components/ui/Moldura'
import natal1 from '../../assets/web/galeria-brincatocadeira/natal-1.webp'
import natal2 from '../../assets/web/galeria-brincatocadeira/natal-2.webp'
import natal3 from '../../assets/web/galeria-brincatocadeira/natal-3.webp'
import carnaval1 from '../../assets/web/galeria-brincatocadeira/carnaval-1.webp'
import carnaval2 from '../../assets/web/galeria-brincatocadeira/carnaval-2.webp'
import carnaval3 from '../../assets/web/galeria-brincatocadeira/carnaval-3.webp'
import aniversarios1 from '../../assets/web/galeria-brincatocadeira/aniversarios-1.webp'
import aniversarios2 from '../../assets/web/galeria-brincatocadeira/aniversarios-2.webp'
import aniversarios3 from '../../assets/web/galeria-brincatocadeira/aniversarios-3.webp'
import aniversarios4 from '../../assets/web/galeria-brincatocadeira/aniversarios-4.webp'
import aniversarios5 from '../../assets/web/galeria-brincatocadeira/aniversarios-5.webp'
import aniversarios6 from '../../assets/web/galeria-brincatocadeira/aniversarios-6.webp'
import aniversarioInfantil1 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-1.webp'
import aniversarioInfantil2 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-2.webp'
import aniversarioInfantil3 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-3.webp'
import aniversarioInfantil4 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-4.webp'
import aniversarioInfantil5 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-5.webp'
import aniversarioInfantil6 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-6.webp'
import aniversarioInfantil7 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-7.webp'
import aniversarioInfantil8 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-8.webp'
import aniversarioInfantil9 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-9.webp'
import aniversarioInfantil10 from '../../assets/web/galeria-aniversario-infantil/aniversario-infantil-10.webp'
import saoJoao1 from '../../assets/web/galeria-brincatocadeira/sao-joao-1.webp'
import saoJoao2 from '../../assets/web/galeria-brincatocadeira/sao-joao-2.webp'
import saoJoao3 from '../../assets/web/galeria-brincatocadeira/sao-joao-3.webp'
import ferias1 from '../../assets/web/galeria-brincatocadeira/ferias-1.webp'
import ferias2 from '../../assets/web/galeria-brincatocadeira/ferias-2.webp'
import ferias3 from '../../assets/web/galeria-brincatocadeira/ferias-3.webp'

// Fotos reais dos shows e rodas, agrupadas pela época do ano (mesmas tags do card 3/4 da prospecção).
// Regra do projeto: nenhum rosto de criança em primeiro plano; plateia de longe pode aparecer.
const TEMPORADAS = [
    {
        tag: 'Natal',
        etiquetaAmarela: true,
        fotos: [
            { src: natal1, alt: 'Pedro de braços para cima regendo a plateia no show de Natal do shopping' },
            { src: natal2, alt: 'Banda no palco de Natal, com a árvore iluminada ao fundo e o público em volta' },
            { src: natal3, alt: 'Pedro, o duende e o guitarrista tocando em frente à árvore de Natal' },
        ],
    },
    {
        tag: 'Carnaval',
        fotos: [
            { src: carnaval1, alt: 'Pedro cantando no palco do Terraço do Barra com o guitarrista' },
            { src: carnaval2, alt: 'Pedro de óculos escuros e maquiagem de Carnaval no Terraço do Barra' },
            { src: carnaval3, alt: 'Pedro sorrindo com colar de flores e maquiagem de Carnaval' },
        ],
    },
    {
        tag: 'Aniversários',
        fotos: [
            { src: aniversarios4, alt: 'Pedro com o fantoche de macaco contando história para as crianças na roda de música' },
            { src: aniversarios1, alt: 'Pedro cantando no jardim de uma festa de aniversário' },
            { src: aniversarios2, alt: 'Pedro tocando um instrumento de sopro com o microfone, no quintal da festa' },
            { src: aniversarios3, alt: 'Instrumentos espalhados no tapete da roda de música' },
            { src: aniversarios5, alt: 'Pedro mostrando um ovinho de percussão para um menino na roda de música' },
            { src: aniversarios6, alt: 'Crianças em volta dos instrumentos de sucata, vistas de cima, tocando juntas' },
        ],
    },
    {
        // Capa autorizada pela família (sem desfoque); nas demais, rostos de criança desfocados.
        tag: 'Aniversário infantil',
        etiquetaAmarela: true,
        fotos: [
            { src: aniversarioInfantil1, alt: 'Pedro com a sanfoninha ao lado da família da aniversariante, atrás do bolo de 1 ano' },
            { src: aniversarioInfantil2, alt: 'Crianças sentadas no tapete explorando os instrumentos da roda de música, com os convidados filmando ao fundo' },
            { src: aniversarioInfantil3, alt: 'Pedro mostra um tamborzinho para a aniversariante e um menino, sentados no tapete' },
            { src: aniversarioInfantil4, alt: 'Um menino toca ukulele de frente para Pedro, que acompanha na sanfoninha' },
            { src: aniversarioInfantil5, alt: 'Pedro sentado no chão com a sanfoninha levanta um boneco enquanto duas meninas assistem de costas' },
            { src: aniversarioInfantil6, alt: 'Pedro com um boneco nas mãos canta para as crianças, que tocam baquetas e tamborzinhos no tapete' },
            { src: aniversarioInfantil7, alt: 'Pedro de microfone e camisa estampada de instrumentos, chegando para a roda' },
            { src: aniversarioInfantil8, alt: 'Vista do salão: Pedro dança na frente das crianças em volta do tapete de instrumentos, com as famílias nas mesas' },
            { src: aniversarioInfantil9, alt: 'Pedro toca ukulele para a aniversariante, que segura um ovinho de percussão' },
            { src: aniversarioInfantil10, alt: 'Pedro conduz a roda enquanto as crianças pequenas tocam sanfoninha, ovinhos e chocalhos no tapete' },
        ],
    },
    {
        tag: 'São João',
        etiquetaAmarela: true,
        fotos: [
            { src: saoJoao1, alt: 'A banda do Brincatocadeira e as crianças juntas no palco do Arraiá do Sertão, no Shopping Barra' },
            { src: saoJoao2, alt: 'A banda tocando no Arraiá do Sertão, com as crianças dançando na frente do palco' },
            { src: saoJoao3, alt: 'A banda figurinada de São João sorrindo com as crianças no fim do show' },
        ],
    },
    {
        tag: 'Férias',
        fotos: [
            { src: ferias1, alt: 'Pedro puxando a dança à noite no Terraço do Barra' },
            { src: ferias2, alt: 'Pedro dançando no meio da roda com as famílias' },
            { src: ferias3, alt: 'Plateia lotada no terraço, vista de longe' },
        ],
    },
]

function GaleriaTemporadas() {
    const [aberta, setAberta] = useState(null)

    return (
        <>
            <GradeMolduras>
                {TEMPORADAS.map((temporada, i) => (
                    <Moldura
                        key={temporada.tag}
                        tag={temporada.tag}
                        capa={temporada.fotos[0].src}
                        quantidade={temporada.fotos.length}
                        etiquetaAmarela={temporada.etiquetaAmarela}
                        onClick={() => setAberta(i)}
                        rotuloAcao={`Ver as fotos de ${temporada.tag}`}
                        indice={i} total={TEMPORADAS.length}
                    />
                ))}
            </GradeMolduras>
            <p className="mt-8 text-center text-sm text-tinta-suave">Fotos reais dos nossos shows e rodas. Toque numa época para ver mais.</p>

            {aberta !== null && (
                <CarrosselModal titulo={TEMPORADAS[aberta].tag} fotos={TEMPORADAS[aberta].fotos} onFechar={() => setAberta(null)} />
            )}
        </>
    )
}

export default GaleriaTemporadas
