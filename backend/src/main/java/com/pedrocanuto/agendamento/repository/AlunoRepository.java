package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Aluno;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    List<Aluno> findByResponsavelId(Long responsavelId);

    Optional<Aluno> findByResponsavelIdAndEhProprioResponsavelTrue(Long responsavelId);

    Optional<Aluno> findByResponsavelIdAndNomeIgnoreCaseAndDataNascimento(
            Long responsavelId, String nome, LocalDate dataNascimento);
}
