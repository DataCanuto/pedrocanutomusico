package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.TurmaOcorrencia;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.dto.response.TurmaOcorrenciaResponseDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.mapper.TurmaOcorrenciaMapper;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import com.pedrocanuto.agendamento.repository.TurmaOcorrenciaRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TurmaOcorrenciaServiceTest {

    @Mock
    private TurmaOcorrenciaRepository turmaOcorrenciaRepository;
    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private PrecoServicoService precoServicoService;
    @Mock
    private TurmaMapper turmaMapper;
    @Mock
    private TurmaOcorrenciaMapper turmaOcorrenciaMapper;
    @Mock
    private AgendamentoService agendamentoService;
    @Mock
    private AgendamentoValidator agendamentoValidator;

    private TurmaOcorrenciaService turmaOcorrenciaService;

    @BeforeEach
    void setUp() {
        turmaOcorrenciaService = new TurmaOcorrenciaService(turmaOcorrenciaRepository, turmaRepository, matriculaRepository,
                precoServicoService, turmaMapper, turmaOcorrenciaMapper, agendamentoService, agendamentoValidator);
    }

    private Turma turmaDeQuarta() {
        Turma turma = new Turma();
        turma.setId(7L);
        turma.setDiaSemana(DayOfWeek.WEDNESDAY);
        return turma;
    }

    @Test
    void confirmarMaterializaOcorrenciaNaPrimeiraTransicao() {
        LocalDate quarta = LocalDate.of(2026, 8, 5); // quarta-feira
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, quarta)).thenReturn(Optional.empty());
        when(turmaRepository.findById(7L)).thenReturn(Optional.of(turmaDeQuarta()));
        when(turmaOcorrenciaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(matriculaRepository.listarPorTurmaEStatus(any(), any())).thenReturn(List.of());
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any()))
                .thenReturn(new TurmaOcorrenciaResponseDTO(null, 7L, "ABC123", null, null, quarta, null, null, 50,
                        EStatusAgendamento.CONFIRMADO, null, null, List.of()));

        turmaOcorrenciaService.confirmar(7L, quarta);

        ArgumentCaptor<TurmaOcorrencia> captor = ArgumentCaptor.forClass(TurmaOcorrencia.class);
        verify(turmaOcorrenciaRepository).save(captor.capture());
        assertThat(captor.getValue().getTurma().getId()).isEqualTo(7L);
        assertThat(captor.getValue().getData()).isEqualTo(quarta);

        ArgumentCaptor<TurmaOcorrencia> mapeadoCaptor = ArgumentCaptor.forClass(TurmaOcorrencia.class);
        verify(turmaOcorrenciaMapper).toResponseDTO(mapeadoCaptor.capture(), any(), any());
        assertThat(mapeadoCaptor.getValue().getStatus()).isEqualTo(EStatusAgendamento.CONFIRMADO);
    }

    @Test
    void checkInReaproveitaOcorrenciaJaMaterializadaSemCriarNova() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        TurmaOcorrencia existente = new TurmaOcorrencia();
        existente.setId(50L);
        existente.setTurma(turmaDeQuarta());
        existente.setData(quarta);
        existente.setStatus(EStatusAgendamento.CONFIRMADO);
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, quarta)).thenReturn(Optional.of(existente));
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(matriculaRepository.listarPorTurmaEStatus(any(), any())).thenReturn(List.of());
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any())).thenReturn(
                new TurmaOcorrenciaResponseDTO(50L, 7L, null, null, null, quarta, null, null, 50,
                        EStatusAgendamento.CHECK_IN, null, null, List.of()));

        turmaOcorrenciaService.checkIn(7L, quarta);

        verify(turmaOcorrenciaRepository, never()).save(any());
        verify(turmaRepository, never()).findById(any());
        assertThat(existente.getStatus()).isEqualTo(EStatusAgendamento.CHECK_IN);
        assertThat(existente.getDataHoraCheckIn()).isNotNull();
    }

    @Test
    void materializarRejeitaDataComDiaDaSemanaDiferenteDaTurma() {
        LocalDate segunda = LocalDate.of(2026, 8, 3); // segunda-feira, turma é quarta
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, segunda)).thenReturn(Optional.empty());
        when(turmaRepository.findById(7L)).thenReturn(Optional.of(turmaDeQuarta()));

        assertThatThrownBy(() -> turmaOcorrenciaService.confirmar(7L, segunda))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("dia da semana");

        verify(turmaOcorrenciaRepository, never()).save(any());
    }

    @Test
    void transicaoIlegalLancaExcecao() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        TurmaOcorrencia finalizada = new TurmaOcorrencia();
        finalizada.setTurma(turmaDeQuarta());
        finalizada.setData(quarta);
        finalizada.setStatus(EStatusAgendamento.FINALIZADO);
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, quarta)).thenReturn(Optional.of(finalizada));

        assertThatThrownBy(() -> turmaOcorrenciaService.confirmar(7L, quarta))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    @Test
    void finalizarRegistraDataHoraAutomaticamente() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        TurmaOcorrencia emAndamento = new TurmaOcorrencia();
        emAndamento.setTurma(turmaDeQuarta());
        emAndamento.setData(quarta);
        emAndamento.setStatus(EStatusAgendamento.EM_ANDAMENTO);
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, quarta)).thenReturn(Optional.of(emAndamento));
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(matriculaRepository.listarPorTurmaEStatus(any(), any())).thenReturn(List.of());
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any())).thenReturn(
                new TurmaOcorrenciaResponseDTO(null, 7L, null, null, null, quarta, null, null, 50,
                        EStatusAgendamento.FINALIZADO, null, null, List.of()));

        turmaOcorrenciaService.finalizar(7L, quarta);

        assertThat(emAndamento.getDataHoraFinalizacao()).isNotNull();
    }

    @Test
    void reagendarMoveDataEHoraSemAlterarTurma() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        LocalDate sexta = LocalDate.of(2026, 8, 7);
        TurmaOcorrencia existente = new TurmaOcorrencia();
        existente.setTurma(turmaDeQuarta());
        existente.setData(quarta);
        existente.setStatus(EStatusAgendamento.AGENDADO);
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, quarta)).thenReturn(Optional.of(existente));
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, sexta)).thenReturn(Optional.empty());
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(matriculaRepository.listarPorTurmaEStatus(any(), any())).thenReturn(List.of());
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any())).thenReturn(
                new TurmaOcorrenciaResponseDTO(null, 7L, null, null, null, sexta, LocalTime.of(16, 0), null, 50,
                        EStatusAgendamento.AGENDADO, null, null, List.of()));

        turmaOcorrenciaService.reagendar(7L, quarta, sexta, LocalTime.of(16, 0));

        verify(agendamentoValidator).validarHorarioDeAula(sexta, LocalTime.of(16, 0));
        verify(agendamentoService).validarDisponibilidadeExcluindo(sexta, LocalTime.of(16, 0), 50, null, 7L);
        assertThat(existente.getData()).isEqualTo(sexta);
        assertThat(existente.getHora()).isEqualTo(LocalTime.of(16, 0));
        assertThat(existente.getDataOriginal()).isEqualTo(quarta);
    }

    @Test
    void reagendarNaoSobrescreveDataOriginalNumSegundoReagendamento() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        LocalDate sexta = LocalDate.of(2026, 8, 7);
        LocalDate sabado = LocalDate.of(2026, 8, 8);
        TurmaOcorrencia jaReagendada = new TurmaOcorrencia();
        jaReagendada.setTurma(turmaDeQuarta());
        jaReagendada.setData(sexta);
        jaReagendada.setDataOriginal(quarta);
        jaReagendada.setStatus(EStatusAgendamento.AGENDADO);
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, sexta)).thenReturn(Optional.of(jaReagendada));
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, sabado)).thenReturn(Optional.empty());
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(matriculaRepository.listarPorTurmaEStatus(any(), any())).thenReturn(List.of());
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any())).thenReturn(
                new TurmaOcorrenciaResponseDTO(null, 7L, null, null, null, sabado, LocalTime.of(10, 0), null, 50,
                        EStatusAgendamento.AGENDADO, null, null, List.of()));

        turmaOcorrenciaService.reagendar(7L, sexta, sabado, LocalTime.of(10, 0));

        assertThat(jaReagendada.getData()).isEqualTo(sabado);
        assertThat(jaReagendada.getDataOriginal()).isEqualTo(quarta);
    }

    @Test
    void reagendarRejeitaStatusTerminal() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        TurmaOcorrencia finalizada = new TurmaOcorrencia();
        finalizada.setTurma(turmaDeQuarta());
        finalizada.setData(quarta);
        finalizada.setStatus(EStatusAgendamento.FINALIZADO);
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, quarta)).thenReturn(Optional.of(finalizada));

        assertThatThrownBy(() -> turmaOcorrenciaService.reagendar(7L, quarta, quarta.plusDays(2), LocalTime.of(10, 0)))
                .isInstanceOf(RegraDeNegocioException.class);

        verify(agendamentoService, never()).validarDisponibilidadeExcluindo(any(), any(), any(Integer.class), any(), any());
    }

    @Test
    void reagendarRejeitaSeJaExisteOcorrenciaNaDataNova() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        LocalDate sexta = LocalDate.of(2026, 8, 7);
        TurmaOcorrencia existente = new TurmaOcorrencia();
        existente.setTurma(turmaDeQuarta());
        existente.setData(quarta);
        existente.setStatus(EStatusAgendamento.AGENDADO);
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, quarta)).thenReturn(Optional.of(existente));
        when(turmaOcorrenciaRepository.findByTurmaIdAndData(7L, sexta)).thenReturn(Optional.of(new TurmaOcorrencia()));

        assertThatThrownBy(() -> turmaOcorrenciaService.reagendar(7L, quarta, sexta, LocalTime.of(10, 0)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("já tem uma ocorrência");

        verify(agendamentoService, never()).validarDisponibilidadeExcluindo(any(), any(), any(Integer.class), any(), any());
    }
}
