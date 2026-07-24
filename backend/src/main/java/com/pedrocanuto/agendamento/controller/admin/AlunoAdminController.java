package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.response.AlunoListItemResponseDTO;
import com.pedrocanuto.agendamento.dto.response.AnamneseMusicoterapiaResponseDTO;
import com.pedrocanuto.agendamento.service.AlunoService;
import com.pedrocanuto.agendamento.service.AnamneseService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/alunos")
public class AlunoAdminController {

    private final AlunoService alunoService;
    private final AnamneseService anamneseService;

    public AlunoAdminController(AlunoService alunoService, AnamneseService anamneseService) {
        this.alunoService = alunoService;
        this.anamneseService = anamneseService;
    }

    @GetMapping
    public List<AlunoListItemResponseDTO> listar() {
        return alunoService.listarTodos();
    }

    /** 404 quando o aluno ainda não tem anamnese registrada (ver AnamneseService.criarSeAusente). */
    @GetMapping("/{id}/anamnese")
    public AnamneseMusicoterapiaResponseDTO buscarAnamnese(@PathVariable Long id) {
        return anamneseService.buscarPorAluno(id);
    }
}
