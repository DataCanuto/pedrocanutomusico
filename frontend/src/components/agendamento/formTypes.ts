import type {
    ECategoriaServico,
    EDiaSemana,
    EInstrumento,
    EModalidadeServico,
    ESexo,
    ETipoContratacao,
    ETipoEvento,
} from "../../types/domain";

/** Forma "achatada" usada pelo react-hook-form; AgendarPage converte isso em AgendamentoRequest no submit. */
export interface AgendamentoFormValues {
    categoria: ECategoriaServico | "";
    modalidade: EModalidadeServico | "";
    tipoContratacao: ETipoContratacao | "";
    /** Só para modalidade GRUPO: aula em grupo acontece dentro de uma Turma com data/hora/local já fixados pelo professor. */
    codigoTurma: string;
    instrumento: EInstrumento | "";
    tipoEvento: ETipoEvento | "";
    eventoPrecoServicoId: number | "";
    duracaoMinutosEvento: number | "";
    /** Uma música por linha - convertido em lista no submit. */
    musicasObrigatorias: string;

    clienteNome: string;
    clienteTelefone: string;
    clienteEmail: string;
    clienteDataNascimento: string;
    /** Endereço do cliente - sempre exigido pelo backend. Para EVENTO, é reaproveitado como endereço do evento (ver AgendarPage). */
    clienteEnderecoCep: string;
    clienteEnderecoRua: string;
    clienteEnderecoNumero: string;
    clienteEnderecoBairro: string;
    clienteEnderecoCidade: string;
    clienteEnderecoEstado: string;
    clienteEnderecoComplemento: string;

    paraMim: boolean;
    alunoNome: string;
    alunoDataNascimento: string;
    alunoSexo: ESexo | "";
    alunoObservacoes: string;

    // Anamnese de Musicoterapia (só para categoria MUSICOTERAPIA - ver AnamneseFields). Tudo
    // opcional, espelhando AnamneseMusicoterapiaRequest achatado para o react-hook-form.
    anamneseIdade: number | "";
    anamneseProfissao: string;
    anamneseEscolaridade: string;
    anamneseEstadoCivil: string;
    anamneseMotivoEncaminhamento: string;
    anamneseQueixaPrincipal: string;
    anamneseObjetivosPaciente: string;
    anamneseObjetivosMusicoterapeuticos: string;
    anamneseObservacoesGerais: string;

    anamneseHcPossuiDiagnostico: boolean;
    anamneseHcDiagnosticos: string;
    anamneseHcFazUsoMedicamentos: boolean;
    anamneseHcMedicamentos: string;
    anamneseHcPossuiAcompanhamentoMedico: boolean;
    anamneseHcEspecialidadesMedicas: string;
    anamneseHcPossuiAcompanhamentoPsicologico: boolean;
    anamneseHcObservacoesAcompanhamentoPsicologico: string;
    anamneseHcPossuiAlergias: boolean;
    anamneseHcAlergias: string;

    anamnesePdDesenvolvimento: string;
    anamnesePdAspectosEmocionais: string;
    anamnesePdAspectosCognitivos: string;
    anamnesePdAspectosMotores: string;
    anamnesePdComunicacao: string;
    anamnesePdSocializacao: string;
    anamnesePdRotina: string;
    anamnesePdSono: string;
    anamnesePdAlimentacao: string;

    anamneseHmPossuiExperienciaMusical: boolean;
    anamneseHmDescricaoExperienciaMusical: string;
    anamneseHmInstrumentosPreferidos: string;
    anamneseHmEstilosMusicaisPreferidos: string;
    anamneseHmMusicasSignificativas: string;
    anamneseHmPossuiHipersensibilidadeSonora: boolean;
    anamneseHmObservacoesAuditivas: string;

    /** Nome/telefone recebem preenchimento automático a partir do cliente (ver AnamneseFields). */
    anamneseRespNome: string;
    anamneseRespParentesco: string;
    anamneseRespTelefone: string;
    anamneseRespEmail: string;

    anamneseAiGestacao: string;
    anamneseAiParto: string;
    anamneseAiDesenvolvimentoMotor: string;
    anamneseAiDesenvolvimentoLinguagem: string;
    anamneseAiDesenvolvimentoSocial: string;
    anamneseAiDesenvolvimentoEscolar: string;
    anamneseAiComportamentoCasa: string;
    anamneseAiComportamentoEscola: string;
    anamneseAiSeletividadeAlimentar: string;
    anamneseAiDesfraldeConcluido: boolean;
    anamneseAiUsaFraldas: boolean;
    anamneseAiInteressesCrianca: string;
    anamneseAiBrincadeirasFavoritas: string;

