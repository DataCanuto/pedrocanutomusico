import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useController, useFieldArray, useFormContext } from "react-hook-form";
import { listarHorariosOcupados } from "../../services/agendamentoService";
import type { EDiaSemana, ETipoContratacao, PrecoServico } from "../../types/domain";
import { DIA_SEMANA_LABELS, QUANTIDADE_AULAS } from "../../types/labels";
import { slotIndisponivel } from "../../utils/disponibilidade";
import { gerarSlotsDeHorario } from "../../utils/horarios";
import { cabeNaJanela, gerarPreviewDeDatas } from "../../utils/recorrencia";
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
                    <div key={field.id} className="linha-recorrencia">
                        <div>
                            <label htmlFor={`recorrencia-dia-${index}`}>Dia da semana</label>
                            <select
                                id={`recorrencia-dia-${index}`}
                                {...register(`recorrencias.${index}.diaSemana`, { required: "Selecione o dia" })}
                            >
                                <option value="">Selecione...</option>
                                {DIAS_SEMANA.map((dia) => (
                                    <option key={dia} value={dia}>
                                        {DIA_SEMANA_LABELS[dia]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor={`recorrencia-hora-${index}`}>Horário</label>
                            <select
                                id={`recorrencia-hora-${index}`}
                                {...register(`recorrencias.${index}.hora`, { required: "Selecione o horário" })}
                            >
                                <option value="">Selecione...</option>
                                {SLOTS.map((slot) => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {fields.length > 1 && (
                            <button type="button" className="botao-secundario" onClick={() => remove(index)}>
                                Remover dia
                            </button>
                        )}
                    </div>
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
                <div className="grade-horarios">
                    {SLOTS.map((slot) => {
                        const bloqueado = data !== "" && duracaoMinutos != null && slotIndisponivel(slot, duracaoMinutos, ocupados);
                        const selecionado = campoHora.value === slot;
                        return (
                            <button
                                key={slot}
                                type="button"
                                className={`slot-horario${selecionado ? " slot-horario-selecionado" : ""}${bloqueado ? " slot-horario-bloqueado" : ""}`}
                                disabled={bloqueado}
                                aria-pressed={selecionado}
                                title={bloqueado ? "Horário indisponível - já há um compromisso marcado perto desse horário" : undefined}
                                onClick={() => campoHora.onChange(slot)}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
                {data === "" && <p className="aviso">Escolha a data acima para ver os horários já ocupados.</p>}
            </fieldset>
            {errors.hora && <span className="erro-campo">{errors.hora.message}</span>}

            <label htmlFor="observacoes">Observações (opcional)</label>
            <textarea id="observacoes" {...register("observacoes")} />
        </fieldset>
    );
}
