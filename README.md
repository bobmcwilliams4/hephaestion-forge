# Hephaestion Forge v5.0

**A++ Grade Doctrine Regeneration Engine for Echo Engine Runtime**

Hephaestion is a high-throughput, multi-LLM doctrine forge that rebuilds all 2,614+ engines in the Echo Engine Runtime database with TIE Gold Standard quality. It uses a swarm of 37+ LLM providers firing in parallel to generate deeply reasoned, domain-expert doctrine blocks — then scores, filters, deduplicates, and inserts them directly into Cloudflare D1.

Named after Alexander the Great's most trusted general, Hephaestion executes the full doctrine rebuild campaign across 210+ domain categories.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  HEPHAESTION FORGE v5.0                  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Fork A  │  │  Fork B  │  │  Fork C  │  ...         │
│  │ idx 0-N  │  │ idx N-M  │  │ idx M-K  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│       ▼              ▼              ▼                    │
│  ┌──────────────────────────────────────────────┐       │
│  │         37+ LLM PROVIDER SWARM               │       │
│  │                                              │       │
│  │  TIER 1: Azure GPT-4.1 / GPT-4o (FREE)      │       │
│  │  TIER 1: GitHub Models (6 models, FREE)      │       │
│  │  TIER 2: 18× OpenRouter paid keys            │       │
│  │  TIER 2: DeepSeek V3 / Together / Groq       │       │
│  │  TIER 2: xAI Grok-3-mini / Mistral / etc.   │       │
│  │  TIER 3: Gemini 2.0 Flash direct             │       │
│  │  BONUS: OpenRouter free models               │       │
│  └────────────────────┬─────────────────────────┘       │
│                       │                                  │
│                       ▼                                  │
│  ┌──────────────────────────────────────────────┐       │
│  │         QUALITY PIPELINE                     │       │
│  │                                              │       │
│  │  Score 0-15 → Filter ≥8 → Dedup → Grade     │       │
│  │  A++ (min≥10) | A+ (min≥8) | A | B | F      │       │
│  │  Gap fill with backup provider if short      │       │
│  └────────────────────┬─────────────────────────┘       │
│                       │                                  │
│                       ▼                                  │
│  ┌──────────────────────────────────────────────┐       │
│  │         D1 DIRECT WRITE                      │       │
│  │                                              │       │
│  │  echo-engine-doctrines (Cloudflare D1)       │       │
│  │  Batch INSERT via wrangler CLI               │       │
│  │  10 doctrines per SQL file                   │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## LLM Provider Arsenal

Hephaestion uses every available LLM endpoint to maximize throughput. Providers are organized into tiers by reliability and cost:

### Tier 1 — FREE, High Reliability (Primary Workhorses)

| Provider | Models | Auth | Notes |
|----------|--------|------|-------|
| **Azure OpenAI** | GPT-4.1, GPT-4.1-mini, GPT-4o | `api-key` header | EchoOMEGA subscription, FREE, best JSON compliance |
| **GitHub Models** | GPT-4.1, GPT-4.1-mini, GPT-4o, DeepSeek-V3, Grok-3-mini, Llama-405B | Bearer token | FREE inference API, rate-limited |

### Tier 2 — Paid/Direct API

| Provider | Models | Auth | Notes |
|----------|--------|------|-------|
| **OpenRouter (Paid)** | Gemini 2.0 Flash | Bearer token | 18 independent API keys for parallel throughput |
| **DeepSeek** | DeepSeek-V3 | Bearer token | Direct API, strong reasoning |
| **Together AI** | Llama-3.3-70B-Instruct-Turbo | Bearer token | Fast inference |
| **Groq** | Llama-3.3-70B-Versatile | Bearer token | LPU inference, sub-second tokens |
| **xAI** | Grok-3-mini-beta | Bearer token | Good reasoning quality |
| **Mistral** | Mistral-Large-Latest | Bearer token | Strong multilingual |
| **Fireworks** | Llama-3.3-70B | Bearer token | Fast API |
| **SambaNova** | Meta-Llama-3.3-70B-Instruct | Bearer token | Custom silicon |

### Tier 3 — Gemini Direct

| Provider | Models | Auth | Notes |
|----------|--------|------|-------|
| **Google Gemini** | Gemini 2.0 Flash | API key in URL | Direct Generative Language API |

### Bonus — OpenRouter Free Models

