## Objetivo

Transformar perfis em hubs sociais e adicionar uma camada de notificações para que o app fique gostoso de usar entre amigos.

## Novidades por área

### 1. Perfis completos
- Perfil público em `/u/:username` (qualquer pessoa visita, logada ou não).
- Página atual `/profile` vira "meu perfil" com botão **Editar**.
- Campos: bio (até 280 chars), avatar, **artistas favoritos** (lista de até 5 nomes em texto), contadores de seguidores / seguindo / avaliações.
- Botão **Seguir / Seguindo** no perfil dos outros (otimista).
- Abas no perfil: *Avaliações*, *Seguidores*, *Seguindo*.

### 2. Seguidores
- Tabela `follows (follower_id, following_id)`.
- Listas paginadas com card simples (avatar + nome + botão seguir).
- Header ganha link rápido pro próprio perfil já existente.

### 3. Curtidas em avaliações
- Tabela `rating_likes (rating_id, user_id)`.
- Botão coração no `ReviewCard` agora persiste, com contador real e estado por usuário.

### 4. Comentários em avaliações
- Tabela `rating_comments (rating_id, user_id, body, created_at)`.
- No `ReviewCard`, botão de comentário abre uma seção embutida (lista + input).
- Só logado pode comentar/curtir; visitante vê tudo.

### 5. Notificações
- Tabela `notifications (user_id, actor_id, type, rating_id?, comment_id?, read_at)`.
- Tipos: `follow`, `like`, `comment`.
- Triggers no banco geram a notificação automaticamente.
- Sino no Header com badge de não-lidas; dropdown com lista. Marca como lidas ao abrir.
- Realtime via Supabase pra atualizar o badge sem refresh.

## Mudanças de banco (migração)

```text
profiles            + bio (já existe), favorite_artists text[]
follows             follower_id, following_id            (PK composta)
rating_likes        rating_id, user_id                   (PK composta)
rating_comments     id, rating_id, user_id, body, created_at
notifications       id, user_id, actor_id, type, rating_id, comment_id, read_at, created_at
```

RLS:
- `follows`: select público; insert/delete só do próprio follower.
- `rating_likes`: select público; insert/delete só do próprio user.
- `rating_comments`: select público; insert do próprio; update/delete do próprio.
- `notifications`: select/update só do dono (`user_id = auth.uid()`); insert via trigger (security definer).

Triggers:
- `after insert` em `follows` → notificação tipo `follow` pro `following_id`.
- `after insert` em `rating_likes` → notificação tipo `like` pro dono da avaliação (se diferente).
- `after insert` em `rating_comments` → notificação tipo `comment` pro dono da avaliação.
- Realtime ligado em `notifications`.

## Mudanças no frontend

- `src/pages/Profile.tsx` → divide em `MyProfile` (edição inline) e novo `src/pages/UserProfile.tsx` (`/u/:username`), compartilhando um `ProfileView` component.
- `src/components/EditProfileDialog.tsx` (bio + artistas favoritos + display name).
- `src/components/FollowButton.tsx`.
- `src/components/ReviewCard.tsx` → curtidas reais + seção de comentários, header do card vira link pro perfil do autor.
- `src/components/NotificationsBell.tsx` no Header.
- `src/pages/Index.tsx` e `Rankings.tsx`: nomes/avatares clicáveis pros perfis.
- Rota nova `/u/:username` no `App.tsx`.

## Detalhes técnicos

- Buscas paginadas com `range()` de 20 em 20 nas listas grandes (seguidores, comentários).
- Updates otimistas em curtir/seguir; rollback em caso de erro.
- Notificações: o sino busca as 20 mais recentes; ao abrir o dropdown chama um update marcando `read_at = now()` nas não-lidas.
- Realtime: subscribe em `postgres_changes` na tabela `notifications` filtrando por `user_id`.
- Para evitar consulta N+1 no feed, o `ReviewCard` recebe `likeCount` e `commentCount` calculados via `count` agregado retornado da query inicial; curtir altera só localmente.
- A lista de "artistas favoritos" é livre (texto), sem integração com MusicBrainz nesta etapa — fica simples e rápido.

## Fora do escopo desta etapa
- Upload real de avatar (continua iniciais coloridas).
- Mensagens diretas / chat.
- Notificações por e-mail/push.
- Menções (@user) em comentários.
