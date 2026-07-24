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
