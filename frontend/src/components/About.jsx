function About() {

    return (
        <div className="container-fluid">
            <h2 className="text-center my-5">Sobre</h2>



            <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <div className="card mx-auto" style={{ width: "min(60rem, 92vw)" }}>
                            <div className="card-body">
                                <h5 className="card-title">Multi-instrumentista Autodidata</h5>
                                <h6 className="card-subtitle mb-2 text-body-secondary">Mais de 10 anos de pesquisa, prática e vivência musical.</h6>

                                <p className="card-text">
                                    Aos 12 anos, ganhei de presente do meu pai meu primeiro violão.
                                    Minha mãe então contratou um professor para que eu pudesse iniciar meus estudos
                                    no instrumento. A partir daí, a curiosidade pela música me levou a explorar
                                    diferentes instrumentos, linguagens e possibilidades sonoras.
                                </p>

                                <p className="card-text">
                                    Ao longo dessa trajetória, tive a oportunidade de tocar em bandas de rock e
                                    experimentar instrumentos elétricos, como guitarra e baixo. O baixo elétrico
                                    se tornou um dos meus favoritos, especialmente pela influência do Red Hot
                                    Chili Peppers e pelo interesse em estudar e reproduzir as linhas de baixo
                                    de Flea.
                                </p>

                                <p className="card-text">
                                    Com o trabalho musical, ampliei minha experiência com a percussão e passei
                                    a explorar instrumentos de diferentes tradições. Na faculdade e em diversas
                                    vivências práticas, aprofundei meus conhecimentos sobre ritmo, timbre,
                                    técnica e expressão musical.
                                </p>

                                <p className="card-text">
                                    Minha trajetória inclui instrumentos de cordas, sopros, teclas e percussão,
                                    entre eles: violão, guitarra, baixo elétrico, ukulelê, cavaquinho, bandolim,
                                    teclado, pífano, bansuri, flauta xamânica, djembê, pandeiro, cajón, atabaque,
                                    agogô e derbak.
                                </p>

                                <p className="card-text">
                                    Mais do que acumular instrumentos, essa experiência ampliou minha compreensão
                                    sobre diferentes formas de fazer música. Cada instrumento traz uma maneira
                                    particular de perceber o ritmo, a melodia, o corpo e a cultura, e essa
                                    diversidade faz parte da minha forma de ensinar e de criar experiências musicais.
                                </p>


                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="card mx-auto" style={{ width: "min(60rem, 92vw)" }}>
                            <div className="card-body">
                                <h5 className="card-title">Experiência e Embasamento</h5>
                                <h6 className="card-subtitle mb-2 text-body-secondary">8 anos de experiência formal em aulas de musicalização infantil.</h6>
                                <p className="card-text">Em 2016 tive a oportunidade de levar meu sobrinho rescem-nascido para uma aula de musicalização infantil na escola de música canela fina. O mais encantador é que eu gostei tanto daquela experiência que busquei saber mais. Tive a oportunidade de estagiar na escola durante o fim de minha formação no Bacharelado Interdisciplinar em Artes, e então comecei a atuar como professor efetivo.</p>
                                <p>Tive a oportunidade de atuar como professor de música na educação infantil e fundamental I nas escolas Dorilândia, Bunny, Cresça e Apareça, Colégio Miró onde acumulei bastante experiência com grupos diversos de crianças e atividades multidisciplinares desenvolvidas em ambiente pedagógico.</p>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="card mx-auto" style={{ width: "min(60rem, 92vw)" }}>
                            <div className="card-body">
                                <h5 className="card-title">Minha Trajetória Musical</h5>
                                <h6 className="card-subtitle mb-2 text-body-secondary">Momentos marcantes da minha relação com a música.</h6>
                                <div className="clearfix">
                                    {/* <img src="." className="col-md-6 float-md-end mb-3 ms-md-3" alt="..."/> */}

                                        <p>
                                            Dos 14 aos 20 anos fui baixista nas bandas de rock: Tomada 21, Gozo de Lebre e Hao, participando de shows independentes e eventos de edital. Nesse período, compus músicas, gravei discos e fiz contato com muita gente interessante do cenário musical de Salvador, principalmente do Rio Vermelho.
                                        </p>

                                        <p>
                                            As you can see the paragraphs gracefully wrap around the floated image. Now imagine how this would look with some actual content in here, rather than just this boring placeholder text that goes on and on, but actually conveys no tangible information at. It simply takes up space and should not really be read.
                                        </p>

                                        <p>
                                            And yet, here you are, still persevering in reading this placeholder text, hoping for some more insights, or some hidden easter egg of content. A joke, perhaps. Unfortunately, there’s none of that here.
                                        </p>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>

            </div>


        </div>
    )

}

export default About;