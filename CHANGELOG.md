# CHANGELOG

Registro do que foi implementado sessão a sessão. Ver [CLAUDE.md](CLAUDE.md) para as regras de comportamento do projeto e [PROJECT.md](PROJECT.md) para a especificação de domínio/produto.

---

## Sessão 1 — Backend e frontend do zero (2026-07-23)

### Contexto

Existia um protótipo manual em `agendamentosApp` (fora deste repositório) com boa intenção de modelagem mas que não compilava, sem Flyway, sem endpoints de Agendamento/Serviço. Por pedido explícito, ele não foi tocado — serviu só de referência de erros a não repetir. Backend e frontend foram construídos do zero aqui em `pedrocanuto.musico.app/`.

### Decisões de arquitetura

- **Cliente vs Aluno (Q1)** — `Cliente` é a conta/contato/responsável financeiro (quem recebe WhatsApp); `Aluno` é quem recebe o serviço, sempre com um `responsavel` (Cliente), mesmo quando é a própria pessoa (`ehProprioResponsavel=true`, cópia única de nome/nascimento na criação, sem sincronização automática depois). Cobre tanto "Pedro faz aula de violão" (cliente = aluno) quanto "Maria matriculou Sofia e Lara" (um cliente, dois alunos). O desenho original do PROJECT.md (Cliente abstrato com subclasses Aluno/Responsável) foi descartado porque herança Java não permite uma pessoa ser as duas coisas ao mesmo tempo.
- **Pacotes (Q2)** — `Matricula` representa o fechamento de um pacote (Avulso/2/3/4 aulas, desconto embutido no enum `ETipoContratacao`). O saldo de aulas restantes **não é uma coluna** — é derivado (`aulasContratadas - count(agendamentos não cancelados)`), evitando contador dessincronizado. Endpoint dedicado agenda aulas seguintes contra o saldo sem fechar um novo pacote.
- **Preços (Q3)** — `PrecoServico` é a única fonte de preço; cliente nunca envia valor; editar um preço não afeta agendamentos já criados (snapshot no momento da contratação).
- **Evento — redesenhado no meio da sessão** — o plano inicial era "sem preço fixo, orçamento manual do professor depois". Com o conteúdo real de negócio que foi sendo adicionado (pacotes nomeados tipo "Roda de Música com Banda das Crianças", alguns com preço fixo e outros "sob consulta"), `PrecoServico` foi redesenhado: para EVENTO, `modalidade` fica nula e `nome`/`descricao`/`publicoAlvo`/`tipoEvento` passam a existir; o cliente escolhe um pacote específico do catálogo (`eventoPrecoServicoId`) e o preço já sai definido na hora se for fixo, ou fica pendente de orçamento manual (`definirOrcamento`) se for "sob consulta". Também foi adicionado `musicasObrigatorias` (lista de músicas que não podem faltar) ao agendamento de evento.
- **Listagem de clientes (Q5)** — DTO resumido (`ClienteListItemResponseDTO`) com endereço formatado em uma linha, separado do DTO de detalhe.
- **Segurança** — rotas administrativas (preços, clientes, agendamentos, status) atrás de `AdminApiKeyFilter` (header `X-Admin-Key`) — substituto simples até JWT entrar (login é funcionalidade futura no PROJECT.md).

### Backend (`backend/`)

Spring Boot 3.5.16, Java 21, Maven, PostgreSQL + Flyway (profile padrão), H2 em memória (profile de teste).

