/** Lista em pílulas com ícone, usada para benefícios, públicos e instrumentos. */
function ListaMarcada({ itens, icone = 'bi-music-note-beamed', colunas = 'sm:grid-cols-2' }) {
    return (
        <ul className={`grid gap-3 ${colunas}`}>
            {itens.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-tinta/5">
                    <i className={`bi ${icone} mt-0.5 text-marca`} aria-hidden="true"></i>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    )
}

export default ListaMarcada