| Provider | Models | Notes |
|----------|--------|-------|
| **OpenRouter Free** | Llama-3.3-70B, Gemma-3-27B | Heavily rate-limited, opportunistic use |

**Provider Intelligence:**
- Auto-disables providers after 2 permanent failures (401/402/403)
- Tracks success rate, average latency, total chars, and doctrines produced per provider
- Randomizes provider selection to distribute load evenly
- Falls back to fewer providers gracefully if keys are exhausted
- Logs all LLM calls with full telemetry for the live monitor

---

## Doctrine Structure

Each doctrine is a 14+ field pre-compiled expert reasoning block following the TIE Gold Standard:

```json
{
  "topic": "Fatigue Life in Welded Joints Under Variable Amplitude Loading",
  "keywords": ["fatigue crack propagation", "S-N curve", "Miner's rule", "AWS D1.1", "stress concentration factor", "weld toe geometry"],
  "conclusion": "3-5 authoritative sentences with specific recommendations...",
  "reasoning": "300-600 word structured analysis: issue framing → standards → methodology → decision factors → adversary position → resolution → confidence",
  "key_factors": ["Factor 1 with explanation", "Factor 2...", "...5-8 factors"],
  "authorities": ["ASME BPVC Section VIII — pressure vessel design", "API 579-1 — fitness for service", "...3-5 real citations"],
  "burden_holder": "Who bears responsibility",
  "adversary_position": "Strongest opposing argument (2-3 sentences)",
  "counter_arguments": ["Counter 1", "Counter 2", "...3-5 arguments"],
  "resolution_strategy": "Specific actionable steps (3-5 sentences)",
  "entity_scope": "What entities/situations this applies to",
  "confidence": "DEFENSIBLE | AGGRESSIVE | DISCLOSURE | HIGH_RISK",
  "confidence_stratification": "Rating + reasoning",
  "controlling_precedent": "Single most authoritative source",
  "zone": "PLANNING | REPORTING | AUDIT",
  "cross_domain_routes": "[{\"engine\": \"MECH01\", \"relevance\": \"high\"}]",
  "domain_scope": "Subdomain areas covered"
}
```

### Quality Scoring (0-15 scale)

| Criterion | Points | Threshold |
|-----------|--------|-----------|
| Reasoning depth | 0-3 | ≥500 chars = 3, ≥300 = 2, ≥100 = 1 |
| Standards citations in reasoning | 0-1 | Contains ASME/API/ISO/IEEE/etc. |
| Conclusion depth | 0-2 | ≥200 chars = 2, ≥100 = 1 |
| Key factors count | 0-2 | ≥5 = 2, ≥3 = 1 |
| Authorities count | 0-2 | ≥3 = 2, ≥1 = 1 |
| Keywords count | 0-1 | ≥6 = 1 |
| Topic specificity | 0-1 | ≥20 chars = 1 |
| Burden holder | 0-1 | ≥10 chars = 1 |
| Adversary position | 0-1 | ≥30 chars = 1 |
| Counter arguments | 0-1 | ≥3 items = 1 |

**Grade Thresholds:**
- **A++**: All doctrines score ≥ 10 (target)
- **A+**: All doctrines score ≥ 8
- **A**: Average score ≥ 8
- **B**: Relaxed filter (min score 5), used when initial batch falls short
- **F**: No doctrines passed quality filter

---

## Pipeline Per Engine

Each engine goes through this pipeline:

```
1. PURGE (optional)
   └─ DELETE low-quality doctrines (reasoning NULL or < 50 chars)

2. EXPAND SUBDOMAINS
   └─ Ask reliable provider for 45 highly specific subtopics
   └─ Fallback to 35 generic templates if LLM fails

3. BATCH 1 (30 doctrines target)
   ├─ Split subtopics into chunks
   ├─ Dispatch chunks to up to 15 parallel LLM workers
   ├─ Parse JSON responses (handles markdown wrapping, XML tags)
   ├─ Score all candidates (0-15 scale)
   ├─ Filter: deduplicate by topic hash, require score ≥ 8
   ├─ Gap fill if insufficient (call backup provider)
   └─ INSERT into D1 in batches of 10

4. BATCH 2 (30 doctrines target)
   └─ Same pipeline with remaining subtopics

5. ROUTING DOCTRINES (backbone engines only)
   ├─ Domain Scope & Coverage Map
   ├─ Cross-Domain Routing Matrix
   ├─ Sub-Engine Delegation Protocol
   ├─ Multi-Domain Query Decomposition
   └─ Domain Boundary Detection

6. SWARM QA
   └─ Sample 3 doctrines → echo-swarm-brain.bmcii1976.workers.dev
   └─ Trinity/consult endpoint rates 1-10

7. LOG COMPLETION
   └─ Total doctrines, QA score, grade, elapsed time
```