- **Domínio**: `Cliente`, `Endereco`, `Aluno`, `PrecoServico`, `Matricula`, `Agendamento` + enums (`ECategoriaServico`, `EModalidadeServico`, `ETipoContratacao`, `EInstrumento`, `ETipoEvento`, `EStatusAgendamento` com transições legais centralizadas, `EStatusMatricula`, `ESexo`).
- **Migrations**: `V1__criar_tabelas_iniciais.sql`, `V2__seed_precos_conhecidos.sql` (só os preços que o dono do produto confirmou — Musicalização Infantil; Musicoterapia/Instrumento/Evento ficam para cadastro via admin, sem valor inventado).
- **DTOs/Mappers**: MapStruct em todos os mapeamentos; records para todos os DTOs.
- **Services**: `ClienteService`, `AlunoService`, `PrecoServicoService`, `MatriculaService`, `AgendamentoService` (orquestra criação/transições de status com métodos nomeados — `confirmar`/`checkIn`/`iniciar`/`finalizar`/`cancelar`/`marcarFalta` — em vez de PATCH genérico), `DuracaoCalculator` (idade-based para Musicalização Infantil, catálogo para o resto).
- **Validação de negócio**: `AgendamentoValidator` centraliza campos obrigatórios/proibidos por categoria.
- **Controllers**: públicos (`/api/precos`, `/api/agendamentos`) e admin (`/api/admin/**`, protegidos).
- **Exception handling**: `GlobalExceptionHandler` (`@RestControllerAdvice`) padroniza respostas de erro.
- **Testes**: 37 testes — unitários (regra de pacote, validador, transições de status), Mockito (orquestração do `AgendamentoService`), e um teste que sobe o contexto Spring completo com Flyway+Hibernate (`AgendamentoApplicationTests`) + teste de integração de repositório.

### Frontend (`frontend/`)

React 19 + TypeScript + Vite, React Router, Axios, React Query, React Hook Form. Sem Material UI ainda (CSS simples, decisão consciente de não gastar orçamento em polimento visual não pedido).

- **Páginas**: `HomePage`, `AgendarPage` (fluxo de agendamento completo, condicional por categoria), `AdminPrecosPage` (gerenciamento de preços, protegida por chave de admin).
- **Componentes**: `ClienteFields`, `AlunoFields`, `ServicoFields`, `HorarioFields` (reutilizáveis, compõem o formulário de agendamento).
- **Serviços**: cliente Axios centralizado, funções de API por domínio (`precoService`, `agendamentoService`), link de WhatsApp montado no frontend (sem integração de API do WhatsApp).

### Bugs reais encontrados durante verificação (não só testes automatizados)

1. Coluna `estado` `CHAR(2)` na migration vs `VARCHAR(2)` gerado pelo Hibernate — só apareceu no teste que sobe o contexto Spring completo.
2. Constraint de unicidade em `PrecoServico` bloquearia um 2º pacote de Evento (`categoria`+`modalidade` com `modalidade` sempre nula) — só apareceu testando via HTTP real.
3. `App.tsx` não importava `App.css` — página inteira sem estilo — só apareceu na verificação visual no navegador (Playwright).

### Pendências conhecidas

- **PostgreSQL real do usuário** ainda não testado (backend foi validado contra H2 nas verificações ao vivo desta sessão) — falta confirmar a conexão assim que o banco estiver configurado.
- **Conteúdo do catálogo de Evento incompleto/conflitante**: "Roda de Música + Música ao Vivo" tem valores diferentes em anotações distintas do usuário (R$1200 vs R$1500); Casamento/Aniversário de Adultos não tem pacotes definidos ainda. Não foi inventado nenhum valor — fica para o usuário decidir e cadastrar via `/admin/precos`.
- **Repositório Git**: projeto ainda não inicializado como repositório.
- Fora de escopo por decisão consciente: dashboard admin completo (calendário, filtros de receita), conteúdo/SEO da landing page, notificação real ao professor, motor de disponibilidade de horários, autenticação JWT completa.

---

## Sessão 1 (continuação) — DTOs de Anamnese de Musicoterapia

Escopo explicitamente reduzido pelo usuário: apenas os Request DTOs que representam a anamnese clínica, sem entidade, migration, repository, service, controller ou validação de negócio.

Criados em `backend/src/main/java/com/pedrocanuto/agendamento/dto/request/`:

- `HistoricoClinicoRequestDTO`, `PerfilDesenvolvimentoRequestDTO`, `HistoricoMusicalRequestDTO`, `ResponsavelRequestDTO`, `AnamneseInfantilRequestDTO` — um record por bloco coeso da anamnese.
- `AnamneseMusicoterapiaRequestDTO` — compõe os anteriores + campos de seção única (motivo do encaminhamento, queixa principal, objetivos etc.).

