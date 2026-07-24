-- Preços exatos informados pelo dono do produto (prices.txt), com uma simplificação de regra de
-- negócio pedida depois: para categorias de aula, só AVULSO/PACOTE_4/PACOTE_12 (pacote_2/pacote_3
-- deixaram de ser oferecidos - existiam só em Musicalização; Musicoterapia e Instrumento já
-- seguiam essa regra desde o início). Não é uma fórmula de desconto - cada combinação
-- categoria+modalidade+pacote tem seu valor próprio, e nem toda categoria/modalidade tem
-- pacote_12 cadastrado ainda (só Musicoterapia Individual, por enquanto).
-- duracao_padrao_minutos é fixo por categoria+modalidade (não varia por idade do aluno).
INSERT INTO preco_servico (categoria, modalidade, tipo_contratacao, valor, duracao_padrao_minutos)
VALUES
    ('MUSICALIZACAO_INFANTIL', 'INDIVIDUAL', 'AVULSO', 150.00, 30),
    ('MUSICALIZACAO_INFANTIL', 'INDIVIDUAL', 'PACOTE_4', 560.00, 30),
    ('MUSICALIZACAO_INFANTIL', 'GRUPO', 'AVULSO', 80.00, 45),
    ('MUSICALIZACAO_INFANTIL', 'GRUPO', 'PACOTE_4', 280.00, 45),

    ('MUSICOTERAPIA', 'INDIVIDUAL', 'AVULSO', 180.00, 50),
    ('MUSICOTERAPIA', 'INDIVIDUAL', 'PACOTE_4', 600.00, 50),
    ('MUSICOTERAPIA', 'INDIVIDUAL', 'PACOTE_12', 1700.00, 50),
    ('MUSICOTERAPIA', 'GRUPO', 'AVULSO', 90.00, 50),
    ('MUSICOTERAPIA', 'GRUPO', 'PACOTE_4', 300.00, 50),

    ('AULA_INSTRUMENTO', 'INDIVIDUAL', 'AVULSO', 140.00, 50),
    ('AULA_INSTRUMENTO', 'INDIVIDUAL', 'PACOTE_4', 500.00, 50),
    ('AULA_INSTRUMENTO', 'GRUPO', 'AVULSO', 70.00, 50),
    ('AULA_INSTRUMENTO', 'GRUPO', 'PACOTE_4', 250.00, 50);

-- Pacotes de EVENTO. "Sob consulta" = valor/duracao_padrao_minutos nulos (professor define
-- depois via orçamento manual).
INSERT INTO preco_servico (categoria, tipo_evento, nome, descricao, publico_alvo, equipe, materiais, valor, duracao_padrao_minutos)
VALUES
    ('EVENTO', 'ANIVERSARIO', 'Roda de Música',
     '1h de apresentação com repertório infantil, brincadeiras musicadas e prática com instrumentos musicais.',
     NULL, 'Pedro Canuto', 'tapete, instrumentos, som reduzido', 600.00, 60),

    ('EVENTO', 'ANIVERSARIO', 'Brincatocadeira',
     'Animação musical, brincadeiras musicadas, coreografia, karaokê e desafios.',
     NULL, 'Pedro + músico', 'equipamento de som, materiais lúdicos', 1000.00, 60),

    ('EVENTO', 'ANIVERSARIO', 'Monte Seu Show',
     'Show personalizado, montado sob medida com o cliente.',
     NULL, NULL, NULL, NULL, NULL),

    ('EVENTO', 'CARNAVAL', 'Bailinho de Carnaval - Solo',
     'Bailinho de carnaval voltado para público infantil.', NULL, 'Pedro Canuto', NULL, 600.00, 60),
    ('EVENTO', 'CARNAVAL', 'Bailinho de Carnaval - Com Músico',
     'Bailinho de carnaval voltado para público infantil.', NULL, 'Pedro Canuto + músico', NULL, 1500.00, 90),
    ('EVENTO', 'CARNAVAL', 'Bailinho de Carnaval - Com Banda',
     'Bailinho de carnaval voltado para público infantil.', NULL, 'Pedro Canuto + banda Brincatocadeira', NULL, 2000.00, 90),

    ('EVENTO', 'SAO_JOAO', 'Quadrilha Junina - Solo',
     'Quadrilha junina voltada para público infantil.', NULL, 'Pedro Canuto', NULL, 600.00, 60),
    ('EVENTO', 'SAO_JOAO', 'Quadrilha Junina - Com Músico',
     'Quadrilha junina voltada para público infantil.', NULL, 'Pedro Canuto + músico', NULL, 1500.00, 90),
    ('EVENTO', 'SAO_JOAO', 'Quadrilha Junina - Com Banda',
     'Quadrilha junina voltada para público infantil.', NULL, 'Pedro Canuto + banda Brincatocadeira', NULL, 2000.00, 90),

    ('EVENTO', 'CASAMENTO', 'Casamento - Sob Consulta',
     'Repertório e formato definidos sob consulta.', NULL, NULL, NULL, NULL, NULL),

    ('EVENTO', 'EVENTO_CORPORATIVO', 'Evento Corporativo - Sob Consulta',
     'Repertório e formato definidos sob consulta.', NULL, NULL, NULL, NULL, NULL),

    ('EVENTO', 'MUSICOTERAPIA_EVENTO', 'Soundhealing com Instrumentos Xamânicos',
     'Sessão sonora terapêutica em grupo com instrumentos xamânicos.', NULL, NULL, NULL, NULL, NULL);
