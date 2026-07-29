# Deploy — Frontend (Vercel) + Backend/Banco (Railway)

Este roteiro assume um deploy gratuito (free tier) para validar o produto. As variáveis de ambiente abaixo já são as usadas pelo código (`application.properties` e `services/api.ts`) — não é preciso alterar nada no código para seguir este roteiro.

---

## 1. Banco de dados (Railway — PostgreSQL)

1. Crie uma conta em [railway.app](https://railway.app) (pode logar com GitHub).
2. Clique em **New Project → Provision PostgreSQL**.
3. Abra o serviço do Postgres criado e vá na aba **Variables** (ou **Connect**). Anote:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
4. Monte a URL JDBC no formato usado pelo backend:
   ```
   jdbc:postgresql://PGHOST:PGPORT/PGDATABASE
   ```

> O Flyway (`spring.flyway.enabled=true`) roda as migrations automaticamente na primeira subida do backend — não é preciso criar tabelas manualmente.

---

## 2. Backend (Railway — Spring Boot)

1. No mesmo projeto Railway, clique em **New → GitHub Repo** e selecione o repositório `pedrocanutomusico`.
2. Em **Settings**, defina o **Root Directory** como `backend`.
3. O Railway detecta o `pom.xml` e builda com Nixpacks (Maven + JDK) automaticamente — não é necessário Dockerfile.
4. Em **Variables**, configure:

   | Variável | Valor |
   |---|---|
   | `DB_URL` | `jdbc:postgresql://PGHOST:PGPORT/PGDATABASE` (do passo 1) |
   | `DB_USERNAME` | `PGUSER` |
   | `DB_PASSWORD` | `PGPASSWORD` |
   | `ADMIN_API_KEY` | uma chave forte e secreta (nunca a padrão `1234` de dev) |
   | `ADMIN_EXIGIR_HTTPS` | `true` |
   | `CORS_ALLOWED_ORIGIN` | URL da Vercel (deixe um placeholder por enquanto, ex: `https://placeholder.vercel.app`, e atualize no passo 3.4) |
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `SERVER_PORT` | `8080` (ou deixe o Railway injetar `PORT` e ajuste se necessário) |

5. Faça o deploy (Railway builda e sobe automaticamente a cada push na branch configurada).
6. Depois de subir, copie a URL pública gerada pelo Railway (em **Settings → Networking → Generate Domain**), algo como `https://seu-backend.up.railway.app`.
7. Teste rapidamente: `GET https://seu-backend.up.railway.app/api/...` (um endpoint público) deve responder.

> Atenção ao `AdminApiKeyStartupValidator`: com `SPRING_PROFILES_ACTIVE=prod`, a aplicação recusa subir se `ADMIN_API_KEY` estiver vazia ou igual ao valor padrão de dev. Configure a variável **antes** do primeiro deploy nesse profile.

---

## 3. Frontend (Vercel — React/Vite)

1. Crie uma conta em [vercel.com](https://vercel.com) (pode logar com GitHub).
2. Clique em **Add New → Project** e importe o mesmo repositório.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (detectado automaticamente)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Em **Environment Variables**, adicione:

   | Variável | Valor |
   |---|---|
   | `VITE_API_URL` | `https://seu-backend.up.railway.app/api` (URL do passo 2.6) |

5. Deploy. Ao final, a Vercel gera uma URL pública, ex: `https://seu-app.vercel.app`.

---

## 4. Conectar as duas pontas (pós-deploy)

1. Volte ao Railway e atualize a variável `CORS_ALLOWED_ORIGIN` do backend com a URL real da Vercel (`https://seu-app.vercel.app`), substituindo o placeholder do passo 2.4.
2. Redeploy do backend (o Railway costuma reiniciar automaticamente ao salvar a variável; se não, force um redeploy manual).
3. Abra o site da Vercel e teste o fluxo completo (ex: fazer um agendamento) para confirmar que o frontend está se comunicando com o backend sem erro de CORS.
4. (Opcional) Configure domínio próprio:
   - Na Vercel: **Settings → Domains**.
   - No Railway: **Settings → Networking → Custom Domain**.
   - Se usar domínio próprio no frontend, lembre de atualizar `CORS_ALLOWED_ORIGIN` novamente.

---

## 5. Checklist final

- [ ] Backend responde em produção com `SPRING_PROFILES_ACTIVE=prod`
- [ ] Migrations Flyway rodaram sem erro (checar logs do Railway)
- [ ] `ADMIN_API_KEY` configurada com valor forte, diferente do padrão de dev
- [ ] `CORS_ALLOWED_ORIGIN` aponta para a URL final da Vercel (ou domínio próprio)
- [ ] Frontend consegue chamar a API sem erro de CORS
- [ ] Fluxo principal (agendamento) testado ponta a ponta em produção

---

## 6. Riscos do plano gratuito (resumo)

Ver explicação detalhada na conversa com o assistente, mas em resumo:

- **Railway free/trial**: funciona por créditos mensais limitados, não por "sempre grátis"; o serviço pode parar de responder se o crédito acabar no meio do mês. Sem SLA e sem backup automático do banco no plano gratuito — faça backups manuais (`pg_dump`) periodicamente.
- **Vercel free (Hobby)**: limite de banda e de build minutes por mês; uso comercial explícito pode violar os termos do plano Hobby (a Vercel pede plano pago para "uso comercial").
- **Cold start**: planos gratuitos podem "dormir" serviços inativos, causando lentidão na primeira requisição após um tempo sem uso.
- **Mitigação recomendada**: monitorar uso/consumo no dashboard de cada plataforma, manter backup do banco fora da plataforma, e ter um plano de upgrade definido caso o tráfego cresça.
