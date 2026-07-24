package com.pedrocanuto.agendamento.controller.admin;

import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AlunoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.ClienteListItemResponseDTO;
import com.pedrocanuto.agendamento.dto.response.ClienteResponseDTO;
import com.pedrocanuto.agendamento.dto.response.MatriculaResponseDTO;
import com.pedrocanuto.agendamento.service.AlunoService;
import com.pedrocanuto.agendamento.service.ClienteService;
import com.pedrocanuto.agendamento.service.MatriculaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Painel do professor sobre clientes. Cadastro de Cliente/Aluno "de verdade" acontece dentro do
 * fluxo de agendamento (AgendamentoService); aqui é só consulta/edição administrativa - por isso
 * a resposta de listagem usa o DTO resumido (Q5) e o detalhe fica atrás do filtro de admin, já
 * que carrega telefone/endereço.
 */
@RestController
@RequestMapping("/api/admin/clientes")
public class ClienteAdminController {

    private final ClienteService clienteService;
    private final AlunoService alunoService;
    private final MatriculaService matriculaService;

    public ClienteAdminController(ClienteService clienteService, AlunoService alunoService,
                                   MatriculaService matriculaService) {
        this.clienteService = clienteService;
        this.alunoService = alunoService;
        this.matriculaService = matriculaService;
    }

    @GetMapping
    public List<ClienteListItemResponseDTO> listar() {
        return clienteService.listarResumido();
    }

    @GetMapping("/{id}")
    public ClienteResponseDTO buscarPorId(@PathVariable Long id) {
        return clienteService.buscarDetalhePorId(id);
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> criar(@Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.criar(dto));
    }

    @PutMapping("/{id}")
    public ClienteResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequestDTO dto) {
        return clienteService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        clienteService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/alunos")
    public List<AlunoResponseDTO> listarAlunos(@PathVariable Long id) {
        return alunoService.listarPorResponsavel(id);
    }

    @GetMapping("/{id}/matriculas")
    public List<MatriculaResponseDTO> listarMatriculas(@PathVariable Long id) {
        return matriculaService.listarPorCliente(id);
    }
}
