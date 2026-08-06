import type { EDiaSemana } from "../types/domain";
import { DIA_SEMANA_LABELS } from "../types/labels";

export const DIAS_SEMANA = Object.keys(DIA_SEMANA_LABELS) as EDiaSemana[];
