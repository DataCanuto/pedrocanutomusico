package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.response.EnderecoListItemResponseDTO;
import com.pedrocanuto.agendamento.service.EnderecoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/enderecos")
public class EnderecoAdminController {

    private final EnderecoService enderecoService;

    public EnderecoAdminController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @GetMapping
    public List<EnderecoListItemResponseDTO> listar() {
        return enderecoService.listarTodos();
    }
}
