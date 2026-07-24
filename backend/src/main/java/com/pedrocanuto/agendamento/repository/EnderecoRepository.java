package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
}