Validação minimalista por pedido explícito: nenhum `@NotBlank`/`@NotNull` em conteúdo clínico; só `@Email` (responsável) e `@PositiveOrZero` (idade), ambos checagem de formato, não obrigatoriedade.

**Não incluído** (fica para uma próxima tarefa, por decisão explícita do usuário): `AgendamentoMusicoterapiaRequestDTO` (o request externo com cliente/aluno/data/hora que vai envolver essa anamnese), entidade `AnamneseMusicoterapia`, migration, repository, service, controller, e regra de negócio de quando `responsavel`/`anamneseInfantil` são obrigatórios (ex.: por idade do paciente).

---

## Sessão 2 — Preços reais (`prices.txt`) + estrutura para os casos de uso recorrentes (`use_cases.txt`) (2026-07-24)

### Contexto

Dois arquivos novos trouxeram dado de negócio real que substituiu premissas da Sessão 1: uma tabela de preços exata (não uma fórmula de desconto) e uma descrição dos fluxos mais recorrentes do sistema — revelando um conceito de domínio que faltava (**Turma**, aula em grupo com código compartilhável).

### Preços — modelo reescrito

- **`PrecoServico` ganhou `tipoContratacao` como parte da chave.** Cada combinação categoria+modalidade+tipoContratacao agora tem um **valor fixo direto** em vez de um preço unitário multiplicado por desconto — `prices.txt` não segue fórmula uniforme (ex.: Musicalização individual pacote_2=280, não 150×2=300) e nem toda categoria oferece todos os tamanhos (Instrumento não tem PACOTE_2/PACOTE_3; Musicoterapia tem PACOTE_12, que Musicalização não tem). `ETipoContratacao` perdeu o multiplicador de desconto - virou metadado puro de quantidade.
- **Duração deixou de ser calculada por idade.** A regra antiga (30min <5 anos, 50min ≥5 anos para Musicalização) foi **substituída** porque `prices.txt` mostra duração fixa por categoria+modalidade em toda linha, sem distinção de idade — mudança de comportamento testado na Sessão 1, sinalizada explicitamente ao usuário. `DuracaoCalculator` foi removido (virou leitura direta do catálogo).
- Campo renomeado `valorUnitario` → `valor` em toda a stack (entidade, DTOs, migration, tipos TS) - o nome antigo insinuava "multiplique isso", o que deixou de ser verdade.
- **Página de admin de preços ficou mais restrita para categorias de aula**: por pedido explícito do usuário ("é mais profissional definir no backend do que na área do professor"), o cadastro de preço de aula novo foi bloqueado (`PrecoServicoService.criar` rejeita categoria != EVENTO) - só é possível ajustar valor/duração de uma combinação já semeada via migration. EVENTO continua com cadastro livre (catálogo inerentemente flexível).
- Evento ganhou `equipe` e `materiais` (texto livre) e três novos `ETipoEvento` (`CARNAVAL`, `SAO_JOAO`, `MUSICOTERAPIA_EVENTO`), com todos os 12 pacotes de `prices.txt` semeados exatamente (incluindo os 3 níveis de equipe do Bailinho de Carnaval e da Quadrilha Junina).

### Turma (aula em grupo) — conceito novo

- Nova entidade `Turma`: código curto alfanumérico (6 caracteres, sem 0/O/1/I/L para evitar ambiguidade ao ditar por telefone), categoria, data, hora, local, status. Criada pelo professor (`POST /api/admin/turmas`).
- Cada aluno que se matricula recebe sua **própria** Matricula/Agendamento (preço de grupo é por aluno, confirmado pela tabela) - a Turma só fixa categoria/modalidade=GRUPO/data/hora/local; o pacote é escolhido por família. `AgendamentoService.criarAgendamentoDeAula` foi extraído como núcleo compartilhado entre o fluxo de agendamento direto e a inscrição em turma.
- Endpoints públicos: `GET /api/turmas/{codigo}` (consulta antes de decidir entrar) e `POST /api/turmas/{codigo}/inscricoes` (matrícula) - mesmo modelo de confiança do agendamento direto (sem autenticação).

### Outros itens de `use_cases.txt`