---

## Multi-Fork Parallel Execution

The engine queue can be split across independent processes (forks) for concurrent building:

```
Fork A: engines[0:1308]     ─── Process 1 ───▶ forge_A.jsonl
Fork B: engines[1308:2614]  ─── Process 2 ───▶ forge_B.jsonl
Fork C: engines[gap]        ─── Process 3 ───▶ forge_C.jsonl
```

Each fork:
- Runs as an independent Python process
- Writes to its own JSONL log file
- Shares the same LLM provider pool (rate limits apply across forks)
- Can be started/stopped independently
- The monitor aggregates all fork logs into a single dashboard

---

## Files

| File | Lines | Description |
|------|-------|-------------|
| `hephaestion_forge.py` | 852 | Main forge engine — providers, pipeline, D1 writes |
| `forge_monitor.py` | 278 | Live terminal dashboard — reads JSONL from all forks |

---

## Usage

### Full Rebuild (all engines)

```bash
python -u hephaestion_forge.py --all-engines --purge-first
```

### Specific Engines

```bash
python -u hephaestion_forge.py --engines ACCT01,ACCT02,LM01,LM02
```

### Routing Doctrines Only

```bash
python -u hephaestion_forge.py --all-engines --routing-only
```

### Multi-Fork Mode

```bash
# Fork A: first half
python -u hephaestion_forge.py --all-engines --start-at 0 --end-at 1308 \
  --log-file forge_A.jsonl --purge-first

# Fork B: second half
python -u hephaestion_forge.py --all-engines --start-at 1308 \
  --log-file forge_B.jsonl --purge-first

# Fork C: targeted gap or priority engines
python -u hephaestion_forge.py --all-engines --start-at 1308 --end-at 1387 \
  --log-file forge_C.jsonl --purge-first
```

### CLI Arguments

| Argument | Description |
|----------|-------------|
| `--engines` | Comma-separated engine IDs to forge |
| `--all-engines` | Fetch all engine IDs from D1 and forge sequentially |
| `--start-at N` | Start at engine index N (0-based) in sorted list |
| `--end-at N` | End at engine index N (exclusive, 0 = all remaining) |
| `--purge-first` | Delete low-quality doctrines before regeneration |
| `--routing-only` | Generate only 5 routing doctrines per engine (skip domain doctrines) |
| `--log-file PATH` | Override JSONL log file path (required for multi-fork) |

### Monitor

```bash
# Auto-refresh every 3 seconds
python -u forge_monitor.py --refresh 3

# Single snapshot
python -u forge_monitor.py --once
```

---

## D1 Integration

**Database:** `echo-engine-doctrines` (Cloudflare D1)
**Table:** `doctrines`

Doctrines are written directly to D1 via `npx wrangler d1 execute`:
- Batched in groups of 10 (SQL file per batch)
- Each INSERT includes all 18 columns + `created_at` timestamp
- SQL values are properly escaped (single quotes doubled)
- Temp SQL files are created and deleted after execution
- Timeout: 60 seconds per batch

**Purge query:** Removes doctrines where `reasoning IS NULL OR LENGTH(reasoning) < 50`

---

## JSONL Event Log Format

Every action is logged to a JSONL file for the monitor. Event types:

| Type | Fields | Description |
|------|--------|-------------|
| `init` | status | Forge startup |
| `queue` | total_engines, mode, provider_count | Engine queue loaded |
| `start` | engine, domain | Engine forge begins |
| `llm_call` | provider, model, status, elapsed_s, chars, error | Every LLM API call |
| `batch` | batch, inserted, target, score_max, score_min, grade, candidates, passed | Batch completion |
| `d1_insert` | inserted, batch_offset | D1 write success |
| `d1_error` | error | D1 write failure |
| `purge` | purged | Low-quality doctrine deletion |
| `routing` | inserted | Routing doctrine generation |
| `complete` | doctrines, qa_score, grade, elapsed_s, avg_score | Engine forge complete |
| `progress` | progress, completed, grand_total, elapsed_min, eta_min | Periodic progress |
| `provider_stats` | providers[] | Provider leaderboard (every 10 engines) |
| `error` | error | Fatal engine error |
| `done` | grand_total, engines_completed, engines_total, elapsed_min | Forge complete |

