import { Link } from 'react-router-dom'
import musicalizacaoimg from '../assets/musicalizacao-servicos.png'
import brincatocadeiraImg from '../assets/brincatocadeira-servicos.png'
import mtimg from '../assets/musicoterapia-card.png'
import mtimg2 from '../assets/mt-servicos.png'
import instrumentoimg from '../assets/instrumentos-service.png'
import jornadaimg from '../assets/jornada-service.png'
import eventosimg from '../assets/eventos-service.png'

function Servicos() {
    return (
        <div>
            <h2 className="text-center my-5">Serviços</h2>
            <div className="container">
                <div className="row align-items-center my-5" id="musicalizacao">
                    <div className="col-12 col-md-6">
                        <h2 className="servicos-title">Musicalização Infantil</h2>
                        <p>A Musicalização Infantil é uma forma de iniciação e alfabetização musical que proporciona à criança o contato com a música por meio de vivências lúdicas, afetivas e estruturadas. Por meio de brincadeiras, canções, movimentos, exploração de sons e instrumentos, a criança desenvolve gradualmente sua percepção e compreensão do universo musical, despertando o interesse, a curiosidade e a expressão por meio da música.</p>

                        <p>As aulas acontecem em domicílio, proporcionando à criança uma experiência musical no ambiente em que ela já se sente segura e familiar. Podem ser realizadas individualmente ou em pequenos grupos, de acordo com os objetivos e a dinâmica de cada família.</p>
                        <p>As vivências utilizam um kit diversificado de instrumentos musicais, incluindo instrumentos de percussão, cordas, teclado, sanfoninha e outros recursos sonoros. A criança é estimulada a experimentar, escutar, criar, cantar, tocar e se movimentar, construindo sua relação com a música de maneira ativa e prazerosa.</p>
                        <div>
                            <Link to="/musicalizacao" className="btn btn-action">Saiba mais</Link>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <img src={musicalizacaoimg} className="img-thumbnail d-block mx-auto" alt="musicalização infantil" />
                    </div>
                </div>


                <div className="row align-items-center my-5" id="brincatocadeira">
                    <div className="col-12 col-md-6">

                        <div>
                            <h2 className="servicos-title">Brincatocadeira</h2>
                            <p>O Brincatocadeira é um projeto de música e musicalização que transforma canções, brincadeiras e experiências sonoras em momentos de alegria, interação e descoberta. Além do nosso show autoral “Que Brincadeira!”, realizamos apresentações temáticas de temporada, como Carnaval e São João, levando música, movimento e ludicidade para diferentes espaços e eventos.</p>
                            <p>Em nossas apresentações, também promovemos oficinas de construção e experimentação de instrumentos musicais, aproximando as crianças dos sons e do fazer musical de forma criativa e participativa.</p>
                            <Link to="/brincatocadeira" className="btn btn-action">Saiba mais</Link>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <img src={brincatocadeiraImg} className="img-thumbnail d-block mx-auto" alt="brincatocadeira" style={{width:"60%"}}/>
                    </div>
                </div>

                <hr></hr>

                <div className="row align-items-center my-5" id="musicoterapia">
                    <div className="col-12 col-md-6">
                        <img src={mtimg2} className="img-thumbnail d-block mx-auto" alt="musicoterapia" />
                        <div>

                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <h2 className="servicos-title">Musicoterapia</h2>
                        <p>A Musicoterapia utiliza a música e seus elementos como ferramentas terapêuticas para promover saúde, expressão e qualidade de vida. A partir de uma abordagem individualizada, desenvolvo experiências musicais que consideram a identidade sonora, as necessidades e as possibilidades de cada pessoa, utilizando recursos como improvisação, prática instrumental, musicalização e escuta receptiva.</p>

                        <p>Minha experiência inclui atendimentos com crianças com autismo e Síndrome de Down, jovens e adultos em demandas relacionadas à ansiedade, concentração e depressão, além do trabalho com idosos, incluindo casos de Alzheimer, Parkinson, solidão e outras condições, sempre buscando favorecer o desenvolvimento, a autonomia, a comunicação e o bem-estar.</p>

                        <Link to="/mt" className="btn btn-action">Saiba mais</Link>
                    </div>
                </div>

                <div className="row align-items-center my-5" id="ritossonoros">
                    <div className="col-12 col-md-6">
                        <img src={mtimg} className="img-thumbnail d-block mx-auto" alt="ritos sonoros" style={{width:"60%"}} />
                        <div>

                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <h2 className="servicos-title">Ritos Sonoros</h2>
                        <p>Os Ritos Sonoros são experiências de imersão e escuta que utilizam o som como elemento de relaxamento, presença e conexão. Integrando práticas como Yoga, Sound Healing e outros rituais sonoros, exploro diferentes instrumentos terapêuticos — como flauta xamânica, sinos, tigelas tibetanas e instrumentos de percussão — a partir de estudos sobre suas características sonoras e possibilidades de aplicação.</p>

                        <p>Uma experiência voltada à escuta, à desaceleração e ao bem-estar, na qual o som conduz momentos de contemplação e percepção.</p>



                        <Link to="/ritossonoros" className="btn btn-action">Saiba mais</Link>
                    </div>
                </div>

                <hr></hr>

                <div className="row align-items-center my-5" id="instrumento">
                    <div className="col-12 col-md-6">
                        <h2 className="servicos-title">Aulas de Instrumento</h2>
                        <p>As aulas de instrumento são um espaço para desenvolver musicalidade, técnica e expressão a partir da prática. Trabalho com instrumentos de cordas, canto e percussão, respeitando o ritmo e os objetivos de cada aluno.</p>

                        <p>Mais do que aprender a tocar, a proposta é desenvolver uma relação prática, criativa e significativa com a música, explorando diferentes instrumentos e possibilidades de expressão.</p>

                        <div>
                            <Link to="/instrumento" className="btn btn-action">Saiba mais</Link>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <img src={instrumentoimg} className="img-thumbnail d-block mx-auto" alt="aulas de instrumento" style={{width:"80%"}} />
                    </div>
                </div>

                <div className="row align-items-center my-5" id="jornada">
                    <div className="col-12 col-md-6">
                        <h2 className="servicos-title">Jornada Percussiva</h2>
                        <p>A Jornada Percussiva é uma experiência de imersão no universo da percussão, construída a partir da exploração de ritmos, instrumentos, corpo e escuta coletiva.</p>

                        <p>Por meio da prática de diferentes instrumentos de percussão e de dinâmicas musicais, os participantes experimentam ritmos, desenvolvem coordenação, percepção e presença, descobrindo a música através do fazer, tocar e compartilhar.</p>

                        <p>Uma experiência que transforma a percussão em encontro, aprendizado e expressão musical.</p>

                        <div>
                            <Link to="/instrumento" className="btn btn-action">Saiba mais</Link>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <img src={jornadaimg} className="img-thumbnail d-block mx-auto" alt="jornada percussiva" style={{width:"80%"}}/>
                    </div>
                </div>

                <div className="row align-items-center my-5" id="eventos">
                    <div className="col-12 col-md-6">

                        <div>
                            <img src={eventosimg} className="img-thumbnail" alt="eventos" />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <h2 className="servicos-title">Eventos</h2>

                        <p>Produzo experiências musicais personalizadas para diferentes públicos e ocasiões, unindo música ao vivo, interação e atividades pensadas para cada evento.</p>

                        <p>Para o público infantil, integro a experiência do Brinca Tocadeira e da Musicalização Infantil em propostas que podem incluir oficinas de instrumentos, canções afetivas da infância, dança, brincadeiras e outras dinâmicas musicais.</p>

                        <p>Também desenvolvo formatos para música ao vivo, Carnaval, São João, Natal e casamentos, adaptando repertório, formação musical e dinâmica para criar experiências que façam sentido para cada ocasião.</p>

                        <p>Vamos criar um evento com música, identidade e experiência?</p>

                        
                        <a
                            href="https://wa.me/5571999958950?text=Ol%C3%A1%2C%20Pedro!%20Quero%20saber%20mais%20sobre%20m%C3%BAsica%20para%20eventos."
                            className="btn btn-action"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Falar no WhatsApp
                        </a>
                    </div>
                </div>



            </div>

        </div>
    )
}

export default Servicos;