- **Consulta pública sem ID sequencial**: `Agendamento.codigoPublico` (UUID) + `GET /api/agendamentos/publico/{codigoPublico}` - o próprio usuário apontou o risco de IDOR com id sequencial, e sugeriu a solução implementada.
- **Horário em grade**: 08h–18h, de 15 em 15 minutos, validado no backend (`AgendamentoValidator.validarHorario`, reaproveitado pela inscrição em turma) e refletido no frontend (`HorarioFields` virou `<select>` de slots gerados, não mais `<input type="time">` livre).
- **Check-in/finalização**: `Agendamento.dataHoraCheckIn`/`dataHoraFinalizacao`, preenchidos automaticamente pelos métodos `checkIn()`/`finalizar()` já existentes.
- **Listagens administrativas**: `GET /api/admin/alunos` (id, nome, idade, dados do responsável, endereço resumido, contadores de aulas agendadas/confirmadas/finalizadas) e `GET /api/admin/enderecos` (listagem global) - novos `EnderecoService`, `AlunoService.listarTodos`.

### Frontend

- `ServicoFields.tsx`: preço passou a vir de busca direta no catálogo (filtrando as opções de pacote realmente disponíveis por categoria+modalidade) em vez de calculado no cliente.
- `AdminPrecosPage.tsx`: seção de cadastro livre agora só existe para pacotes de evento; preços de aula só editam valor/duração de linhas existentes.
- Novas páginas: `TurmaPage.tsx` (pública - busca por código + formulário de matrícula) e `AdminTurmasPage.tsx` (professor cria turma e recebe o código pra compartilhar).

### Verificação

47 testes automatizados (10 a mais que a Sessão 1), incluindo teste de integração que confirma os 29 preços semeados batendo exatamente com `prices.txt`. Smoke test via HTTP real cobrindo: criação de turma, consulta por código (maiúsculo/minúsculo), duas matrículas com pacotes diferentes na mesma turma (mesma cliente reaproveitada, valores por aula corretos), consulta pública de agendamento por código, rejeição de pacote inexistente para uma categoria, rejeição de horário fora da grade, rejeição de turma para categoria EVENTO, check-in com timestamp automático.

### Pendências conhecidas (novas)

- Conteúdo de Casamento/Aniversário de Adultos em `prices.txt` ficou incompleto ("violão clássico, bandolim e lira", sem preço/estrutura) - não foi modelado, fica para quando houver mais detalhe.
- Dashboard de faturamento, cadastro de músico convidado, calendário visual administrativo e notificação automática via WhatsApp foram conscientemente deixados de fora desta rodada (ver seção "Fora de escopo" no plano da sessão) - a estrutura de dados já os suporta quando forem implementados.

---

## Sessão 3 — Agendamento recorrente de pacotes, fix de CORS no admin, interação com aulas na agenda (2026-07-24)

### Contexto

Comprar um pacote (`PACOTE_4`/`PACOTE_12`) só agendava a primeira aula - não havia tela nem endpoint público para marcar as demais (`agendarProximaAula` existia no service mas não estava exposto em nenhum controller). O usuário descreveu dois jeitos possíveis de resolver (cliente escolhe N datas soltas vs. cliente escolhe dia-da-semana+horário e o sistema gera as datas) e pediu para avaliar qual era mais prudente. Depois, ao testar a área do professor pela primeira vez nesta sessão, apareceram três problemas: turma não cadastrava, agenda/clientes não carregavam, e não dava pra interagir com o status das aulas.

### Decisão de arquitetura: agendamento recorrente por dia-da-semana

Optado (com validação do usuário) pelo modelo de **slots recorrentes**: o cliente escolhe de 1 a 3 combinações de dia-da-semana + horário; o backend gera todas as datas do pacote (round-robin a partir da próxima ocorrência de cada dia), sempre dentro de uma **janela de 31 dias corridos a partir de hoje** - se os dias escolhidos não derem conta disso (ex.: `PACOTE_12` com 1 dia/semana levaria ~12 semanas), a criação é rejeitada com mensagem acionável em vez de aceitar um pacote que só termina meses depois. AVULSO e EVENTO continuam com data/hora únicos - só pacotes de aula mudam de fluxo. Nenhuma tabela nova: o padrão recorrente não é persistido (mesma filosofia de `Matricula.aulasRestantes` - derivar, não guardar dado que pode dessincronizar), os `Agendamento` gerados são a única fonte da verdade.

