import './Footer.css'

function Footer() {
    const whatsappNumero = "5571999958950"
    const whatsappMensagem = encodeURIComponent("Olá, Pedro! Vim pelo site e gostaria de saber mais sobre as aulas.")

    return (
        <footer className="footer-site" id="footer">
            <div className="container text-center">
                <h2 className="footer-title">Pedro Canuto Músico</h2>
                <p className="footer-subtitle">Aulas de música, musicalização infantil e musicoterapia em Salvador</p>

                <div className="footer-links">
                    <a
                        href={`https://wa.me/${whatsappNumero}?text=${whatsappMensagem}`}
                        className="footer-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="bi bi-whatsapp"></i> (71) 99958-8950
                    </a>
                    <a href="mailto:pedrocanuto96@gmail.com" className="footer-link">
                        <i className="bi bi-envelope"></i> pedrocanuto96@gmail.com
                    </a>
                </div>

                <p className="footer-copy">© {new Date().getFullYear()} Pedro Canuto Música. Todos os direitos reservados.</p>
            </div>
        </footer>
    )
}

export default Footer
