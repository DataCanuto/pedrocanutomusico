package com.pedrocanuto.agendamento.controller;

import com.pedrocanuto.agendamento.dto.request.AgendamentoRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoResponseDTO;
import com.pedrocanuto.agendamento.service.AgendamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Fluxo público de agendamento (PROJECT.md: serviço -> modalidade -> formulário -> horário).
 * Além da criação, expõe consulta pelo código público (não sequencial) para o próprio cliente
 * acompanhar sua aula - listar/detalhar por id sequencial continua só em
 * AgendamentoAdminController, atrás do filtro de admin, já que ali é dado de terceiros.
 */
@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDTO> criar(@Valid @RequestBody AgendamentoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoService.criar(dto));
    }

    /** codigoPublico é a prova de posse - não sequencial, não dá pra adivinhar o de outro cliente. */
    @GetMapping("/publico/{codigoPublico}")
    public AgendamentoResponseDTO buscarPorCodigoPublico(@PathVariable String codigoPublico) {
        return agendamentoService.buscarPorCodigoPublico(codigoPublico);
    }
}
