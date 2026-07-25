package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pedrocanuto.agendamento.dto.request.HorarioRecorrenteRequestDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class GeradorDeDatasRecorrentesTest {

    private static final LocalDate HOJE = LocalDate.of(2026, 7, 24); // sexta-feira
    private static final LocalTime HORA = LocalTime.of(15, 0);

    @Test
    void geraAQuantidadeExataDeAulasEmOrdemCronologica() {
        List<HorarioRecorrenteRequestDTO> recorrencias = List.of(
                new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, HORA),
                new HorarioRecorrenteRequestDTO(DayOfWeek.THURSDAY, LocalTime.of(16, 0)));

        var geradas = GeradorDeDatasRecorrentes.gerar(recorrencias, 4, HOJE);

        assertThat(geradas).hasSize(4);
        assertThat(geradas).isSortedAccordingTo((a, b) -> a.data().compareTo(b.data()));
        assertThat(geradas.get(0).data().getDayOfWeek()).isEqualTo(DayOfWeek.TUESDAY);
        assertThat(geradas.get(1).data().getDayOfWeek()).isEqualTo(DayOfWeek.THURSDAY);
        assertThat(geradas.get(2).data().getDayOfWeek()).isEqualTo(DayOfWeek.TUESDAY);
        assertThat(geradas.get(2).data()).isEqualTo(geradas.get(0).data().plusDays(7));
    }

    @Test
    void umUnicoDiaDaSemanaAvancaSempreSeteDias() {
        List<HorarioRecorrenteRequestDTO> recorrencias = List.of(new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, HORA));

        var geradas = GeradorDeDatasRecorrentes.gerar(recorrencias, 4, HOJE);

        assertThat(geradas).hasSize(4);
        for (int i = 1; i < geradas.size(); i++) {
            assertThat(geradas.get(i).data()).isEqualTo(geradas.get(i - 1).data().plusDays(7));
        }
    }

    @Test
    void pacote12ComUmDiaPorSemanaEstouraJanelaDe31DiasEEhRejeitado() {
        List<HorarioRecorrenteRequestDTO> recorrencias = List.of(new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, HORA));

        assertThatThrownBy(() -> GeradorDeDatasRecorrentes.gerar(recorrencias, 12, HOJE))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("31 dias");
    }

    @Test
    void pacote12ComTresDiasPorSemanaCabeNaJanelaDe31Dias() {
        List<HorarioRecorrenteRequestDTO> recorrencias = List.of(
                new HorarioRecorrenteRequestDTO(DayOfWeek.MONDAY, HORA),
                new HorarioRecorrenteRequestDTO(DayOfWeek.WEDNESDAY, HORA),
                new HorarioRecorrenteRequestDTO(DayOfWeek.FRIDAY, HORA));

        var geradas = GeradorDeDatasRecorrentes.gerar(recorrencias, 12, HOJE);

        assertThat(geradas).hasSize(12);
        assertThat(geradas.get(11).data()).isBeforeOrEqualTo(HOJE.plusDays(31));
    }

    @Test
    void diaDaSemanaIgualAHojeUsaHojeComoPrimeiraOcorrencia() {
        List<HorarioRecorrenteRequestDTO> recorrencias = List.of(new HorarioRecorrenteRequestDTO(DayOfWeek.FRIDAY, HORA));

        var geradas = GeradorDeDatasRecorrentes.gerar(recorrencias, 1, HOJE);

        assertThat(geradas.get(0).data()).isEqualTo(HOJE);
    }
}
