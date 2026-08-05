package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.dto.response.MatriculaResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.MatriculaMapper;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Representa o "fechamento de pacote" (Q2). aulasRestantes nunca é uma coluna mutável - é
 * sempre aulasContratadas menos a contagem de Agendamentos não cancelados desta matrícula,
 * evitando a classe de bugs de um contador que pode dessincronizar da realidade.
 */
@Service
@Transactional
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final MatriculaMapper matriculaMapper;

    public MatriculaService(MatriculaRepository matriculaRepository, AgendamentoRepository agendamentoRepository,
                             MatriculaMapper matriculaMapper) {
        this.matriculaRepository = matriculaRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.matriculaMapper = matriculaMapper;
    }

    public Matricula criar(Cliente cliente, Aluno aluno, PrecoServico precoServico, ETipoContratacao tipoContratacao,
                            EInstrumento instrumento, Turma turma) {
        Matricula matricula = new Matricula();
        matricula.setCliente(cliente);
        matricula.setAluno(aluno);
        matricula.setPrecoServico(precoServico);
        matricula.setTipoContratacao(tipoContratacao);
        matricula.setValorTotal(precoServico.getValor());
        matricula.setAulasContratadas(tipoContratacao.getQuantidadeAulas());
        matricula.setInstrumento(instrumento);
        matricula.setTurma(turma);
        matricula.setStatus(EStatusMatricula.ATIVA);
        return matriculaRepository.save(matricula);
    }

    /** "Aluno saiu da turma": inativa sem apagar histórico - reaproveita EStatusMatricula.CANCELADA como "inativo". */
    public MatriculaResponseDTO inativar(Long id) {
        Matricula matricula = buscarPorId(id);
        if (matricula.getStatus() != EStatusMatricula.ATIVA) {
            throw new RegraDeNegocioException("Matrícula já está inativa");
        }
        matricula.setStatus(EStatusMatricula.CANCELADA);
        return toResponseDTO(matricula);
    }

    /** Toma lock pessimista - use somente dentro do fluxo transacional que vai criar um Agendamento contra o saldo. */
    public Matricula buscarComLockPorId(Long id) {
        return matriculaRepository.findWithLockById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Matrícula", id));
    }

    @Transactional(readOnly = true)
    public Matricula buscarPorId(Long id) {
        return matriculaRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Matrícula", id));
    }

    @Transactional(readOnly = true)
    public long calcularAulasRestantes(Matricula matricula) {
        long usadas = agendamentoRepository.countByMatriculaIdAndStatusNot(matricula.getId(), EStatusAgendamento.CANCELADO);
        return Math.max(0, matricula.getAulasContratadas() - usadas);
    }

    @Transactional(readOnly = true)
    public MatriculaResponseDTO toResponseDTO(Matricula matricula) {
        return matriculaMapper.toResponseDTO(matricula, calcularAulasRestantes(matricula));
    }

    @Transactional(readOnly = true)
    public List<MatriculaResponseDTO> listarPorCliente(Long clienteId) {
        return matriculaRepository.findByClienteId(clienteId).stream().map(this::toResponseDTO).toList();
    }
}
