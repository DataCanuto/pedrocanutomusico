import { useRef, useState } from 'react'
import card1 from '../../assets/web/carrossel-brincatocadeira/card-1-roda.webp'
import card2 from '../../assets/web/carrossel-brincatocadeira/card-2-tapete.webp'
import card3 from '../../assets/web/carrossel-brincatocadeira/card-3-show-ao-vivo.webp'

// Cards de feed da turminha (15/10/2026), redesenhados com a paleta atual dos avatares.
const CARDS = [
    { src: card1, alt: 'Card "Aqui ninguém só assiste!": a turminha de instrumentos tocando em roda em volta da zabumba' },
    { src: card2, alt: 'Card "O tapete tá pronto. Só falta a criançada!": a turminha no tapete com pandeiro e baquetas ao alcance das crianças' },
    { src: card3, alt: 'Card "A festa vira show ao vivo!": a turminha no palco com bandeirinhas e caixas de som, para Roda de Música, Brincatocadeira e Monte Seu Show' },
]

/** Carrossel dos cards: desliza com o dedo (scroll-snap), pelas setas ou pelos pontinhos. */
function CarrosselCards() {
    const trilho = useRef(null)
    const [atual, setAtual] = useState(0)
    const total = CARDS.length

    function irPara(i) {
        const el = trilho.current
        const n = (i + total) % total
        el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
    }

    function aoRolar() {
        const el = trilho.current
        setAtual(Math.round(el.scrollLeft / el.clientWidth))
    }

    return (
        <div className="mx-auto w-full max-w-sm" role="region" aria-roledescription="carrossel" aria-label="Cards do Brincatocadeira">
            <div className="relative">
                <div
                    ref={trilho}
                    onScroll={aoRolar}
                    className="flex snap-x snap-mandatory overflow-x-auto rounded-[2rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {CARDS.map((card, i) => (
                        <img
                            key={card.src}
                            src={card.src}
                            alt={card.alt}
                            loading="lazy"
                            aria-hidden={i !== atual}
                            className="w-full shrink-0 snap-center"
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => irPara(atual - 1)}
                    className="absolute top-1/2 left-0 inline-flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-tinta shadow-lg hover:bg-girassol max-sm:translate-x-1"
                    aria-label="Card anterior"
                >
                    <i className="bi bi-chevron-left" aria-hidden="true"></i>
                </button>
                <button
                    type="button"
                    onClick={() => irPara(atual + 1)}
                    className="absolute top-1/2 right-0 inline-flex size-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-tinta shadow-lg hover:bg-girassol max-sm:-translate-x-1"
                    aria-label="Próximo card"
                >
                    <i className="bi bi-chevron-right" aria-hidden="true"></i>
                </button>
            </div>
            <div className="mt-4 flex justify-center gap-2">
                {CARDS.map((card, i) => (
                    <button
                        key={card.src}
                        type="button"
                        onClick={() => irPara(i)}
                        className={`size-3 rounded-full transition ${i === atual ? 'bg-marca' : 'bg-tinta/20 hover:bg-tinta/40'}`}
                        aria-label={`Ver card ${i + 1} de ${total}`}
                        aria-current={i === atual}
                    ></button>
                ))}
            </div>
        </div>
    )
}

export default CarrosselCards
