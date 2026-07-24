package com.pedrocanuto.agendamento.controller;

import com.pedrocanuto.agendamento.dto.response.PrecoServicoResponseDTO;
import com.pedrocanuto.agendamento.service.PrecoServicoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Leitura pública do catálogo de preços - o site precisa mostrar o preço antes do cliente agendar. */
@RestController
@RequestMapping("/api/precos")
public class PrecoServicoController {

    private final PrecoServicoService precoServicoService;

    public PrecoServicoController(PrecoServicoService precoServicoService) {
        this.precoServicoService = precoServicoService;
    }

    @GetMapping
    public List<PrecoServicoResponseDTO> listar() {
        return precoServicoService.listar();
    }
}
