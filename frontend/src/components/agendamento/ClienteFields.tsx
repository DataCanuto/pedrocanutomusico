import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ehGrupoDeAula, type AgendamentoFormValues } from "./formTypes";
import { buscarEnderecoPorCep } from "../../services/cepService";

const CAMPOS_ENDERECO = [
    "clienteEnderecoCep",
    "clienteEnderecoRua",
    "clienteEnderecoNumero",
    "clienteEnderecoBairro",
    "clienteEnderecoCidade",
    "clienteEnderecoEstado",
    "clienteEnderecoComplemento",
] as const;

export function ClienteFields() {
    const {
        register,
        watch,
        setValue,
        unregister,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const paraMim = watch("paraMim");
    const categoria = watch("categoria");
    const modalidade = watch("modalidade");
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [erroCep, setErroCep] = useState<string | null>(null);

    const ehGrupo = ehGrupoDeAula(categoria, modalidade);

    /**
     * Aula em grupo acontece sempre no endereço fixo da turma (confirmado em TurmaCampos), não na
     * casa do cliente - por isso este bloco nem pede o endereço quando ehGrupo. unregister (em vez
     * de só deixar de renderizar) evita o gotcha clássico do RHF: sem isso, a regra `required`
     * registrada num render anterior (ex.: cliente trocou de "Individual" para "Grupo") ficaria
     * presa e bloquearia o envio mesmo com os campos fora de tela. O backend também não exige mais
     * endereço nesse fluxo - ver TurmaService#inscrever.
     */
    useEffect(() => {
        if (ehGrupo) {
            unregister(CAMPOS_ENDERECO);
        }
    }, [ehGrupo, unregister]);

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

            {!ehGrupo && (
                <>
                    <label htmlFor="clienteEnderecoCep">CEP</label>
                    <input
                        id="clienteEnderecoCep"
                        placeholder="00000-000"
                        {...register("clienteEnderecoCep", {
                            required: "Informe o CEP",
                            onBlur: (e) => preencherEnderecoPeloCep(e.target.value),
                        })}
                    />
                    {buscandoCep && <small>Buscando endereço...</small>}
                    {erroCep && <span className="erro-campo">{erroCep}</span>}
                    {errors.clienteEnderecoCep && <span className="erro-campo">{errors.clienteEnderecoCep.message}</span>}

                    <label htmlFor="clienteEnderecoRua">Rua</label>
                    <input id="clienteEnderecoRua" {...register("clienteEnderecoRua", { required: "Informe a rua" })} />
                    {errors.clienteEnderecoRua && <span className="erro-campo">{errors.clienteEnderecoRua.message}</span>}

                    <label htmlFor="clienteEnderecoNumero">Número</label>
                    <input id="clienteEnderecoNumero" {...register("clienteEnderecoNumero", { required: "Informe o número" })} />
                    {errors.clienteEnderecoNumero && <span className="erro-campo">{errors.clienteEnderecoNumero.message}</span>}

                    <label htmlFor="clienteEnderecoBairro">Bairro</label>
                    <input id="clienteEnderecoBairro" {...register("clienteEnderecoBairro", { required: "Informe o bairro" })} />
                    {errors.clienteEnderecoBairro && <span className="erro-campo">{errors.clienteEnderecoBairro.message}</span>}

                    <label htmlFor="clienteEnderecoCidade">Cidade</label>
                    <input id="clienteEnderecoCidade" {...register("clienteEnderecoCidade", { required: "Informe a cidade" })} />
                    {errors.clienteEnderecoCidade && <span className="erro-campo">{errors.clienteEnderecoCidade.message}</span>}

                    <label htmlFor="clienteEnderecoEstado">Estado (UF)</label>
                    <input
                        id="clienteEnderecoEstado"
                        maxLength={2}
                        placeholder="BA"
                        {...register("clienteEnderecoEstado", { required: "Informe o estado" })}
                    />
                    {errors.clienteEnderecoEstado && <span className="erro-campo">{errors.clienteEnderecoEstado.message}</span>}

                    <label htmlFor="clienteEnderecoComplemento">Complemento (opcional)</label>
                    <input
                        id="clienteEnderecoComplemento"
                        placeholder="Apto, ponto de referência..."
                        {...register("clienteEnderecoComplemento")}
                    />
                </>
            )}
        </fieldset>
    );
}
