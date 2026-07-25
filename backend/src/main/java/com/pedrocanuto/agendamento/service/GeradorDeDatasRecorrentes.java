package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.dto.request.HorarioRecorrenteRequestDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

/**
 * Gera as datas de um pacote (PACOTE_4/PACOTE_12) a partir dos dias da semana + horário
 * escolhidos pelo cliente (1 a 3 recorrencias), sem depender de repositório/Spring - pura função
 * de calendário, testável isoladamente.
 *
 * <p>Estratégia: cada recorrencia tem sua própria "próxima data pendente" (começando na primeira
 * ocorrência do dia da semana a partir de hoje, inclusive); a cada passo emite-se a pendente mais
 * próxima entre todas as recorrencias e avança-se ela em 7 dias, até completar a quantidade de
 * aulas do pacote. O pacote inteiro precisa caber dentro da janela de {@link #JANELA_DIAS} dias
 * corridos a partir de hoje - se os dias escolhidos não derem conta disso (ex.: PACOTE_12 com só
 * 1 dia/semana levaria ~12 semanas), rejeita com uma mensagem acionável em vez de aceitar um
 * pacote que só termina meses depois.
 */
public final class GeradorDeDatasRecorrentes {

    static final int JANELA_DIAS = 31;

    private GeradorDeDatasRecorrentes() {
    }

    public record AgendaSlot(LocalDate data, LocalTime hora) {
    }

    public static List<AgendaSlot> gerar(List<HorarioRecorrenteRequestDTO> recorrencias, int quantidadeAulas, LocalDate hoje) {
        LocalDate[] proximaPendentePorSlot = new LocalDate[recorrencias.size()];
        for (int i = 0; i < recorrencias.size(); i++) {
            proximaPendentePorSlot[i] = hoje.with(TemporalAdjusters.nextOrSame(recorrencias.get(i).diaSemana()));
        }

        List<AgendaSlot> geradas = new ArrayList<>(quantidadeAulas);
        for (int aula = 0; aula < quantidadeAulas; aula++) {
            int indiceEscolhido = indiceDaMenorData(proximaPendentePorSlot);
            LocalDate data = proximaPendentePorSlot[indiceEscolhido];
            geradas.add(new AgendaSlot(data, recorrencias.get(indiceEscolhido).hora()));
            proximaPendentePorSlot[indiceEscolhido] = data.plusDays(7);
        }

        LocalDate limite = hoje.plusDays(JANELA_DIAS);
        LocalDate ultimaData = geradas.get(geradas.size() - 1).data();
        if (ultimaData.isAfter(limite)) {
            throw new RegraDeNegocioException(
                    ("Com os dias escolhidos, o pacote terminaria em %s, fora do prazo de %d dias a partir de hoje (%s). "
                            + "Selecione mais dias da semana ou um pacote menor.")
                            .formatted(ultimaData, JANELA_DIAS, hoje));
        }
        return geradas;
    }

    private static int indiceDaMenorData(LocalDate[] proximaPendentePorSlot) {
        int indiceEscolhido = 0;
        for (int i = 1; i < proximaPendentePorSlot.length; i++) {
            if (proximaPendentePorSlot[i].isBefore(proximaPendentePorSlot[indiceEscolhido])) {
                indiceEscolhido = i;
            }
        }
        return indiceEscolhido;
    }
}
