package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.TurmaOcorrencia;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.dto.response.AlunoDaTurmaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaOcorrenciaResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.mapper.TurmaOcorrenciaMapper;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import com.pedrocanuto.agendamento.repository.TurmaOcorrenciaRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ciclo de vida da aula de uma Turma numa semana específica - reaproveita {@link EStatusAgendamento}
 * (mesmas transições confirmar/check-in/iniciar/finalizar/cancelar de um Agendamento individual),
 * sem "marcar falta" (não faz sentido para a turma inteira, só para um aluno). Ver
 * {@link TurmaOcorrencia} para o ciclo virtual→persistida.
 */
@Service
@Transactional
public class TurmaOcorrenciaService {

    private final TurmaOcorrenciaRepository turmaOcorrenciaRepository;
    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final PrecoServicoService precoServicoService;
    private final TurmaMapper turmaMapper;
    private final TurmaOcorrenciaMapper turmaOcorrenciaMapper;
    private final AgendamentoService agendamentoService;
    private final AgendamentoValidator agendamentoValidator;

    public TurmaOcorrenciaService(TurmaOcorrenciaRepository turmaOcorrenciaRepository, TurmaRepository turmaRepository,
                                   MatriculaRepository matriculaRepository, PrecoServicoService precoServicoService,
                                   TurmaMapper turmaMapper, TurmaOcorrenciaMapper turmaOcorrenciaMapper,
                                   AgendamentoService agendamentoService, AgendamentoValidator agendamentoValidator) {
        this.turmaOcorrenciaRepository = turmaOcorrenciaRepository;
        this.turmaRepository = turmaRepository;
        this.matriculaRepository = matriculaRepository;
        this.precoServicoService = precoServicoService;
        this.turmaMapper = turmaMapper;
        this.turmaOcorrenciaMapper = turmaOcorrenciaMapper;
        this.agendamentoService = agendamentoService;
        this.agendamentoValidator = agendamentoValidator;
    }

    public TurmaOcorrenciaResponseDTO confirmar(Long turmaId, LocalDate data) {
        return paraResponseDTO(transicionar(turmaId, data, EStatusAgendamento.CONFIRMADO));
    }

    public TurmaOcorrenciaResponseDTO checkIn(Long turmaId, LocalDate data) {
        TurmaOcorrencia ocorrencia = transicionar(turmaId, data, EStatusAgendamento.CHECK_IN);
        ocorrencia.setDataHoraCheckIn(LocalDateTime.now());
        return paraResponseDTO(ocorrencia);
    }

    public TurmaOcorrenciaResponseDTO iniciar(Long turmaId, LocalDate data) {
        return paraResponseDTO(transicionar(turmaId, data, EStatusAgendamento.EM_ANDAMENTO));
    }

    public TurmaOcorrenciaResponseDTO finalizar(Long turmaId, LocalDate data) {
        TurmaOcorrencia ocorrencia = transicionar(turmaId, data, EStatusAgendamento.FINALIZADO);
        ocorrencia.setDataHoraFinalizacao(LocalDateTime.now());
        return paraResponseDTO(ocorrencia);
    }

    public TurmaOcorrenciaResponseDTO cancelar(Long turmaId, LocalDate data) {
        return paraResponseDTO(transicionar(turmaId, data, EStatusAgendamento.CANCELADO));
    }

    /**
     * Move esta ocorrência (a turma só nesta semana específica) para nova data/hora, sem alterar o
     * horário recorrente da Turma - turma.diaSemana/hora seguem intocados e as próximas semanas
     * continuam normais. Guarda a data original em {@link TurmaOcorrencia#getDataOriginal()} na
     * primeira vez (nunca sobrescreve num segundo reagendamento) só para AgendaAdminService não
     * gerar uma ocorrência virtual fantasma no slot semanal que ficou vago.
     */
    public TurmaOcorrenciaResponseDTO reagendar(Long turmaId, LocalDate data, LocalDate novaData, LocalTime novaHora) {
        TurmaOcorrencia ocorrencia = buscarOuMaterializar(turmaId, data);
        if (ocorrencia.getStatus().isTerminal()) {
            throw new RegraDeNegocioException("Não é possível reagendar uma ocorrência com status " + ocorrencia.getStatus());
        }
        if (!novaData.equals(ocorrencia.getData()) && turmaOcorrenciaRepository.findByTurmaIdAndData(turmaId, novaData).isPresent()) {
            throw new RegraDeNegocioException("Esta turma já tem uma ocorrência marcada na data informada");
        }
        agendamentoValidator.validarHorarioDeAula(novaData, novaHora);
        Integer duracaoMinutos = precoServicoService.buscarDuracaoDeGrupo(ocorrencia.getTurma().getCategoria());
        agendamentoService.validarDisponibilidadeExcluindo(novaData, novaHora, duracaoMinutos, null, turmaId);

        if (ocorrencia.getDataOriginal() == null) {
            ocorrencia.setDataOriginal(ocorrencia.getData());
        }
        ocorrencia.setData(novaData);
        ocorrencia.setHora(novaHora);
        return paraResponseDTO(ocorrencia);
    }

    private TurmaOcorrencia transicionar(Long turmaId, LocalDate data, EStatusAgendamento novoStatus) {
        TurmaOcorrencia ocorrencia = buscarOuMaterializar(turmaId, data);
        if (!ocorrencia.getStatus().podeTransicionarPara(novoStatus)) {
            throw new RegraDeNegocioException(
                    "Não é possível mudar o status de %s para %s".formatted(ocorrencia.getStatus(), novoStatus));
        }
        ocorrencia.setStatus(novoStatus);
        return ocorrencia;
    }

    /** Materializa na primeira interação - antes disso a ocorrência só existe como cálculo virtual (ver AgendaAdminService). */
    private TurmaOcorrencia buscarOuMaterializar(Long turmaId, LocalDate data) {
        return turmaOcorrenciaRepository.findByTurmaIdAndData(turmaId, data)
                .orElseGet(() -> materializar(turmaId, data));
    }

    private TurmaOcorrencia materializar(Long turmaId, LocalDate data) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Turma", turmaId));
        if (turma.getDiaSemana() != data.getDayOfWeek()) {
            throw new RegraDeNegocioException(
                    "%s não é %s, o dia da semana desta turma".formatted(data, turma.getDiaSemana()));
        }
        TurmaOcorrencia ocorrencia = new TurmaOcorrencia();
        ocorrencia.setTurma(turma);
        ocorrencia.setData(data);
        return turmaOcorrenciaRepository.save(ocorrencia);
    }

    private TurmaOcorrenciaResponseDTO paraResponseDTO(TurmaOcorrencia ocorrencia) {
        Integer duracaoMinutos = precoServicoService.buscarDuracaoDeGrupo(ocorrencia.getTurma().getCategoria());
        List<AlunoDaTurmaResponseDTO> alunosAtivos = matriculaRepository
                .listarPorTurmaEStatus(ocorrencia.getTurma().getId(), EStatusMatricula.ATIVA).stream()
                .map(turmaMapper::paraAlunoDaTurma)
                .toList();
        return turmaOcorrenciaMapper.toResponseDTO(ocorrencia, duracaoMinutos, alunosAtivos);
    }
}
