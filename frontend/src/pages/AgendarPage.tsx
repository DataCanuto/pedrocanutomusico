import { useMutation, useQuery } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { AlunoFields } from "../components/agendamento/AlunoFields";
import { AnamneseFields } from "../components/agendamento/AnamneseFields";
import { ClienteFields } from "../components/agendamento/ClienteFields";
import {
    categoriaEhDeAula,
    ehGrupoDeAula,
    ehPacoteRecorrente,
    valoresIniciais,
    type AgendamentoFormValues,
} from "../components/agendamento/formTypes";
import { HorarioFields } from "../components/agendamento/HorarioFields";
import { ServicoFields } from "../components/agendamento/ServicoFields";
import { extrairMensagemErro } from "../services/api";
import { criarAgendamento } from "../services/agendamentoService";
import { listarPrecos } from "../services/precoService";
import { inscreverEmTurma } from "../services/turmaService";
import { montarLinkWhatsApp } from "../services/whatsapp";
import type {
    AgendamentoCriadoResponse,
    AgendamentoRequest,
    AnamneseMusicoterapiaRequest,
    ECategoriaServico,
    EInstrumento,
    EModalidadeServico,
    ESexo,
    ETipoContratacao,
    ETipoEvento,
    InscricaoTurmaRequest,
} from "../types/domain";

/**
 * paraMim=true: quem participa é o próprio cliente - a tela não pede nome/data de nascimento
 * de novo (ver AlunoFields/ClienteFields), então o request reaproveita os dados do cliente já
 * coletados. O backend continua recebendo dadosAluno preenchido normalmente.
 */
function dadosAlunoDoFormulario(v: AgendamentoFormValues) {
    return {
        nome: v.paraMim ? v.clienteNome : v.alunoNome,
        dataNascimento: v.paraMim ? v.clienteDataNascimento : v.alunoDataNascimento,
        sexo: (v.alunoSexo || undefined) as ESexo | undefined,
        observacoes: v.alunoObservacoes || undefined,
    };
}

/** Endereço é sempre exigido pelo backend - todo request que cria/atualiza um Cliente precisa de pelo menos um. */
function clienteDoFormulario(v: AgendamentoFormValues) {
    return {
        nome: v.clienteNome,
        telefone: v.clienteTelefone,
        email: v.clienteEmail || undefined,
        dataNascimento: v.clienteDataNascimento || undefined,
        enderecos: [
            {
                cep: v.clienteEnderecoCep,
                rua: v.clienteEnderecoRua,
                numero: v.clienteEnderecoNumero,
                bairro: v.clienteEnderecoBairro,
                cidade: v.clienteEnderecoCidade,
                estado: v.clienteEnderecoEstado,
                complemento: v.clienteEnderecoComplemento || undefined,
            },
        ],
    };
}

