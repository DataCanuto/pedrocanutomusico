package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.dto.request.ReagendarRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.CompromissoResponseDTO;
import com.pedrocanuto.agendamento.service.AgendaAdminService;
import com.pedrocanuto.agendamento.service.AgendamentoService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Painel do professor sobre agendamentos: consulta (dado sensível de cliente) e transições de
 * status nomeadas - cada uma valida seu próprio estado-anterior legal em
 * EStatusAgendamento.podeTransicionarPara, em vez de um PATCH genérico de status.
 */
@RestController
@RequestMapping("/api/admin/agendamentos")
public class AgendamentoAdminController {

    private final AgendamentoService agendamentoService;
    private final AgendaAdminService agendaAdminService;

    public AgendamentoAdminController(AgendamentoService agendamentoService, AgendaAdminService agendaAdminService) {
        this.agendamentoService = agendamentoService;
        this.agendaAdminService = agendaAdminService;
    }

    /** Agendamentos individuais/evento + ocorrências de Turma juntos - ver AgendaAdminService. */
    @GetMapping
    public List<CompromissoResponseDTO> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) ECategoriaServico categoria) {
        return agendaAdminService.listar(data, categoria);
    }

    @GetMapping("/{id}")
    public AgendamentoResponseDTO buscarPorId(@PathVariable Long id) {
        return agendamentoService.buscarPorId(id);
    }

    @PostMapping("/{id}/confirmar")
    public AgendamentoResponseDTO confirmar(@PathVariable Long id) {
        return agendamentoService.confirmar(id);
    }

    @PostMapping("/{id}/check-in")
    public AgendamentoResponseDTO checkIn(@PathVariable Long id) {
        return agendamentoService.checkIn(id);
    }

    @PostMapping("/{id}/iniciar")
    public AgendamentoResponseDTO iniciar(@PathVariable Long id) {
        return agendamentoService.iniciar(id);
    }

    @PostMapping("/{id}/finalizar")
    public AgendamentoResponseDTO finalizar(@PathVariable Long id) {
        return agendamentoService.finalizar(id);
    }

    @PostMapping("/{id}/cancelar")
    public AgendamentoResponseDTO cancelar(@PathVariable Long id) {
        return agendamentoService.cancelar(id);
    }

    @PostMapping("/{id}/marcar-falta")
    public AgendamentoResponseDTO marcarFalta(@PathVariable Long id) {
        return agendamentoService.marcarFalta(id);
    }

    @PutMapping("/{id}/orcamento")
    public AgendamentoResponseDTO definirOrcamento(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        return agendamentoService.definirOrcamento(id, body.get("valor"));
    }

    @PutMapping("/{id}/reagendar")
    public AgendamentoResponseDTO reagendar(@PathVariable Long id, @Valid @RequestBody ReagendarRequestDTO dto) {
        return agendamentoService.reagendar(id, dto.data(), dto.hora());
    }
}
