import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { BotaoCopiar } from "../../components/ui/BotaoCopiar";
import { GradeDeHorarios } from "../../components/ui/GradeDeHorarios";
import { extrairMensagemErro } from "../../services/api";
import { listarHorariosOcupados } from "../../services/agendamentoService";
import { listarPrecos } from "../../services/precoService";
import { criarTurma } from "../../services/turmaService";
import { slotIndisponivel } from "../../utils/disponibilidade";
import { gerarSlotsDeHorario } from "../../utils/horarios";
import { proximaOcorrenciaISO } from "../../utils/recorrencia";
import { CATEGORIA_LABELS, DIA_SEMANA_LABELS, INSTRUMENTO_LABELS } from "../../types/labels";
import type { ECategoriaServico, EDiaSemana, EInstrumento } from "../../types/domain";

const CATEGORIAS_DE_AULA = Object.keys(CATEGORIA_LABELS).filter((c) => c !== "EVENTO") as ECategoriaServico[];
const TODOS_INSTRUMENTOS = Object.keys(INSTRUMENTO_LABELS) as EInstrumento[];
const DIAS_SEMANA = Object.keys(DIA_SEMANA_LABELS) as EDiaSemana[];
const SLOTS = gerarSlotsDeHorario();

export function AdminTurmasPage() {
    return <AdminGate titulo="Cadastrar turma">{(adminKey) => <CadastroDeTurma adminKey={adminKey} />}</AdminGate>;
}

