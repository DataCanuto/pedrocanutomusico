package com.pedrocanuto.agendamento.controller;

import com.pedrocanuto.agendamento.dto.request.InscricaoTurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import com.pedrocanuto.agendamento.service.TurmaService;
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
 * Fluxo público de Turma: cliente confere data/hora/local pelo código antes de decidir entrar,
 * depois se matricula - mesmo modelo de confiança do POST /api/agendamentos (sem autenticação).
 */
@RestController
@RequestMapping("/api/turmas")
public class TurmaController {

    private final TurmaService turmaService;

    public TurmaController(TurmaService turmaService) {
        this.turmaService = turmaService;
    }

    @GetMapping("/{codigo}")
    public TurmaResponseDTO buscarPorCodigo(@PathVariable String codigo) {
        return turmaService.buscarPorCodigo(codigo);
    }

    @PostMapping("/{codigo}/inscricoes")
    public ResponseEntity<AgendamentoResponseDTO> inscrever(@PathVariable String codigo,
                                                              @Valid @RequestBody InscricaoTurmaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turmaService.inscrever(codigo, dto));
    }
}
