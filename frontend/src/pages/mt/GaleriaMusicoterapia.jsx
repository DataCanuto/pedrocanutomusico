import { useState } from 'react'
import CarrosselModal from '../../components/ui/CarrosselModal'
import { GradeMolduras, Moldura } from '../../components/ui/Moldura'
import { ALBUNS_MUSICOTERAPIA } from './albunsMusicoterapia'

function GaleriaMusicoterapia() {
    const [aberto, setAberto] = useState(null)

    return (
        <>
            <GradeMolduras>
                {ALBUNS_MUSICOTERAPIA.map((album, i) => (
                    <Moldura
                        key={i}
                        tag={album.tag}
                        capa={album.fotos[0]?.src}
                        quantidade={album.fotos.length}
                        etiquetaAmarela={album.etiquetaAmarela}
                        legenda={album.legenda}
                        onClick={() => setAberto(i)}
                        rotuloAcao={`Ver as fotos de ${album.tag}`}
                        indice={i} total={ALBUNS_MUSICOTERAPIA.length}
                    />
                ))}
            </GradeMolduras>

            {aberto !== null && (
                <CarrosselModal
                    titulo={ALBUNS_MUSICOTERAPIA[aberto].tag}
                    fotos={ALBUNS_MUSICOTERAPIA[aberto].fotos}
                    legenda={ALBUNS_MUSICOTERAPIA[aberto].legenda}
                    onFechar={() => setAberto(null)}
                />
            )}
        </>
    )
}

export default GaleriaMusicoterapia
