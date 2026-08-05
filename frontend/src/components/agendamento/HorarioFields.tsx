import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useController, useFieldArray, useFormContext, useWatch, type Control } from "react-hook-form";
import { GradeDeHorarios } from "../ui/GradeDeHorarios";
import { listarHorariosOcupados } from "../../services/agendamentoService";
import type { EDiaSemana, ETipoContratacao, PrecoServico } from "../../types/domain";
import { DIA_SEMANA_LABELS, QUANTIDADE_AULAS } from "../../types/labels";
import { slotIndisponivel } from "../../utils/disponibilidade";
import { gerarSlotsDeHorario } from "../../utils/horarios";
import { cabeNaJanela, gerarPreviewDeDatas, proximaOcorrenciaISO } from "../../utils/recorrencia";
import { ehPacoteRecorrente, resolverDuracaoMinutos, type AgendamentoFormValues } from "./formTypes";

const SLOTS = gerarSlotsDeHorario();
const DIAS_SEMANA = Object.keys(DIA_SEMANA_LABELS) as EDiaSemana[];
const MAX_RECORRENCIAS = 3;

export function HorarioFields({ precos }: { precos: PrecoServico[] }) {
    const {
        register,
        control,
        watch,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const categoria = watch("categoria");
    const modalidade = watch("modalidade");
    const tipoContratacao = watch("tipoContratacao");
    const eventoPrecoServicoId = watch("eventoPrecoServicoId");
    const duracaoMinutosEvento = watch("duracaoMinutosEvento");
    const data = watch("data");
    const recorrencias = watch("recorrencias");
    const { fields, append, remove } = useFieldArray({ control, name: "recorrencias" });
    const { field: campoHora } = useController({ control, name: "hora", rules: { required: "Selecione o horário" } });

    const duracaoMinutos = resolverDuracaoMinutos(
        { categoria, modalidade, tipoContratacao, eventoPrecoServicoId, duracaoMinutosEvento },
        precos,
    );
    // Só busca com data preenchida; disabled evita round-trip para um parâmetro vazio.
    const ocupadosQuery = useQuery({
        queryKey: ["horarios-ocupados", data],
        queryFn: () => listarHorariosOcupados(data),
        enabled: data !== "",
    });
    const ocupados = data !== "" ? (ocupadosQuery.data ?? []) : [];

    // Se a data/duração mudar e o horário já escolhido deixar de caber, limpa a seleção em vez
    // de deixar o formulário guardar (sem o cliente perceber) um horário que agora está bloqueado.
    useEffect(() => {
        if (campoHora.value !== "" && duracaoMinutos != null && slotIndisponivel(campoHora.value, duracaoMinutos, ocupados)) {
            campoHora.onChange("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, duracaoMinutos, ocupadosQuery.data]);

    if (ehPacoteRecorrente(categoria, tipoContratacao)) {
        const quantidadeAulas = tipoContratacao ? QUANTIDADE_AULAS[tipoContratacao as ETipoContratacao] : 0;
        const slotsPreenchidos = recorrencias.filter(
            (r): r is { diaSemana: EDiaSemana; hora: string } => r.diaSemana !== "" && r.hora !== "",
        );
        const preview = gerarPreviewDeDatas(slotsPreenchidos, quantidadeAulas, new Date());
        const cabeNoPrazo = cabeNaJanela(preview, new Date());

        return (
            <fieldset className="form-section">
                <legend>Dias e horário recorrentes</legend>
                <p className="aviso">
                    Escolha de 1 a 3 dias da semana + horário. As {quantidadeAulas} aulas do pacote serão marcadas automaticamente a
                    partir da próxima ocorrência de cada dia, sempre dentro de 31 dias corridos a partir de hoje.
                </p>

                {fields.map((field, index) => (
                    <LinhaRecorrencia
                        key={field.id}
                        index={index}
                        control={control}
                        duracaoMinutos={duracaoMinutos}
                        podeRemover={fields.length > 1}
                        onRemover={() => remove(index)}
                    />
                ))}
                {errors.recorrencias && <span className="erro-campo">Preencha todos os dias e horários escolhidos.</span>}

                {fields.length < MAX_RECORRENCIAS && (
                    <button type="button" className="botao-secundario" onClick={() => append({ diaSemana: "", hora: "" })}>
                        + Adicionar outro dia
                    </button>
                )}

                {preview.length > 0 && (
                    <div className="preview-recorrencia">
                        <p>Datas previstas:</p>
                        <ul>
                            {preview.map((slot, i) => (
                                <li key={i}>
                                    {slot.data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })} às{" "}
                                    {slot.hora}
                                </li>
                            ))}
                        </ul>
                        {!cabeNoPrazo && (
                            <p className="erro-campo">
                                Com os dias escolhidos, esse pacote não caberia em 31 dias - selecione mais dias da semana.
                            </p>
                        )}
                    </div>
                )}

                <label htmlFor="observacoes">Observações (opcional)</label>
                <textarea id="observacoes" {...register("observacoes")} />
            </fieldset>
        );
    }

    const hoje = new Date().toISOString().split("T")[0];

    return (
        <fieldset className="form-section">
            <legend>Data e horário</legend>

            <label htmlFor="data">Data</label>
            <input id="data" type="date" min={hoje} {...register("data", { required: "Selecione a data" })} />
            {errors.data && <span className="erro-campo">{errors.data.message}</span>}

            <fieldset className="grupo-horario">
                <legend>Horário</legend>
                {data !== "" && duracaoMinutos != null && ocupadosQuery.isLoading && (
                    <p className="aviso">Carregando horários disponíveis...</p>
                )}
                <GradeDeHorarios
                    slots={SLOTS}
                    valorSelecionado={campoHora.value}
                    onSelecionar={campoHora.onChange}
                    ehBloqueado={(slot) => data !== "" && duracaoMinutos != null && slotIndisponivel(slot, duracaoMinutos, ocupados)}
                />
                {data === "" && <p className="aviso">Escolha a data acima para ver os horários já ocupados.</p>}
            </fieldset>
            {errors.hora && <span className="erro-campo">{errors.hora.message}</span>}

            <label htmlFor="observacoes">Observações (opcional)</label>
            <textarea id="observacoes" {...register("observacoes")} />
        </fieldset>
    );
}

/**
 * Uma recorrência (dia da semana + horário) não tem `data` própria - por isso a grade aqui usa a
 * próxima ocorrência do dia da semana escolhido como referência de disponibilidade (mesma
 * limitação de "só a próxima ocorrência" assumida no preview de datas geradas e na validação de
 * Turma no backend - ver AgendamentoService#validarDisponibilidadeDeNovaTurma).
 */
function LinhaRecorrencia({
    index,
    control,
    duracaoMinutos,
    podeRemover,
    onRemover,
}: {
    index: number;
    control: Control<AgendamentoFormValues>;
    duracaoMinutos: number | null;
    podeRemover: boolean;
    onRemover: () => void;
}) {
    const { register } = useFormContext<AgendamentoFormValues>();
    const diaSemana = useWatch({ control, name: `recorrencias.${index}.diaSemana` });
    const { field: campoHora } = useController({ control, name: `recorrencias.${index}.hora`, rules: { required: "Selecione o horário" } });

    const data = diaSemana !== "" ? proximaOcorrenciaISO(diaSemana, new Date()) : "";
    const ocupadosQuery = useQuery({
        queryKey: ["horarios-ocupados", data],
        queryFn: () => listarHorariosOcupados(data),
        enabled: data !== "",
    });
    const ocupados = data !== "" ? (ocupadosQuery.data ?? []) : [];

    // Mesma lógica da aula avulsa: se o dia da semana mudar e o horário escolhido deixar de caber
    // na nova referência, limpa a seleção em vez de guardar um horário agora bloqueado.
    useEffect(() => {
        if (campoHora.value !== "" && duracaoMinutos != null && slotIndisponivel(campoHora.value, duracaoMinutos, ocupados)) {
            campoHora.onChange("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, duracaoMinutos, ocupadosQuery.data]);

    return (
        <div className="linha-recorrencia">
            <div>
                <label htmlFor={`recorrencia-dia-${index}`}>Dia da semana</label>
                <select id={`recorrencia-dia-${index}`} {...register(`recorrencias.${index}.diaSemana`, { required: "Selecione o dia" })}>
                    <option value="">Selecione...</option>
                    {DIAS_SEMANA.map((dia) => (
                        <option key={dia} value={dia}>
                            {DIA_SEMANA_LABELS[dia]}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Horário</label>
                {diaSemana === "" && <p className="aviso">Escolha o dia da semana para ver os horários disponíveis.</p>}
                {diaSemana !== "" && duracaoMinutos != null && ocupadosQuery.isLoading && (
                    <p className="aviso">Carregando horários disponíveis...</p>
                )}
                {diaSemana !== "" && (
                    <GradeDeHorarios
                        slots={SLOTS}
                        valorSelecionado={campoHora.value}
                        onSelecionar={campoHora.onChange}
                        ehBloqueado={(slot) => duracaoMinutos == null || slotIndisponivel(slot, duracaoMinutos, ocupados)}
                    />
                )}
            </div>

            {podeRemover && (
                <button type="button" className="botao-secundario" onClick={onRemover}>
                    Remover dia
                </button>
            )}
        </div>
    );
}
