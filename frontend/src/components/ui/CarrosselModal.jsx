import { useEffect, useRef, useState } from 'react'

/** Carrossel em tela cheia (fotos e vídeos: item com `video` toca o vídeo e usa `src` como capa). Fecha com Esc (comportamento nativo do <dialog>), com o X ou clicando fora da foto. */
export default function CarrosselModal({ titulo, fotos, legenda, inicio = 0, onFechar }) {
    const dialogo = useRef(null)
    const [atual, setAtual] = useState(inicio)
    const total = fotos.length

    // Não chamar close() na limpeza: no modo de desenvolvimento (StrictMode) o efeito roda duas vezes,
    // e o evento "close" fecharia o modal logo depois de abrir. Ao desmontar, o <dialog> sai da tela sozinho.
    useEffect(() => {
        const el = dialogo.current
        if (!el.open) el.showModal()
        // Guarda o valor anterior: o carrossel pode abrir por cima de outro modal que já trava a rolagem.
        const overflowAnterior = document.documentElement.style.overflow
        document.documentElement.style.overflow = 'hidden'
        return () => {
            document.documentElement.style.overflow = overflowAnterior
        }
    }, [])

    const anterior = () => setAtual((n) => (n - 1 + total) % total)
    const proxima = () => setAtual((n) => (n + 1) % total)

    function aoTeclar(evento) {
        if (evento.key === 'ArrowLeft') anterior()
        if (evento.key === 'ArrowRight') proxima()
    }

    const foto = fotos[atual]

    return (
        <dialog
            ref={dialogo}
            onClose={(evento) => evento.target === evento.currentTarget && onFechar()}
            onKeyDown={aoTeclar}
            onClick={(evento) => evento.target === evento.currentTarget && onFechar()}
            aria-label={`Fotos de ${titulo}`}
            className="m-auto h-dvh max-h-none w-full max-w-none p-0 bg-tinta/90 backdrop:bg-black/60"
        >
            <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-4 px-4 py-6 sm:px-16">
                <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between text-white">
                    <p className="font-display text-2xl font-bold">
                        {titulo} <span className="text-base font-semibold text-white/70">{atual + 1} de {total}</span>
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
                    {foto.video ? (
                        <video
                            key={foto.video}
                            src={foto.video}
                            poster={foto.src}
                            aria-label={foto.alt}
                            controls
                            autoPlay
                            playsInline
                            className="max-h-full max-w-full rounded-xl bg-black shadow-2xl"
                        ></video>
                    ) : (
                        <img key={foto.src} src={foto.src} alt={foto.alt} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
                    )}
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

                {legenda && <p className="pointer-events-auto max-w-2xl text-center text-white/85">{legenda}</p>}

                <div className="pointer-events-auto flex gap-2">
                    {fotos.map((item, i) => (
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
