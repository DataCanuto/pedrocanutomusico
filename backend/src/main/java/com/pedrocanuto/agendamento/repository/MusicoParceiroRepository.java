package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.MusicoParceiro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MusicoParceiroRepository extends JpaRepository<MusicoParceiro, Long> {

    boolean existsByCpf(String cpf);
}
