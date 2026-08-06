package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.TurmaOcorrencia;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.ECompromissoTipo;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.dto.response.AgendamentoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.CompromissoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaOcorrenciaResponseDTO;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.mapper.TurmaOcorrenciaMapper;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import com.pedrocanuto.agendamento.repository.TurmaOcorrenciaRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AgendaAdminServiceTest {

    @Mock
    private AgendamentoService agendamentoService;
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

    private AgendaAdminService agendaAdminService;

    @BeforeEach
    void setUp() {
        agendaAdminService = new AgendaAdminService(agendamentoService, turmaOcorrenciaRepository, turmaRepository,
                matriculaRepository, precoServicoService, turmaMapper, turmaOcorrenciaMapper);
    }

    private Turma turma(ECategoriaServico categoria, DayOfWeek diaSemana) {
        Turma turma = new Turma();
        turma.setId(7L);
        turma.setCategoria(categoria);
        turma.setDiaSemana(diaSemana);
        turma.setHora(LocalTime.of(15, 0));
        turma.setStatus(EStatusTurma.ATIVA);
        return turma;
    }

    @Test
    void listarMesclaAgendamentoEOcorrenciaVirtualDeTurmaNaMesmaData() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        when(agendamentoService.listar(quarta, null)).thenReturn(List.of(mockAgendamento()));
        when(turmaOcorrenciaRepository.findByDataBetween(quarta, quarta)).thenReturn(List.of());
        when(turmaRepository.findByStatus(EStatusTurma.ATIVA)).thenReturn(List.of(turma(ECategoriaServico.AULA_INSTRUMENTO, DayOfWeek.WEDNESDAY)));
        when(matriculaRepository.listarComTurmaEAluno()).thenReturn(List.of());
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any())).thenReturn(mockOcorrencia(quarta));

        List<CompromissoResponseDTO> resultado = agendaAdminService.listar(quarta, null);

        assertThat(resultado).hasSize(2);
        assertThat(resultado).anySatisfy(c -> assertThat(c.tipo()).isEqualTo(ECompromissoTipo.AGENDAMENTO));
        assertThat(resultado).anySatisfy(c -> assertThat(c.tipo()).isEqualTo(ECompromissoTipo.TURMA_OCORRENCIA));
    }

    @Test
    void listarNaoDuplicaOcorrenciaJaMaterializadaNaMesmaData() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        Turma turmaAtiva = turma(ECategoriaServico.AULA_INSTRUMENTO, DayOfWeek.WEDNESDAY);
        TurmaOcorrencia persistida = new TurmaOcorrencia();
        persistida.setTurma(turmaAtiva);
        persistida.setData(quarta);
        persistida.setStatus(EStatusAgendamento.CONFIRMADO);

        when(agendamentoService.listar(quarta, null)).thenReturn(List.of());
        when(turmaOcorrenciaRepository.findByDataBetween(quarta, quarta)).thenReturn(List.of(persistida));
        when(turmaRepository.findByStatus(EStatusTurma.ATIVA)).thenReturn(List.of(turmaAtiva));
        when(matriculaRepository.listarComTurmaEAluno()).thenReturn(List.of());
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any())).thenReturn(mockOcorrencia(quarta));

        List<CompromissoResponseDTO> resultado = agendaAdminService.listar(quarta, null);

        // só a persistida - não gera uma virtual extra para a mesma turma+data
        assertThat(resultado).hasSize(1);
    }

    @Test
    void listarRespeitaFiltroDeCategoriaParaAgendamentoETurma() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        when(agendamentoService.listar(quarta, ECategoriaServico.AULA_INSTRUMENTO)).thenReturn(List.of());
        when(turmaOcorrenciaRepository.findByDataBetween(quarta, quarta)).thenReturn(List.of());
        when(turmaRepository.findByStatus(EStatusTurma.ATIVA)).thenReturn(List.of(
                turma(ECategoriaServico.AULA_INSTRUMENTO, DayOfWeek.WEDNESDAY),
                turma(ECategoriaServico.MUSICALIZACAO_INFANTIL, DayOfWeek.WEDNESDAY)));
        when(matriculaRepository.listarComTurmaEAluno()).thenReturn(List.of());
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any())).thenReturn(mockOcorrencia(quarta));

        List<CompromissoResponseDTO> resultado = agendaAdminService.listar(quarta, ECategoriaServico.AULA_INSTRUMENTO);

        assertThat(resultado).hasSize(1);
        verify(agendamentoService).listar(eq(quarta), eq(ECategoriaServico.AULA_INSTRUMENTO));
    }

    /**
     * Ver TurmaOcorrenciaService#reagendar: mover uma ocorrência para outra data guarda o slot
     * semanal vago em dataOriginal só para este cenário não voltar a gerar uma ocorrência virtual
     * fantasma nele.
     */
    @Test
    void listarNaoGeraOcorrenciaFantasmaNoSlotOriginalAposReagendamento() {
        LocalDate dataOriginal = LocalDate.now().plusDays(3).with(TemporalAdjusters.nextOrSame(DayOfWeek.WEDNESDAY));
        LocalDate novaData = dataOriginal.plusDays(2);
        Turma turmaAtiva = turma(ECategoriaServico.AULA_INSTRUMENTO, DayOfWeek.WEDNESDAY);

        TurmaOcorrencia reagendada = new TurmaOcorrencia();
        reagendada.setTurma(turmaAtiva);
        reagendada.setData(novaData);
        reagendada.setDataOriginal(dataOriginal);
        reagendada.setStatus(EStatusAgendamento.AGENDADO);

        when(agendamentoService.listar(null, null)).thenReturn(List.of());
        when(turmaOcorrenciaRepository.findByDataBetween(any(), any())).thenReturn(List.of(reagendada));
        when(turmaRepository.findByStatus(EStatusTurma.ATIVA)).thenReturn(List.of(turmaAtiva));
        when(matriculaRepository.listarComTurmaEAluno()).thenReturn(List.of());
        when(precoServicoService.buscarDuracaoDeGrupo(any())).thenReturn(50);
        // turma.diaSemana é WEDNESDAY, então a janela padrão (38 dias) tem várias quartas normais
        // além do slot vago - o mapper devolve o DTO com a data de cada TurmaOcorrencia (real ou
        // virtual) recebida, para o teste conseguir distinguir qual data cada resultado representa.
        when(turmaOcorrenciaMapper.toResponseDTO(any(), any(), any()))
                .thenAnswer(invocation -> mockOcorrencia(((TurmaOcorrencia) invocation.getArgument(0)).getData()));

        List<CompromissoResponseDTO> resultado = agendaAdminService.listar(null, null);

        List<LocalDate> datas = resultado.stream().map(c -> c.turmaOcorrencia().data()).toList();
        assertThat(datas).doesNotContain(dataOriginal); // sem fantasma no slot semanal que ficou vago
        assertThat(datas).filteredOn(novaData::equals).hasSize(1); // a ocorrência reagendada aparece exatamente uma vez
    }

    @Test
    void listarSoConsultaTurmasAtivasParaGerarOcorrenciasVirtuais() {
        LocalDate quarta = LocalDate.of(2026, 8, 5);
        when(agendamentoService.listar(quarta, null)).thenReturn(List.of());
        when(turmaOcorrenciaRepository.findByDataBetween(quarta, quarta)).thenReturn(List.of());
        when(turmaRepository.findByStatus(EStatusTurma.ATIVA)).thenReturn(List.of());

        agendaAdminService.listar(quarta, null);

        verify(turmaRepository).findByStatus(EStatusTurma.ATIVA);
    }

    private AgendamentoResponseDTO mockAgendamento() {
        return new AgendamentoResponseDTO(1L, "codigo", 1L, "Cliente", "71999999999", null, null, null, null, null,
                ECategoriaServico.MUSICOTERAPIA, null, null, null, null, null, List.of(), null, 50,
                LocalDate.of(2026, 8, 5), LocalTime.of(11, 0), EStatusAgendamento.AGENDADO, null, null, null, null);
    }

    private TurmaOcorrenciaResponseDTO mockOcorrencia(LocalDate data) {
        return new TurmaOcorrenciaResponseDTO(null, 7L, "ABC123", ECategoriaServico.AULA_INSTRUMENTO, null, data,
                LocalTime.of(15, 0), "Estúdio", 50, EStatusAgendamento.AGENDADO, null, null, List.of());
    }
}
