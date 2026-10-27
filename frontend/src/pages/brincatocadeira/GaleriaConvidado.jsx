import { useState } from 'react'
import CarrosselModal from '../../components/ui/CarrosselModal'
import { GradeMolduras, Moldura } from '../../components/ui/Moldura'
import { ALBUNS_CONVIDADO } from './albunsConvidado'

function GaleriaConvidado() {
    const [aberto, setAberto] = useState(null)

    return (
        <>
            <GradeMolduras>
                {ALBUNS_CONVIDADO.map((album, i) => (
                    <Moldura
                        key={i}
                        tag={album.tag}
                        capa={album.fotos[0]?.src}
                        quantidade={album.fotos.length}
                        etiquetaAmarela={album.etiquetaAmarela}
                        legenda={album.legenda}
                        onClick={() => setAberto(i)}
                        rotuloAcao={`Ver as fotos de ${album.tag}`}
                        indice={i} total={ALBUNS_CONVIDADO.length}
                    />
                ))}
            </GradeMolduras>

            {aberto !== null && (
                <CarrosselModal
                    titulo={ALBUNS_CONVIDADO[aberto].tag}
                    fotos={ALBUNS_CONVIDADO[aberto].fotos}
                    legenda={ALBUNS_CONVIDADO[aberto].legenda}
                    onFechar={() => setAberto(null)}
                />
            )}
        </>
    )
}

export default GaleriaConvidado
