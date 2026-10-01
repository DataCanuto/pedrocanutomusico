import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../../assets/favicon/favicon-32x32.png'
import { SERVICOS } from '../../data/servicos.js'

function Navbar() {
    const [menuAberto, setMenuAberto] = useState(false)
    const [servicosAbertos, setServicosAbertos] = useState(false)
    const local = useLocation()
    const dropdown = useRef(null)

    useEffect(() => {
        function fecharAoClicarFora(evento) {
            if (dropdown.current && !dropdown.current.contains(evento.target)) setServicosAbertos(false)
        }
        document.addEventListener('click', fecharAoClicarFora)
        return () => document.removeEventListener('click', fecharAoClicarFora)
    }, [])

    // Fecha os menus a cada navegação.
    const [ultimoCaminho, setUltimoCaminho] = useState(local.key)
    if (ultimoCaminho !== local.key) {
        setUltimoCaminho(local.key)
        setMenuAberto(false)
        setServicosAbertos(false)
    }

    const linkClasse = 'rounded-full px-3 py-2 font-semibold text-tinta/80 transition hover:bg-areia hover:text-tinta'

    return (
        <header className="sticky top-0 z-40 border-b border-tinta/5 bg-creme/90 backdrop-blur">
            <nav className="container-site flex h-16 items-center justify-between gap-4" aria-label="Principal">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="" width="32" height="32" className="size-8" />
                    <span className="font-display text-xl font-extrabold">
                        Pedro Canuto <span className="text-marca">Músico</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-1 lg:flex">
                    <div className="relative" ref={dropdown}>
                        <button
                            type="button"
                            className={`${linkClasse} inline-flex items-center gap-1`}
                            aria-expanded={servicosAbertos}
                            aria-haspopup="true"
                            onClick={() => setServicosAbertos((aberto) => !aberto)}
                        >
                            Serviços <i className={`bi bi-chevron-down text-xs transition ${servicosAbertos ? 'rotate-180' : ''}`} aria-hidden="true"></i>
                        </button>
                        {servicosAbertos && (
                            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-tinta/5">
                                {SERVICOS.map((servico) => (
                                    <NavLink key={servico.caminho} to={servico.caminho} className="flex items-center gap-3 rounded-xl p-2 hover:bg-areia">
                                        <img src={servico.imagem} alt="" className="size-10 rounded-lg object-cover" loading="lazy" />
                                        <span className="font-semibold">{servico.nome}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                    <Link to="/#sobre" className={linkClasse}>Sobre</Link>
                    <a href="#contato" className={linkClasse}>Contato</a>
                    <Link to="/agendar" className="btn-primario ml-2 px-5 py-2 text-base">Agendar</Link>
                </div>

                <button
                    type="button"
                    className="inline-flex size-11 items-center justify-center rounded-full text-2xl hover:bg-areia lg:hidden"
                    aria-expanded={menuAberto}
                    aria-controls="menu-celular"
                    aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                    onClick={() => setMenuAberto((aberto) => !aberto)}
                >
                    <i className={`bi ${menuAberto ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true"></i>
                </button>
            </nav>

            {menuAberto && (
                <div id="menu-celular" className="border-t border-tinta/5 bg-creme lg:hidden">
                    <div className="container-site flex flex-col gap-1 py-4">
                        <p className="rotulo px-3 pt-1">Serviços</p>
                        {SERVICOS.map((servico) => (
                            <NavLink key={servico.caminho} to={servico.caminho} className={linkClasse}>{servico.nome}</NavLink>
                        ))}
                        <hr className="my-2 border-tinta/10" />
                        <Link to="/#sobre" className={linkClasse}>Sobre</Link>
                        <a href="#contato" className={linkClasse} onClick={() => setMenuAberto(false)}>Contato</a>
                        <Link to="/agendar" className="btn-primario mt-2">Agendar</Link>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
