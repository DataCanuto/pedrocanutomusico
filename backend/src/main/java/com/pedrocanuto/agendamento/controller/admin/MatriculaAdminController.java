package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.request.AgendarProximaAulaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoCriadoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoResponseDTO;
import com.pedrocanuto.agendamento.service.AgendamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Agenda mais uma aula contra o saldo de uma Matricula já fechada (Q2). Fica atrás do filtro de
 * admin por enquanto: sem login de cliente ainda, não há como confirmar que quem chama este
 * endpoint é o dono da matrícula - o professor faz isso a pedido do cliente até existir área do
 * aluno/responsável (PROJECT.md, funcionalidades futuras).
 */
@RestController
@RequestMapping("/api/admin/matriculas")
public class MatriculaAdminController {

    private final AgendamentoService agendamentoService;

    public MatriculaAdminController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping("/{id}/agendamentos")
    public ResponseEntity<AgendamentoResponseDTO> agendarProximaAula(@PathVariable Long id,
                                                                       @Valid @RequestBody AgendarProximaAulaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoService.agendarProximaAula(id, dto));
    }

    /** Sem request body - dia da semana, horário e valor são inferidos da última aula da matrícula (ver AgendamentoService#confirmarRecorrencia). */
    @PostMapping("/{id}/confirmar-recorrencia")
    public ResponseEntity<AgendamentoCriadoResponseDTO> confirmarRecorrencia(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoService.confirmarRecorrencia(id));
    }
}