/** Reflete AnamneseMusicoterapiaRequestDTO (backend) - só enviado para categoria MUSICOTERAPIA. */
function anamneseDoFormulario(v: AgendamentoFormValues): AnamneseMusicoterapiaRequest {
    return {
        idade: v.anamneseIdade !== "" ? Number(v.anamneseIdade) : undefined,
        profissao: v.anamneseProfissao || undefined,
        escolaridade: v.anamneseEscolaridade || undefined,
        estadoCivil: v.anamneseEstadoCivil || undefined,
        motivoEncaminhamento: v.anamneseMotivoEncaminhamento || undefined,
        queixaPrincipal: v.anamneseQueixaPrincipal || undefined,
        objetivosPaciente: v.anamneseObjetivosPaciente || undefined,
        historicoClinico: {
            possuiDiagnostico: v.anamneseHcPossuiDiagnostico,
            diagnosticos: v.anamneseHcDiagnosticos || undefined,
            fazUsoMedicamentos: v.anamneseHcFazUsoMedicamentos,
            medicamentos: v.anamneseHcMedicamentos || undefined,
            possuiAcompanhamentoMedico: v.anamneseHcPossuiAcompanhamentoMedico,
            especialidadesMedicas: v.anamneseHcEspecialidadesMedicas || undefined,
            possuiAcompanhamentoPsicologico: v.anamneseHcPossuiAcompanhamentoPsicologico,
            observacoesAcompanhamentoPsicologico: v.anamneseHcObservacoesAcompanhamentoPsicologico || undefined,
            possuiAlergias: v.anamneseHcPossuiAlergias,
            alergias: v.anamneseHcAlergias || undefined,
        },
        perfilDesenvolvimento: {
            desenvolvimento: v.anamnesePdDesenvolvimento || undefined,
            aspectosEmocionais: v.anamnesePdAspectosEmocionais || undefined,
            aspectosCognitivos: v.anamnesePdAspectosCognitivos || undefined,
            aspectosMotores: v.anamnesePdAspectosMotores || undefined,
            comunicacao: v.anamnesePdComunicacao || undefined,
            socializacao: v.anamnesePdSocializacao || undefined,
            rotina: v.anamnesePdRotina || undefined,
            sono: v.anamnesePdSono || undefined,
            alimentacao: v.anamnesePdAlimentacao || undefined,
        },
        historicoMusical: {
            possuiExperienciaMusical: v.anamneseHmPossuiExperienciaMusical,
            descricaoExperienciaMusical: v.anamneseHmDescricaoExperienciaMusical || undefined,
            instrumentosPreferidos: v.anamneseHmInstrumentosPreferidos || undefined,
            estilosMusicaisPreferidos: v.anamneseHmEstilosMusicaisPreferidos || undefined,
            musicasSignificativas: v.anamneseHmMusicasSignificativas || undefined,
            possuiHipersensibilidadeSonora: v.anamneseHmPossuiHipersensibilidadeSonora,
            observacoesAuditivas: v.anamneseHmObservacoesAuditivas || undefined,
        },
        objetivosMusicoterapeuticos: v.anamneseObjetivosMusicoterapeuticos || undefined,
        observacoesGerais: v.anamneseObservacoesGerais || undefined,
        responsavel: {
            nome: v.anamneseRespNome || undefined,
            parentesco: v.anamneseRespParentesco || undefined,
            telefone: v.anamneseRespTelefone || undefined,
            email: v.anamneseRespEmail || undefined,
        },
        anamneseInfantil: {
            gestacao: v.anamneseAiGestacao || undefined,
            parto: v.anamneseAiParto || undefined,
            desenvolvimentoMotor: v.anamneseAiDesenvolvimentoMotor || undefined,
            desenvolvimentoLinguagem: v.anamneseAiDesenvolvimentoLinguagem || undefined,
            desenvolvimentoSocial: v.anamneseAiDesenvolvimentoSocial || undefined,
            desenvolvimentoEscolar: v.anamneseAiDesenvolvimentoEscolar || undefined,
            comportamentoCasa: v.anamneseAiComportamentoCasa || undefined,
            comportamentoEscola: v.anamneseAiComportamentoEscola || undefined,
            seletividadeAlimentar: v.anamneseAiSeletividadeAlimentar || undefined,
            desfraldeConcluido: v.anamneseAiDesfraldeConcluido,
            usaFraldas: v.anamneseAiUsaFraldas,
            interessesCrianca: v.anamneseAiInteressesCrianca || undefined,
            brincadeirasFavoritas: v.anamneseAiBrincadeirasFavoritas || undefined,
        },
    };
}

function paraAgendamentoRequest(v: AgendamentoFormValues): AgendamentoRequest {
    const ehAula = categoriaEhDeAula(v.categoria);
    const ehEvento = v.categoria === "EVENTO";
    const ehMusicoterapia = v.categoria === "MUSICOTERAPIA";
    const ehPacote = ehPacoteRecorrente(v.categoria, v.tipoContratacao);

    return {
        cliente: clienteDoFormulario(v),
        aluno: ehAula
            ? {
                  paraMim: v.paraMim,
                  dadosAluno: dadosAlunoDoFormulario(v),
              }
            : null,
        categoria: v.categoria as ECategoriaServico,
        modalidade: ehAula ? (v.modalidade as EModalidadeServico) : null,
        tipoContratacao: ehAula ? (v.tipoContratacao as ETipoContratacao) : null,
        instrumento: v.categoria === "AULA_INSTRUMENTO" ? (v.instrumento as EInstrumento) : null,
        tipoEvento: ehEvento ? (v.tipoEvento as ETipoEvento) : null,
        eventoPrecoServicoId: ehEvento && v.eventoPrecoServicoId !== "" ? Number(v.eventoPrecoServicoId) : null,
        // O formulário só pede um endereço (ver ServicoFields) - para EVENTO, ele vale tanto como
        // endereço do cliente quanto como local do evento.
        enderecoEvento: ehEvento
            ? {
                  cep: v.clienteEnderecoCep,
                  rua: v.clienteEnderecoRua,
                  numero: v.clienteEnderecoNumero,
                  bairro: v.clienteEnderecoBairro,
                  cidade: v.clienteEnderecoCidade,
                  estado: v.clienteEnderecoEstado,
                  complemento: v.clienteEnderecoComplemento || undefined,
              }
            : null,
        duracaoMinutosEvento: ehEvento && v.duracaoMinutosEvento !== "" ? Number(v.duracaoMinutosEvento) : null,
        musicasObrigatorias: ehEvento
            ? v.musicasObrigatorias
                  .split("\n")
                  .map((musica) => musica.trim())
                  .filter((musica) => musica.length > 0)
            : undefined,
        anamnese: ehMusicoterapia ? anamneseDoFormulario(v) : null,
        data: ehPacote ? null : v.data,
        hora: ehPacote ? null : v.hora,
        recorrencias: ehPacote
            ? v.recorrencias
                  .filter((r) => r.diaSemana !== "" && r.hora !== "")
                  .map((r) => ({ diaSemana: r.diaSemana as Exclude<typeof r.diaSemana, "">, hora: r.hora }))
            : null,
        observacoes: v.observacoes || undefined,
    };
}

