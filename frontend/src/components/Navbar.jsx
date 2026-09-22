import { Link } from 'react-router-dom'
import favicon from '../assets/favicon/favicon-32x32.png'

function Navbar() {
    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        <img src={favicon} alt="Pedro Canuto Música" width="32" height="32" />
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Serviços
                                </a>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to="/musicalizacao">Musicalização Infantil</Link></li>
                                    <li><Link className="dropdown-item" to="/instrumento">Aulas de Instrumento</Link></li>
                                    <li><Link className="dropdown-item" to="/musicoterapia">Musicoterapia</Link></li>
                                    <li><Link className="dropdown-item" to="/eventos">Eventos</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Sobre</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#footer">Contato</a>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar;