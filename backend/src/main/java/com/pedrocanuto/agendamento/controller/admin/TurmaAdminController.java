package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import com.pedrocanuto.agendamento.service.TurmaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/turmas")
public class TurmaAdminController {

    private final TurmaService turmaService;

    public TurmaAdminController(TurmaService turmaService) {
        this.turmaService = turmaService;
    }

    @PostMapping
    public ResponseEntity<TurmaResponseDTO> criar(@Valid @RequestBody TurmaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turmaService.criar(dto));
    }
}
