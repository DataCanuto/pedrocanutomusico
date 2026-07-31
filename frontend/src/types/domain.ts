// Espelha os enums e DTOs do backend (com.pedrocanuto.agendamento.domain.enums / dto).
// Mantido em sincronia manualmente - projeto não gera cliente TS a partir do OpenAPI ainda.

export type ECategoriaServico =
    | "MUSICALIZACAO_INFANTIL"
    | "MUSICOTERAPIA"
    | "AULA_INSTRUMENTO"
    | "EVENTO";

export type EModalidadeServico = "INDIVIDUAL" | "GRUPO";

export type ETipoContratacao = "AVULSO" | "PACOTE_2" | "PACOTE_3" | "PACOTE_4" | "PACOTE_12";

/** Espelha java.time.DayOfWeek (Jackson serializa enums pelo nome por padrão). */
export type EDiaSemana = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export type EInstrumento =
    | "VIOLAO"
    | "UKULELE"
    | "BAIXO"
    | "CAJON"
    | "PANDEIRO"
    | "FLAUTA_DOCE"
    | "CANTO";

export type ETipoEvento =
    | "ANIVERSARIO"
    | "CASAMENTO"
    | "EVENTO_CORPORATIVO"
    | "CARNAVAL"
    | "SAO_JOAO"
    | "MUSICOTERAPIA_EVENTO";

export type EStatusAgendamento =
    | "AGENDADO"
    | "CONFIRMADO"
    | "CHECK_IN"
    | "EM_ANDAMENTO"
    | "FINALIZADO"
    | "CANCELADO"
    | "FALTOU";

export type EStatusTurma = "ATIVA" | "ENCERRADA" | "CANCELADA";

export type ESexo = "MASCULINO" | "FEMININO" | "PREFIRO_NAO_INFORMAR";

export interface EnderecoRequest {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    complemento?: string;
}

export interface EnderecoResponse extends EnderecoRequest {
    id: number;
}

export interface ClienteRequest {
    nome: string;
    telefone: string;
    email?: string;
    cpf?: string;
    cnpj?: string;
    dataNascimento?: string;
    sexo?: ESexo;
    /** Sempre exigido pelo backend - todo request que cria/atualiza um Cliente precisa de pelo menos um endereço. */
    enderecos: EnderecoRequest[];
}

export interface ClienteListItem {
    id: number;
    nome: string;
    telefone: string;
    enderecoResumo: string | null;
    /** Categoria do agendamento mais recente do cliente - null se ele ainda não tem nenhum. */
    categoriaServico: ECategoriaServico | null;
}

export interface AlunoRequest {
    nome: string;
    dataNascimento: string;
    sexo?: ESexo;
    observacoes?: string;
}

export interface AlunoSelecaoRequest {
    paraMim: boolean;
    dadosAluno: AlunoRequest;
}

/**
 * Para categoria != EVENTO: modalidade e tipoContratacao sempre presentes (juntos identificam
 * a linha - cada combinação tem um valor FIXO próprio, não é preço unitário × desconto).
 * nome/descricao/publicoAlvo/equipe/materiais/tipoEvento ficam null.
 * Para categoria == EVENTO: modalidade/tipoContratacao ficam null, nome identifica o pacote
 * (ex. "Festa Temática"). valor/duracaoPadraoMinutos podem ser null ("sob consulta").
 */
export interface PrecoServico {
    id: number;
    categoria: ECategoriaServico;
    modalidade: EModalidadeServico | null;
    tipoContratacao: ETipoContratacao | null;
    tipoEvento: ETipoEvento | null;
    nome: string | null;
    descricao: string | null;
    publicoAlvo: string | null;
    equipe: string | null;
    materiais: string | null;
    valor: number | null;
    duracaoPadraoMinutos: number | null;
    atualizadoEm: string;
}

export interface PrecoServicoRequest {
    categoria: ECategoriaServico;
    modalidade: EModalidadeServico | null;
    tipoContratacao: ETipoContratacao | null;
    tipoEvento: ETipoEvento | null;
    nome: string | null;
    descricao: string | null;
    publicoAlvo: string | null;
    equipe: string | null;
    materiais: string | null;
    valor: number | null;
    duracaoPadraoMinutos: number | null;
}

