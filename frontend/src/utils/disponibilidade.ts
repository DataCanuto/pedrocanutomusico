import type { HorarioOcupado } from "../types/domain";

/** Mesmo intervalo mínimo do backend entre o fim de um compromisso e o início do próximo - ver AgendamentoService#MINUTOS_INTERVALO_ENTRE_COMPROMISSOS. Duplicado aqui (não há endpoint de config) só para a pré-visualização no formulário; quem valida de verdade continua sendo o backend ao criar o agendamento. */
const MINUTOS_INTERVALO_ENTRE_COMPROMISSOS = 15;

function minutosDoDia(hora: string): number {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
}

/**
 * Espelha AgendamentoService#validarDisponibilidade: um novo compromisso de `duracaoMinutosNovo`
 * a partir de `horaSlot` colide se não sobrar o intervalo mínimo antes/depois de algum ocupado.
 */
export function slotIndisponivel(horaSlot: string, duracaoMinutosNovo: number, ocupados: HorarioOcupado[]): boolean {
    const inicioNovo = minutosDoDia(horaSlot);
    const fimNovoComIntervalo = inicioNovo + duracaoMinutosNovo + MINUTOS_INTERVALO_ENTRE_COMPROMISSOS;

    return ocupados.some((ocupado) => {
        const inicioExistente = minutosDoDia(ocupado.hora);
        const fimExistenteComIntervalo = inicioExistente + ocupado.duracaoMinutos + MINUTOS_INTERVALO_ENTRE_COMPROMISSOS;
        return inicioNovo < fimExistenteComIntervalo && inicioExistente < fimNovoComIntervalo;
    });
}
