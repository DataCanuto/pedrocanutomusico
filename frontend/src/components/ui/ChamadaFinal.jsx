import { Link } from 'react-router-dom'
import { whatsappComMensagem } from '../../data/servicos.js'

function ChamadaFinal({ titulo = 'Vamos construir essa experiência juntos?', texto, agendar = '/agendar', textoAgendar = 'Agendar agora', mensagemWhatsapp = 'Olá, Pedro! Vim pelo site.' }) {
    return (
        <section className="secao">
            <div className="container-site">
                <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-marca to-laranja px-6 py-12 text-center text-white sm:px-12">
                    <div className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-girassol/30 blur-2xl" aria-hidden="true"></div>
                    <h2 className="relative text-3xl text-white sm:text-4xl">{titulo}</h2>
                    {texto && <p className="relative mx-auto mt-4 max-w-2xl text-lg text-white/90">{texto}</p>}
                    <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                        <Link to={agendar} className="btn bg-white text-marca hover:bg-creme">{textoAgendar}</Link>
                        <a href={whatsappComMensagem(mensagemWhatsapp)} className="btn border-2 border-white/60 text-white hover:bg-white/10" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-whatsapp" aria-hidden="true"></i> Falar no WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ChamadaFinal