    /** Só para tipoContratacao AVULSO ou categoria EVENTO - ver HorarioFields. */
    data: string;
    hora: string;
    /** Só para pacotes (PACOTE_4/PACOTE_12) - 1 a 3 combinações de dia da semana + horário; o backend gera as datas a partir daqui. */
    recorrencias: { diaSemana: EDiaSemana | ""; hora: string }[];
    observacoes: string;
}

export const valoresIniciais: AgendamentoFormValues = {
    categoria: "",
    modalidade: "",
    tipoContratacao: "",
    codigoTurma: "",
    instrumento: "",
    tipoEvento: "",
    eventoPrecoServicoId: "",
    duracaoMinutosEvento: "",
    musicasObrigatorias: "",
    clienteNome: "",
    clienteTelefone: "",
    clienteEmail: "",
    clienteDataNascimento: "",
    clienteEnderecoCep: "",
    clienteEnderecoRua: "",
    clienteEnderecoNumero: "",
    clienteEnderecoBairro: "",
    clienteEnderecoCidade: "",
    clienteEnderecoEstado: "",
    clienteEnderecoComplemento: "",
    paraMim: false,
    alunoNome: "",
    alunoDataNascimento: "",
    alunoSexo: "",
    alunoObservacoes: "",

    anamneseIdade: "",
    anamneseProfissao: "",
    anamneseEscolaridade: "",
    anamneseEstadoCivil: "",
    anamneseMotivoEncaminhamento: "",
    anamneseQueixaPrincipal: "",
    anamneseObjetivosPaciente: "",
    anamneseObjetivosMusicoterapeuticos: "",
    anamneseObservacoesGerais: "",

    anamneseHcPossuiDiagnostico: false,
    anamneseHcDiagnosticos: "",
    anamneseHcFazUsoMedicamentos: false,
    anamneseHcMedicamentos: "",
    anamneseHcPossuiAcompanhamentoMedico: false,
    anamneseHcEspecialidadesMedicas: "",
    anamneseHcPossuiAcompanhamentoPsicologico: false,
    anamneseHcObservacoesAcompanhamentoPsicologico: "",
    anamneseHcPossuiAlergias: false,
    anamneseHcAlergias: "",

    anamnesePdDesenvolvimento: "",
    anamnesePdAspectosEmocionais: "",
    anamnesePdAspectosCognitivos: "",
    anamnesePdAspectosMotores: "",
    anamnesePdComunicacao: "",
    anamnesePdSocializacao: "",
    anamnesePdRotina: "",
    anamnesePdSono: "",
    anamnesePdAlimentacao: "",

    anamneseHmPossuiExperienciaMusical: false,
    anamneseHmDescricaoExperienciaMusical: "",
    anamneseHmInstrumentosPreferidos: "",
    anamneseHmEstilosMusicaisPreferidos: "",
    anamneseHmMusicasSignificativas: "",
    anamneseHmPossuiHipersensibilidadeSonora: false,
    anamneseHmObservacoesAuditivas: "",

    anamneseRespNome: "",
    anamneseRespParentesco: "",
    anamneseRespTelefone: "",
    anamneseRespEmail: "",

    anamneseAiGestacao: "",
    anamneseAiParto: "",
    anamneseAiDesenvolvimentoMotor: "",
    anamneseAiDesenvolvimentoLinguagem: "",
    anamneseAiDesenvolvimentoSocial: "",
    anamneseAiDesenvolvimentoEscolar: "",
    anamneseAiComportamentoCasa: "",
    anamneseAiComportamentoEscola: "",
    anamneseAiSeletividadeAlimentar: "",
    anamneseAiDesfraldeConcluido: false,
    anamneseAiUsaFraldas: false,
    anamneseAiInteressesCrianca: "",
    anamneseAiBrincadeirasFavoritas: "",

    data: "",
    hora: "",
    recorrencias: [{ diaSemana: "", hora: "" }],
    observacoes: "",
};

export function categoriaEhDeAula(categoria: ECategoriaServico | ""): boolean {
    return categoria !== "" && categoria !== "EVENTO";
}

/** Aula em grupo não tem horário livre - acontece dentro de uma Turma com data/hora/local fixados pelo professor. */
export function ehGrupoDeAula(categoria: ECategoriaServico | "", modalidade: EModalidadeServico | ""): boolean {
    return categoriaEhDeAula(categoria) && modalidade === "GRUPO";
}

/** PACOTE_4/PACOTE_12 (ou qualquer coisa != AVULSO): o cliente escolhe dia(s) da semana + horário em vez de uma data única - ver HorarioFields. */
export function ehPacoteRecorrente(categoria: ECategoriaServico | "", tipoContratacao: ETipoContratacao | ""): boolean {
    return categoriaEhDeAula(categoria) && tipoContratacao !== "" && tipoContratacao !== "AVULSO";
}
