# PROJECT.md

# Projeto

Sistema de gerenciamento profissional de Pedro Canuto.

Objetivos:

- divulgar os serviços
- captar clientes
- gerenciar agenda
- controlar faturamento
- automatizar processos
- integrar WhatsApp

Cidade

Salvador - BA

---

# Serviços

- Musicalização Infantil
- Musicoterapia
- Aulas de Instrumento
- Eventos

---

# Landing Page

## Hero

Pedro Canuto

Músico

Professor

Musicoterapeuta

Texto de apresentação.

Botão:

Agendar agora.

---

## Sessões

### Musicalização Infantil

- descrição
- benefícios
- público
- galeria
- vídeos
- botão Agendar

---

### Musicoterapia

- descrição
- benefícios
- público
- duração
- botão Agendar

---

### Instrumentos

Instrumentos oferecidos:

- Violão
- Ukulele
- Baixo
- Cajón
- Pandeiro
- Flauta Doce
- Canto

Cada instrumento poderá possuir página própria futuramente.

---

### Eventos

Tipos

- Aniversários
- Casamentos
- Eventos Corporativos

Botão:

Solicitar orçamento.

---

# Contato

WhatsApp

(71) 99958-8950

Após qualquer agendamento:

cliente é direcionado ao WhatsApp.

---

# Painel Administrativo

Dashboard

Visualização:

- diária
- semanal
- mensal
- anual

Ao clicar em um agendamento mostrar:

- cliente
- endereço
- telefone
- serviço
- observações

Permitir:

- copiar endereço
- abrir Waze
- abrir WhatsApp

---

# Filtros

Clientes

Alunos

Responsáveis

Clientes por serviço

Receita diária

Receita semanal

Receita mensal

---

# Modelo de Domínio

## Cliente

Classe abstrata

Campos

- nome
- telefone
- dataNascimento
- sexo
- CPF (opcional)
- CNPJ (opcional)
- endereços

Especializações

Aluno

Responsável

---

## Endereço

- CEP
- Rua
- Número
- Bairro
- Cidade
- Estado
- Complemento

Buscar automaticamente pelo CEP.

---

## Serviço

Categorias

- Musicalização
- Musicoterapia
- Instrumento
- Evento

Cada categoria possui regras próprias.

---

## Agendamento

Campos

- cliente
- serviço
- data
- hora
- status
- observações
- dataHoraAgendamento

---

Status

AGENDADO

CONFIRMADO

CHECK_IN

EM_ANDAMENTO

FINALIZADO

CANCELADO

FALTOU

---

# Regras de Negócio

## Musicalização

Modalidades

Individual

Grupo

Preço

Individual

R$150

Grupo

R$80

Contratação

Avulsa

Pacote 2

Pacote 3

Pacote 4

Regras

Pacote 2

preço ×2

Pacote 3

preço ×3 ×0,97

Pacote 4

preço ×4 ×0,95

---

## Duração

Musicalização

até 5 anos

30 minutos

acima de 5 anos

50 minutos

Eventos

duração definida pelo cliente.

---

# Fluxo

Cliente

↓

Seleciona serviço

↓

Seleciona modalidade

↓

Preenche formulário

↓

Seleciona horário disponível

↓

Sistema cria agendamento

↓

Sistema envia notificação ao professor

↓

Cliente é redirecionado para WhatsApp

---

# Funcionalidades Futuras

- chatbot
- confirmação automática
- lembrete de aula
- integração WhatsApp
- integração Google Calendar
- integração Google Maps
- integração Waze
- dashboard financeiro
- login
- área do aluno
- área do responsável
- PIX
- upload de fotos
- upload de vídeos
- blog

---

# SEO

O projeto deve ser otimizado para aparecer nas pesquisas:

- aulas de música Salvador
- aulas de violão Salvador
- musicalização infantil Salvador
- musicoterapia Salvador
- músico para eventos Salvador

Todas as páginas devem possuir:

- Meta Title
- Meta Description
- Open Graph
- Schema.org
- URLs amigáveis
- Alto desempenho
- Lazy Loading
