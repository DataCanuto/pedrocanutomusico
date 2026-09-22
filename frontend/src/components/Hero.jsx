import './hero.css'
import ServiceCards from './ServiceCards';

function Hero (){
    return(
        <div className="hero-bg">
            <div className="hero-content">
                <h1 className="hero-title">Pedro Canuto Músico</h1>
                <ServiceCards />
            </div>
        </div>
    )
}

export default Hero;