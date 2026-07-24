package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.request.PrecoServicoRequestDTO;
import com.pedrocanuto.agendamento.dto.response.PrecoServicoResponseDTO;
import com.pedrocanuto.agendamento.service.PrecoServicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Página de gerenciamento de preços do professor (Q4). Protegida pelo AdminApiKeyFilter em
 * qualquer rota /api/admin/**.
 */
@RestController
@RequestMapping("/api/admin/precos")
public class PrecoServicoAdminController {

    private final PrecoServicoService precoServicoService;

    public PrecoServicoAdminController(PrecoServicoService precoServicoService) {
        this.precoServicoService = precoServicoService;
    }

    @PostMapping
    public ResponseEntity<PrecoServicoResponseDTO> criar(@Valid @RequestBody PrecoServicoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(precoServicoService.criar(dto));
    }

    @PutMapping("/{id}")
    public PrecoServicoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody PrecoServicoRequestDTO dto) {
        return precoServicoService.atualizar(id, dto);
    }
}