- **Backend**: `HorarioRecorrenteRequestDTO`, `GeradorDeDatasRecorrentes` (utilitário puro, sem dependência de Spring/repositório - gera as datas e valida a janela de 31 dias) e `AgendamentoCriadoResponseDTO` (`{ matriculaId, agendamentos[] }`, retorno unificado de `POST /api/agendamentos` para qualquer categoria/pacote, evitando dois contratos de resposta diferentes) são novos. `AgendamentoRequestDTO` teve `data`/`hora` tornados condicionais e ganhou `recorrencias`; `AgendamentoValidator` valida que pacotes exigem `recorrencias` (1-3, sem duplicata) e AVULSO/EVENTO exigem `data`/`hora`. `AgendamentoService.criar` foi reorganizado em três ramos (evento/avulso/pacote recorrente) reaproveitando um novo helper privado `criarAgendamentoIndividual` (também usado por `agendarProximaAula`, que passou a compartilhar a mesma construção de `Agendamento`).
- **Frontend**: `HorarioFields.tsx` alterna entre a UI antiga (data+hora únicos, para AVULSO/EVENTO) e uma nova UI de dias recorrentes (para pacotes) com preview client-side das datas geradas (`utils/recorrencia.ts`, mesmo algoritmo do backend, só para exibição - o servidor sempre revalida). `AgendarPage.tsx`/`agendamentoService.ts` atualizados para o novo contrato de resposta (lista de aulas, não uma só).
- **Bônus pedido junto**: pacotes de evento agora são filtrados pelo `tipoEvento` escolhido (`ServicoFields.tsx`) - antes um cliente escolhendo "Casamento" via todos os pacotes de Carnaval/Aniversário também.
- **Testes**: `GeradorDeDatasRecorrentesTest` novo (contagem exata, ordem cronológica, rejeição por estourar 31 dias), `AgendamentoValidatorTest`/`AgendamentoServiceTest` estendidos para os novos casos condicionais.

### Bug real encontrado: CORS bloqueava TODAS as rotas `/api/admin/**`

Ao testar a criação de turma pela área do professor, nada funcionava - nem turma, nem agenda, nem clientes. Causa: `AdminApiKeyFilter` roda antes do Spring processar CORS; o preflight `OPTIONS` que o navegador manda antes de qualquer request nunca carrega o header `X-Admin-Key` (spec CORS não reenvia headers customizados no preflight), então o filtro rejeitava o preflight com 401 antes do Spring conseguir responder com `Access-Control-Allow-Origin` - o navegador então bloqueava a chamada real inteira por erro de CORS, mesmo com a chave certa. Corrigido em `AdminApiKeyFilter.shouldNotFilter`, que agora deixa `OPTIONS` passar livre (a requisição real seguinte continua validada normalmente - não abre brecha de segurança). Novo teste cobrindo o caso em `AdminApiKeyFilterTest`.

### Nova funcionalidade: interagir com o status das aulas na agenda do admin

O backend já tinha os endpoints de transição de status (`confirmar`/`check-in`/`iniciar`/`finalizar`/`cancelar`/`marcar-falta`/`orçamento`), mas `AdminAgendaPage.tsx` só listava as aulas do dia, sem nenhuma ação. Adicionados: `transicionarStatusAdmin`/`definirOrcamentoAdmin` em `agendamentoAdminService.ts`, e em `AdminAgendaPage.tsx` cada aula agora mostra os botões correspondentes ao seu status atual (espelhando `EStatusAgendamento.podeTransicionarPara` do backend, que continua sendo a autoridade real), além de um formulário de orçamento para eventos "sob consulta".

### Verificação

Suíte completa de testes backend passando (`mvn test`) depois de cada mudança. Validação ao vivo com backend (Spring Boot, porta 8080) e frontend (Vite, porta 5173) rodando lado a lado, dirigidos via Playwright headless:
- Pacote de 4 aulas com terça+quinta gerou exatamente as 4 datas esperadas; pacote de 12 com 1 dia/semana foi corretamente rejeitado; fluxo completo do formulário até a confirmação sem erros de console.
- Filtro de pacotes de evento por tipo confirmado (Casamento só mostra "Sob Consulta", Carnaval só mostra os pacotes de Carnaval).
- Criação de turma e carregamento de agenda/clientes confirmados funcionando após o fix de CORS.
- Ciclo completo de transição de status (Confirmar → Check-in → Iniciar aula → Finalizar) testado clicando de verdade nos botões da agenda, cada clique refletindo no banco e na tela.

