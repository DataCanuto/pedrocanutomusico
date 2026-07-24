import { Link } from "react-router-dom";

export function NavBar() {
    return (
        <nav className="navbar">
            <Link to="/" className="marca">
                Pedro Canuto
            </Link>
            <div className="links">
                <Link to="/agendar">Agendar</Link>
                <Link to="/#sobre">Sobre</Link>
                <Link to="/#servicos">Serviços</Link>
                <Link to="/admin">Área do professor</Link>
            </div>
        </nav>
    );
}
