function CabecalhoSecao({ rotulo, titulo, descricao, centralizado = false }) {
    return (
        <div className={`max-w-2xl ${centralizado ? 'mx-auto text-center' : ''}`}>
            {rotulo && <p className="rotulo">{rotulo}</p>}
            <h2 className="titulo-secao">{titulo}</h2>
            {descricao && <p className="mt-4 text-lg text-tinta-suave">{descricao}</p>}
        </div>
    )
}

export default CabecalhoSecao
