/** Slots de horário disponíveis: 08h às 18h, de 15 em 15 minutos - mesma regra validada no backend (AgendamentoValidator). */
export function gerarSlotsDeHorario(): string[] {
    const slots: string[] = [];
    for (let minutos = 8 * 60; minutos <= 18 * 60; minutos += 15) {
        const hora = String(Math.floor(minutos / 60)).padStart(2, "0");
        const min = String(minutos % 60).padStart(2, "0");
        slots.push(`${hora}:${min}`);
    }
    return slots;
}
