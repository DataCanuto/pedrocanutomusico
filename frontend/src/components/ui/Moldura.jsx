import { Link } from 'react-router-dom'

// Posição de cada moldura na grade de 6 colunas e uma leve inclinação de papel.
// 5 molduras: 2 em cima, 3 embaixo (como no card 3/4). 4 molduras: 2 + 2.
const LAYOUT_5 = [
    'sm:col-span-3 -rotate-1',
    'sm:col-span-3 rotate-1',
    'sm:col-span-2 rotate-1',
    'sm:col-span-2 -rotate-1',
    'sm:col-span-2 rotate-1',
]
const LAYOUT_4 = ['sm:col-span-3 -rotate-1', 'sm:col-span-3 rotate-1', 'sm:col-span-3 rotate-1', 'sm:col-span-3 -rotate-1']

function layoutDaMoldura(indice, total) {
    return (total === 4 ? LAYOUT_4 : LAYOUT_5)[indice % 5]
}

/** Grade das molduras de foto (galeria do Brincatocadeira e as que seguem o mesmo layout). */
export function GradeMolduras({ children }) {
    return <div className="mt-10 grid gap-8 sm:grid-cols-6 sm:gap-6">{children}</div>
}

/**
 * Moldura de foto estilo polaroide, com etiqueta. Vira botão com `onClick`, link interno com `para`
 * ou fica parada como "em breve" quando não tem capa. `indice` e `total` definem a posição na grade.
 */
export function Moldura({ tag, capa, quantidade, etiquetaAmarela = false, legenda, video = false, onClick, para, rotuloAcao, indice, total }) {
    const classe = layoutDaMoldura(indice, total)
    const vazia = !capa
    const conteudo = (
        <>
            <span className={`block aspect-[4/3] overflow-hidden ${vazia ? 'border-2 border-dashed border-tinta/15 bg-areia/60' : 'bg-areia'}`}>
                {vazia ? (
                    <span className="flex size-full flex-col items-center justify-center gap-2 text-tinta-suave">
                        <i className="bi bi-camera text-4xl" aria-hidden="true"></i>
                        <span className="text-sm font-bold">Fotos em breve</span>
                    </span>
                ) : (
                    <img src={capa} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                )}
            </span>
            {tag && (
                <span
                    className={`absolute bottom-3 left-1/2 -translate-x-1/2 -rotate-2 rounded-md px-4 py-1 font-display text-lg font-bold tracking-wide w-max max-w-[90%] text-center text-balance text-tinta uppercase shadow-md sm:text-xl ${
                        etiquetaAmarela ? 'bg-girassol' : 'bg-white ring-1 ring-tinta/10'
                    }`}
                >
                    {tag}
                </span>
            )}
            {video && (
                <span className="absolute inset-0 flex items-center justify-center pb-6" aria-hidden="true">
                    <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/85 text-3xl text-marca shadow-lg transition group-hover:scale-110">
                        <i className="bi bi-play-fill"></i>
                    </span>
                </span>
            )}
            {quantidade > 0 && (
                <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-tinta/70 px-2.5 py-1 text-xs font-bold text-white">
                    <i className="bi bi-images" aria-hidden="true"></i> {quantidade}
                </span>
            )}
        </>
    )

    const estilo = `group relative block self-start rounded-sm bg-white p-2.5 pb-8 text-left shadow-md ring-1 ring-tinta/5 transition sm:p-3 sm:pb-10 ${
        vazia ? 'opacity-80' : 'hover:z-10 hover:rotate-0 hover:shadow-xl'
    } ${classe}`

    let moldura
    if (vazia) {
        moldura = <div className={estilo}>{conteudo}</div>
    } else if (para) {
        moldura = <Link to={para} className={estilo} aria-label={rotuloAcao}>{conteudo}</Link>
    } else {
        moldura = <button type="button" onClick={onClick} className={`w-full ${estilo}`} aria-label={rotuloAcao}>{conteudo}</button>
    }

    if (!legenda) return moldura
    return (
        <figure className={`self-start ${classe.match(/sm:col-span-\d/)?.[0] ?? ''}`}>
            {moldura}
            <figcaption className="mt-4 px-1 text-center text-tinta-suave">{legenda}</figcaption>
        </figure>
    )
}
