import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GradeMolduras, Moldura } from '../../components/ui/Moldura'
import GaleriaTemporadas from '../brincatocadeira/GaleriaTemporadas'
import { ALBUNS_RITOS } from '../ritos-sonoros/albunsRitos'
import { ALBUNS_CONVIDADO } from '../brincatocadeira/albunsConvidado'
import CarrosselModal from '../../components/ui/CarrosselModal'
import capaInfantis from '../../assets/web/galeria-brincatocadeira/carnaval-1.webp'
import capaMusicaAoVivo from '../../assets/web/musica-ao-vivo-capa.webp'
import capaJornada from '../../assets/web/jornada-service.webp'

function GaleriaEventos({ ancoraMusicaAoVivo }) {
    const [brincatocadeiraAberta, setBrincatocadeiraAberta] = useState(false)
    const [convidadoAberto, setConvidadoAberto] = useState(false)
    const cantarolou = ALBUNS_CONVIDADO[0]

    const secoes = [
        {
            tag: 'Eventos infantis',
            etiquetaAmarela: true,
            capa: capaInfantis,
            legenda: 'Aniversários, Carnaval, São João e mais com o Brincatocadeira. Toque para ver a galeria.',
            onClick: () => setBrincatocadeiraAberta(true),
            rotuloAcao: 'Ver a galeria do Brincatocadeira',
        },
        {
            tag: 'Música ao vivo',
            capa: capaMusicaAoVivo,
            legenda: 'Repertório instrumental e lírico, nacional e internacional, para aniversários, casamentos e outros eventos.',
            onClick: () => document.getElementById(ancoraMusicaAoVivo)?.scrollIntoView({ behavior: 'smooth' }),
            rotuloAcao: 'Ver os formatos de música ao vivo',
        },
        {
            tag: 'Ritos sonoros',
            capa: ALBUNS_RITOS[0].fotos[0].src,
            legenda: 'Instrumentos relaxantes para aulas de yoga, sessões de sound healing e outros eventos de contemplação sonora.',
            para: '/ritossonoros',
            rotuloAcao: 'Conhecer os Ritos Sonoros',
        },
        {
            tag: 'Jornada percussiva',
            etiquetaAmarela: true,
            capa: capaJornada,
            legenda: 'Oficina de percussão para pessoas com ou sem experiência prévia com música.',
            para: '/jornadapercussiva',
            rotuloAcao: 'Conhecer a Jornada Percussiva',
        },
        {
            tag: 'Participação como músico convidado',
            capa: cantarolou.fotos[0].src,
            quantidade: cantarolou.fotos.length,
            legenda: 'Pedro como músico convidado do Cantarolou. Toque para ver as fotos.',
            onClick: () => setConvidadoAberto(true),
            rotuloAcao: 'Ver as fotos da participação no Cantarolou',
        },
    ]

    return (
        <>
            <GradeMolduras>
                {secoes.map(({ tag, ...secao }, i) => (
                    <Moldura key={tag} tag={tag} {...secao} indice={i} total={secoes.length} />
                ))}
            </GradeMolduras>

            {brincatocadeiraAberta && <ModalBrincatocadeira onFechar={() => setBrincatocadeiraAberta(false)} />}
            {convidadoAberto && (
                <CarrosselModal titulo={cantarolou.tag} fotos={cantarolou.fotos} legenda={cantarolou.legenda} onFechar={() => setConvidadoAberto(false)} />
            )}
        </>
    )
}

/** A galeria do Brincatocadeira (o mesmo componente da página dele) dentro de um modal, sem sair de /eventos. */
function ModalBrincatocadeira({ onFechar }) {
    const dialogo = useRef(null)

    // Mesmo cuidado do carrossel: sem close() na limpeza por causa do StrictMode.
    useEffect(() => {
        const el = dialogo.current
        if (!el.open) el.showModal()
        document.documentElement.style.overflow = 'hidden'
        return () => {
            document.documentElement.style.overflow = ''
        }
    }, [])

    return (
        <dialog
            ref={dialogo}
            onClose={(evento) => evento.target === evento.currentTarget && onFechar()}
            onClick={(evento) => evento.target === evento.currentTarget && onFechar()}
            aria-label="Galeria do Brincatocadeira"
            className="m-auto h-dvh max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-tinta/80"
        >
            <div className="pointer-events-none flex min-h-full items-start justify-center px-3 py-6 sm:items-center sm:px-6">
                <div className="pointer-events-auto w-full max-w-5xl rounded-3xl bg-creme p-5 shadow-2xl sm:p-10">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="rotulo">Eventos infantis · Brincatocadeira</p>
                            <h2 className="titulo-secao">A turma toda no palco</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onFechar}
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-tinta/10 text-2xl text-tinta hover:bg-tinta/20"
                            aria-label="Fechar galeria"
                            autoFocus
                        >
                            <i className="bi bi-x-lg" aria-hidden="true"></i>
                        </button>
                    </div>
                    <GaleriaTemporadas />
                    <div className="mt-6 text-center">
                        <Link to="/brincatocadeira" className="font-bold text-marca hover:underline">
                            Conhecer o Brincatocadeira
                        </Link>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default GaleriaEventos
