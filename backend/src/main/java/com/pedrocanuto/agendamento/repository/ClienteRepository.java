package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Cliente;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByTelefone(String telefone);

    List<Cliente> findByNomeContainingIgnoreCase(String nome);

    /** Traz os endereços num único SELECT (evita N+1 ao montar o resumo de endereço na listagem). */
    @Query("SELECT DISTINCT c FROM Cliente c LEFT JOIN FETCH c.enderecos ORDER BY c.nome")
    List<Cliente> listarTodosComEnderecos();
}
