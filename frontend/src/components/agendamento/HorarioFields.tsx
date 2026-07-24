import { useFormContext } from "react-hook-form";
import { gerarSlotsDeHorario } from "../../utils/horarios";
import type { AgendamentoFormValues } from "./formTypes";

const SLOTS = gerarSlotsDeHorario();

export function HorarioFields() {
    const {
        register,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

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
