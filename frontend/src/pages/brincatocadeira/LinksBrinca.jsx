import { Link } from 'react-router-dom'
import { LANCAMENTO, LINKS_BRINCA } from '../../data/links.js'
import capa from '../../assets/web/links/capa-brincatocadeira.webp'
import baterinha from '../../assets/web/links/baterinha.webp'

/** Um botão da lista: link externo abre em nova aba; caminho do site usa o roteador. */
function ItemLink({ item }) {
    const conteudo = (
        <>
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl text-white ${item.cor}`} aria-hidden="true">
                <i className={`bi ${item.icone}`}></i>
            </span>
            <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-tight font-bold">{item.titulo}</span>
                <span className="block text-sm text-creme/70">{item.detalhe}</span>
            </span>
            <i className="bi bi-arrow-up-right text-lg text-creme/50 transition group-hover:text-girassol" aria-hidden="true"></i>
        </>
    )
    const classe =
        'group flex items-center gap-4 rounded-3xl bg-white/[.06] p-3 pr-5 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[.1] hover:ring-girassol/40'
    return item.externo ? (
        <a href={item.href} className={classe} target="_blank" rel="noopener noreferrer">{conteudo}</a>
    ) : (
        <Link to={item.href} className={classe}>{conteudo}</Link>
    )
}

/** Seção #links: o "link na bio" do Instagram do Brincatocadeira, com o lançamento em destaque. */
function LinksBrinca() {
    const links = LINKS_BRINCA.filter((l) => l.href)
    return (
        <section id="links" className="relative overflow-hidden bg-tinta py-14 text-creme sm:py-20">
            <div className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-marca/25 blur-3xl" aria-hidden="true"></div>
            <div className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-girassol/15 blur-3xl" aria-hidden="true"></div>

            <div className="relative mx-auto w-full max-w-md px-4">
                <div className="flex flex-col items-center text-center">
                    <img src={baterinha} alt="Baterinha, o tambor da turminha do Brincatocadeira" className="size-24 rounded-full ring-4 ring-girassol/70" loading="lazy" />
                    <p className="rotulo mt-4 text-girassol">Links</p>
                    <h2 className="mt-1 text-3xl text-creme sm:text-4xl">Ouça, assista e dance com a turminha</h2>
                    <p className="mt-2 text-creme/70">Música autoral para a infância, feita em Salvador.</p>
                </div>

                <a
                    href={LANCAMENTO.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-8 flex items-center gap-4 rounded-3xl bg-creme p-3 text-tinta shadow-2xl shadow-black/30 transition hover:-translate-y-0.5"
                >
                    <img src={capa} alt={`Capa do single ${LANCAMENTO.titulo}`} className="size-24 shrink-0 rounded-2xl sm:size-28" loading="lazy" />
                    <span className="min-w-0 flex-1">
                        <span className="inline-block rounded-full bg-marca px-2.5 py-0.5 text-xs font-bold tracking-wider text-white uppercase">{LANCAMENTO.selo}</span>
                        <span className="mt-1 block font-display text-2xl leading-tight font-bold">{LANCAMENTO.titulo}</span>
                        <span className="block text-sm text-tinta-suave">{LANCAMENTO.descricao}</span>
                        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#169c46]">
                            <i className="bi bi-play-circle-fill text-base" aria-hidden="true"></i> {LANCAMENTO.acao}
                        </span>
                    </span>
                </a>

                <nav aria-label="Links do Brincatocadeira" className="mt-4 grid gap-3">
                    {links.map((item) => <ItemLink key={item.id} item={item} />)}
                </nav>
            </div>
        </section>
    )
}

export default LinksBrinca
