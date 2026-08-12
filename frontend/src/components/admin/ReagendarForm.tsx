import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GradeDeHorarios } from "../ui/GradeDeHorarios";
import { listarHorariosOcupados } from "../../services/agendamentoService";
import { DIA_SEMANA_LABELS } from "../../types/labels";
import { DIAS_SEMANA, DIAS_SEMANA_AULA } from "../../utils/diasSemana";
import { slotIndisponivel } from "../../utils/disponibilidade";
import { gerarSlotsDeHorario, gerarSlotsDeHorarioDeAula } from "../../utils/horarios";
import { proximaOcorrenciaISO } from "../../utils/recorrencia";
import type { EDiaSemana } from "../../types/domain";

/**
 * Fluxo de reagendamento (admin/agenda ou admin/clientes -> compromisso -> "Reagendar"): escolher
 * dia da semana -> o sistema calcula a próxima ocorrência desse dia (mesmo padrão de recorrência
 * usado no agendamento novo, ver HorarioFields) -> mostra os horários disponíveis nesse dia ->
 * escolher um chama onReagendar imediatamente (mesma UX de clique-para-selecionar de
 * GradeDeHorarios). Compartilhado entre AdminAgendaPage e AdminClientesPage.
 *
 * `ehEvento` decide a regra de dia/horário aplicada: EVENTO aceita qualquer dia (inclusive
 * domingo) das 08h às 18h; as categorias de aula seguem seg-sex 08h-18h / sáb 08h-13h, sem
 * domingo - mesma regra validada no backend (AgendamentoValidator).
 */
export function ReagendarForm({
    duracaoMinutos,
    pendente,
    ehEvento,
    onReagendar,
    onCancelar,
}: {
    duracaoMinutos: number;
    pendente: boolean;
    ehEvento: boolean;
    onReagendar: (data: string, hora: string) => void;
    onCancelar: () => void;
}) {
    const [diaSemana, setDiaSemana] = useState<EDiaSemana | "">("");
    const data = diaSemana !== "" ? proximaOcorrenciaISO(diaSemana, new Date()) : "";
    const diasDisponiveis = ehEvento ? DIAS_SEMANA : DIAS_SEMANA_AULA;
    const slots = ehEvento ? gerarSlotsDeHorario() : gerarSlotsDeHorarioDeAula(diaSemana);
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
                {diasDisponiveis.map((dia) => (
                    <option key={dia} value={dia}>
                        {DIA_SEMANA_LABELS[dia]}
                    </option>
                ))}
            </select>
            {diaSemana !== "" && ocupadosQuery.isLoading && <span>Carregando horários...</span>}
            {diaSemana !== "" && !ocupadosQuery.isLoading && (
                <GradeDeHorarios
                    slots={slots}
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
