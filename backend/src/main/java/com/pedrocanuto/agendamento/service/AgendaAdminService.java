package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.TurmaOcorrencia;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.ECompromissoTipo;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.dto.response.AlunoDaTurmaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.CompromissoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaOcorrenciaResponseDTO;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.mapper.TurmaOcorrenciaMapper;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import com.pedrocanuto.agendamento.repository.TurmaOcorrenciaRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Compõe a visão unificada da agenda do professor: Agendamentos individuais/evento
 * ({@link AgendamentoService#listar}) lado a lado com ocorrências de Turma (persistidas +
 * virtuais - ver {@link TurmaOcorrencia}), como uma única lista de compromissos. Turma não tem
 * data de término, então ocorrências virtuais só são geradas dentro de uma janela ao redor de
 * hoje (não "para sempre") quando nenhuma data específica é pedida.
 */
@Service
@Transactional(readOnly = true)
public class AgendaAdminService {

    private static final int JANELA_PASSADO_DIAS = 7;
    private static final int JANELA_FUTURO_DIAS = 31;

    private final AgendamentoService agendamentoService;
    private final TurmaOcorrenciaRepository turmaOcorrenciaRepository;
    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final PrecoServicoService precoServicoService;
    private final TurmaMapper turmaMapper;
    private final TurmaOcorrenciaMapper turmaOcorrenciaMapper;

    public AgendaAdminService(AgendamentoService agendamentoService, TurmaOcorrenciaRepository turmaOcorrenciaRepository,
                               TurmaRepository turmaRepository, MatriculaRepository matriculaRepository,
                               PrecoServicoService precoServicoService, TurmaMapper turmaMapper,
                               TurmaOcorrenciaMapper turmaOcorrenciaMapper) {
        this.agendamentoService = agendamentoService;
        this.turmaOcorrenciaRepository = turmaOcorrenciaRepository;
        this.turmaRepository = turmaRepository;
        this.matriculaRepository = matriculaRepository;
        this.precoServicoService = precoServicoService;
        this.turmaMapper = turmaMapper;
        this.turmaOcorrenciaMapper = turmaOcorrenciaMapper;
    }

    public List<CompromissoResponseDTO> listar(LocalDate data, ECategoriaServico categoria) {
        List<CompromissoResponseDTO> resultado = new ArrayList<>();
        agendamentoService.listar(data, categoria).forEach(a ->
                resultado.add(new CompromissoResponseDTO(ECompromissoTipo.AGENDAMENTO, a, null)));
        listarOcorrenciasDeTurma(data, categoria).forEach(o ->
                resultado.add(new CompromissoResponseDTO(ECompromissoTipo.TURMA_OCORRENCIA, null, o)));
        return resultado;
    }

    private List<TurmaOcorrenciaResponseDTO> listarOcorrenciasDeTurma(LocalDate data, ECategoriaServico categoria) {
        LocalDate inicio = data != null ? data : LocalDate.now().minusDays(JANELA_PASSADO_DIAS);
        LocalDate fim = data != null ? data : LocalDate.now().plusDays(JANELA_FUTURO_DIAS);

        List<TurmaOcorrencia> persistidas = turmaOcorrenciaRepository.findByDataBetween(inicio, fim);
        Set<String> chavesPersistidas = new HashSet<>();
        for (TurmaOcorrencia ocorrencia : persistidas) {
            chavesPersistidas.add(chave(ocorrencia.getTurma().getId(), ocorrencia.getData()));
            // Ocorrência reagendada (ver TurmaOcorrenciaService#reagendar): o slot semanal natural que ela
            // vagou também precisa ficar marcado, senão o loop abaixo gera um fantasma nele.
            if (ocorrencia.getDataOriginal() != null) {
                chavesPersistidas.add(chave(ocorrencia.getTurma().getId(), ocorrencia.getDataOriginal()));
            }
        }

        List<TurmaOcorrencia> todas = new ArrayList<>(persistidas);
        for (Turma turma : turmaRepository.findByStatus(EStatusTurma.ATIVA)) {
            for (LocalDate dia = inicio; !dia.isAfter(fim); dia = dia.plusDays(1)) {
                if (dia.getDayOfWeek() == turma.getDiaSemana() && !chavesPersistidas.contains(chave(turma.getId(), dia))) {
                    TurmaOcorrencia virtual = new TurmaOcorrencia();
                    virtual.setTurma(turma);
                    virtual.setData(dia);
                    todas.add(virtual);
                }
            }
        }

        Map<Long, List<AlunoDaTurmaResponseDTO>> alunosAtivosPorTurma = buscarAlunosAtivosPorTurma();
        return todas.stream()
                .filter(o -> categoria == null || o.getTurma().getCategoria() == categoria)
                .map(o -> turmaOcorrenciaMapper.toResponseDTO(o,
                        precoServicoService.buscarDuracaoDeGrupo(o.getTurma().getCategoria()),
                        alunosAtivosPorTurma.getOrDefault(o.getTurma().getId(), List.of())))
                .toList();
    }

    private Map<Long, List<AlunoDaTurmaResponseDTO>> buscarAlunosAtivosPorTurma() {
        Map<Long, List<AlunoDaTurmaResponseDTO>> resultado = new HashMap<>();
        for (Matricula matricula : matriculaRepository.listarComTurmaEAluno()) {
            if (matricula.getStatus() != EStatusMatricula.ATIVA) {
                continue;
            }
            resultado.computeIfAbsent(matricula.getTurma().getId(), id -> new ArrayList<>())
                    .add(turmaMapper.paraAlunoDaTurma(matricula));
        }
        return resultado;
    }

    private static String chave(Long turmaId, LocalDate data) {
        return turmaId + "|" + data;
    }
}
