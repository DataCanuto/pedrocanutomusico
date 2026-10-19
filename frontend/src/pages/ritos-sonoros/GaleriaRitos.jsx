import { useState } from 'react'
import CarrosselModal from '../../components/ui/CarrosselModal'
import { GradeMolduras, Moldura } from '../../components/ui/Moldura'
import { ALBUNS_RITOS } from './albunsRitos'

function GaleriaRitos() {
    const [aberto, setAberto] = useState(null)

    return (
        <>
            <GradeMolduras>
                {ALBUNS_RITOS.map((album, i) => (
                    <Moldura
                        key={i}
                        tag={album.tag}
                        capa={album.fotos[0]?.src}
                        quantidade={album.fotos.length}
                        etiquetaAmarela={album.etiquetaAmarela}
                        legenda={album.legenda}
                        onClick={() => setAberto(i)}
                        rotuloAcao={`Ver as fotos de ${album.tag}`}
                        indice={i} total={ALBUNS_RITOS.length}
                    />
                ))}
            </GradeMolduras>

            {aberto !== null && (
                <CarrosselModal
                    titulo={ALBUNS_RITOS[aberto].tag}
                    fotos={ALBUNS_RITOS[aberto].fotos}
                    legenda={ALBUNS_RITOS[aberto].legenda}
                    onFechar={() => setAberto(null)}
                />
            )}
        </>
    )
}

export default GaleriaRitos
