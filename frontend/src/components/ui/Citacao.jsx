function Citacao({ texto, autor }) {
    return (
        <figure className="mx-auto max-w-3xl text-center">
            <i className="bi bi-quote text-5xl text-laranja" aria-hidden="true"></i>
            <blockquote className="font-display text-2xl leading-snug font-semibold sm:text-3xl">{texto}</blockquote>
            <figcaption className="mt-3 text-tinta-suave">{autor}</figcaption>
        </figure>
    )
}

export default Citacao
