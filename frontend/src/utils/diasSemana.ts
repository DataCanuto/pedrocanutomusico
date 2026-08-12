import type { EDiaSemana } from "../types/domain";
import { DIA_SEMANA_LABELS } from "../types/labels";

export const DIAS_SEMANA = Object.keys(DIA_SEMANA_LABELS) as EDiaSemana[];

/** Dias com expediente de aula (Musicalização, Musicoterapia, Aula de Instrumento) - sem domingo, só EVENTO atende nesse dia. */
export const DIAS_SEMANA_AULA = DIAS_SEMANA.filter((dia) => dia !== "SUNDAY");
