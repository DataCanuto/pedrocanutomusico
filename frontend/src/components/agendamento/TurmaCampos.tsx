import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { extrairMensagemErro } from "../../services/api";
import { buscarTurmaPorCodigo } from "../../services/turmaService";
import { montarLinkWhatsApp } from "../../services/whatsapp";
import { INSTRUMENTO_LABELS } from "../../types/labels";
import type { AgendamentoFormValues } from "./formTypes";

/**
 * Aula em grupo não tem data/hora livre - acontece dentro de uma Turma já marcada pelo
 * professor (ver TurmaService no backend). Em vez de uma página separada, a matrícula na turma
 * acontece no mesmo formulário de agendamento: o campo abaixo busca a turma pelo código e, se
 * encontrada, mostra data/hora/local para conferência; se a cliente não tiver o código, o botão
 * de WhatsApp chama o professor.
 */
export function TurmaCampos() {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const codigoTurma = watch("codigoTurma");
    const codigoParecCompleto = codigoTurma.trim().length >= 6;

    const turmaQuery = useQuery({
        queryKey: ["turma", codigoTurma],
        queryFn: () => buscarTurmaPorCodigo(codigoTurma.trim()),
        enabled: codigoParecCompleto,
        retry: false,
    });

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
                    <p>Data: {turmaQuery.data.data} às {turmaQuery.data.hora}</p>
                    <p>Local: {turmaQuery.data.local}</p>
                    {turmaQuery.data.instrumento && <p>Instrumento: {INSTRUMENTO_LABELS[turmaQuery.data.instrumento]}</p>}
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
