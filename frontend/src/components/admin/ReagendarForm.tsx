import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GradeDeHorarios } from "../ui/GradeDeHorarios";
import { listarHorariosOcupados } from "../../services/agendamentoService";
import { DIA_SEMANA_LABELS } from "../../types/labels";
import { DIAS_SEMANA } from "../../utils/diasSemana";
import { slotIndisponivel } from "../../utils/disponibilidade";
import { gerarSlotsDeHorario } from "../../utils/horarios";
import { proximaOcorrenciaISO } from "../../utils/recorrencia";
import type { EDiaSemana } from "../../types/domain";

const SLOTS = gerarSlotsDeHorario();

/**
 * Fluxo de reagendamento (admin/agenda ou admin/clientes -> compromisso -> "Reagendar"): escolher
 * dia da semana -> o sistema calcula a próxima ocorrência desse dia (mesmo padrão de recorrência
 * usado no agendamento novo, ver HorarioFields) -> mostra os horários disponíveis nesse dia ->
 * escolher um chama onReagendar imediatamente (mesma UX de clique-para-selecionar de
 * GradeDeHorarios). Compartilhado entre AdminAgendaPage e AdminClientesPage.
 */
export function ReagendarForm({
    duracaoMinutos,
    pendente,
    onReagendar,
    onCancelar,
}: {
    duracaoMinutos: number;
    pendente: boolean;
    onReagendar: (data: string, hora: string) => void;
    onCancelar: () => void;
}) {
    const [diaSemana, setDiaSemana] = useState<EDiaSemana | "">("");
    const data = diaSemana !== "" ? proximaOcorrenciaISO(diaSemana, new Date()) : "";
    const ocupadosQuery = useQuery({
        queryKey: ["horarios-ocupados", data],
        queryFn: () => listarHorariosOcupados(data),
        enabled: data !== "",
    });
    const ocupados = data !== "" ? (ocupadosQuery.data ?? []) : [];

    return (
        <span className="agenda-reagendar-form">
            <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value as EDiaSemana)} disabled={pendente}>
                <option value="">Dia da semana...</option>
                {DIAS_SEMANA.map((dia) => (
                    <option key={dia} value={dia}>
                        {DIA_SEMANA_LABELS[dia]}
                    </option>
                ))}
            </select>
            {diaSemana !== "" && ocupadosQuery.isLoading && <span>Carregando horários...</span>}
            {diaSemana !== "" && !ocupadosQuery.isLoading && (
                <GradeDeHorarios
                    slots={SLOTS}
                    valorSelecionado=""
                    onSelecionar={(hora) => onReagendar(data, hora)}
                    ehBloqueado={(slot) => pendente || slotIndisponivel(slot, duracaoMinutos, ocupados)}
                />
            )}
            <button type="button" className="botao-secundario" disabled={pendente} onClick={onCancelar}>
                Cancelar
            </button>
        </span>
    );
}
