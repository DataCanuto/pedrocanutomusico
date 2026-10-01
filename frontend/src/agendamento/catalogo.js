// Catálogo de serviços, preços e durações. Mesmos valores do antigo backend
// (migration V2__seed_precos_conhecidos.sql), agora como dado estático porque
// não há mais banco. Compartilhado entre o formulário (src/) e a função da
// Vercel (api/), então qualquer ajuste de preço é feito só aqui.

export const WHATSAPP_NUMERO = '5571999958950'

export const CATEGORIAS = {
    MUSICALIZACAO_INFANTIL: { nome: 'Musicalização Infantil', tipo: 'AULA' },
    MUSICOTERAPIA: { nome: 'Musicoterapia', tipo: 'AULA' },
    AULA_INSTRUMENTO: { nome: 'Aulas de Instrumento', tipo: 'AULA' },
    EVENTO: { nome: 'Eventos', tipo: 'EVENTO' },
}

export const MODALIDADES = {
    INDIVIDUAL: 'Individual',
    GRUPO: 'Grupo',
}

export const TIPOS_CONTRATACAO = {
    AVULSO: { nome: 'Aula avulsa', quantidadeAulas: 1 },
    PACOTE_4: { nome: 'Pacote de 4 aulas', quantidadeAulas: 4 },
    PACOTE_12: { nome: 'Pacote de 12 aulas', quantidadeAulas: 12 },
}

export const INSTRUMENTOS = {
    VIOLAO: 'Violão',
    GUITARRA: 'Guitarra',
    UKULELE: 'Ukulele',
    CAVAQUINHO: 'Cavaquinho',
    BANDOLIM: 'Bandolim',
    BAIXO: 'Baixo',
    CAJON: 'Cajón',
    PANDEIRO: 'Pandeiro',
    FLAUTA_DOCE: 'Flauta doce',
    CANTO: 'Canto',
}

// categoria -> modalidade -> tipoContratacao -> { valor, duracaoMinutos }
export const PRECOS_AULAS = {
    MUSICALIZACAO_INFANTIL: {
        INDIVIDUAL: {
            AVULSO: { valor: 150, duracaoMinutos: 30 },
            PACOTE_4: { valor: 560, duracaoMinutos: 30 },
        },
        GRUPO: {
            AVULSO: { valor: 80, duracaoMinutos: 45 },
            PACOTE_4: { valor: 280, duracaoMinutos: 45 },
        },
    },
    MUSICOTERAPIA: {
        INDIVIDUAL: {
            AVULSO: { valor: 180, duracaoMinutos: 50 },
            PACOTE_4: { valor: 600, duracaoMinutos: 50 },
            PACOTE_12: { valor: 1700, duracaoMinutos: 50 },
        },
        GRUPO: {
            AVULSO: { valor: 90, duracaoMinutos: 50 },
            PACOTE_4: { valor: 300, duracaoMinutos: 50 },
        },
    },
    AULA_INSTRUMENTO: {
        INDIVIDUAL: {
            AVULSO: { valor: 140, duracaoMinutos: 50 },
            PACOTE_4: { valor: 500, duracaoMinutos: 50 },
        },
        GRUPO: {
            AVULSO: { valor: 70, duracaoMinutos: 50 },
            PACOTE_4: { valor: 250, duracaoMinutos: 50 },
        },
    },
}

export const TIPOS_EVENTO = {
    ANIVERSARIO: 'Aniversário',
    CASAMENTO: 'Casamento',
    EVENTO_CORPORATIVO: 'Evento corporativo',
    CARNAVAL: 'Carnaval',
    SAO_JOAO: 'São João',
    MUSICOTERAPIA_EVENTO: 'Ritos sonoros / Sound healing',
}

// Pacotes "sob consulta" não têm valor nem duração: o horário fica reservado
// com DURACAO_EVENTO_SOB_CONSULTA e Pedro ajusta ao confirmar.
export const DURACAO_EVENTO_SOB_CONSULTA = 120

export const PACOTES_EVENTO = [
    { id: 'roda-de-musica', tipoEvento: 'ANIVERSARIO', nome: 'Roda de Música', descricao: '1h de apresentação com repertório infantil, brincadeiras musicadas e prática com instrumentos musicais.', valor: 600, duracaoMinutos: 60 },
    { id: 'brincatocadeira', tipoEvento: 'ANIVERSARIO', nome: 'Brincatocadeira', descricao: 'Animação musical, brincadeiras musicadas, coreografia, karaokê e desafios.', valor: 1000, duracaoMinutos: 60 },
    { id: 'monte-seu-show', tipoEvento: 'ANIVERSARIO', nome: 'Monte Seu Show', descricao: 'Show personalizado, montado sob medida com você.', valor: null, duracaoMinutos: null },
    { id: 'carnaval-solo', tipoEvento: 'CARNAVAL', nome: 'Bailinho de Carnaval (solo)', descricao: 'Bailinho de carnaval para o público infantil, com Pedro Canuto.', valor: 600, duracaoMinutos: 60 },
    { id: 'carnaval-musico', tipoEvento: 'CARNAVAL', nome: 'Bailinho de Carnaval (com músico)', descricao: 'Bailinho de carnaval para o público infantil, com Pedro Canuto e mais um músico.', valor: 1500, duracaoMinutos: 90 },
    { id: 'carnaval-banda', tipoEvento: 'CARNAVAL', nome: 'Bailinho de Carnaval (com banda)', descricao: 'Bailinho de carnaval com a banda Brincatocadeira.', valor: 2000, duracaoMinutos: 90 },
    { id: 'sao-joao-solo', tipoEvento: 'SAO_JOAO', nome: 'Quadrilha Junina (solo)', descricao: 'Quadrilha junina para o público infantil, com Pedro Canuto.', valor: 600, duracaoMinutos: 60 },
    { id: 'sao-joao-musico', tipoEvento: 'SAO_JOAO', nome: 'Quadrilha Junina (com músico)', descricao: 'Quadrilha junina para o público infantil, com Pedro Canuto e mais um músico.', valor: 1500, duracaoMinutos: 90 },
    { id: 'sao-joao-banda', tipoEvento: 'SAO_JOAO', nome: 'Quadrilha Junina (com banda)', descricao: 'Quadrilha junina com a banda Brincatocadeira.', valor: 2000, duracaoMinutos: 90 },
    { id: 'casamento', tipoEvento: 'CASAMENTO', nome: 'Casamento', descricao: 'Repertório e formato definidos sob consulta.', valor: null, duracaoMinutos: null },
    { id: 'corporativo', tipoEvento: 'EVENTO_CORPORATIVO', nome: 'Evento corporativo', descricao: 'Repertório e formato definidos sob consulta.', valor: null, duracaoMinutos: null },
    { id: 'soundhealing', tipoEvento: 'MUSICOTERAPIA_EVENTO', nome: 'Sound healing com instrumentos xamânicos', descricao: 'Sessão sonora terapêutica em grupo.', valor: null, duracaoMinutos: null },
]

export function buscarPacoteEvento(id) {
    return PACOTES_EVENTO.find((pacote) => pacote.id === id) ?? null
}

export function buscarPrecoAula(categoria, modalidade, tipoContratacao) {
    return PRECOS_AULAS[categoria]?.[modalidade]?.[tipoContratacao] ?? null
}

export function formatarValor(valor) {
    if (valor == null) {
        return 'Sob consulta'
    }
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
