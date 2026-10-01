import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import RolagemPorRota from './components/layout/RolagemPorRota'
import Home from './pages/home/Home'
import Musicalizacao from './pages/musicalizacao/Musicalizacao'
import Brincatocadeira from './pages/brincatocadeira/Brincatocadeira'
import Instrumento from './pages/aulas-instrumento/Instrumento'
import JornadaPercussiva from './pages/jornada-percussiva/JornadaPercussiva'
import Mt from './pages/mt/Mt'
import RitosSonoros from './pages/ritos-sonoros/RitosSonoros'
import Eventos from './pages/eventos/Eventos'
import Agendar from './pages/agendar/Agendar'
import NaoEncontrada from './pages/nao-encontrada/NaoEncontrada'

function App() {
  return (
    <BrowserRouter>
      <RolagemPorRota />
      <div className="flex min-h-svh flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/musicalizacao" element={<Musicalizacao />} />
            <Route path="/brincatocadeira" element={<Brincatocadeira />} />
            <Route path="/instrumento" element={<Instrumento />} />
            <Route path="/jornadapercussiva" element={<JornadaPercussiva />} />
            <Route path="/musicoterapia" element={<Mt />} />
            <Route path="/ritossonoros" element={<RitosSonoros />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/agendar" element={<Agendar />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
