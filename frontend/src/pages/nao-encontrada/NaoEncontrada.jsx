import { Link } from 'react-router-dom'

function NaoEncontrada() {
    return (
        <section className="container-site secao text-center">
            <p className="rotulo">Erro 404</p>
            <h1 className="mt-2 text-4xl">Essa página saiu do compasso.</h1>
            <p className="mt-4 text-lg text-tinta-suave">O endereço não existe ou mudou de lugar.</p>
            <Link to="/" className="btn-primario mt-8">Voltar ao início</Link>
        </section>
    )
}

export default NaoEncontrada
