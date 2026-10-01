import { Link } from 'react-router-dom'
import { SERVICOS, whatsappComMensagem } from '../../data/servicos.js'

function Footer() {
    return (
        <footer id="contato" className="mt-auto bg-tinta text-white/85">
            <div className="container-site grid gap-10 py-14 md:grid-cols-3">
                <div>
                    <p className="font-display text-2xl font-extrabold text-white">Pedro Canuto <span className="text-girassol">Músico</span></p>
                    <p className="mt-2 text-white/70">Música que educa, acolhe e transforma. Aulas, musicoterapia e eventos em Salvador.</p>
                </div>
                <div>
                    <p className="font-display text-lg font-bold text-white">Serviços</p>
                    <ul className="mt-3 grid gap-1.5">
                        {SERVICOS.map((servico) => (
                            <li key={servico.caminho}>
                                <Link to={servico.caminho} className="hover:text-girassol">{servico.nome}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="font-display text-lg font-bold text-white">Contato</p>
                    <ul className="mt-3 grid gap-3">
                        <li>
                            <a
                                href={whatsappComMensagem('Olá, Pedro! Vim pelo site e gostaria de saber mais.')}
                                className="inline-flex items-center gap-2 hover:text-girassol"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="bi bi-whatsapp" aria-hidden="true"></i> (71) 99958-8950
                            </a>
                        </li>
                        <li>
                            <a href="mailto:pedrocanuto96@gmail.com" className="inline-flex items-center gap-2 hover:text-girassol">
                                <i className="bi bi-envelope" aria-hidden="true"></i> pedrocanuto96@gmail.com
                            </a>
                        </li>
                        <li className="inline-flex items-center gap-2">
                            <i className="bi bi-geo-alt" aria-hidden="true"></i> Salvador, Bahia
                        </li>
                    </ul>
                    <Link to="/agendar" className="btn-primario mt-6">Agendar agora</Link>
                </div>
            </div>
            <p className="border-t border-white/10 py-5 text-center text-sm text-white/50">
                © {new Date().getFullYear()} Pedro Canuto Música. Todos os direitos reservados.
            </p>
        </footer>
    )
}

export default Footer
