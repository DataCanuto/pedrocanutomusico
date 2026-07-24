import { useFormContext } from "react-hook-form";
import type { AgendamentoFormValues } from "./formTypes";

/**
 * paraMim=true: quem participa é o próprio cliente, então nome/data de nascimento não são
 * pedidos de novo aqui - o formulário reaproveita clienteNome/clienteDataNascimento (ver
 * ClienteFields) no submit (AgendarPage.paraAgendamentoRequest). O backend continua exigindo
 * dadosAluno.nome/dataNascimento (a duração da aula depende da idade de quem participa) - só
 * deixamos de pedir a mesma informação duas vezes na tela.
 */
export function AlunoFields() {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const paraMim = watch("paraMim");

    return (
        <fieldset className="form-section">
            <legend>Quem vai participar da aula</legend>

            <label className="checkbox-label">
                <input type="checkbox" checked={paraMim} onChange={(e) => setValue("paraMim", e.target.checked)} />
                É para mim mesmo
            </label>

            {!paraMim && (
                <>
                    <label htmlFor="alunoNome">Nome de quem vai participar</label>
                    <input id="alunoNome" {...register("alunoNome", { required: "Informe o nome do aluno" })} />
                    {errors.alunoNome && <span className="erro-campo">{errors.alunoNome.message}</span>}

                    <label htmlFor="alunoDataNascimento">Data de nascimento</label>
                    <input
                        id="alunoDataNascimento"
                        type="date"
                        {...register("alunoDataNascimento", { required: "Informe a data de nascimento" })}
                    />
                    {errors.alunoDataNascimento && <span className="erro-campo">{errors.alunoDataNascimento.message}</span>}
                    <small>Usamos a idade para definir a duração da aula.</small>
                </>
            )}

            <label htmlFor="alunoObservacoes">Observações (opcional)</label>
            <textarea id="alunoObservacoes" {...register("alunoObservacoes")} />
        </fieldset>
    );
}
