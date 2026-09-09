# 🐟 FLOW

> Write what the whole table is going to write. Standing alone costs you a fish.

**FLOW** is a browser party game for **3 to 12 players**, each on their own phone, all in the same room. A card is read out loud, everyone writes an answer on their private slate, and all slates flip at once. Match the majority and you walk away clean — go your own way and you take a fish from the school. **Fewest fish at the end wins.**

Inspired by the mechanic of *Segue o Fluxo* (Party Games, BR). Own rules text, own art, own name.

---

## 🎮 How a round goes

| Step | What happens |
| --- | --- |
| 1️⃣ | The reader draws a card and the question shows up on every screen |
| 2️⃣ | Everyone writes on their slate — nobody sees anybody else's answer |
| 3️⃣ | All slates flip together and identical answers get grouped |
| 4️⃣ | The reader can merge or split groups the table disagrees about |
| 5️⃣ | Everyone outside the biggest group takes **one fish** |
| 6️⃣ | The reader passes to the left and the next card comes out |

The match ends when the school runs dry. **Fewest fish wins.**

### 🧠 Rules the manual leaves open

The published rules don't cover every corner, so these are documented decisions rather than guesses:

- **Nobody agrees with anybody** (every answer unique) — the whole table takes a fish. No majority means no safe harbour.
- **The table splits evenly** (two groups of equal size) — both groups are safe. A tie is still a shared answer.
- **School size scales with the table** — `6 × players`, floored at 30 and capped at 120, so a game of 4 and a game of 12 last about the same.
- **Typos count as agreement** — `brigadeiro` and `brigadiero` land in the same group. The reader can always split them apart.

## ✍️ The slate

Typing is fully local — no round trip per keystroke, no lag. The answer only leaves your phone when you put it on the table, and you can rewrite it until the reveal.

Answers are grouped by a normalising pass (case, accents, punctuation, whitespace) followed by a Damerau-Levenshtein comparison with a length-aware tolerance. `MORANGO`, `morango` and `morrango` all read as one answer. When the table disagrees with the machine, the reader has the final word.

## 🃏 Decks

| Deck | Cards | Tone |
| --- | --- | --- |
| **Geral** | 140 | anything goes at any table |
| **Picante** | 60 | for the right crowd |
| **Misto** | 200 | both shuffled together |

## 🛠️ Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** strict
- **Tailwind CSS 4** — `@theme` and `@utility`, no config file
- **Supabase** Postgres, tables prefixed `fl_`
- **Vitest** for the pure game logic

Every table has row level security on with **zero policies**: nothing is reachable from the browser. All reads and writes go through this app's own API routes using the service key, so a private slate stays private.

## 🚀 Running it

```bash
pnpm install
pnpm dev        # http://localhost:1000
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

Apply `supabase/migrations/0001_init.sql` to your database.

```bash
pnpm test       # game logic
pnpm lint
pnpm build
pnpm icons      # regenerate every icon size from src/app/icon.svg
```

### 🧪 Testing with several players on one machine

In development only, `?code=<CODE>&token=<TOKEN>&name=<NAME>` seats you directly. It writes to `sessionStorage`, which is **per tab** — so three tabs are three different players instead of three views of the same one. Production ignores these parameters entirely.

## 📁 Layout

```
src/
  app/           routes, API handlers, icons, manifest
  components/
    game/        screens and game pieces
    ui/          buttons, modals, fish, wordmark
  data/          brand copy and the 200 prompts
  hooks/         room polling, session, clock
  lib/
    game/        grouping, scoring, rotation, text
  types/         row shapes shared by client and server
  utils/         plural helpers, shuffle
tests/           pure logic under Vitest
supabase/        migrations
```

## 🎨 Look

The palette was sampled from the published cover art: shallow water `#7ae3f2`, mid `#2fd1f4`, deep `#0f9af3`, abyss `#052ba8`, koi `#ea1705`. Paper-cut layers, one koi, and no dark mode — this game only happens in daylight water.
