import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AccordionItem } from "../ui/Accordion";
import type { AgendamentoFormValues } from "./formTypes";

function calcularIdade(dataIso: string): number | null {
    if (!dataIso) return null;
    const nascimento = new Date(dataIso);
    if (Number.isNaN(nascimento.getTime())) return null;

    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const aindaNaoFezAniversarioEsteAno =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
    if (aindaNaoFezAniversarioEsteAno) idade -= 1;
    return idade;
}

/**
 * Só é renderizado quando a categoria selecionada é MUSICOTERAPIA (ver AgendarPage). Gravada só
 * na primeira reserva do aluno - preenchimentos seguintes são ignorados pelo backend (ver
 * AnamneseService.criarSeAusente), então esta seção é sempre opcional aqui.
 *
 * Idade e dados do responsável recebem preenchimento automático a partir do que já foi digitado
 * em "Quem vai participar" e "Seus dados" - só quando o campo ainda está vazio, para nunca
 * sobrescrever uma edição manual do usuário.
 */
export function AnamneseFields() {
    const { register, watch, setValue } = useFormContext<AgendamentoFormValues>();
    const [salva, setSalva] = useState(false);

    const paraMim = watch("paraMim");
    const clienteNome = watch("clienteNome");
    const clienteTelefone = watch("clienteTelefone");
    const clienteDataNascimento = watch("clienteDataNascimento");
    const alunoDataNascimento = watch("alunoDataNascimento");
    const anamneseIdade = watch("anamneseIdade");
    const anamneseRespNome = watch("anamneseRespNome");
    const anamneseRespTelefone = watch("anamneseRespTelefone");

    const idadeCalculada = calcularIdade(paraMim ? clienteDataNascimento : alunoDataNascimento);
    const ehCrianca = idadeCalculada !== null && idadeCalculada < 12;

    useEffect(() => {
        if (idadeCalculada !== null && anamneseIdade === "") {
            setValue("anamneseIdade", idadeCalculada);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idadeCalculada]);

    useEffect(() => {
        if (paraMim) return;
        if (!anamneseRespNome && clienteNome) setValue("anamneseRespNome", clienteNome);
        if (!anamneseRespTelefone && clienteTelefone) setValue("anamneseRespTelefone", clienteTelefone);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paraMim, clienteNome, clienteTelefone]);

    const hcPossuiDiagnostico = watch("anamneseHcPossuiDiagnostico");
    const hcFazUsoMedicamentos = watch("anamneseHcFazUsoMedicamentos");
    const hcPossuiAcompanhamentoMedico = watch("anamneseHcPossuiAcompanhamentoMedico");
    const hcPossuiAcompanhamentoPsicologico = watch("anamneseHcPossuiAcompanhamentoPsicologico");
    const hcPossuiAlergias = watch("anamneseHcPossuiAlergias");
    const hmPossuiExperienciaMusical = watch("anamneseHmPossuiExperienciaMusical");
    const hmPossuiHipersensibilidadeSonora = watch("anamneseHmPossuiHipersensibilidadeSonora");

    if (salva) {
        return (
            <fieldset className="form-section anamnese-secao anamnese-salva">
                <legend>Anamnese de Musicoterapia</legend>
                <p className="anamnese-confirmacao">Anamnese preenchida - será enviada junto com o agendamento.</p>
                <button type="button" onClick={() => setSalva(false)}>
                    Editar anamnese
                </button>
            </fieldset>
        );
    }

    return (
        <fieldset className="form-section anamnese-secao">
            <legend>Anamnese de Musicoterapia</legend>
            <p className="aviso">
                Essas informações ajudam a preparar a primeira sessão - tudo aqui é opcional. Só é gravada uma vez: se o
                aluno já tiver uma anamnese registrada, este preenchimento é ignorado.
            </p>

            <label htmlFor="anamneseIdade">Idade</label>
            <input id="anamneseIdade" type="number" min={0} {...register("anamneseIdade")} />
            <small>Preenchida automaticamente a partir da data de nascimento informada acima.</small>

            <label htmlFor="anamneseProfissao">Profissão (se adulto)</label>
            <input id="anamneseProfissao" {...register("anamneseProfissao")} />

            <label htmlFor="anamneseEscolaridade">Escolaridade</label>
            <input id="anamneseEscolaridade" {...register("anamneseEscolaridade")} />

            <label htmlFor="anamneseEstadoCivil">Estado civil (se adulto)</label>
            <input id="anamneseEstadoCivil" {...register("anamneseEstadoCivil")} />

            <div className="accordion-grupo">
                <AccordionItem titulo="Motivo e objetivos">
                    <label htmlFor="anamneseMotivoEncaminhamento">Motivo do encaminhamento</label>
                    <textarea id="anamneseMotivoEncaminhamento" rows={2} {...register("anamneseMotivoEncaminhamento")} />

                    <label htmlFor="anamneseQueixaPrincipal">Queixa principal</label>
                    <textarea id="anamneseQueixaPrincipal" rows={2} {...register("anamneseQueixaPrincipal")} />

                    <label htmlFor="anamneseObjetivosPaciente">Objetivos do paciente/família</label>
                    <textarea id="anamneseObjetivosPaciente" rows={2} {...register("anamneseObjetivosPaciente")} />

                    <label htmlFor="anamneseObjetivosMusicoterapeuticos">Objetivos musicoterapêuticos</label>
                    <textarea id="anamneseObjetivosMusicoterapeuticos" rows={2} {...register("anamneseObjetivosMusicoterapeuticos")} />
                </AccordionItem>

                <AccordionItem titulo="Histórico clínico">
                    <label className="checkbox-label">
                        <input type="checkbox" {...register("anamneseHcPossuiDiagnostico")} />
                        Possui diagnóstico
                    </label>
                    {hcPossuiDiagnostico && <textarea rows={2} placeholder="Quais?" {...register("anamneseHcDiagnosticos")} />}

                    <label className="checkbox-label">
                        <input type="checkbox" {...register("anamneseHcFazUsoMedicamentos")} />
                        Faz uso de medicamentos
                    </label>
                    {hcFazUsoMedicamentos && <textarea rows={2} placeholder="Quais?" {...register("anamneseHcMedicamentos")} />}

                    <label className="checkbox-label">
                        <input type="checkbox" {...register("anamneseHcPossuiAcompanhamentoMedico")} />
                        Possui acompanhamento médico
                    </label>
                    {hcPossuiAcompanhamentoMedico && (
                        <textarea rows={2} placeholder="Quais especialidades?" {...register("anamneseHcEspecialidadesMedicas")} />
                    )}

                    <label className="checkbox-label">
                        <input type="checkbox" {...register("anamneseHcPossuiAcompanhamentoPsicologico")} />
                        Possui acompanhamento psicológico
                    </label>
                    {hcPossuiAcompanhamentoPsicologico && (
                        <textarea rows={2} placeholder="Observações" {...register("anamneseHcObservacoesAcompanhamentoPsicologico")} />
                    )}

                    <label className="checkbox-label">
                        <input type="checkbox" {...register("anamneseHcPossuiAlergias")} />
                        Possui alergias
                    </label>
                    {hcPossuiAlergias && <textarea rows={2} placeholder="Quais?" {...register("anamneseHcAlergias")} />}
                </AccordionItem>

                <AccordionItem titulo="Perfil de desenvolvimento">
                    <label htmlFor="anamnesePdDesenvolvimento">Desenvolvimento geral</label>
                    <textarea id="anamnesePdDesenvolvimento" rows={2} {...register("anamnesePdDesenvolvimento")} />

                    <label htmlFor="anamnesePdAspectosEmocionais">Aspectos emocionais</label>
                    <textarea id="anamnesePdAspectosEmocionais" rows={2} {...register("anamnesePdAspectosEmocionais")} />

                    <label htmlFor="anamnesePdAspectosCognitivos">Aspectos cognitivos</label>
                    <textarea id="anamnesePdAspectosCognitivos" rows={2} {...register("anamnesePdAspectosCognitivos")} />

                    <label htmlFor="anamnesePdAspectosMotores">Aspectos motores</label>
                    <textarea id="anamnesePdAspectosMotores" rows={2} {...register("anamnesePdAspectosMotores")} />

                    <label htmlFor="anamnesePdComunicacao">Comunicação</label>
                    <textarea id="anamnesePdComunicacao" rows={2} {...register("anamnesePdComunicacao")} />

                    <label htmlFor="anamnesePdSocializacao">Socialização</label>
                    <textarea id="anamnesePdSocializacao" rows={2} {...register("anamnesePdSocializacao")} />

                    <label htmlFor="anamnesePdRotina">Rotina</label>
                    <textarea id="anamnesePdRotina" rows={2} {...register("anamnesePdRotina")} />

                    <label htmlFor="anamnesePdSono">Sono</label>
                    <textarea id="anamnesePdSono" rows={2} {...register("anamnesePdSono")} />

                    <label htmlFor="anamnesePdAlimentacao">Alimentação</label>
                    <textarea id="anamnesePdAlimentacao" rows={2} {...register("anamnesePdAlimentacao")} />
                </AccordionItem>

                <AccordionItem titulo="Histórico musical">
                    <label className="checkbox-label">
                        <input type="checkbox" {...register("anamneseHmPossuiExperienciaMusical")} />
                        Já teve experiência musical
                    </label>
                    {hmPossuiExperienciaMusical && (
                        <textarea rows={2} placeholder="Descreva" {...register("anamneseHmDescricaoExperienciaMusical")} />
                    )}

                    <label htmlFor="anamneseHmInstrumentosPreferidos">Instrumentos preferidos</label>
                    <input id="anamneseHmInstrumentosPreferidos" {...register("anamneseHmInstrumentosPreferidos")} />

                    <label htmlFor="anamneseHmEstilosMusicaisPreferidos">Estilos musicais preferidos</label>
                    <input id="anamneseHmEstilosMusicaisPreferidos" {...register("anamneseHmEstilosMusicaisPreferidos")} />

                    <label htmlFor="anamneseHmMusicasSignificativas">Músicas significativas</label>
                    <input id="anamneseHmMusicasSignificativas" {...register("anamneseHmMusicasSignificativas")} />

                    <label className="checkbox-label">
                        <input type="checkbox" {...register("anamneseHmPossuiHipersensibilidadeSonora")} />
                        Possui hipersensibilidade sonora
                    </label>
                    {hmPossuiHipersensibilidadeSonora && (
                        <textarea rows={2} placeholder="Observações" {...register("anamneseHmObservacoesAuditivas")} />
                    )}
                </AccordionItem>

                <AccordionItem titulo="Responsável" subtitulo="Nome e telefone preenchidos automaticamente a partir dos seus dados">
                    <label htmlFor="anamneseRespNome">Nome do responsável</label>
                    <input id="anamneseRespNome" {...register("anamneseRespNome")} />

                    <label htmlFor="anamneseRespParentesco">Parentesco</label>
                    <input id="anamneseRespParentesco" {...register("anamneseRespParentesco")} />

                    <label htmlFor="anamneseRespTelefone">Telefone</label>
                    <input id="anamneseRespTelefone" {...register("anamneseRespTelefone")} />

                    <label htmlFor="anamneseRespEmail">E-mail</label>
                    <input id="anamneseRespEmail" type="email" {...register("anamneseRespEmail")} />
                </AccordionItem>

                {ehCrianca && (
                    <AccordionItem titulo="Dados da infância" subtitulo="Só para pacientes crianças">
                        <label htmlFor="anamneseAiGestacao">Gestação</label>
                        <textarea id="anamneseAiGestacao" rows={2} {...register("anamneseAiGestacao")} />

                        <label htmlFor="anamneseAiParto">Parto</label>
                        <textarea id="anamneseAiParto" rows={2} {...register("anamneseAiParto")} />

                        <label htmlFor="anamneseAiDesenvolvimentoMotor">Desenvolvimento motor</label>
                        <textarea id="anamneseAiDesenvolvimentoMotor" rows={2} {...register("anamneseAiDesenvolvimentoMotor")} />

                        <label htmlFor="anamneseAiDesenvolvimentoLinguagem">Desenvolvimento da linguagem</label>
                        <textarea id="anamneseAiDesenvolvimentoLinguagem" rows={2} {...register("anamneseAiDesenvolvimentoLinguagem")} />

                        <label htmlFor="anamneseAiDesenvolvimentoSocial">Desenvolvimento social</label>
                        <textarea id="anamneseAiDesenvolvimentoSocial" rows={2} {...register("anamneseAiDesenvolvimentoSocial")} />

                        <label htmlFor="anamneseAiDesenvolvimentoEscolar">Desenvolvimento escolar</label>
                        <textarea id="anamneseAiDesenvolvimentoEscolar" rows={2} {...register("anamneseAiDesenvolvimentoEscolar")} />

                        <label htmlFor="anamneseAiComportamentoCasa">Comportamento em casa</label>
                        <textarea id="anamneseAiComportamentoCasa" rows={2} {...register("anamneseAiComportamentoCasa")} />

                        <label htmlFor="anamneseAiComportamentoEscola">Comportamento na escola</label>
                        <textarea id="anamneseAiComportamentoEscola" rows={2} {...register("anamneseAiComportamentoEscola")} />

                        <label htmlFor="anamneseAiSeletividadeAlimentar">Seletividade alimentar</label>
                        <input id="anamneseAiSeletividadeAlimentar" {...register("anamneseAiSeletividadeAlimentar")} />

                        <label className="checkbox-label">
                            <input type="checkbox" {...register("anamneseAiDesfraldeConcluido")} />
                            Desfralde concluído
                        </label>

                        <label className="checkbox-label">
                            <input type="checkbox" {...register("anamneseAiUsaFraldas")} />
                            Usa fraldas
                        </label>

                        <label htmlFor="anamneseAiInteressesCrianca">Interesses da criança</label>
                        <input id="anamneseAiInteressesCrianca" {...register("anamneseAiInteressesCrianca")} />

                        <label htmlFor="anamneseAiBrincadeirasFavoritas">Brincadeiras favoritas</label>
                        <input id="anamneseAiBrincadeirasFavoritas" {...register("anamneseAiBrincadeirasFavoritas")} />
                    </AccordionItem>
                )}
            </div>

            <label htmlFor="anamneseObservacoesGerais">Observações gerais</label>
            <textarea id="anamneseObservacoesGerais" rows={2} {...register("anamneseObservacoesGerais")} />

            <button type="button" className="botao-secundario" onClick={() => setSalva(true)}>
                Salvar anamnese
            </button>
        </fieldset>
    );
}
