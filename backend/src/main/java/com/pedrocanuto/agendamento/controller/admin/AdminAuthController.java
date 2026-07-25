package com.pedrocanuto.agendamento.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Único propósito: dar ao frontend (AdminGate) uma forma barata de confirmar que o
 * X-Admin-Key informado é válido, sem depender do efeito colateral de carregar dados de
 * alguma página específica. A validação em si acontece inteiramente em AdminApiKeyFilter,
 * que já protege qualquer rota /api/admin/** - chegar até aqui já significa chave válida.
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @GetMapping("/verificar")
    public ResponseEntity<Void> verificar() {
        return ResponseEntity.noContent().build();
    }
}
