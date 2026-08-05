package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.MatriculaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaComAlunosResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import com.pedrocanuto.agendamento.service.TurmaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping
    public List<TurmaComAlunosResponseDTO> listarComAlunos() {
        return turmaService.listarComAlunos();
    }

    /**
     * Completa/corrige o endereço estruturado de uma turma - necessário sobretudo para turmas
     * criadas antes do endereço estruturado existir (ver Turma#enderecoCep), que travam a
     * matrícula em TurmaService#comEnderecoDaTurmaSeAusente até o professor preencher aqui.
     */
    @PatchMapping("/{id}/endereco")
    public TurmaResponseDTO atualizarEndereco(@PathVariable Long id, @Valid @RequestBody EnderecoRequestDTO dto) {
        return turmaService.atualizarEndereco(id, dto);
    }

    /** "Aluno saiu da turma" - inativa a matrícula sem apagar histórico (ver TurmaService#inativarMatricula). */
    @PatchMapping("/matriculas/{id}/inativar")
    public MatriculaResponseDTO inativarMatricula(@PathVariable Long id) {
        return turmaService.inativarMatricula(id);
    }
}