function CadastroDeTurma({ adminKey }: { adminKey: string }) {
    const [categoria, setCategoria] = useState<ECategoriaServico | "">("");
    const [instrumento, setInstrumento] = useState<EInstrumento | "">("");
    const [diaSemana, setDiaSemana] = useState<EDiaSemana | "">("");
    const [hora, setHora] = useState("");
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [complemento, setComplemento] = useState("");
    const ehInstrumento = categoria === "AULA_INSTRUMENTO";

    const precosQuery = useQuery({ queryKey: ["precos"], queryFn: listarPrecos });
    const duracaoGrupo =
        categoria !== "" ? (precosQuery.data?.find((p) => p.categoria === categoria && p.modalidade === "GRUPO")?.duracaoPadraoMinutos ?? null) : null;

    // Turma não tem uma data própria (é recorrente por dia da semana) - a grade usa a próxima
    // ocorrência do dia escolhido como referência de disponibilidade, mesma lógica do backend em
    // AgendamentoService#validarDisponibilidadeDeNovaTurma (que é quem valida de verdade).
    const dataDeReferencia = diaSemana !== "" ? proximaOcorrenciaISO(diaSemana, new Date()) : "";
    const ocupadosQuery = useQuery({
        queryKey: ["horarios-ocupados", dataDeReferencia],
        queryFn: () => listarHorariosOcupados(dataDeReferencia),
        enabled: dataDeReferencia !== "",
    });
    const ocupados = dataDeReferencia !== "" ? (ocupadosQuery.data ?? []) : [];

    useEffect(() => {
        if (hora !== "" && duracaoGrupo != null && slotIndisponivel(hora, duracaoGrupo, ocupados)) {
            setHora("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataDeReferencia, duracaoGrupo, ocupadosQuery.data]);

    const mutation = useMutation({
        mutationFn: () =>
            criarTurma(
                {
                    categoria: categoria as ECategoriaServico,
                    instrumento: ehInstrumento ? (instrumento as EInstrumento) : null,
                    diaSemana: diaSemana as EDiaSemana,
                    hora,
                    endereco: { cep, rua, numero, bairro, cidade, estado, complemento: complemento || undefined },
                },
                adminKey,
            ),
    });

    return (
        <>
            {mutation.isSuccess ? (
                <div className="detalhe-pacote">
                    <p>Turma criada! Compartilhe o código abaixo com as famílias interessadas:</p>
                    <p className="valor-estimado codigo-turma">
                        {mutation.data.codigo}
                        <BotaoCopiar valor={mutation.data.codigo} label="Copiar código" />
                    </p>
                    <button onClick={() => mutation.reset()}>Cadastrar outra turma</button>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate();
                    }}
                >
                    <fieldset className="form-section">
                        <legend>Dados da turma</legend>

                        <label htmlFor="categoria">Serviço</label>
                        <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as ECategoriaServico)} required>
                            <option value="">Selecione...</option>
                            {CATEGORIAS_DE_AULA.map((c) => (
                                <option key={c} value={c}>
                                    {CATEGORIA_LABELS[c]}
                                </option>
                            ))}
                        </select>

                        {ehInstrumento && (
                            <>
                                <label htmlFor="instrumento">Instrumento</label>
                                <select
                                    id="instrumento"
                                    value={instrumento}
                                    onChange={(e) => setInstrumento(e.target.value as EInstrumento)}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {TODOS_INSTRUMENTOS.map((i) => (
                                        <option key={i} value={i}>
                                            {INSTRUMENTO_LABELS[i]}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        <label htmlFor="diaSemana">Dia da semana</label>
                        <select id="diaSemana" value={diaSemana} onChange={(e) => setDiaSemana(e.target.value as EDiaSemana)} required>
                            <option value="">Selecione...</option>
                            {DIAS_SEMANA.map((dia) => (
                                <option key={dia} value={dia}>
                                    {DIA_SEMANA_LABELS[dia]}
                                </option>
                            ))}
                        </select>
                        <p className="aviso">
                            A turma acontece toda semana neste dia e horário. Cada família que se matricular recebe automaticamente
                            todas as aulas do pacote escolhido, geradas dentro de 31 dias corridos a partir da inscrição.
                        </p>

                        <label>Horário</label>
                        {diaSemana === "" && <p className="aviso">Escolha o dia da semana acima para ver os horários disponíveis.</p>}
                        {diaSemana !== "" && categoria === "" && <p className="aviso">Escolha o serviço acima para ver os horários disponíveis.</p>}
                        {diaSemana !== "" && categoria !== "" && ocupadosQuery.isLoading && <p className="aviso">Carregando horários disponíveis...</p>}
                        {diaSemana !== "" && categoria !== "" && (
                            <GradeDeHorarios
                                slots={SLOTS}
                                valorSelecionado={hora}
                                onSelecionar={setHora}
                                ehBloqueado={(slot) => duracaoGrupo == null || slotIndisponivel(slot, duracaoGrupo, ocupados)}
                            />
                        )}
                    </fieldset>

                    <fieldset className="form-section">
                        <legend>Endereço da turma</legend>

                        <label htmlFor="cep">CEP</label>
                        <input id="cep" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} required />

                        <label htmlFor="rua">Rua</label>
                        <input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} required />

                        <label htmlFor="numero">Número</label>
                        <input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} required />

                        <label htmlFor="bairro">Bairro</label>
                        <input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />

                        <label htmlFor="cidade">Cidade</label>
                        <input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />

                        <label htmlFor="estado">Estado (UF)</label>
                        <input id="estado" maxLength={2} placeholder="BA" value={estado} onChange={(e) => setEstado(e.target.value)} required />

                        <label htmlFor="complemento">Complemento (opcional)</label>
                        <input
                            id="complemento"
                            placeholder="Sala, ponto de referência..."
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />
                    </fieldset>

                    {mutation.isError && (
                        <p className="erro-campo">{extrairMensagemErro(mutation.error, "Não foi possível criar a turma.")}</p>
                    )}

                    {hora === "" && <p className="aviso">Selecione um horário na grade acima para poder criar a turma.</p>}
                    <button type="submit" disabled={mutation.isPending || hora === ""}>
                        {mutation.isPending ? "Criando..." : "Criar turma"}
                    </button>
                </form>
            )}
        </>
    );
}