### Dados de teste no banco de dev

Toda a verificação ao vivo usou o Postgres local do usuário (não H2) - clientes/alunos/matrículas/agendamentos/turmas de teste criados durante a sessão foram removidos manualmente via `psql` ao final (ordem segura respeitando FKs: agendamento → matrícula → aluno → cliente). Confirmado que produção usa uma `DB_URL` separada (variável de ambiente) com Flyway recriando o schema do zero - nenhum dado de teste desta sessão chega a produção.

### Pendências conhecidas (novas)

- **Reagendamento manual de uma aula individual pelo professor** (cliente pede pra trocar de dia depois do cadastro) - adiado por pedido explícito do usuário, "trataremos futuramente".
- Dashboard de faturamento, calendário administrativo mais rico (edição de agendamento, filtros) e autenticação JWT completa (substituindo `AdminApiKeyFilter`) continuam fora de escopo, como já registrado na Sessão 2.

---

## Sessão 4 — Turma passa a usar dia da semana recorrente, igual ao pacote individual (2026-07-25)

### Contexto

Pendência da Sessão 3: `Turma` fixava uma `data` (LocalDate) única, e `TurmaService.inscrever` sempre criava UM único `Agendamento` por família, ignorando quantas aulas o pacote escolhido (`PACOTE_2/3/4`) realmente contratava. O usuário pediu para alinhar o cadastro de Turma (`/admin/turmas`) ao mesmo modelo já usado no agendamento individual recorrente: o professor define um dia da semana + horário fixos, e o sistema gera automaticamente as datas de cada pacote dentro da janela de 31 dias corridos (mesma regra de `GeradorDeDatasRecorrentes`).

### Mudança

- **Banco**: migration `V4__turma_dia_semana_recorrente.sql` troca `turma.data DATE` por `turma.dia_semana VARCHAR(10)`. Projeto ainda não foi para produção - a coluna foi trocada direto (com um `DEFAULT` temporário só para não quebrar turmas de teste já existentes no banco local, removido em seguida).
- **Backend**: `Turma.diaSemana` (`DayOfWeek`) substitui `Turma.data`; mesma troca em `TurmaRequestDTO`/`TurmaResponseDTO` (`TurmaMapper` continua auto-mapeando por nome, sem mudança). O núcleo da mudança é `AgendamentoService.criarInscricaoTurma` (novo, package-private): gera N `AgendaSlot`s a partir do dia/hora da Turma via `GeradorDeDatasRecorrentes` (quantidade = `tipoContratacao.getQuantidadeAulas()`) e cria um `Agendamento` por aula contra uma única `Matricula`, reaproveitando os mesmos helpers já usados pelo pacote individual (`criarAgendamentoDeAula`/`criarAgendamentoIndividual`). Como Turma é aula em GRUPO (vários alunos podem ocupar o mesmo slot), essa rotina não faz a checagem de disponibilidade que o fluxo individual faz. `TurmaService.inscrever` e `TurmaController` passam a devolver `AgendamentoCriadoResponseDTO` (mesmo contrato de `POST /api/agendamentos`) em vez de um único `AgendamentoResponseDTO`.
- **Frontend**: `AdminTurmasPage.tsx` troca o campo de data por um select de dia da semana (reaproveita `DIA_SEMANA_LABELS`). `TurmaCampos.tsx` (formulário do cliente, que busca a turma pelo código antes de se matricular) agora mostra "Toda [dia da semana] às [hora]" e um preview das datas que serão geradas para o pacote já escolhido (reaproveita `gerarPreviewDeDatas` de `utils/recorrencia.ts`, o mesmo usado no pacote individual). `inscreverEmTurma` passou a retornar `AgendamentoCriadoResponse`, simplificando `AgendarPage.tsx` (não precisa mais empacotar manualmente um único agendamento numa lista de 1).
- **Testes**: `TurmaServiceTest` atualizado para verificar que `inscrever` delega para `criarInscricaoTurma` com os dados corretos da Turma; novo teste em `AgendamentoServiceTest` (`criarInscricaoTurmaGeraUmAgendamentoPorAulaDoPacoteNoDiaEHoraDaTurma`) confirma que um `PACOTE_4` gera exatamente 4 `Agendamento`s, todos no dia da semana/horário da Turma, sem checar disponibilidade.

