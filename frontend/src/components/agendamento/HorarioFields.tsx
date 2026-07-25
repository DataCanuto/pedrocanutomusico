import { useFieldArray, useFormContext } from "react-hook-form";
import type { EDiaSemana, ETipoContratacao } from "../../types/domain";
import { DIA_SEMANA_LABELS, QUANTIDADE_AULAS } from "../../types/labels";
import { gerarSlotsDeHorario } from "../../utils/horarios";
import { cabeNaJanela, gerarPreviewDeDatas } from "../../utils/recorrencia";
import { ehPacoteRecorrente, type AgendamentoFormValues } from "./formTypes";

const SLOTS = gerarSlotsDeHorario();
const DIAS_SEMANA = Object.keys(DIA_SEMANA_LABELS) as EDiaSemana[];
const MAX_RECORRENCIAS = 3;

export function HorarioFields() {
    const {
        register,
        control,
        watch,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const categoria = watch("categoria");
    const tipoContratacao = watch("tipoContratacao");
    const recorrencias = watch("recorrencias");
    const { fields, append, remove } = useFieldArray({ control, name: "recorrencias" });

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

            <label htmlFor="hora">Horário</label>
            <select id="hora" {...register("hora", { required: "Selecione o horário" })}>
                <option value="">Selecione...</option>
                {SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                        {slot}
                    </option>
                ))}
            </select>
            {errors.hora && <span className="erro-campo">{errors.hora.message}</span>}

            <label htmlFor="observacoes">Observações (opcional)</label>
            <textarea id="observacoes" {...register("observacoes")} />
        </fieldset>
    );
}
