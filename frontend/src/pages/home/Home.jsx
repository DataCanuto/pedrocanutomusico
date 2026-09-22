import Hero from "../../components/Hero";
import Servicos from "../../components/Servicos";
import About from "../../components/About";
import Contato from "../../components/Contato";

function Home (){
    return(
        <div>
            <Hero />
            <Servicos />
            <About />
            <Contato />

        </div>
    )
}

export default Home;