package com.pedrocanuto.agendamento.dto.request;

import com.pedrocanuto.agendamento.domain.enums.ESexo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.List;

public record ClienteRequestDTO(

        @NotBlank String nome,

        @NotBlank
        @Pattern(regexp = "\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}", message = "Telefone inválido")
        String telefone,

        @Email String email,

        @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
        String cpf,

        @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter 14 dígitos")
        String cnpj,

        @Past LocalDate dataNascimento,

        ESexo sexo,

        /**
         * Estruturalmente opcional aqui (matrícula em Turma não pede endereço do cliente - ver
         * TurmaService#inscrever, que usa o endereço da própria turma). Quem exige pelo menos um
         * é cada fluxo que realmente precisa: AgendamentoValidator (agendamento avulso/evento) e
         * ClienteService (cadastro/edição direta pelo admin).
         */
        @Valid List<EnderecoRequestDTO> enderecos
) {
}
