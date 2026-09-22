import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from "./components/Navbar"
import Home from './pages/home/Home'
import Musicalizacao from './pages/musicalizacao/Musicalizacao'
import Brincatocadeira from './pages/brincatocadeira/Brincatocadeira'
import Instrumento from './pages/aulas-instrumento/Instrumento'
import JornadaPercussiva from './pages/jornada-percussiva/JornadaPercussiva'
import Mt from './pages/mt/Mt'
import RitosSonoros from './pages/ritos-sonoros/RitosSonoros'
import Eventos from './pages/eventos/Eventos'

import './App.css'

function App() {


  return (
    <BrowserRouter>
    <Navbar />

    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/musicalizacao" element={<Musicalizacao />}></Route>
      <Route path="/brincatocadeira" element={<Brincatocadeira />}></Route>
      <Route path="/instrumento" element={<Instrumento />}></Route>
      <Route path="/jornadapercussiva" element={<JornadaPercussiva />}></Route>
      <Route path="/musicoterapia" element={<Mt />}></Route>
      <Route path="/ritossonoros" element={<RitosSonoros />}></Route>
      <Route path="/eventos" element={<Eventos />}></Route>
    </Routes>
    
    </BrowserRouter>
  )
}

export default App
