import { useFormContext } from "react-hook-form";
import type { AgendamentoFormValues } from "./formTypes";

interface AlunoFieldsProps {
    /** Texto do fieldset - default cobre o fluxo de aula; EVENTO+ANIVERSARIO passa textos de aniversariante. */
    legend?: string;
    perguntaLabel?: string;
    nomeLabel?: string;
    /** Dica exibida abaixo da data de nascimento - passe null para omitir (não se aplica a EVENTO). */
    dica?: string | null;
}

/**
 * paraMim=true: quem participa é o próprio cliente, então nome/data de nascimento não são
 * pedidos de novo aqui - o formulário reaproveita clienteNome/clienteDataNascimento (ver
 * ClienteFields) no submit (AgendarPage.paraAgendamentoRequest). O backend continua exigindo
 * dadosAluno.nome/dataNascimento mesmo com paraMim=true - só deixamos de pedir a mesma
 * informação duas vezes na tela.
 *
 * Reaproveitado também para o aniversariante em EVENTO+ANIVERSARIO (ver AgendarPage) - mesma
 * estrutura de campos (paraMim/nome/dataNascimento/observações), só os textos mudam via props.
 */
export function AlunoFields({
    legend = "Quem vai participar da aula",
    perguntaLabel = "É para mim mesmo",
    nomeLabel = "Nome de quem vai participar",
    dica = "Usamos a idade para definir a duração da aula.",
}: AlunoFieldsProps) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const paraMim = watch("paraMim");

    return (
        <fieldset className="form-section">
            <legend>{legend}</legend>

            <label className="checkbox-label">
                <input type="checkbox" checked={paraMim} onChange={(e) => setValue("paraMim", e.target.checked)} />
                {perguntaLabel}
            </label>

            {!paraMim && (
                <>
                    <label htmlFor="alunoNome">{nomeLabel}</label>
                    <input id="alunoNome" {...register("alunoNome", { required: "Informe o nome" })} />
                    {errors.alunoNome && <span className="erro-campo">{errors.alunoNome.message}</span>}

                    <label htmlFor="alunoDataNascimento">Data de nascimento</label>
                    <input
                        id="alunoDataNascimento"
                        type="date"
                        {...register("alunoDataNascimento", { required: "Informe a data de nascimento" })}
                    />
                    {errors.alunoDataNascimento && <span className="erro-campo">{errors.alunoDataNascimento.message}</span>}
                    {dica && <small>{dica}</small>}
                </>
            )}

            <label htmlFor="alunoObservacoes">Observações (opcional)</label>
            <textarea id="alunoObservacoes" {...register("alunoObservacoes")} />
        </fieldset>
    );
}