function paraInscricaoTurmaRequest(v: AgendamentoFormValues): InscricaoTurmaRequest {
    return {
        cliente: clienteDoFormulario(v),
        aluno: {
            paraMim: v.paraMim,
            dadosAluno: dadosAlunoDoFormulario(v),
        },
        tipoContratacao: v.tipoContratacao as ETipoContratacao,
        observacoes: v.observacoes || undefined,
    };
}

export function AgendarPage() {
    const precosQuery = useQuery({ queryKey: ["precos"], queryFn: listarPrecos });

    const form = useForm<AgendamentoFormValues>({ defaultValues: valoresIniciais });
    const { watch } = form;
    const categoria = watch("categoria");
    const modalidade = watch("modalidade");
    const ehGrupo = ehGrupoDeAula(categoria, modalidade);

    const mutation = useMutation({
        mutationFn: async (v: AgendamentoFormValues): Promise<AgendamentoCriadoResponse> => {
            if (ehGrupoDeAula(v.categoria, v.modalidade)) {
                const agendamento = await inscreverEmTurma(v.codigoTurma.trim(), paraInscricaoTurmaRequest(v));
                return { matriculaId: agendamento.matriculaId, agendamentos: [agendamento] };
            }
            return criarAgendamento(paraAgendamentoRequest(v));
        },
    });

    if (mutation.isSuccess) {
        const { agendamentos } = mutation.data;
        const primeiro = agendamentos[0];
        const mensagem =
            agendamentos.length > 1
                ? `Olá! Acabei de agendar ${primeiro.categoria} (${agendamentos.length} aulas), a primeira para ${primeiro.data} às ${primeiro.hora}.`
                : `Olá! Acabei de agendar ${primeiro.categoria} para ${primeiro.data} às ${primeiro.hora}.`;
        return (
            <div className="pagina-agendar confirmacao">
                <h1>Agendamento recebido!</h1>
                {agendamentos.length === 1 ? (
                    <p>
                        Combinado para <strong>{primeiro.data}</strong> às <strong>{primeiro.hora}</strong>.
                    </p>
                ) : (
                    <>
                        <p>Combinadas as seguintes aulas:</p>
                        <ul>
                            {agendamentos.map((a) => (
                                <li key={a.id}>
                                    <strong>{a.data}</strong> às <strong>{a.hora}</strong>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <p>Confirme os detalhes com a gente no WhatsApp:</p>
                <a className="botao-whatsapp" href={montarLinkWhatsApp(mensagem)} target="_blank" rel="noreferrer">
                    Continuar no WhatsApp
                </a>
            </div>
        );
    }

    return (
        <div className="pagina-agendar">
            <h1>Agendar</h1>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
                    <ServicoFields precos={precosQuery.data ?? []} />
                    {categoriaEhDeAula(categoria) && <AlunoFields />}
                    <ClienteFields />
                    {categoria === "MUSICOTERAPIA" && <AnamneseFields />}
                    {!ehGrupo && <HorarioFields />}

                    {mutation.isError && (
                        <p className="erro-campo">{extrairMensagemErro(mutation.error, "Não foi possível agendar. Tente novamente.")}</p>
                    )}

                    <button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Agendando..." : "Agendar agora"}
                    </button>
                </form>
            </FormProvider>
        </div>
    );
}