export interface HistoricoClinicoRequest {
    possuiDiagnostico?: boolean | null;
    diagnosticos?: string | null;
    fazUsoMedicamentos?: boolean | null;
    medicamentos?: string | null;
    possuiAcompanhamentoMedico?: boolean | null;
    especialidadesMedicas?: string | null;
    possuiAcompanhamentoPsicologico?: boolean | null;
    observacoesAcompanhamentoPsicologico?: string | null;
    possuiAlergias?: boolean | null;
    alergias?: string | null;
}

export interface PerfilDesenvolvimentoRequest {
    desenvolvimento?: string | null;
    aspectosEmocionais?: string | null;
    aspectosCognitivos?: string | null;
    aspectosMotores?: string | null;
    comunicacao?: string | null;
    socializacao?: string | null;
    rotina?: string | null;
    sono?: string | null;
    alimentacao?: string | null;
}

export interface HistoricoMusicalRequest {
    possuiExperienciaMusical?: boolean | null;
    descricaoExperienciaMusical?: string | null;
    instrumentosPreferidos?: string | null;
    estilosMusicaisPreferidos?: string | null;
    musicasSignificativas?: string | null;
    possuiHipersensibilidadeSonora?: boolean | null;
    observacoesAuditivas?: string | null;
}

export interface ResponsavelAnamneseRequest {
    nome?: string | null;
    parentesco?: string | null;
    telefone?: string | null;
    email?: string | null;
}

/** Só preenchido quando o paciente é criança. */
export interface AnamneseInfantilRequest {
    gestacao?: string | null;
    parto?: string | null;
    desenvolvimentoMotor?: string | null;
    desenvolvimentoLinguagem?: string | null;
    desenvolvimentoSocial?: string | null;
    desenvolvimentoEscolar?: string | null;
    comportamentoCasa?: string | null;
    comportamentoEscola?: string | null;
    seletividadeAlimentar?: string | null;
    desfraldeConcluido?: boolean | null;
    usaFraldas?: boolean | null;
    interessesCrianca?: string | null;
    brincadeirasFavoritas?: string | null;
}

/**
 * Perfil clínico/terapêutico do paciente de Musicoterapia - opcional, só enviado na primeira
 * reserva do aluno (o backend ignora silenciosamente se o aluno já tiver uma, ver
 * AnamneseService.criarSeAusente).
 */
export interface AnamneseMusicoterapiaRequest {
    idade?: number | null;
    profissao?: string | null;
    escolaridade?: string | null;
    estadoCivil?: string | null;
    motivoEncaminhamento?: string | null;
    queixaPrincipal?: string | null;
    objetivosPaciente?: string | null;
    historicoClinico?: HistoricoClinicoRequest | null;
    perfilDesenvolvimento?: PerfilDesenvolvimentoRequest | null;
    historicoMusical?: HistoricoMusicalRequest | null;
    objetivosMusicoterapeuticos?: string | null;
    observacoesGerais?: string | null;
    responsavel?: ResponsavelAnamneseRequest | null;
    anamneseInfantil?: AnamneseInfantilRequest | null;
}

export interface HorarioRecorrenteRequest {
    diaSemana: EDiaSemana;
    hora: string;
}

