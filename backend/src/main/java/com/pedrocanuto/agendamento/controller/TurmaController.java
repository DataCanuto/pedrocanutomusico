package com.pedrocanuto.agendamento.controller;

import com.pedrocanuto.agendamento.dto.request.InscricaoTurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoCriadoResponseDTO;
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
 * Fluxo público de Turma: cliente confere dia da semana/hora/local pelo código antes de decidir
 * entrar, depois se matricula - mesmo modelo de confiança do POST /api/agendamentos (sem
 * autenticação). A inscrição gera uma aula por semana no pacote escolhido (ver
 * AgendamentoService#criarInscricaoTurma), por isso devolve o mesmo contrato de POST
 * /api/agendamentos (lista de aulas), não um único Agendamento.
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
    public ResponseEntity<AgendamentoCriadoResponseDTO> inscrever(@PathVariable String codigo,
                                                                    @Valid @RequestBody InscricaoTurmaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turmaService.inscrever(codigo, dto));
    }
}
