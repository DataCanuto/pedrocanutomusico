import { useEffect, useRef, useState } from 'react'
import natal1 from '../../assets/web/galeria-brincatocadeira/natal-1.webp'
import natal2 from '../../assets/web/galeria-brincatocadeira/natal-2.webp'
import natal3 from '../../assets/web/galeria-brincatocadeira/natal-3.webp'
import carnaval1 from '../../assets/web/galeria-brincatocadeira/carnaval-1.webp'
import carnaval2 from '../../assets/web/galeria-brincatocadeira/carnaval-2.webp'
import carnaval3 from '../../assets/web/galeria-brincatocadeira/carnaval-3.webp'
import aniversarios1 from '../../assets/web/galeria-brincatocadeira/aniversarios-1.webp'
import aniversarios2 from '../../assets/web/galeria-brincatocadeira/aniversarios-2.webp'
import aniversarios3 from '../../assets/web/galeria-brincatocadeira/aniversarios-3.webp'
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
            { src: aniversarios1, alt: 'Pedro cantando no jardim de uma festa de aniversário' },
            { src: aniversarios2, alt: 'Pedro tocando um instrumento de sopro com o microfone, no quintal da festa' },
            { src: aniversarios3, alt: 'Instrumentos espalhados no tapete da roda de música' },
        ],
    },
    {
        tag: 'São João',
        etiquetaAmarela: true,
        fotos: [
            { src: saoJoao1, alt: 'A banda do Brincatocadeira posando no palco, de braços abertos' },
            { src: saoJoao2, alt: 'Pedro de chapéu e colete azul tocando guitarra no palco' },
            { src: saoJoao3, alt: 'Retrato da banda do Brincatocadeira figurinada' },
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

// Posição de cada moldura na grade (2 em cima, 3 embaixo, como no card 3/4) e uma leve inclinação de papel.
const LAYOUT = [
    'sm:col-span-3 -rotate-1',
    'sm:col-span-3 rotate-1',
    'sm:col-span-2 rotate-1',
    'sm:col-span-2 -rotate-1',
    'sm:col-span-2 rotate-1',
]

function GaleriaTemporadas() {
    const [aberta, setAberta] = useState(null)

    return (
        <>
            <div className="mt-10 grid gap-8 sm:grid-cols-6 sm:gap-6">
                {TEMPORADAS.map((temporada, i) => (
                    <button
                        key={temporada.tag}
                        type="button"
                        onClick={() => setAberta(i)}
                        className={`group relative rounded-sm bg-white p-2.5 pb-8 text-left shadow-md ring-1 ring-tinta/5 transition hover:z-10 hover:rotate-0 hover:shadow-xl sm:p-3 sm:pb-10 ${LAYOUT[i]}`}
                        aria-label={`Ver as fotos de ${temporada.tag}`}
                    >
                        <span className="block aspect-[4/3] overflow-hidden bg-areia">
                            <img
                                src={temporada.fotos[0].src}
                                alt=""
                                loading="lazy"
                                className="size-full object-cover transition duration-500 group-hover:scale-105"
                            />
                        </span>
                        <span
                            className={`absolute bottom-3 left-1/2 -translate-x-1/2 -rotate-2 rounded-md px-4 py-1 font-display text-lg font-bold tracking-wide whitespace-nowrap text-tinta uppercase shadow-md sm:text-xl ${
                                temporada.etiquetaAmarela ? 'bg-girassol' : 'bg-white ring-1 ring-tinta/10'
                            }`}
                        >
                            {temporada.tag}
                        </span>
                        <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-tinta/70 px-2.5 py-1 text-xs font-bold text-white">
                            <i className="bi bi-images" aria-hidden="true"></i> {temporada.fotos.length}
                        </span>
                    </button>
                ))}
            </div>
            <p className="mt-8 text-center text-sm text-tinta-suave">Fotos reais dos nossos shows e rodas. Toque numa época para ver mais.</p>

            {aberta !== null && <CarrosselModal temporada={TEMPORADAS[aberta]} onFechar={() => setAberta(null)} />}
        </>
    )
}

/** Carrossel em tela cheia. Fecha com Esc (comportamento nativo do <dialog>), com o X ou clicando fora da foto. */
function CarrosselModal({ temporada, onFechar }) {
    const dialogo = useRef(null)
    const [atual, setAtual] = useState(0)
    const total = temporada.fotos.length

    // Não chamar close() na limpeza: no modo de desenvolvimento (StrictMode) o efeito roda duas vezes,
    // e o evento "close" fecharia o modal logo depois de abrir. Ao desmontar, o <dialog> sai da tela sozinho.
    useEffect(() => {
        const el = dialogo.current
        if (!el.open) el.showModal()
        document.documentElement.style.overflow = 'hidden'
        return () => {
            document.documentElement.style.overflow = ''
        }
    }, [])

    const anterior = () => setAtual((n) => (n - 1 + total) % total)
    const proxima = () => setAtual((n) => (n + 1) % total)

    function aoTeclar(evento) {
        if (evento.key === 'ArrowLeft') anterior()
        if (evento.key === 'ArrowRight') proxima()
    }

    const foto = temporada.fotos[atual]

    return (
        <dialog
            ref={dialogo}
            onClose={onFechar}
            onKeyDown={aoTeclar}
            onClick={(evento) => evento.target === evento.currentTarget && onFechar()}
            aria-label={`Fotos de ${temporada.tag}`}
            className="m-auto h-dvh max-h-none w-full max-w-none p-0 bg-tinta/90 backdrop:bg-black/60"
        >
            <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-4 px-4 py-6 sm:px-16">
                <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between text-white">
                    <p className="font-display text-2xl font-bold">
                        {temporada.tag} <span className="text-base font-semibold text-white/70">{atual + 1} de {total}</span>
                    </p>
                    <button
                        type="button"
                        onClick={onFechar}
                        className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl hover:bg-white/30"
                        aria-label="Fechar galeria"
                        autoFocus
                    >
                        <i className="bi bi-x-lg" aria-hidden="true"></i>
                    </button>
                </div>

                <div className="pointer-events-auto relative flex min-h-0 w-full max-w-4xl flex-1 items-center justify-center">
                    <img key={foto.src} src={foto.src} alt={foto.alt} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
                    <button
                        type="button"
                        onClick={anterior}
                        className="absolute left-0 inline-flex size-11 -translate-x-1/2 items-center justify-center rounded-full bg-white text-xl text-tinta shadow-lg hover:bg-girassol max-sm:translate-x-1"
                        aria-label="Foto anterior"
                    >
                        <i className="bi bi-chevron-left" aria-hidden="true"></i>
                    </button>
                    <button
                        type="button"
                        onClick={proxima}
                        className="absolute right-0 inline-flex size-11 translate-x-1/2 items-center justify-center rounded-full bg-white text-xl text-tinta shadow-lg hover:bg-girassol max-sm:-translate-x-1"
                        aria-label="Próxima foto"
                    >
                        <i className="bi bi-chevron-right" aria-hidden="true"></i>
                    </button>
                </div>

                <div className="pointer-events-auto flex gap-2">
                    {temporada.fotos.map((item, i) => (
                        <button
                            key={item.src}
                            type="button"
                            onClick={() => setAtual(i)}
                            className={`size-3 rounded-full transition ${i === atual ? 'bg-girassol' : 'bg-white/40 hover:bg-white/70'}`}
                            aria-label={`Ver foto ${i + 1}`}
                            aria-current={i === atual}
                        ></button>
                    ))}
                </div>
            </div>
        </dialog>
    )
}

export default GaleriaTemporadas
