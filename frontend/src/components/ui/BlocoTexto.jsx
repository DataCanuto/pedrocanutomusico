/** Seção de texto com ilustração ao lado, alternando o lado em telas largas. */
function BlocoTexto({ rotulo, titulo, imagem, imagemAlt, invertido = false, imagemLarga = false, children }) {
    return (
        <div className="grid items-center gap-10 md:grid-cols-2">
            {imagem && (
                <img
                    src={imagem}
                    alt={imagemAlt}
                    loading="lazy"
                    className={`mx-auto w-full rounded-[2rem] ${imagemLarga ? 'max-w-xl' : 'max-w-sm'} ${invertido ? 'md:order-2' : ''}`}
                />
            )}
            <div className={imagem ? '' : 'md:col-span-2'}>
                {rotulo && <p className="rotulo">{rotulo}</p>}
                <h2 className="titulo-secao">{titulo}</h2>
                <div className="mt-4 space-y-4 text-lg text-tinta-suave">{children}</div>
            </div>
        </div>
    )
}

export default BlocoTexto
