import { Link, useLocation } from "react-router-dom";

/** Só faz sentido na navegação da home (âncoras Sobre/Serviços) - fora dela ela some. */
export function NavBar() {
    const { pathname } = useLocation();
    if (pathname !== "/") return null;

    return (
        <nav className="navbar navbar-fixa">
            <Link to="/" className="marca">
                Pedro Canuto
            </Link>
            <div className="links">
                <Link to="/agendar">Agendar</Link>
                <Link to="/#sobre">Sobre</Link>
                <Link to="/#servicos">Serviços</Link>
            </div>
        </nav>
    );
}
