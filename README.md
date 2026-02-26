# Hephaestion Forge

**v2.0.0 -- AI Software Factory / Autonomous Code Builder**

[![Live](https://img.shields.io/badge/status-live-brightgreen)](https://hephaestion-forge.bmcii1976.workers.dev/health)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://hephaestion-forge.bmcii1976.workers.dev/health)
[![Cloudflare Workers](https://img.shields.io/badge/platform-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Engines](https://img.shields.io/badge/Engine%20Runtime-2%2C632%20engines-8B00FF)](#engine-runtime-integration)
[![Archetypes](https://img.shields.io/badge/archetypes-15-orange.svg)](#project-archetypes)
[![Quality Gates](https://img.shields.io/badge/quality%20gates-6-green.svg)](#quality-gates)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#license)

13-stage build pipeline, 6 quality gates, 15 project archetypes, 5 language profiles, 8 design patterns, multi-LLM swarm with consensus -- now enriched with 202,751 real software engineering doctrines from the Echo Engine Runtime.

**Live:** `https://hephaestion-forge.bmcii1976.workers.dev`

*Named after Hephaestion, Alexander the Great's most trusted companion -- the builder that executes the architect's vision with absolute fidelity.*

---

## Architecture

```
                      Hephaestion Forge v2.0.0
 +----------------------------------------------------------------+
 |                   Cloudflare Workers Edge                        |
 |                                                                  |
 |  "Build me a Discord bot that tracks crypto prices"              |
 |       |                                                          |
 |       v                                                          |
 |  Intent Classifier --> Archetype Selector --> Pipeline            |
 |       |                      |                                   |
 |       v                      v                                   |
 |  Echo Engine Runtime    13-Stage Pipeline                        |
 |  2,632 engines          + 6 Quality Gates                       |
 |  202K+ doctrines                                                 |
 |       |                      |                                   |
 |       v                      v                                   |
 |  Doctrine Enrichment    Multi-LLM Swarm                         |
 |  (real CS expertise)    Azure / DeepSeek / Groq / Grok          |
 |       |                      |                                   |
 |       +----------+-----------+                                   |
 |                  |                                               |
 |                  v                                               |
 |           Generated Project (10-50 files)                        |
 |           Complete, tested, deployable                            |
 +----------------------------------------------------------------+
```

---

## Engine Runtime Integration

Every code generation, security audit, architecture design, and code review call is enriched with real software engineering doctrines from the Echo Engine Runtime -- 2,632 engines, 202,751 doctrine blocks, 210 domain categories.

### Data Flow

```
User Prompt --> Archetype Detection --> Engine Category Mapping
                                            |
                       +--------------------+--------------------+
                       |                    |                    |
                   PROG/DEVOPS          CLOUD/NET            CYBER/TEST
                       |                    |                    |
                       v                    v                    v
               Engine Runtime API    Engine Runtime API    Engine Runtime API
               (real doctrines)     (real doctrines)     (real doctrines)
                       |                    |                    |
                       +--------------------+--------------------+
                                            |
                                            v
                               LLM Prompt + Doctrine Context
                                            |
                                            v
                                  Generated Code Module
                              (grounded in real CS expertise)
```

### Project-Type-to-Category Mappings

| Project Type | Engine Categories |
|-------------|-------------------|
| Python App | PROG, DEVOPS, TEST, SAAS |
| Electron App | PROG, UIUX, DESKTOP, TEST |
| Web App | WEBAPP, UIUX, PROG, SAAS, CLOUD |
| CLI Tool | PROG, DEVOPS, TEST |
| MCP Server | PROG, AIML, CLOUD, DEVOPS |
| API Service | PROG, CLOUD, DEVOPS, NET, SAAS |
| GUI Application | PROG, UIUX, DESKTOP, TEST |
| Automation Script | PROG, DEVOPS, DATENG, TEST |
| Cloudflare Worker | CLOUD, PROG, DEVOPS, NET, SAAS |
| Discord Bot | PROG, CLOUD, NET |
| Telegram Bot | PROG, CLOUD, NET |
| Browser Extension | WEBAPP, UIUX, PROG, CYBER |
| Mobile App | MOBILE, UIUX, PROG, TEST |
| Chrome Extension | WEBAPP, UIUX, PROG, CYBER |
| VS Code Extension | PROG, DEVOPS, UIUX |

### Topic-to-Category Mappings

| Topic | Engine Categories |
|-------|-------------------|
| Security | CYBER, PROG, NET |
| Database | DATENG, PROG, CLOUD |
| Testing | TEST, PROG, DEVOPS |
| Deployment | DEVOPS, CLOUD, SAAS |
| Architecture | PROG, CLOUD, SAAS, DEVOPS |
| Performance | PROG, CLOUD, NET |
| AI / ML | AIML, DATENG, PROG |
| Frontend | WEBAPP, UIUX, PROG |
| Mobile | MOBILE, UIUX, PROG |
| API | PROG, NET, CLOUD |
| DevOps | DEVOPS, CLOUD, PROG |
| Microservices | CLOUD, DEVOPS, NET, PROG |
| Blockchain | CRYPTO, PROG, CYBER |
| Game Dev | GAMEDEV, PROG, UIUX |

### Engine Runtime Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/engines/query` | Query doctrines by project type and prompt |
| `GET` | `/engines/domains` | List all project-type and topic mappings |
| `POST` | `/engines/topic` | Query doctrines by programming topic |

---

## Project Archetypes

15 archetypes define the scaffold, language, dependencies, and build configuration:

| # | Archetype | Language | Framework | Use Case |
|:-:|-----------|----------|-----------|----------|
| 1 | `PYTHON_APP` | Python 3.11+ | -- | General Python application |
| 2 | `ELECTRON_APP` | TypeScript | Electron | Desktop GUI application |
| 3 | `WEB_APP` | TypeScript | Next.js | Full-stack web application |
| 4 | `CLI_TOOL` | Python 3.11+ | Click/Typer | Command-line interface tool |
| 5 | `MCP_SERVER` | Python 3.11+ | MCP SDK | Model Context Protocol server |
| 6 | `API_SERVICE` | Python 3.11+ | FastAPI | RESTful API service |
| 7 | `GUI_APPLICATION` | Python 3.11+ | PyQt6/Tkinter | Desktop GUI (Python-native) |
| 8 | `AUTOMATION_SCRIPT` | Python 3.11+ | -- | Task automation / batch scripts |
| 9 | `CLOUDFLARE_WORKER` | TypeScript | Hono | Cloudflare Workers edge service |
| 10 | `DISCORD_BOT` | TypeScript | discord.js | Discord bot with slash commands |
| 11 | `TELEGRAM_BOT` | Python 3.11+ | python-telegram-bot | Telegram bot |
| 12 | `BROWSER_EXTENSION` | TypeScript | -- | Browser extension (Chrome/Firefox) |
| 13 | `MOBILE_APP` | TypeScript | React Native | Cross-platform mobile app |
| 14 | `CHROME_EXTENSION` | TypeScript | -- | Chrome extension (Manifest V3) |
| 15 | `VSCODE_EXTENSION` | TypeScript | VS Code API | VS Code extension |

---

## Build Pipeline

13 stages transform a natural language description into a complete project:

| Stage | Name | Output |
|:-----:|------|--------|
| 1 | Requirements Analysis | Structured requirements, archetype selection |
| 2 | Architecture Design | Module graph, pattern selection |
| 3 | Scaffold Generation | Project skeleton (10-20 files) |
| 4 | Core Logic | Business logic with full implementation |
| 5 | API Layer | HTTP routes, middleware, validation |
| 6 | Data Layer | Database models, repositories, migrations |
| 7 | Test Generation | Unit and integration tests |
| 8 | Documentation | README, API docs, inline comments |
| 9 | Configuration | Environment configs, feature flags |
| 10 | CI/CD Pipeline | GitHub Actions, Docker, deploy scripts |
| 11 | Quality Gates | 6-gate quality report card |
| 12 | Code Review | LLM-powered review with fix suggestions |
| 13 | Package | Bundled deliverable archive (R2) |

---

## Quality Gates

6 gates enforce production-readiness (0-100 score each):

| Gate | Category | Pass Threshold | Weight |
|------|----------|:--------------:|:------:|
| **CAT1-CODE** | Code Quality | 70 | 25% |
| **CAT2-PERF** | Performance | 60 | 15% |
| **CAT3-SEC** | Security | 80 | 25% |
| **CAT5-ARCH** | Architecture | 65 | 15% |
| **CAT7-TEST** | Testing | 60 | 10% |
| **CAT8-DOCS** | Documentation | 50 | 10% |

---

## Language Toolchains

| Language | Linter | Type Checker | Test Runner | Formatter |
|----------|--------|-------------|-------------|-----------|
| **Python 3.11+** | ruff | mypy | pytest | ruff format |
| **TypeScript 5.x** | eslint | tsc (strict) | vitest | prettier |
| **JavaScript ES2022+** | eslint | -- | jest | prettier |
| **Rust 2021** | clippy | rustc | cargo test | rustfmt |
| **Go 1.21+** | golangci-lint | go vet | go test | gofmt |

---

## Design Patterns

8 patterns automatically selected based on project requirements:

| Pattern | When Used |
|---------|-----------|
| **Repository** | Data-heavy apps, API services |
| **Factory** | Multiple similar object types |
| **Strategy** | Interchangeable algorithms |
| **Observer** | Event-driven, real-time systems |
| **Circuit Breaker** | External service calls |
| **Middleware Chain** | HTTP APIs, processing pipelines |
| **Builder** | Complex object construction |
| **Adapter** | Integration, legacy wrapping |

---

## Multi-LLM Swarm

| Provider | Model | Role | Cost |
|----------|-------|------|:----:|
| **Azure GPT-4.1** | gpt-4.1 | Primary code generation | FREE |
| **Azure GPT-4.1-mini** | gpt-4.1-mini | Fast iterations, simple modules | FREE |
| **DeepSeek V3** | deepseek-chat | Complex logic, algorithms | Low |
| **Groq** | llama-3.3-70b | Fast code review, linting | FREE |
| **xAI Grok 3** | grok-3 | Architecture, creative solutions | Low |
| **OpenRouter** | Multiple | Fallback, specialized models | Varies |

LLM consensus: For critical decisions (architecture, security), multiple models are queried and results are merged.

---

## API Reference

### System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Status, version, pipeline info, LLM availability |
| `GET` | `/stats` | Build statistics (projects, success rate, avg time) |
| `GET` | `/archetypes` | All 15 project archetypes |
| `GET` | `/patterns` | All 8 design patterns |
| `GET` | `/toolchains` | All 5 language toolchains |
| `GET` | `/gates` | All 6 quality gates with thresholds |

### Build

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/forge` | Main build -- describe what to build |
| `POST` | `/forge/continue` | Continue multi-turn conversation |
| `GET` | `/forge/:session_id` | Get build session state |
| `POST` | `/forge/:session_id/advance` | Advance to next pipeline stage |
| `POST` | `/forge/:session_id/regen` | Regenerate a specific stage |

### Code Generation

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/generate/scaffold` | Project scaffold only |
| `POST` | `/generate/module` | Single code module |
| `POST` | `/generate/tests` | Tests for existing code |
| `POST` | `/generate/docs` | Documentation from code |
| `POST` | `/generate/config` | Config files |
| `POST` | `/generate/cicd` | CI/CD pipeline |

### Quality and Review

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/quality/check` | Run all 6 quality gates |
| `POST` | `/quality/lint` | CAT1-CODE lint check |
| `POST` | `/quality/security` | CAT3-SEC security scan |
| `POST` | `/quality/review` | LLM-powered code review |

### Engine Runtime

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/engines/query` | Query doctrines by project type |
| `GET` | `/engines/domains` | Project-type and topic category mappings |
| `POST` | `/engines/topic` | Query doctrines by programming topic |

### Doctrine Generation

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/doctrines/generate` | Generate TIE-grade doctrine blocks |
| `POST` | `/doctrines/batch` | Batch generate for multiple engines |

---

## Infrastructure

| Resource | Type | Details |
|----------|------|---------|
| **Runtime** | Cloudflare Workers | TypeScript, global edge |
| **Database** | D1 `hephaestion-forge` | Build history, quality gate results |
| **KV** | `FORGE_PROJECTS` | Active project state |
| **KV** | `TEMPLATE_CACHE` | Framework template cache |
| **Storage** | R2 `echo-build-plans` | Generated project archives |

---

## Quick Start

```bash
# Health check
curl https://hephaestion-forge.bmcii1976.workers.dev/health

# Build a complete project
curl -X POST https://hephaestion-forge.bmcii1976.workers.dev/forge \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a Cloudflare Worker URL shortener with KV storage and click analytics", "archetype": "CLOUDFLARE_WORKER"}'

# Query engine doctrines for security topic
curl -X POST https://hephaestion-forge.bmcii1976.workers.dev/engines/topic \
  -H "Content-Type: application/json" \
  -d '{"query": "input validation best practices", "topic": "security"}'

# Run quality gates on code
curl -X POST https://hephaestion-forge.bmcii1976.workers.dev/quality/check \
  -H "Content-Type: application/json" \
  -d '{"code": "from fastapi import FastAPI\n...", "language": "python"}'
```

---

## Development

```bash
npm install
npm run dev          # Local development
npx wrangler deploy  # Deploy to Cloudflare
```

---

## Ecosystem

| System | Purpose |
|--------|---------|
| **Hephaestion Forge** | Software factory (this) |
| **Daedalus Forge** | Manufacturing intelligence |
| **EchoCAD** | Parametric CAD engine |
| **FORGE-X Cloud** | Engine build pipeline |
| **Echo Engine Runtime** | 2,632 knowledge engines, 202K+ doctrines |
| **Echo AI Orchestrator** | Multi-LLM dispatch (29 workers) |
| **Echo Shared Brain** | Universal memory layer |

**GitHub:** [bobmcwilliams4/hephaestion-forge](https://github.com/bobmcwilliams4/hephaestion-forge)
**Website:** [echo-ept.com](https://echo-ept.com)

---

## License

Proprietary. Copyright 2026 Echo Prime Technologies / Bobby Don McWilliams II. All rights reserved.
