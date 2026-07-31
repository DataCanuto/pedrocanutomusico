import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ehGrupoDeAula, type AgendamentoFormValues } from "./formTypes";
import { buscarEnderecoPorCep } from "../../services/cepService";
import { buscarTurmaPorCodigo } from "../../services/turmaService";
import { extrairMensagemErro } from "../../services/api";

export function ClienteFields() {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const paraMim = watch("paraMim");
    const categoria = watch("categoria");
    const modalidade = watch("modalidade");
    const codigoTurma = watch("codigoTurma");
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [erroCep, setErroCep] = useState<string | null>(null);

    const ehGrupo = ehGrupoDeAula(categoria, modalidade);
    const codigoParecCompleto = codigoTurma.trim().length >= 6;

    /**
     * Aula em grupo acontece sempre no endereço fixo da turma (mesmo racional de enderecoEvento
     * em AgendarPage) - aqui "endereço do cliente" não é "onde ele mora", é "onde a aula
     * acontece", então nesse caso vem só da turma e fica travado. Mesma queryKey de TurmaCampos
     * (código já digitado ali) para o react-query reaproveitar a mesma busca em vez de duplicar.
     */
    const turmaQuery = useQuery({
        queryKey: ["turma", codigoTurma],
        queryFn: () => buscarTurmaPorCodigo(codigoTurma.trim()),
        enabled: ehGrupo && codigoParecCompleto,
        retry: false,
    });

    useEffect(() => {
        if (!ehGrupo) {
            return;
        }
        // Turma resolvida com endereço: preenche. Qualquer outro estado (código incompleto, ainda
        // buscando, erro, turma sem endereço estruturado) limpa os campos - sem isso, o endereço de
        // uma turma anterior ficaria "preso" (só desabilitado) ao trocar para um código inválido.
        const endereco = turmaQuery.isSuccess ? turmaQuery.data.endereco : null;
        setValue("clienteEnderecoCep", endereco?.cep ?? "", { shouldValidate: true });
        setValue("clienteEnderecoRua", endereco?.rua ?? "", { shouldValidate: true });
        setValue("clienteEnderecoNumero", endereco?.numero ?? "", { shouldValidate: true });
        setValue("clienteEnderecoBairro", endereco?.bairro ?? "", { shouldValidate: true });
        setValue("clienteEnderecoCidade", endereco?.cidade ?? "", { shouldValidate: true });
        setValue("clienteEnderecoEstado", endereco?.estado ?? "", { shouldValidate: true });
        setValue("clienteEnderecoComplemento", endereco?.complemento ?? "", { shouldValidate: true });
    }, [ehGrupo, turmaQuery.isSuccess, turmaQuery.data, setValue]);

    async function preencherEnderecoPeloCep(cep: string) {
        if (cep.replace(/\D/g, "").length !== 8) {
            return;
        }
        setErroCep(null);
        setBuscandoCep(true);
        try {
            const endereco = await buscarEnderecoPorCep(cep);
            if (!endereco) {
                setErroCep("CEP não encontrado.");
                return;
            }
            setValue("clienteEnderecoRua", endereco.rua, { shouldValidate: true });
            setValue("clienteEnderecoBairro", endereco.bairro, { shouldValidate: true });
            setValue("clienteEnderecoCidade", endereco.cidade, { shouldValidate: true });
            setValue("clienteEnderecoEstado", endereco.estado, { shouldValidate: true });
        } catch {
            setErroCep("Não foi possível buscar o CEP agora. Preencha o endereço manualmente.");
        } finally {
            setBuscandoCep(false);
        }
    }

    // Turma inválida, ou turma antiga sem endereço estruturado cadastrado (ver Turma#enderecoCep no backend).
    const enderecoDaTurmaIndisponivel =
        ehGrupo && codigoParecCompleto && (turmaQuery.isError || (turmaQuery.isSuccess && !turmaQuery.data.endereco));

    return (
        <fieldset className="form-section">
            <legend>Seus dados</legend>

            <label htmlFor="clienteNome">Nome completo</label>
            <input id="clienteNome" {...register("clienteNome", { required: "Informe seu nome" })} />
            {errors.clienteNome && <span className="erro-campo">{errors.clienteNome.message}</span>}

            <label htmlFor="clienteTelefone">WhatsApp</label>
            <input
                id="clienteTelefone"
                placeholder="(71) 99999-9999"
                {...register("clienteTelefone", { required: "Informe seu telefone com DDD" })}
            />
            {errors.clienteTelefone && <span className="erro-campo">{errors.clienteTelefone.message}</span>}

            <label htmlFor="clienteEmail">E-mail (opcional)</label>
            <input id="clienteEmail" type="email" {...register("clienteEmail")} />

            {paraMim && (
                <>
                    <label htmlFor="clienteDataNascimento">Data de nascimento</label>
                    <input
                        id="clienteDataNascimento"
                        type="date"
                        {...register("clienteDataNascimento", { required: "Informe sua data de nascimento" })}
                    />
                    {errors.clienteDataNascimento && <span className="erro-campo">{errors.clienteDataNascimento.message}</span>}
                    <small>Usamos a idade para definir a duração da aula.</small>
                </>
            )}

            {ehGrupo && (
                <p className="aviso">
                    {!codigoParecCompleto
                        ? "Informe o código da turma acima para carregar o endereço automaticamente."
                        : turmaQuery.isFetching
                          ? "Carregando endereço da turma..."
                          : !enderecoDaTurmaIndisponivel &&
                            "Endereço preenchido automaticamente a partir da turma - a aula acontece sempre nesse local."}
                </p>
            )}
            {enderecoDaTurmaIndisponivel && (
                <p className="erro-campo">
                    {turmaQuery.isError
                        ? extrairMensagemErro(turmaQuery.error, "Turma não encontrada para esse código.")
                        : "Esta turma ainda não tem endereço cadastrado - fale com o professor antes de continuar."}
                </p>
            )}

            <label htmlFor="clienteEnderecoCep">CEP</label>
            <input
                id="clienteEnderecoCep"
                placeholder="00000-000"
                disabled={ehGrupo}
                {...register("clienteEnderecoCep", {
                    required: "Informe o CEP",
                    onBlur: (e) => preencherEnderecoPeloCep(e.target.value),
                })}
            />
            {!ehGrupo && buscandoCep && <small>Buscando endereço...</small>}
            {!ehGrupo && erroCep && <span className="erro-campo">{erroCep}</span>}
            {!ehGrupo && errors.clienteEnderecoCep && <span className="erro-campo">{errors.clienteEnderecoCep.message}</span>}

            <label htmlFor="clienteEnderecoRua">Rua</label>
            <input id="clienteEnderecoRua" disabled={ehGrupo} {...register("clienteEnderecoRua", { required: "Informe a rua" })} />
            {!ehGrupo && errors.clienteEnderecoRua && <span className="erro-campo">{errors.clienteEnderecoRua.message}</span>}

            <label htmlFor="clienteEnderecoNumero">Número</label>
            <input
                id="clienteEnderecoNumero"
                disabled={ehGrupo}
                {...register("clienteEnderecoNumero", { required: "Informe o número" })}
            />
            {!ehGrupo && errors.clienteEnderecoNumero && <span className="erro-campo">{errors.clienteEnderecoNumero.message}</span>}

            <label htmlFor="clienteEnderecoBairro">Bairro</label>
            <input
                id="clienteEnderecoBairro"
                disabled={ehGrupo}
                {...register("clienteEnderecoBairro", { required: "Informe o bairro" })}
            />
            {!ehGrupo && errors.clienteEnderecoBairro && <span className="erro-campo">{errors.clienteEnderecoBairro.message}</span>}

            <label htmlFor="clienteEnderecoCidade">Cidade</label>
            <input
                id="clienteEnderecoCidade"
                disabled={ehGrupo}
                {...register("clienteEnderecoCidade", { required: "Informe a cidade" })}
            />
            {!ehGrupo && errors.clienteEnderecoCidade && <span className="erro-campo">{errors.clienteEnderecoCidade.message}</span>}

            <label htmlFor="clienteEnderecoEstado">Estado (UF)</label>
            <input
                id="clienteEnderecoEstado"
                maxLength={2}
                placeholder="BA"
                disabled={ehGrupo}
                {...register("clienteEnderecoEstado", { required: "Informe o estado" })}
            />
            {!ehGrupo && errors.clienteEnderecoEstado && <span className="erro-campo">{errors.clienteEnderecoEstado.message}</span>}

            <label htmlFor="clienteEnderecoComplemento">Complemento (opcional)</label>
            <input
                id="clienteEnderecoComplemento"
                placeholder="Apto, ponto de referência..."
                disabled={ehGrupo}
                {...register("clienteEnderecoComplemento")}
            />
        </fieldset>
    );
}
