package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.dto.response.MatriculaResponseDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.MatriculaMapper;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatriculaServiceTest {

    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private MatriculaMapper matriculaMapper;

    private MatriculaService matriculaService;

    @BeforeEach
    void setUp() {
        matriculaService = new MatriculaService(matriculaRepository, agendamentoRepository, matriculaMapper);
    }

    @Test
    void criarComTurmaPreenchidaGravaVinculoNaMatricula() {
        Cliente cliente = new Cliente();
        Aluno aluno = new Aluno();
        PrecoServico preco = new PrecoServico();
        preco.setValor(new BigDecimal("70.00"));
        Turma turma = new Turma();
        turma.setId(7L);
        when(matriculaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Matricula matricula = matriculaService.criar(cliente, aluno, preco, ETipoContratacao.PACOTE_4, null, turma);

        assertThat(matricula.getTurma()).isSameAs(turma);
        assertThat(matricula.getStatus()).isEqualTo(EStatusMatricula.ATIVA);
        assertThat(matricula.getValorTotal()).isEqualByComparingTo("70.00");
    }

    @Test
    void criarSemTurmaDeixaVinculoNulo() {
        when(matriculaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        PrecoServico preco = new PrecoServico();
        preco.setValor(new BigDecimal("150.00"));

        Matricula matricula = matriculaService.criar(new Cliente(), new Aluno(), preco, ETipoContratacao.AVULSO, null, null);

        assertThat(matricula.getTurma()).isNull();
    }

    @Test
    void inativarMudaStatusParaCancelada() {
        Matricula matricula = new Matricula();
        matricula.setId(1L);
        matricula.setAulasContratadas(4);
        matricula.setStatus(EStatusMatricula.ATIVA);
        when(matriculaRepository.findById(1L)).thenReturn(java.util.Optional.of(matricula));
        when(matriculaMapper.toResponseDTO(any(), org.mockito.ArgumentMatchers.anyLong()))
                .thenReturn(new MatriculaResponseDTO(1L, null, null, null, null, null, null, null, null, null, 0, 0,
                        EStatusMatricula.CANCELADA, null));

        MatriculaResponseDTO resposta = matriculaService.inativar(1L);

        assertThat(matricula.getStatus()).isEqualTo(EStatusMatricula.CANCELADA);
        assertThat(resposta.status()).isEqualTo(EStatusMatricula.CANCELADA);
    }

    @Test
    void inativarMatriculaJaInativaLancaExcecao() {
        Matricula matricula = new Matricula();
        matricula.setId(2L);
        matricula.setStatus(EStatusMatricula.CANCELADA);
        when(matriculaRepository.findById(2L)).thenReturn(java.util.Optional.of(matricula));

        assertThatThrownBy(() -> matriculaService.inativar(2L))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("inativa");
    }

    @Test
    void calcularAulasRestantesDescontaAgendamentosNaoCancelados() {
        Matricula matricula = new Matricula();
        matricula.setId(5L);
        matricula.setAulasContratadas(4);
        when(agendamentoRepository.countByMatriculaIdAndStatusNot(5L, com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento.CANCELADO))
                .thenReturn(3L);

        assertThat(matriculaService.calcularAulasRestantes(matricula)).isEqualTo(1L);
    }
}
