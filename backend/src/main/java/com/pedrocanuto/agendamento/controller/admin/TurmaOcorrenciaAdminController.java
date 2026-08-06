package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.request.ReagendarRequestDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaOcorrenciaResponseDTO;
import com.pedrocanuto.agendamento.service.TurmaOcorrenciaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Transições de status da aula de uma Turma numa semana específica - endereçada por
 * (turmaId, data) em vez de um id próprio, porque a ocorrência pode ainda não existir no banco
 * (é "virtual" até a primeira transição - ver TurmaOcorrenciaService). Sem "marcar-falta": não
 * faz sentido para a turma inteira, só para um aluno individual.
 */
@RestController
@RequestMapping("/api/admin/turmas/{turmaId}/ocorrencias")
public class TurmaOcorrenciaAdminController {

    private final TurmaOcorrenciaService turmaOcorrenciaService;

    public TurmaOcorrenciaAdminController(TurmaOcorrenciaService turmaOcorrenciaService) {
        this.turmaOcorrenciaService = turmaOcorrenciaService;
    }

    @PostMapping("/{data}/confirmar")
    public TurmaOcorrenciaResponseDTO confirmar(@PathVariable Long turmaId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate data) {
        return turmaOcorrenciaService.confirmar(turmaId, data);
    }

    @PostMapping("/{data}/check-in")
    public TurmaOcorrenciaResponseDTO checkIn(@PathVariable Long turmaId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate data) {
        return turmaOcorrenciaService.checkIn(turmaId, data);
    }

    @PostMapping("/{data}/iniciar")
    public TurmaOcorrenciaResponseDTO iniciar(@PathVariable Long turmaId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate data) {
        return turmaOcorrenciaService.iniciar(turmaId, data);
    }

    @PostMapping("/{data}/finalizar")
    public TurmaOcorrenciaResponseDTO finalizar(@PathVariable Long turmaId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate data) {
        return turmaOcorrenciaService.finalizar(turmaId, data);
    }

    @PostMapping("/{data}/cancelar")
    public TurmaOcorrenciaResponseDTO cancelar(@PathVariable Long turmaId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate data) {
        return turmaOcorrenciaService.cancelar(turmaId, data);
    }

    @PutMapping("/{data}/reagendar")
    public TurmaOcorrenciaResponseDTO reagendar(@PathVariable Long turmaId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate data,
                                                 @Valid @RequestBody ReagendarRequestDTO dto) {
        return turmaOcorrenciaService.reagendar(turmaId, data, dto.data(), dto.hora());
    }
}
