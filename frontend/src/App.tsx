import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { NavBar } from "./components/layout/NavBar";
import { TelaCarregamento } from "./components/layout/TelaCarregamento";
import { AdminAgendaPage } from "./pages/admin/AdminAgendaPage";
import { AdminClientesPage } from "./pages/admin/AdminClientesPage";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { AdminMusicosPage } from "./pages/admin/AdminMusicosPage";
import { AdminNovoEventoPage } from "./pages/admin/AdminNovoEventoPage";
import { AdminPrecosPage } from "./pages/admin/AdminPrecosPage";
import { AdminTurmasPage } from "./pages/admin/AdminTurmasPage";
import { AdminVerTurmasPage } from "./pages/admin/AdminVerTurmasPage";
import { AgendarPage } from "./pages/AgendarPage";
import { HomePage } from "./pages/HomePage";
import "./App.css";

/** Rola até a seção da âncora (ex: /#servicos) - o React Router não faz isso sozinho. */
function RolarParaAncora() {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return;
        const elemento = document.getElementById(location.hash.slice(1));
        elemento?.scrollIntoView({ behavior: "smooth" });
    }, [location.pathname, location.hash]);

    return null;
}

function App() {
    return (
        <>
            <TelaCarregamento />
            <RolarParaAncora />
            <NavBar />
            <main className="conteudo">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/agendar" element={<AgendarPage />} />
                    <Route path="/admin" element={<AdminHomePage />} />
                    <Route path="/admin/precos" element={<AdminPrecosPage />} />
                    <Route path="/admin/precos/novo-evento" element={<AdminNovoEventoPage />} />
                    <Route path="/admin/turmas" element={<AdminTurmasPage />} />
                    <Route path="/admin/turmas/ver" element={<AdminVerTurmasPage />} />
                    <Route path="/admin/musicos" element={<AdminMusicosPage />} />
                    <Route path="/admin/agenda" element={<AdminAgendaPage />} />
                    <Route path="/admin/clientes" element={<AdminClientesPage />} />
                </Routes>
            </main>
        </>
    );
}

export default App;
