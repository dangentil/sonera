## Correções críticas antes de compartilhar o link

### 1. Bug bloqueante: feed não carrega (erro 400)
A consulta do feed em `src/pages/Index.tsx` tenta juntar `ratings → profiles`, mas não existe foreign key entre as duas tabelas. O Supabase devolve `PGRST200` e a página fica com "Carregando..." ou vazia para todo mundo.

**Como corrigir (escolha uma):**
- **A — Adicionar foreign key** `ratings.user_id → profiles.id` via migração. Mantém o join atual e é a solução mais limpa.
- **B — Buscar perfis em uma segunda query** pelo `user_id` e juntar no client. Sem mudança de schema.

Recomendo a **A** (mais rápido, sem código extra, e a tabela `profiles` já tem 1 linha por usuário).

### 2. Verificações rápidas de "pronto para compartilhar"
- **Publicar o app**: hoje só existe a Preview URL. Para mandar o link aos amigos, publicar como **public**.
- **Auth**: confirmar que signup por email + Google estão ativos e que o e-mail de confirmação está OK (ou desativado se você quiser entrada imediata).
- **Mensagens vazias**: páginas de Grupos, Rankings e Perfil quando não há dados ainda — confirmar se mostram estado vazio amigável.
- **Mobile (390px)**: passar pelas telas principais conferindo bottom nav, RateAlbum (busca MusicBrainz + nota rápida), GroupDetail.

### 3. Perguntas pra fechar
- Quer que eu **publique** o app já com visibilidade pública após corrigir o bug?
- Quer manter **confirmação de e-mail obrigatória** no signup, ou liberar entrada direta para facilitar o teste dos amigos?
- Algum outro ponto que você já notou e quer que eu inclua nessa rodada?

Assim que você confirmar, executo: migração da FK → ajusto qualquer coisa que aparecer no smoke test → publico.