export interface AgendamentoRequest {
    cliente: ClienteRequest;
    aluno: AlunoSelecaoRequest | null;
    categoria: ECategoriaServico;
    modalidade: EModalidadeServico | null;
    tipoContratacao: ETipoContratacao | null;
    instrumento: EInstrumento | null;
    tipoEvento: ETipoEvento | null;
    /** Qual pacote de evento (PrecoServico com categoria=EVENTO) o cliente escolheu. */
    eventoPrecoServicoId: number | null;
    /** Endereço completo de onde o evento vai acontecer - só para categoria EVENTO. */
    enderecoEvento: EnderecoRequest | null;
    /** Só exigido quando o pacote de evento escolhido não tem duração padrão cadastrada. */
    duracaoMinutosEvento: number | null;
    musicasObrigatorias?: string[] | null;
    /** Só para categoria MUSICOTERAPIA - opcional, ver AnamneseMusicoterapiaRequest. */
    anamnese?: AnamneseMusicoterapiaRequest | null;
    /** Obrigatório quando categoria == EVENTO ou tipoContratacao == AVULSO; proibido para pacotes. */
    data?: string | null;
    hora?: string | null;
    /** Obrigatório (1 a 3 itens) apenas quando tipoContratacao é PACOTE_4/PACOTE_12 - o backend gera todas as datas do pacote a partir daqui. */
    recorrencias?: HorarioRecorrenteRequest[] | null;
    observacoes?: string | null;
}

export interface AgendamentoResponse {
    id: number;
    codigoPublico: string;
    clienteId: number;
    clienteNome: string;
    clienteTelefone: string;
    enderecoResumo: string | null;
    alunoId: number | null;
    alunoNome: string | null;
    matriculaId: number | null;
    turmaId: number | null;
    categoria: ECategoriaServico;
    modalidade: EModalidadeServico | null;
    instrumento: EInstrumento | null;
    tipoEvento: ETipoEvento | null;
    local: string | null;
    pacoteEventoNome: string | null;
    musicasObrigatorias: string[];
    valorCobrado: number | null;
    duracaoMinutos: number;
    data: string;
    hora: string;
    status: EStatusAgendamento;
    dataHoraCheckIn: string | null;
    dataHoraFinalizacao: string | null;
    observacoes: string | null;
    dataHoraAgendamento: string;
}

/**
 * Retorno unificado de POST /api/agendamentos - sempre uma lista de agendamentos, mesmo quando é
 * só 1 (EVENTO ou AVULSO), para o frontend não precisar tratar dois formatos de resposta.
 * matriculaId é nulo só para EVENTO (não existe matrícula).
 */
export interface AgendamentoCriadoResponse {
    matriculaId: number | null;
    agendamentos: AgendamentoResponse[];
}

export interface TurmaRequest {
    categoria: ECategoriaServico;
    /** Obrigatório só quando categoria = AULA_INSTRUMENTO. */
    instrumento: EInstrumento | null;
    /** Dia da semana em que a turma acontece toda semana - o backend gera as datas de cada pacote a partir daqui. */
    diaSemana: EDiaSemana;
    hora: string;
    endereco: EnderecoRequest;
}

export interface Turma {
    id: number;
    codigo: string;
    categoria: ECategoriaServico;
    instrumento: EInstrumento | null;
    diaSemana: EDiaSemana;
    hora: string;
    local: string;
    /** Nulo só para turmas criadas antes do endereço estruturado existir. */
    endereco: EnderecoRequest | null;
    status: EStatusTurma;
    criadaEm: string;
}

export interface InscricaoTurmaRequest {
    cliente: ClienteRequest;
    aluno: AlunoSelecaoRequest;
    tipoContratacao: ETipoContratacao;
    observacoes?: string | null;
}

/** Uma linha do roster de uma turma - telefone/endereço são do responsável (Cliente), não do aluno. */
export interface AlunoDaTurma {
    id: number;
    nomeAluno: string;
    idade: number;
    endereco: string | null;
    telefone: string;
}

/** Turma + alunos matriculados nela - ver AdminVerTurmasPage. */
export interface TurmaComAlunos {
    id: number;
    codigo: string;
    categoria: ECategoriaServico;
    instrumento: EInstrumento | null;
    diaSemana: EDiaSemana;
    hora: string;
    local: string;
    status: EStatusTurma;
    alunos: AlunoDaTurma[];
}

export interface MusicoParceiro {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    instrumento: EInstrumento;
    criadoEm: string;
}

export interface MusicoParceiroRequest {
    nome: string;
    cpf: string;
    telefone: string;
    instrumento: EInstrumento;
}

export interface ApiErro {
    timestamp: string;
    status: number;
    erro: string;
    message: string;
    detalhes?: string[];
}
