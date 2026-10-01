# pedrocanutomusico

Site do Pedro Canuto Músico: React + Vite em `frontend/`, publicado na Vercel.

## Agendamento on-line (Google Agenda)

O formulário em `/agendar` envia o pedido para a função `frontend/api/agendamentos.js`,
que revalida as regras de serviço (`frontend/src/agendamento/`), confere se o horário
está livre na agenda e cria o compromisso como **⏳ PENDENTE** (amarelo) no Google Agenda,
com nome, telefone, endereço e links de WhatsApp/Waze/Maps na descrição. Pacotes criam
um evento por encontro. Depois do envio o cliente é levado ao WhatsApp do Pedro com o resumo.

### Configuração (uma vez)

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative a **Google Calendar API**.
2. Em *IAM e administrador → Contas de serviço*, crie uma conta de serviço e gere uma chave **JSON**.
3. No Google Agenda, em *Configurações da agenda → Compartilhar com pessoas específicas*,
   adicione o e-mail da conta de serviço com a permissão **Fazer alterações nos eventos**.
4. Na Vercel (*Settings → Environment Variables*), cadastre:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: campo `client_email` do JSON
   - `GOOGLE_PRIVATE_KEY`: campo `private_key` do JSON (pode colar com os `\n`)
   - `GOOGLE_CALENDAR_ID`: o e-mail da agenda (ex.: `pedrocanuto96@gmail.com`) ou o id de uma agenda dedicada
5. Faça um novo deploy.

Sem essas variáveis o site continua no ar e o formulário orienta o cliente a chamar no WhatsApp.

### Confirmando um pedido

Abra o evento pendente, ajuste o que precisar, troque o título (tire o "⏳ PENDENTE") e a cor.
Os dados do pedido também ficam em `extendedProperties.private` do evento
(`statusAgendamento`, `agendamentoId`, `recorrencias`), para um agente automatizado
encontrar os pendentes, avisar e montar a recorrência depois da confirmação.

### Desenvolvimento

```bash
cd frontend
npm install
npm run dev     # site (as funções /api rodam com `vercel dev`)
npm test        # regras de agendamento e funções da API
npm run lint
```
