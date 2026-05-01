
# MVP funcional do Sonera

Hoje as páginas existem mas tudo é mockado. Este plano substitui os mocks por um backend real (Lovable Cloud), com login, persistência de avaliações e rankings calculados de verdade. Quiz e Descobrir continuam como estão por enquanto — foco no fluxo central: **entrar → adicionar álbum → avaliar → ver no ranking → ver no perfil**.

## 1. Backend (Lovable Cloud)

Habilitar Lovable Cloud e criar o seguinte schema:

**`profiles`** (perfil público do usuário)
- `id` (uuid, FK → auth.users, PK)
- `username` (text, único)
- `display_name` (text)
- `avatar_url` (text, opcional)
- `created_at`
- Trigger automático para criar profile no signup

**`user_roles`** (separada por segurança, com enum `app_role`: 'admin', 'user')
- `id`, `user_id`, `role`
- Função `has_role(user_id, role)` SECURITY DEFINER

**`albums`** (catálogo compartilhado)
- `id`, `title`, `artist`, `release_year`, `genre`, `cover_url`
- `created_by` (FK → auth.users)
- `created_at`
- Constraint único em (title, artist)

**`ratings`** (uma avaliação = um usuário + um álbum)
- `id`, `user_id`, `album_id`
- 13 colunas numéricas (0–10) — uma por critério: `lyrics`, `personal_impact`, `musical_richness`, `authenticity`, `production`, `track_dynamics`, `mix_master`, `historical_weight`, `branding_storytelling`, `musicianship`, `bangers`, `emotion`, `creativity`
- `weighted_score` (numérico, calculado no cliente e salvo)
- `review_text` (text, opcional)
- `created_at`, `updated_at`
- Constraint único em (user_id, album_id) — uma avaliação por usuário/álbum

**RLS em todas as tabelas:**
- `profiles`: leitura pública, update só do dono
- `albums`: leitura pública, insert por autenticados, update/delete só pelo criador ou admin
- `ratings`: leitura pública, insert/update/delete só do dono

## 2. Autenticação

- Página `/auth` com tabs Login / Cadastro (email + senha)
- Confirmação de email **desligada** para iterar rápido (avisar pra ligar antes de produção)
- Hook `useAuth` com `onAuthStateChange` + `getSession`
- Cliente Supabase em `src/integrations/supabase/client.ts` (gerado pelo Cloud)
- Header passa a mostrar avatar/menu quando logado, botão "Entrar" quando deslogado
- Rotas `/rate` e `/profile` exigem login (redirect para `/auth`)

## 3. Páginas conectadas ao backend

**`/rate` (RateAlbum)**
- Antes do formulário de critérios: campo de busca/seleção de álbum existente OU botão "Adicionar novo álbum" (abre dialog com title/artist/year/genre/cover URL)
- Sliders dos 13 critérios + textarea de review
- Calcula `weighted_score` e faz `upsert` em `ratings` (update se já existir avaliação do usuário pra esse álbum)
- Toast de sucesso → redireciona pra `/rankings`

**`/rankings`**
- Lê álbuns + média ponderada de todas as avaliações (via view ou query agregada)
- Filtros por gênero e década continuam, agora aplicados sobre dados reais
- Ordenação por nota média desc

**`/profile`**
- Mostra `display_name`, avatar, bio
- Lista de avaliações do próprio usuário (álbuns + notas)
- Conquistas/quiz tier ficam mockados nessa fase

**`/` (Feed/Index)**
- ReviewCards passam a vir das avaliações mais recentes (todas, com review_text não vazio)
- RankingSidebar usa o top 5 real

**`/quiz` e Discover** — sem mudança nesta fase (continuam mockados, etiqueta "em breve" no Discover)

## 4. Pesos dos critérios (já definidos antes, confirmados aqui)

```text
Letras                3    Mix/master            2
Impacto pessoal       3    Peso histórico        2
Riqueza musical       3    Branding/storytelling 1
Autenticidade         2    Qualidade técnica     2
Produção/arranjo      3    Quantidade de bangers 2
Dinâmica das faixas   2    Emoção                3
                           Criatividade          3
```
Soma = 31. `weighted_score` = Σ(nota × peso) / 31, escala 0–10.

## 5. Publicação

Depois que o fluxo acima estiver rodando no preview:
- Você clica em **Publish** (canto superior direito) → app vai pra `sonera.lovable.app`
- Custom domain pode ser conectado depois em Project Settings → Domains
- Aviso: confirmação de email desligada — ligar antes de divulgar publicamente

## Fora do escopo desta entrega (próximos passos sugeridos)

- Integração Spotify/MusicBrainz para buscar álbuns automaticamente
- Quiz de escuta cega com áudio real
- Página Discover com busca/recomendações
- Sistema de amigos e match musical real
- Upload de avatar e capa pra Storage (por ora, URLs)

---

Confirma que posso seguir com **cadastro manual de álbuns** e implementar tudo isso?
