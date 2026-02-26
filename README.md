# Hephaestion Forge v5.0

A++ grade doctrine generation for Echo Engine Runtime. Rebuilds all 2,614 engines with TIE Gold Standard quality using a multi-LLM swarm.

## Architecture

- **37 LLM providers**: Azure GPT-4o, GitHub Models, OpenRouter (18 paid Gemini Flash keys), DeepSeek V3, Claude, SambaNova, Groq, Together, and more
- **Parallel forks**: Split the engine queue across A/B/C processes for concurrent building
- **Quality gates**: Score 8-15 per doctrine, A++ grade requires min score >= 10
- **D1 direct write**: Doctrines written directly to `echo-engine-doctrines` D1 database
- **Purge + rebuild**: Old doctrines purged before regeneration for clean state

## Files

| File | Description |
|------|-------------|
| `hephaestion_forge.py` | Main forge engine (852 lines) |
| `forge_monitor.py` | Live dashboard monitor for all forks |

## Usage

```bash
# Run full rebuild (all engines)
python -u hephaestion_forge.py --all-engines --purge-first

# Run specific engines
python -u hephaestion_forge.py --engines ACCT01,ACCT02,LM01

# Dual/triple fork mode
python -u hephaestion_forge.py --all-engines --start-at 0 --end-at 1308 --log-file forge_A.jsonl --purge-first
python -u hephaestion_forge.py --all-engines --start-at 1308 --log-file forge_B.jsonl --purge-first

# Monitor
python -u forge_monitor.py --refresh 3
```

## Stats (as of 2026-02-26)

- **2,614 engines** in queue (excluding TIE/ARCS/PIE/ET backbones)
- **202,771 doctrines** in Engine Runtime
- **99.1% A++ grade** on completed batches
- **~5 min/engine** average build time

## Target

Echo Engine Runtime: `echo-engine-runtime.bmcii1976.workers.dev`
D1 Database: `echo-engine-doctrines`
