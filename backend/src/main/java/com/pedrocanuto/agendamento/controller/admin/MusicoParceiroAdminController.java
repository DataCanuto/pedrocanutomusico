package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.request.MusicoParceiroRequestDTO;
import com.pedrocanuto.agendamento.dto.response.MusicoParceiroResponseDTO;
import com.pedrocanuto.agendamento.service.MusicoParceiroService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/musicos")
public class MusicoParceiroAdminController {

    private final MusicoParceiroService musicoParceiroService;

    public MusicoParceiroAdminController(MusicoParceiroService musicoParceiroService) {
        this.musicoParceiroService = musicoParceiroService;
    }

    @PostMapping
    public ResponseEntity<MusicoParceiroResponseDTO> criar(@Valid @RequestBody MusicoParceiroRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(musicoParceiroService.criar(dto));
    }

    @GetMapping
    public List<MusicoParceiroResponseDTO> listar() {
        return musicoParceiroService.listarTodos();
    }
}