### Verificação

Suíte completa de testes backend (`mvn test`) e typecheck do frontend (`tsc -b`) passando, incluindo a migration V4 aplicada com sucesso no banco de teste (H2) via Flyway.

---

## Sessão 5 — Regra de disponibilidade da agenda: duração + intervalo de 30min entre compromissos (2026-07-25)

### Contexto

`validarDisponibilidade` só checava colisão exata de `data+hora` (`existsByDataAndHoraAndStatusNot`) - duas aulas em horários próximos, mas não idênticos, podiam ser marcadas mesmo se uma invadisse o tempo da outra (ex.: aula de 50 min às 15h não impedia outra marcação às 15h15). O usuário pediu a regra fundamental da agenda do professor: um compromisso de duração D às H bloqueia até H+D+30min (intervalo mínimo de transição); ex.: 30 min às 15h bloqueia 15h-15:59 (16h livre), 50 min às 15h bloqueia 15h-16:29 (16:30 livre).

### Mudança

- `AgendamentoRepository.existsByDataAndHoraAndStatusNot` (só checava a hora exata) foi substituído por `findByDataAndStatusNot(data, status)`, que traz todos os compromissos ativos do dia para checagem em memória.
- `AgendamentoService.validarDisponibilidade` ganhou um parâmetro `duracaoMinutos` e agora compara intervalos `[início, início + duração + 30min)` em minutos inteiros desde a meia-noite (evita o estouro de virada de dia que `LocalTime.plusMinutes` teria com durações longas) - dois compromissos conflitam se um começa antes do outro terminar + intervalo, nos dois sentidos (simétrico: cobre tanto "cabe depois" quanto "cabe antes" do compromisso já existente).
- Como a duração só é conhecida depois de resolver o `PrecoServico` (ou o pacote de evento), `criar()` passou a resolver isso **antes** de validar disponibilidade, em vez de validar e só depois descobrir a duração. Efeito colateral positivo: `criarAgendamentoDeAula` agora recebe `PrecoServico` já resolvido em vez de `categoria`+`modalidade` soltos, eliminando uma consulta duplicada que existia entre o `criar()`/`criarInscricaoTurma` e o helper.
- Continua não havendo checagem de disponibilidade na inscrição em Turma (`criarInscricaoTurma`) - aula em grupo permite múltiplas famílias no mesmo slot por definição; a regra nova só afeta compromissos que ocupam a agenda do professor individualmente (aula avulsa, pacote individual, evento, próxima aula de matrícula).
- A "agenda do professor" (`AdminAgendaPage.tsx` / `GET /api/agendamentos`) não precisou de nenhuma mudança - ela já lista diretamente os `Agendamento`s do dia; a garantia de "sem conflito entre marcações" agora é estrutural (todo `Agendamento` só é criado depois de passar por esta validação centralizada), não uma view separada.
- Testes: `AgendamentoServiceTest` ganhou 4 casos cobrindo exatamente os dois exemplos do pedido (30 min e 50 min, checando o minuto bloqueado e o primeiro minuto liberado em cada caso) e 1 caso confirmando que um agendamento CANCELADO não bloqueia o horário.

### Pendência conhecida (nova)

- Criar uma `Turma` não checa se o dia da semana + horário escolhido colide com compromissos já existentes (a checagem só vale para `Agendamento`s reais, criados a cada inscrição/aula) - checar isso exigiria projetar conflito contra uma série recorrente indefinida (todas as terças futuras, por exemplo), o que é uma extensão bem maior da regra atual. Fora de escopo por ora.

### Verificação

Suíte completa de testes backend (`mvn test`, 91 testes) passando.
