interface GradeDeHorariosProps {
    slots: string[];
    valorSelecionado: string;
    onSelecionar: (slot: string) => void;
    ehBloqueado: (slot: string) => boolean;
}

/**
 * Grade de botões de horário com bloqueio visual dos slots indisponíveis - usada em todo fluxo que
 * precisa marcar um horário (aula avulsa/evento, recorrência de pacote, criação de Turma), para
 * que o cliente/professor sempre veja a disponibilidade em vez de digitar/escolher às cegas e só
 * descobrir o conflito ao enviar.
 */
export function GradeDeHorarios({ slots, valorSelecionado, onSelecionar, ehBloqueado }: GradeDeHorariosProps) {
    return (
        <div className="grade-horarios">
            {slots.map((slot) => {
                const bloqueado = ehBloqueado(slot);
                const selecionado = valorSelecionado === slot;
                return (
                    <button
                        key={slot}
                        type="button"
                        className={`slot-horario${selecionado ? " slot-horario-selecionado" : ""}${bloqueado ? " slot-horario-bloqueado" : ""}`}
                        disabled={bloqueado}
                        aria-pressed={selecionado}
                        title={bloqueado ? "Horário indisponível - já há um compromisso marcado perto desse horário" : undefined}
                        onClick={() => onSelecionar(slot)}
                    >
                        {slot}
                    </button>
                );
            })}
        </div>
    );
}
