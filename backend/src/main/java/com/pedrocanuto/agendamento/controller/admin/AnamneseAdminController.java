package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.response.PacienteMusicoterapiaResponseDTO;
import com.pedrocanuto.agendamento.service.AnamneseService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Painel "pacientes de musicoterapia" do professor (Q_verAnamneses) - ver AdminVerAnamnesesPage no frontend. */
@RestController
@RequestMapping("/api/admin/anamneses")
public class AnamneseAdminController {

    private final AnamneseService anamneseService;

    public AnamneseAdminController(AnamneseService anamneseService) {
        this.anamneseService = anamneseService;
    }

    @GetMapping
    public List<PacienteMusicoterapiaResponseDTO> listarPacientes() {
        return anamneseService.listarPacientes();
    }
}
