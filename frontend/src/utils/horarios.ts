import type { EDiaSemana } from "../types/domain";

/**
 * Slots de horário disponíveis: 08h às 18h, de 15 em 15 minutos, sem restrição de dia da semana -
 * mesma regra validada no backend (AgendamentoValidator#validarHorario). Só se aplica à categoria
 * EVENTO - eventos podem ser marcados em qualquer dia disponível, inclusive domingo, diferente das
 * categorias de aula - ver {@link gerarSlotsDeHorarioDeAula}.
 */
export function gerarSlotsDeHorario(): string[] {
    return gerarSlots(8 * 60, 18 * 60);
}

/**
 * Slots de horário das categorias de aula (Musicalização, Musicoterapia, Aula de Instrumento):
 * segunda a sexta das 08h às 18h, sábado das 08h às 13h, sem expediente aos domingos - mesma regra
 * validada no backend (AgendamentoValidator#validarHorarioDeAula).
 */
export function gerarSlotsDeHorarioDeAula(diaSemana: EDiaSemana | ""): string[] {
    if (diaSemana === "" || diaSemana === "SUNDAY") return [];
    const fimMinutos = diaSemana === "SATURDAY" ? 13 * 60 : 18 * 60;
    return gerarSlots(8 * 60, fimMinutos);
}

function gerarSlots(inicioMinutos: number, fimMinutos: number): string[] {
    const slots: string[] = [];
    for (let minutos = inicioMinutos; minutos <= fimMinutos; minutos += 15) {
        const hora = String(Math.floor(minutos / 60)).padStart(2, "0");
        const min = String(minutos % 60).padStart(2, "0");
        slots.push(`${hora}:${min}`);
    }
    return slots;
}

/** Dia da semana (EDiaSemana) de uma data no formato ISO (YYYY-MM-DD), sem depender de fuso do Date. */
export function diaSemanaDe(dataISO: string): EDiaSemana {
    const ORDEM: EDiaSemana[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const [ano, mes, dia] = dataISO.split("-").map(Number);
    return ORDEM[new Date(ano, mes - 1, dia).getDay()];
}