---

## Backbone Engines

43 backbone engines receive additional routing doctrines (5 per engine) that enable cross-domain query decomposition:

| ID | Domain | ID | Domain |
|----|--------|----|--------|
| ACCT01 | Accounting & Auditing | MATH01 | Mathematics |
| AERO01 | Aerospace Engineering | MED01 | Medical Sciences |
| ARCH01 | Architecture & Urban Design | MINE01 | Mining Engineering |
| ASTRO01 | Astronomy & Astrophysics | MUSIC01 | Music Theory & Production |
| AUTO01 | Automotive Engineering | NET01 | Network Engineering |
| BIO01 | Biomedical Engineering | NUC01 | Nuclear Engineering |
| CHEM01 | Chemical Engineering | OPTIC01 | Optics & Photonics |
| CRYPTO01 | Cryptocurrency & Blockchain | PETRO01 | Petroleum Engineering |
| DRL01 | Drilling Engineering | PHIL01 | Philosophy & Ethics |
| EE01 | Electrical Engineering | PHYS01 | Physics |
| ENRG01 | Energy & Power Systems | PIPE01 | Pipeline Engineering |
| ENV01 | Environmental Engineering | PROG01 | Programming & Software Eng. |
| FOOD01 | Food Science & Technology | QUANT01 | Quantitative Finance |
| FOREN01 | Forensic Science | RE01 | Real Estate |
| GEO01 | Geotechnical Engineering | RENEW01 | Renewable Energy |
| HIST01 | Historical Analysis | SCM01 | Supply Chain Management |
| HVAC01 | HVAC Engineering | SOC01 | Sociology |
| INS01 | Insurance & Risk Management | SPORT01 | Sports Science |
| LING01 | Linguistics & NLP | TELE01 | Telecommunications |
| MARINE01 | Marine & Naval Engineering | VET01 | Veterinary Science |
| | | WAT01 | Water Resources Engineering |
| | | WEATHER01 | Meteorology & Climate |
| | | WELD01 | Welding Engineering |

---

## Excluded Engines

The following prefixes are excluded from forge runs (hand-built backbone engines with specialized logic):

- **TIE** — Tax Intelligence Engine (10,918 lines, Gold Standard)
- **ARCS** — Advanced Reasoning & Compliance System (20,157 lines)
- **PIE** — Probate Intelligence Engine (17,317 lines)
- **ET** — Echo Talk engines

---

## Environment Setup

### Required Environment Variables

Create `.env.local` in the project root with:

```env
# Azure OpenAI (Tier 1 — FREE)
# Loaded from config/profile_secrets.env.ps1

# OpenRouter (18 paid keys)
OPENROUTER_API_KEY_1=sk-or-...
OPENROUTER_API_KEY_2=sk-or-...
# ... up to OPENROUTER_API_KEY_18

# Direct API providers
DEEPSEEK_API_KEY=sk-...
TOGETHER_API_KEY=...
GROQ_API_KEY=gsk_...
XAI_API_KEY=xai-...
MISTRAL_API_KEY=...
FIREWORKS_API_KEY=...
SAMBANOVA_API_KEY=...

# Gemini direct
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...

# Claude (disabled — subprocess timeout issues on Windows)
# CLAUDE_CODE_OAUTH_TOKEN=...
```

### Dependencies

- Python 3.11+
- `npx wrangler` (Cloudflare CLI, authenticated)
- No pip packages required (uses only stdlib: `urllib`, `json`, `subprocess`, `concurrent.futures`)

---

## Target

- **Echo Engine Runtime:** `echo-engine-runtime.bmcii1976.workers.dev`
- **D1 Database:** `echo-engine-doctrines` (5eb5f53e)
- **Current stats:** 2,632 engines, 202,751+ doctrines, 210 domain categories

---

## Stats (2026-02-26)

| Metric | Value |
|--------|-------|
| Engines in queue | 2,614 (excluding TIE/ARCS/PIE/ET) |
| Doctrines in Runtime | 202,751+ |
| Domain categories | 210 |
| A++ grade rate | 99.1% on completed batches |
| Average build time | ~5 min/engine |
| Doctrines per engine | 40-65 (2 batches × 30 target + routing) |
| LLM providers active | 37+ |
| Concurrent LLM workers | 15 per batch |

---

## License

Internal tool for Echo Omega Prime. Not licensed for external use.
