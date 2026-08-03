import type { EDiaSemana } from "../types/domain";

const ORDEM_DIAS: EDiaSemana[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/** Mesma janela usada no backend (GeradorDeDatasRecorrentes) - preview aqui é só cosmético, o servidor sempre revalida. */
export const JANELA_DIAS = 31;

export interface SlotRecorrente {
    diaSemana: EDiaSemana;
    hora: string;
}

export interface DataGerada {
    data: Date;
    hora: string;
}

function proximaOcorrencia(diaSemana: EDiaSemana, aPartirDe: Date): Date {
    const alvo = ORDEM_DIAS.indexOf(diaSemana);
    const diferenca = (alvo - aPartirDe.getDay() + 7) % 7;
    const resultado = new Date(aPartirDe);
    resultado.setDate(resultado.getDate() + diferenca);
    return resultado;
}

/**
 * Data (YYYY-MM-DD) da próxima ocorrência de um dia da semana a partir de hoje (inclusive) - usada
 * para consultar `GET /agendamentos/horarios-ocupados` como referência de disponibilidade de um
 * compromisso recorrente (recorrência de pacote, ou Turma) que não tem uma data própria, só o dia
 * da semana. Não cobre ocorrências mais distantes - mesma limitação assumida no preview de datas
 * geradas (ver {@link gerarPreviewDeDatas}).
 */
export function proximaOcorrenciaISO(diaSemana: EDiaSemana, hoje: Date): string {
    const data = proximaOcorrencia(diaSemana, hoje);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

/**
 * Espelha o algoritmo de GeradorDeDatasRecorrentes (backend) só para dar um preview ao cliente
 * antes de enviar - o servidor sempre recalcula e revalida, este resultado nunca é enviado como
 * dado bruto.
 */
export function gerarPreviewDeDatas(slots: SlotRecorrente[], quantidadeAulas: number, hoje: Date): DataGerada[] {
    if (slots.length === 0 || quantidadeAulas <= 0) return [];

    const pendentes = slots.map((slot) => proximaOcorrencia(slot.diaSemana, hoje));
    const geradas: DataGerada[] = [];

    for (let i = 0; i < quantidadeAulas; i++) {
        let indiceEscolhido = 0;
        for (let j = 1; j < pendentes.length; j++) {
            if (pendentes[j].getTime() < pendentes[indiceEscolhido].getTime()) indiceEscolhido = j;
        }
        geradas.push({ data: new Date(pendentes[indiceEscolhido]), hora: slots[indiceEscolhido].hora });
        const proxima = new Date(pendentes[indiceEscolhido]);
        proxima.setDate(proxima.getDate() + 7);
        pendentes[indiceEscolhido] = proxima;
    }

    return geradas;
}

export function cabeNaJanela(datasGeradas: DataGerada[], hoje: Date): boolean {
    if (datasGeradas.length === 0) return true;
    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + JANELA_DIAS);
    return datasGeradas[datasGeradas.length - 1].data.getTime() <= limite.getTime();
}
