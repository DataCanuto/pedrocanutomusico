import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { extrairMensagemErro } from "../../services/api";
import { buscarTurmaPorCodigo } from "../../services/turmaService";
import { montarLinkWhatsApp } from "../../services/whatsapp";
import { DIA_SEMANA_LABELS, INSTRUMENTO_LABELS, QUANTIDADE_AULAS } from "../../types/labels";
import { gerarPreviewDeDatas } from "../../utils/recorrencia";
import type { AgendamentoFormValues } from "./formTypes";
import type { ETipoContratacao } from "../../types/domain";

/**
 * Aula em grupo não tem data/hora livre - acontece dentro de uma Turma já marcada pelo
 * professor (ver TurmaService no backend), com um dia da semana + horário recorrentes. Em vez de
 * uma página separada, a matrícula na turma acontece no mesmo formulário de agendamento: o campo
 * abaixo busca a turma pelo código e, se encontrada, mostra dia/hora/local para conferência e um
 * preview das datas que serão geradas para o pacote já escolhido em ServicoFields; se a cliente
 * não tiver o código, o botão de WhatsApp chama o professor.
 */
export function TurmaCampos() {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const codigoTurma = watch("codigoTurma");
    const tipoContratacao = watch("tipoContratacao");
    const codigoParecCompleto = codigoTurma.trim().length >= 6;

    const turmaQuery = useQuery({
        queryKey: ["turma", codigoTurma],
        queryFn: () => buscarTurmaPorCodigo(codigoTurma.trim()),
        enabled: codigoParecCompleto,
        retry: false,
    });

    const quantidadeAulas = tipoContratacao ? QUANTIDADE_AULAS[tipoContratacao as ETipoContratacao] : 0;
    const preview =
        turmaQuery.isSuccess && quantidadeAulas > 0
            ? gerarPreviewDeDatas([{ diaSemana: turmaQuery.data.diaSemana, hora: turmaQuery.data.hora }], quantidadeAulas, new Date())
            : [];

    return (
        <div className="form-section">
            <label htmlFor="codigoTurma">Código da turma</label>
            <input
                id="codigoTurma"
                placeholder="Ex.: ABU557"
                maxLength={10}
                {...register("codigoTurma", { required: "Informe o código da turma" })}
            />
            {errors.codigoTurma && <span className="erro-campo">{errors.codigoTurma.message}</span>}

            {codigoParecCompleto && turmaQuery.isFetching && <p>Buscando turma...</p>}

            {turmaQuery.isSuccess && (
                <div className="detalhe-pacote">
                    <p>
                        Toda {DIA_SEMANA_LABELS[turmaQuery.data.diaSemana]} às {turmaQuery.data.hora}
                    </p>
                    <p>Local: {turmaQuery.data.local}</p>
                    {turmaQuery.data.instrumento && <p>Instrumento: {INSTRUMENTO_LABELS[turmaQuery.data.instrumento]}</p>}

                    {preview.length > 0 && (
                        <>
                            <p>Datas previstas para o pacote escolhido:</p>
                            <ul>
                                {preview.map((slot, i) => (
                                    <li key={i}>
                                        {slot.data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })} às{" "}
                                        {slot.hora}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {codigoParecCompleto && turmaQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(turmaQuery.error, "Turma não encontrada para esse código.")}</p>
            )}

            <p className="aviso">
                Não tem o código da turma?{" "}
                <a href={montarLinkWhatsApp("Olá! Gostaria de saber se há uma turma disponível.")} target="_blank" rel="noreferrer">
                    Fale com a gente no WhatsApp
                </a>
                .
            </p>
        </div>
    );
}
