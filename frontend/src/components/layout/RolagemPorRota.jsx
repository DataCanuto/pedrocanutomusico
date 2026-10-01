import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Volta ao topo a cada página nova e rola até a âncora quando o link tem #. */
function RolagemPorRota() {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if (hash) {
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
            return
        }
        window.scrollTo({ top: 0 })
    }, [pathname, hash])

    return null
}

export default RolagemPorRota
