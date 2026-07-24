export const NOMES_MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

function paraIso(ano: number, mes: number, dia: number): string {
    return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function paraData(iso: string): Date {
    const [ano, mes, dia] = iso.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function somarDias(iso: string, dias: number): string {
    const data = paraData(iso);
    data.setDate(data.getDate() + dias);
    return paraIso(data.getFullYear(), data.getMonth(), data.getDate());
}

/** Domingo da semana que contém a data informada. */
export function inicioDaSemana(iso: string): string {
    return somarDias(iso, -paraData(iso).getDay());
}

export function diaAnterior(iso: string): string {
    return somarDias(iso, -1);
}

export function proximoDia(iso: string): string {
    return somarDias(iso, 1);
}

export function semanaAnterior(iso: string): string {
    return somarDias(iso, -7);
}

export function proximaSemana(iso: string): string {
    return somarDias(iso, 7);
}

/** 7 datas ISO consecutivas (domingo a sábado) a partir do domingo da semana da data informada. */
export function gerarDiasDaSemana(iso: string): string[] {
    const inicio = inicioDaSemana(iso);
    return Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
}

export function formatarDataBr(iso: string): string {
    return iso.split("-").reverse().join("/");
}

/** Grade do mês em semanas (domingo a sábado) - null nas células de padding antes/depois do mês. */
export function gerarGradeDoMes(ano: number, mes: number): (string | null)[][] {
    const primeiroDia = new Date(ano, mes, 1);
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const offsetInicial = primeiroDia.getDay();

    const dias: (string | null)[] = [
        ...Array.from({ length: offsetInicial }, () => null),
        ...Array.from({ length: totalDias }, (_, i) => paraIso(ano, mes, i + 1)),
    ];
    while (dias.length % 7 !== 0) {
        dias.push(null);
    }

    const semanas: (string | null)[][] = [];
    for (let i = 0; i < dias.length; i += 7) {
        semanas.push(dias.slice(i, i + 7));
    }
    return semanas;
}
