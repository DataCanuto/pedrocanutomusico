import { Link } from 'react-router-dom'
import { whatsappComMensagem } from '../../data/servicos.js'

/** Abertura das páginas de serviço: título, chamada, ilustração e os dois botões de contato. */
function HeroPagina({ rotulo, titulo, descricao, imagem, imagemAlt, agendar, textoAgendar = 'Agendar', mensagemWhatsapp }) {
    return (
        <section className="relative overflow-hidden bg-linear-to-br from-areia via-creme to-creme">
            <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-girassol/20 blur-3xl" aria-hidden="true"></div>
            <div className="container-site relative grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
                <div>
                    <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-tinta-suave hover:text-marca">
                        <i className="bi bi-arrow-left" aria-hidden="true"></i> Início
                    </Link>
                    <p className="rotulo">{rotulo}</p>
                    <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl">{titulo}</h1>
                    <p className="mt-5 max-w-xl text-lg text-tinta-suave">{descricao}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to={agendar} className="btn-primario">{textoAgendar}</Link>
                        <a href={whatsappComMensagem(mensagemWhatsapp)} className="btn-secundario" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-whatsapp text-[#25d366]" aria-hidden="true"></i> Tirar dúvidas
                        </a>
                    </div>
                </div>
                <img src={imagem} alt={imagemAlt} className="mx-auto w-full max-w-md drop-shadow-xl" fetchPriority="high" />
            </div>
        </section>
    )
}

export default HeroPagina
