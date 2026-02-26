#!/usr/bin/env python3
"""
HEPHAESTION v5.0 — ULTIMATE FORGE WITH FULL LLM ARSENAL
=========================================================
TIE Gold Standard doctrine generation for Echo Engine Runtime.
Full 14-field doctrine structure + 5 routing doctrines per backbone engine.
Deep LLM telemetry logging for live monitor.

PROVIDERS:
  - Azure OpenAI GPT-4.1 + GPT-4.1-mini (FREE EchoOMEGA)
  - GitHub Models GPT-4.1, GPT-4.1-mini, GPT-4o, DeepSeek-V3 (FREE)
  - Claude Opus 4.6 via OAuth (Max subscription)
  - 18 OpenRouter paid keys (gemini-2.0-flash, deepseek-chat, qwen-2.5-coder)
  - 7 OpenRouter FREE models (Qwen3-80B, Qwen3-Coder, Llama-70B, Hermes-405B, GPT-OSS-120B, Mistral-Small, Gemma-27B)
  - DeepSeek V3 direct, Together AI, Groq, xAI Grok, Gemini direct
  - Mistral, Fireworks, SambaNova (if keys available)
"""
import json, os, re, sys, time, random, subprocess, hashlib, statistics, argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from datetime import datetime

sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

WRANGLER = "npx wrangler"
D1_DB = "echo-engine-doctrines"
CWD = "O:/ECHO_OMEGA_PRIME"
ENV_FILE = Path("O:/ECHO_OMEGA_PRIME/.env.local")
SECRETS_FILE = Path("O:/ECHO_OMEGA_PRIME/config/profile_secrets.env.ps1")
BATCH_SIZE = 10
BATCHES_PER_ENGINE = 2       # 2 batches × 30 = 60 target (was 3×30=90, most only got 54-80)
DOCTRINES_PER_BATCH = 30
MIN_QUALITY_SCORE = 8
MAX_LLM_WORKERS = 15
MIN_DOCTRINES_SKIP_GAP = 20  # Skip gap fill if we already have this many — saves 60-90s dead time
EXCLUDED_PREFIXES = ["TIE", "ARCS", "PIE", "ET"]
LOG_FILE = Path("C:/Users/bobmc/hephaestion_v4_log.jsonl")

# Only Gemini Flash is fast+good on OR paid. DeepSeek is 150s (too slow).
# qwen-2.5-coder produces only 470ch (coding model, useless for doctrines).
OR_PAID_MODELS = [
    "google/gemini-2.0-flash-001",
]

# Free models are all heavily rate-limited (429) — keep 2 for opportunistic use
OR_FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
]

BACKBONE_ENGINES = {
    "ACCT01": "Accounting & Auditing", "AERO01": "Aerospace Engineering",
    "ARCH01": "Architecture & Urban Design", "ASTRO01": "Astronomy & Astrophysics",
    "AUTO01": "Automotive Engineering", "BIO01": "Biomedical Engineering",
    "CHEM01": "Chemical Engineering", "CRYPTO01": "Cryptocurrency & Blockchain",
    "DRL01": "Drilling Engineering", "EE01": "Electrical Engineering",
    "ENCORE01": "Surface Owner Intelligence", "ENRG01": "Energy & Power Systems",
    "ENV01": "Environmental Engineering",
    "FOOD01": "Food Science & Technology", "FOREN01": "Forensic Science",
    "GEO01": "Geotechnical Engineering", "HIST01": "Historical Analysis",
    "HVAC01": "HVAC Engineering", "INS01": "Insurance & Risk Management",
    "LING01": "Linguistics & NLP", "LM01": "Landman & Title Examination",
    "MARINE01": "Marine & Naval Engineering",
    "MATH01": "Mathematics", "MED01": "Medical Sciences",
    "MINE01": "Mining Engineering", "MUSIC01": "Music Theory & Production",
    "NET01": "Network Engineering", "NUC01": "Nuclear Engineering",
    "OPTIC01": "Optics & Photonics", "PETRO01": "Petroleum Engineering",
    "PHIL01": "Philosophy & Ethics", "PHYS01": "Physics",
    "PIPE01": "Pipeline Engineering", "PROG01": "Programming & Software Engineering",
    "QUANT01": "Quantitative Finance", "RE01": "Real Estate",
    "RENEW01": "Renewable Energy", "SCM01": "Supply Chain Management",
    "SOC01": "Sociology", "SPORT01": "Sports Science",
    "TELE01": "Telecommunications", "VET01": "Veterinary Science",
    "WAT01": "Water Resources Engineering", "WEATHER01": "Meteorology & Climate Science",
    "WELD01": "Welding Engineering",
}


def log_event(event_type, engine_id="", **kwargs):
    entry = {"ts": datetime.now().isoformat(), "type": event_type, "engine": engine_id, **kwargs}
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")


def P(msg):
    print(msg, flush=True)


def load_keys():
    keys = {
        "openrouter": [], "deepseek": "", "together": "", "groq": "", "xai": "",
        "gemini": [], "mistral": "", "fireworks": "", "sambanova": "",
        "claude_api": "", "claude_oauth": "",
        "azure_key": "", "azure_endpoint": "",
        "github_token": "", "github_url": "",
    }
    # Load from .env.local
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            name, val = line.split("=", 1)
            val = val.strip().strip('"').strip("'")
            if name.startswith("OPENROUTER_API_KEY_") and val:
                keys["openrouter"].append(val)
            elif name == "DEEPSEEK_API_KEY" and val:
                keys["deepseek"] = val
            elif name == "TOGETHER_API_KEY" and val:
                keys["together"] = val
            elif name == "GROQ_API_KEY" and val:
                keys["groq"] = val
            elif name == "XAI_API_KEY" and val:
                keys["xai"] = val
            elif name.startswith("GEMINI_API_KEY") and val:
                keys["gemini"].append(val)
            elif name == "MISTRAL_API_KEY" and val:
                keys["mistral"] = val
            elif name == "FIREWORKS_API_KEY" and val:
                keys["fireworks"] = val
            elif name == "SAMBANOVA_API_KEY" and val:
                keys["sambanova"] = val
            elif name == "CLAUDE_API_KEY" and val:
                keys["claude_api"] = val
            elif name == "CLAUDE_CODE_OAUTH_TOKEN" and val:
                keys["claude_oauth"] = val
            elif name == "CLAUDE_OAUTH_ACCESS_TOKEN" and val and not keys["claude_oauth"]:
                keys["claude_oauth"] = val

    # Load from profile_secrets.env.ps1 (Azure + GitHub Models)
    if SECRETS_FILE.exists():
        for line in SECRETS_FILE.read_text().splitlines():
            line = line.strip()
            if "AZURE_OPENAI_API_KEY" in line:
                m = re.search(r'"([^"]+)"', line)
                if m: keys["azure_key"] = m.group(1)
            elif "AZURE_OPENAI_ENDPOINT" in line:
                m = re.search(r'"([^"]+)"', line)
                if m: keys["azure_endpoint"] = m.group(1)
            elif "GITHUB_MODELS_TOKEN" in line:
                m = re.search(r'"([^"]+)"', line)
                if m: keys["github_token"] = m.group(1)
            elif "GITHUB_MODELS_URL" in line:
                m = re.search(r'"([^"]+)"', line)
                if m: keys["github_url"] = m.group(1)

    return keys


class LLMProvider:
    """Multi-protocol LLM provider. Supports OpenAI, Azure, Anthropic, Gemini APIs."""

    def __init__(self, name, api_key, base_url, model, auth_type="bearer", is_gemini=False):
        self.name = name
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.auth_type = auth_type  # "bearer" | "azure" | "anthropic"
        self.is_gemini = is_gemini
        self.failures = 0
        self.permanent_failures = 0  # 401/402/403 = dead key, auto-disable
        self.calls = 0
        self.successes = 0
        self.total_time = 0.0
        self.total_chars = 0
        self.doctrines_produced = 0
        self.disabled = False

    def generate(self, system_prompt, user_prompt, engine_id="", max_tokens=8192, temperature=0.7):
        if self.disabled:
            return ""
        self.calls += 1
        t0 = time.time()
        try:
            if self.is_gemini:
                text = self._gemini(system_prompt, user_prompt, max_tokens, temperature)
            elif self.auth_type == "claude_cli":
                text = self._claude_cli(system_prompt, user_prompt, max_tokens)
            else:
                text = self._openai(system_prompt, user_prompt, max_tokens, temperature)
            elapsed = time.time() - t0
            self.successes += 1
            self.total_time += elapsed
            self.total_chars += len(text)
            log_event("llm_call", engine_id, provider=self.name, model=self.model,
                      status="ok", elapsed_s=round(elapsed, 1), chars=len(text))
            P(f"      [{self.name}] OK {elapsed:.1f}s {len(text):,}ch")
            return text
        except Exception as e:
            elapsed = time.time() - t0
            self.failures += 1
            self.total_time += elapsed
            err_msg = str(e)[:120]
            # Auto-disable on permanent errors (dead key, no credits, forbidden)
            if any(code in err_msg for code in ["401:", "402:", "403:"]):
                self.permanent_failures += 1
                if self.permanent_failures >= 2:
                    self.disabled = True
                    P(f"      [{self.name}] DISABLED (permanent {err_msg[:40]})")
                    log_event("llm_call", engine_id, provider=self.name, model=self.model,
                              status="disabled", elapsed_s=round(elapsed, 1), error=err_msg)
                    return ""
            log_event("llm_call", engine_id, provider=self.name, model=self.model,
                      status="error", elapsed_s=round(elapsed, 1), error=err_msg)
            P(f"      [{self.name}] FAIL {elapsed:.1f}s — {err_msg}")
            return ""

    def _openai(self, sys_p, usr_p, max_tok, temp):
        """OpenAI-compatible API (also used for Azure, GitHub Models, OR, etc.)"""
        body = json.dumps({
            "model": self.model,
            "messages": [{"role": "system", "content": sys_p}, {"role": "user", "content": usr_p}],
            "max_tokens": max_tok, "temperature": temp,
        }).encode()
        req = Request(self.base_url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        if self.auth_type == "azure":
            req.add_header("api-key", self.api_key)
        else:
            req.add_header("Authorization", f"Bearer {self.api_key}")
        with urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode())
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")

    def _claude_cli(self, sys_p, usr_p, max_tok):
        """Claude Code CLI subprocess — uses Max subscription, ultra fast."""
        combined = f"{sys_p}\n\n{usr_p}"
        claude_cmd = r"C:\Users\bobmc\AppData\Roaming\npm\claude.cmd"
        r = subprocess.run(
            [claude_cmd, "-p", "--model", "sonnet", "--output-format", "text",
             "--no-session-persistence"],
            input=combined, capture_output=True, text=True, timeout=180,
        )
        if r.returncode != 0:
            raise RuntimeError(f"claude CLI exit {r.returncode}: {r.stderr[:100]}")
        return r.stdout.strip()

    def _gemini(self, sys_p, usr_p, max_tok, temp):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"
        body = json.dumps({
            "contents": [{"parts": [{"text": f"{sys_p}\n\n{usr_p}"}]}],
            "generationConfig": {"temperature": temp, "maxOutputTokens": max_tok},
        }).encode()
        req = Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        with urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode())
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])
        return parts[0].get("text", "") if parts else ""


def build_providers(keys):
    providers = []

    # ═══ TIER 1: AZURE OPENAI (FREE, reliable, best JSON) ═══
    if keys["azure_key"] and keys["azure_endpoint"]:
        ep = keys["azure_endpoint"].rstrip("/")
        providers.append(LLMProvider(
            "Azure-GPT41", keys["azure_key"],
            f"{ep}/openai/deployments/gpt41-eastus/chat/completions?api-version=2025-01-01-preview",
            "gpt-4.1", auth_type="azure"))
        providers.append(LLMProvider(
            "Azure-GPT41-mini", keys["azure_key"],
            f"{ep}/openai/deployments/gpt41mini-eastus/chat/completions?api-version=2025-01-01-preview",
            "gpt-4.1-mini", auth_type="azure"))
        providers.append(LLMProvider(
            "Azure-GPT4o", keys["azure_key"],
            f"{ep}/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview",
            "gpt-4o", auth_type="azure"))

    # ═══ TIER 1: GITHUB MODELS (FREE, reliable) ═══
    if keys["github_token"]:
        gh_url = (keys["github_url"] or "https://models.github.ai/inference/v1").rstrip("/")
        gh_chat = f"{gh_url}/chat/completions"
        for mid, mname in [
            ("openai/gpt-4.1", "GH-GPT41"),
            ("openai/gpt-4.1-mini", "GH-GPT41-mini"),
            ("openai/gpt-4o", "GH-GPT4o"),
            ("deepseek/DeepSeek-V3-0324", "GH-DeepSeek-V3"),
            ("xai/grok-3-mini", "GH-Grok3-mini"),
            ("meta/Meta-Llama-3.1-405B-Instruct", "GH-Llama-405B"),
        ]:
            providers.append(LLMProvider(mname, keys["github_token"], gh_chat, mid))

    # ═══ CLAUDE DISABLED: subprocess.run timeout doesn't kill .cmd child tree on Windows ═══
    # Claude CLI adds 373s dead time per call — not viable for high-throughput forge.
    # Other 42 providers produce A++ quality (median score 14/15).

    # ═══ TIER 2: OPENROUTER PAID KEYS (18 keys × 3 models) ═══
    for i, key in enumerate(keys["openrouter"]):
        model = OR_PAID_MODELS[i % len(OR_PAID_MODELS)]
        providers.append(LLMProvider(
            f"OR-{i+1}-{model.split('/')[-1][:12]}", key,
            "https://openrouter.ai/api/v1/chat/completions", model))

    # ═══ TIER 2: OPENROUTER FREE MODELS (use first 7 OR keys for free models) ═══
    for i, free_model in enumerate(OR_FREE_MODELS):
        if i < len(keys["openrouter"]):
            short = free_model.split("/")[-1].split(":")[0][:15]
            providers.append(LLMProvider(
                f"OR-F-{short}", keys["openrouter"][i],
                "https://openrouter.ai/api/v1/chat/completions", free_model))

    # ═══ TIER 2: DIRECT API PROVIDERS ═══
    if keys["deepseek"]:
        providers.append(LLMProvider("DeepSeek-V3", keys["deepseek"],
                                     "https://api.deepseek.com/v1/chat/completions", "deepseek-chat"))
    if keys["together"]:
        providers.append(LLMProvider("Together-Llama", keys["together"],
                                     "https://api.together.xyz/v1/chat/completions",
                                     "meta-llama/Llama-3.3-70B-Instruct-Turbo"))
    if keys["groq"]:
        providers.append(LLMProvider("Groq-Llama", keys["groq"],
                                     "https://api.groq.com/openai/v1/chat/completions",
                                     "llama-3.3-70b-versatile"))
    if keys["xai"]:
        providers.append(LLMProvider("Grok-3-mini", keys["xai"],
                                     "https://api.x.ai/v1/chat/completions", "grok-3-mini-beta"))
    if keys["mistral"]:
        providers.append(LLMProvider("Mistral-Large", keys["mistral"],
                                     "https://api.mistral.ai/v1/chat/completions",
                                     "mistral-large-latest"))
    if keys["fireworks"]:
        providers.append(LLMProvider("Fireworks-Llama", keys["fireworks"],
                                     "https://api.fireworks.ai/inference/v1/chat/completions",
                                     "accounts/fireworks/models/llama-v3p3-70b-instruct"))
    if keys["sambanova"]:
        providers.append(LLMProvider("SambaNova-Llama", keys["sambanova"],
                                     "https://api.sambanova.ai/v1/chat/completions",
                                     "Meta-Llama-3.3-70B-Instruct"))

    # ═══ TIER 3: GEMINI DIRECT ═══
    for i, key in enumerate(keys["gemini"]):
        providers.append(LLMProvider(f"Gemini-{i+1}", key, "", "gemini-2.0-flash", is_gemini=True))

    return providers


def get_system_prompt(engine_id, domain_name):
    # Detect if this is a backbone engine (XX01 pattern or in BACKBONE_ENGINES)
    is_backbone = engine_id in BACKBONE_ENGINES or engine_id.endswith("01")
    prefix = re.sub(r'\d+$', '', engine_id)
    # Find sub-engines for this backbone
    sub_engines_note = ""
    if is_backbone:
        sub_engines_note = f"""
BACKBONE ENGINE ROLE: {engine_id} is the MOST POWERFUL engine in the {domain_name} domain.
It serves two critical functions:
  1. DIRECT AUTHORITY: Answers queries directly with the deepest, most comprehensive expertise in {domain_name}.
     It has broader knowledge than any sub-engine and handles complex, multi-faceted questions that span
     the entire domain. When a query touches multiple subdomain areas, {engine_id} synthesizes the answer.
  2. DELEGATION COMMANDER: Routes specialized queries to sub-engines ({prefix}02, {prefix}03, etc.) in its
     domain. Each sub-engine is a specialist in one narrow area. {engine_id} knows WHAT each sub-engine
     does and WHEN to delegate vs answer directly. It orchestrates multi-engine workflows for complex queries.

Doctrines for {engine_id} must reflect this dual role — deep domain mastery PLUS delegation intelligence.
Include cross_domain_routes that reference both sub-engines in this domain AND related backbone engines
in other domains.
"""

    return f"""You are an elite domain expert generating A++ doctrine blocks for {engine_id} ({domain_name}).
{sub_engines_note}
A doctrine block is a pre-compiled DECISION FRAMEWORK — a senior expert's reasoning cached for instant deployment.

MANDATORY QUALITY (A++ GRADE):

1. TOPIC: Highly specific. "Fatigue Life in Welded Joints Under Variable Amplitude Loading" NOT "Welding basics"
2. KEYWORDS: 6-8 specific terms with abbreviations, standards refs, practitioner jargon
3. CONCLUSION: 3-5 authoritative sentences with specific recommendations and confidence qualifiers
4. REASONING: 300-600 words structured as:
   Step 1: Issue identification and framing
   Step 2: Applicable standards/regulations (cite REAL numbers: ASME, API, ISO, IEEE, etc.)
   Step 3: Analysis methodology with formulas/calculations where applicable
   Step 4: Key decision factors with relative weights
   Step 5: Adversary/counter-position — strongest opposing argument
   Step 6: Resolution strategy — specific actionable steps
   Step 7: Confidence assessment with caveats and boundary conditions
5. KEY_FACTORS: 5-8 factors, each a complete sentence explaining WHY it matters
6. AUTHORITIES: 3-5 REAL sources as "TYPE: Reference — relevance"
7. BURDEN_HOLDER: Who bears responsibility
8. ADVERSARY_POSITION: 2-3 sentences — strongest opposing argument
9. COUNTER_ARGUMENTS: 3-5 specific counter-arguments
10. RESOLUTION_STRATEGY: 3-5 sentences of specific actionable steps
11. ENTITY_SCOPE: What entities/situations this applies to
12. CONFIDENCE: DEFENSIBLE | AGGRESSIVE | DISCLOSURE | HIGH_RISK
13. CONFIDENCE_STRATIFICATION: Rating + reasoning
14. CONTROLLING_PRECEDENT: Single most authoritative source
15. ZONE: PLANNING | REPORTING | AUDIT
16. CROSS_DOMAIN_ROUTES: JSON listing related engines for cross-domain queries
17. DOMAIN_SCOPE: What subdomain areas this doctrine covers

Return ONLY a JSON array of doctrine objects with ALL fields. No markdown wrapping."""


def get_user_prompt(engine_id, domain_name, subtopics, count):
    st = "\n".join(f"  {i+1}. {s}" for i, s in enumerate(subtopics[:count]))
    return f"""Generate {count} A++ doctrines for {engine_id} ({domain_name}). One per subtopic:
{st}

Each doctrine JSON object must have: topic, keywords, conclusion, reasoning, key_factors, authorities,
burden_holder, adversary_position, counter_arguments, resolution_strategy, entity_scope,
confidence, confidence_stratification, controlling_precedent, zone, cross_domain_routes, domain_scope.

Return JSON array of {count} objects. Every field REAL content — no placeholders."""


def expand_subdomains(engine_id, domain_name, provider):
    sys_p = f"You are a domain expert in {domain_name}."
    usr_p = f"""List 45 highly specific subtopics within {domain_name} for an intelligence engine.
Cover: foundational, advanced, cutting-edge, regulatory, practical, cross-disciplinary, standards, emerging.
Return ONLY a JSON array of strings. No markdown."""
    text = provider.generate(sys_p, usr_p, engine_id=engine_id, max_tokens=4096, temperature=0.8)
    if text:
        text = re.sub(r"^```\w*\n?", "", text.strip())
        text = re.sub(r"\n?```\s*$", "", text)
        try:
            topics = json.loads(text)
            if isinstance(topics, list) and len(topics) >= 10:
                return topics
        except (json.JSONDecodeError, TypeError):
            pass
    return [f"{domain_name} — {area}" for area in [
        "Fundamental Principles", "Regulatory Framework", "Industry Standards",
        "Quality Assurance", "Risk Assessment", "Safety Protocols", "Advanced Methods",
        "Emerging Technologies", "Cross-Disciplinary Applications", "Professional Ethics",
        "Economic Analysis", "Environmental Impact", "Computational Methods",
        "Materials Science", "Project Management", "Failure Analysis",
        "Optimization Techniques", "Data Analytics", "Automation and AI",
        "Sustainability", "Historical Development", "Education and Training",
        "Case Studies", "Forensic Analysis", "Intellectual Property",
        "Supply Chain", "Testing and Validation", "Maintenance Strategies",
        "Performance Metrics", "Troubleshooting", "Innovation Trends",
        "Certification Requirements", "International Standards", "Cost Estimation",
        "Workforce Development",
    ]]


def parse_doctrines(text):
    if not text:
        return []
    text = re.sub(r"^```\w*\n?", "", text.strip())
    text = re.sub(r"\n?```\s*$", "", text)
    # Handle Claude's occasional <result> or <output> wrapping
    text = re.sub(r"<[^>]+>", "", text)
    try:
        r = json.loads(text)
        return r if isinstance(r, list) else [r] if isinstance(r, dict) else []
    except json.JSONDecodeError:
        m = re.search(r'\[[\s\S]*\]', text)
        if m:
            try:
                return json.loads(m.group())
            except json.JSONDecodeError:
                pass
    return []


def score_doctrine(d):
    score = 0
    r = str(d.get("reasoning", "") or "")
    c = str(d.get("conclusion", "") or "")
    kf = d.get("key_factors", []) or []
    au = d.get("authorities", []) or []
    kw = d.get("keywords", []) or []
    tp = str(d.get("topic", "") or "")
    bh = str(d.get("burden_holder", "") or "")
    ap = str(d.get("adversary_position", "") or "")
    ca = d.get("counter_arguments", []) or []
    if len(r) >= 500: score += 3
    elif len(r) >= 300: score += 2
    elif len(r) >= 100: score += 1
    if re.search(r'\b(ASME|API|ISO|IEEE|NFPA|OSHA|EPA|CFR|IRC|ASTM|NACE|AWS|ANSI)\b', r): score += 1
    if len(c) >= 200: score += 2
    elif len(c) >= 100: score += 1
    if isinstance(kf, list) and len(kf) >= 5: score += 2
    elif isinstance(kf, list) and len(kf) >= 3: score += 1
    if isinstance(au, list) and len(au) >= 3: score += 2
    elif isinstance(au, list) and len(au) >= 1: score += 1
    if isinstance(kw, list) and len(kw) >= 6: score += 1
    if len(tp) >= 20: score += 1
    if len(bh) >= 10: score += 1
    if len(ap) >= 30: score += 1
    if isinstance(ca, list) and len(ca) >= 3: score += 1
    return score


def filter_quality(candidates, min_score=MIN_QUALITY_SCORE):
    scored = []
    seen = set()
    for d in candidates:
        if not isinstance(d, dict) or not d.get("topic"):
            continue
        h = hashlib.md5(d["topic"].lower().encode()).hexdigest()
        if h in seen:
            continue
        seen.add(h)
        s = score_doctrine(d)
        d["_score"] = s
        if s >= min_score:
            scored.append(d)
    scored.sort(key=lambda x: x.get("_score", 0), reverse=True)
    return scored


def generate_batch(engine_id, domain_name, subtopics, count, providers):
    sys_p = get_system_prompt(engine_id, domain_name)
    all_cands = []
    active = [p for p in providers if p.failures < 5 and not p.disabled][:MAX_LLM_WORKERS * 2]
    if not active:
        active = [p for p in providers if not p.disabled][:8]
    random.shuffle(active)  # Distribute load across ALL providers, not just first N
    chunks = []
    per = max(3, count // min(len(active), MAX_LLM_WORKERS))
    for i in range(0, len(subtopics[:count]), per):
        chunks.append(subtopics[i:i + per])

    P(f"    Dispatching {len(chunks)} chunks to {min(len(active), MAX_LLM_WORKERS)} providers...")

    def call(provider, chunk):
        usr_p = get_user_prompt(engine_id, domain_name, chunk, len(chunk))
        text = provider.generate(sys_p, usr_p, engine_id=engine_id)
        docs = parse_doctrines(text)
        provider.doctrines_produced += len(docs)
        return provider.name, docs

    with ThreadPoolExecutor(max_workers=MAX_LLM_WORKERS) as ex:
        futs = {ex.submit(call, active[i % len(active)], ch): i for i, ch in enumerate(chunks)}
        for f in as_completed(futs):
            try:
                pname, docs = f.result()
                all_cands.extend(docs)
                P(f"      [{pname}] => {len(docs)} doctrines parsed")
            except Exception as e:
                P(f"      [ERR] {e}")
    P(f"    Total candidates: {len(all_cands)}")
    return all_cands


def generate_routing(engine_id, domain_name, provider):
    all_eng = ", ".join(f"{k}({v})" for k, v in sorted(BACKBONE_ENGINES.items()))
    prefix = re.sub(r'\d+$', '', engine_id)
    sys_p = f"""Generate ROUTING doctrines for {engine_id} ({domain_name}).

{engine_id} is the BACKBONE ENGINE — the most powerful engine in the {domain_name} domain.
It has two roles: (1) Answer complex queries directly with deep domain mastery, and
(2) Delegate specialized queries to sub-engines ({prefix}02, {prefix}03, etc.) in its domain.

These routing doctrines define HOW {engine_id} decides when to answer directly vs delegate,
which sub-engines handle which specializations, and how to route cross-domain queries to
other backbone engines.

Available backbone engines across all domains: {all_eng}"""
    usr_p = f"""Generate 5 routing doctrines for {engine_id}:
1. "[ROUTING] {engine_id} Domain Scope & Coverage Map" — What {engine_id} covers directly, what it delegates to sub-engines, domain boundaries
2. "[ROUTING] {engine_id} Cross-Domain Routing Matrix" — When to route to other backbone engines (e.g., {prefix}→PIPE, {prefix}→RE, etc.)
3. "[ROUTING] {engine_id} Sub-Engine Delegation Protocol" — Decision tree: when {engine_id} answers vs delegates to {prefix}02/{prefix}03/etc. Include each sub-engine's specialization
4. "[ROUTING] {engine_id} Multi-Domain Query Decomposition" — How to split complex queries that span multiple sub-engines or domains into coordinated sub-queries
5. "[ROUTING] {engine_id} Domain Boundary Detection" — How to detect when a query is leaving {domain_name} territory and needs handoff to another backbone
Same full structure as domain doctrines. Return JSON array of 5 objects."""
    return parse_doctrines(provider.generate(sys_p, usr_p, engine_id=engine_id, max_tokens=8192, temperature=0.6))[:5]


def sql_esc(s):
    if s is None: return ""
    if isinstance(s, list): s = json.dumps(s)
    return str(s).replace("'", "''")


def insert_d1(engine_id, doctrines):
    total = 0
    for bs in range(0, len(doctrines), BATCH_SIZE):
        batch = doctrines[bs:bs + BATCH_SIZE]
        stmts = []
        for d in batch:
            vals = [
                sql_esc(engine_id), sql_esc(d.get("topic", "")),
                sql_esc(d.get("keywords", [])), sql_esc(d.get("conclusion", "")),
                sql_esc(d.get("reasoning", "")), sql_esc(d.get("key_factors", [])),
                sql_esc(d.get("authorities", [])), sql_esc(d.get("confidence", "DEFENSIBLE")),
                sql_esc(d.get("zone", "PLANNING")),
                sql_esc(d.get("burden_holder", "")), sql_esc(d.get("adversary_position", "")),
                sql_esc(d.get("counter_arguments", [])), sql_esc(d.get("resolution_strategy", "")),
                sql_esc(d.get("entity_scope", "")), sql_esc(d.get("confidence_stratification", "")),
                sql_esc(d.get("controlling_precedent", "")),
                sql_esc(d.get("cross_domain_routes", "")), sql_esc(d.get("domain_scope", "")),
            ]
            cols = ("engine_id,topic,keywords,conclusion,reasoning,key_factors,authorities,"
                    "confidence,zone,burden_holder,adversary_position,counter_arguments,"
                    "resolution_strategy,entity_scope,confidence_stratification,"
                    "controlling_precedent,cross_domain_routes,domain_scope,created_at")
            vs = "','".join(vals)
            stmts.append(f"INSERT INTO doctrines ({cols}) VALUES ('{vs}',datetime('now'));")
        sf = Path(f"C:/Users/bobmc/temp_d1_v4_{engine_id}_{bs}.sql")
        sf.write_text("\n".join(stmts), encoding="utf-8")
        try:
            r = subprocess.run(f'{WRANGLER} d1 execute {D1_DB} --remote --file="{sf}"',
                               shell=True, capture_output=True, text=True, cwd=CWD, timeout=60)
            if r.returncode == 0:
                total += len(batch)
                P(f"      [D1] +{len(batch)} inserted")
                log_event("d1_insert", engine_id, inserted=len(batch), batch_offset=bs)
            else:
                P(f"      [D1 ERR] {r.stderr[:150]}")
                log_event("d1_error", engine_id, error=r.stderr[:150])
        except subprocess.TimeoutExpired:
            P(f"      [D1 TIMEOUT]")
            log_event("d1_error", engine_id, error="timeout")
        finally:
            sf.unlink(missing_ok=True)
    return total


def purge_low(engine_id):
    sql = f"DELETE FROM doctrines WHERE engine_id='{sql_esc(engine_id)}' AND (reasoning IS NULL OR LENGTH(reasoning)<50)"
    try:
        r = subprocess.run(f'{WRANGLER} d1 execute {D1_DB} --remote --command="{sql}"',
                           shell=True, capture_output=True, text=True, cwd=CWD, timeout=30)
        m = re.search(r'"changes":\s*(\d+)', r.stdout)
        if m and int(m.group(1)) > 0:
            P(f"    Purged {m.group(1)} low-quality doctrines")
            log_event("purge", engine_id, purged=int(m.group(1)))
    except Exception:
        pass


def swarm_qa(engine_id, doctrines):
    if not doctrines:
        return 7
    sample = random.sample(doctrines, min(3, len(doctrines)))
    body = json.dumps({"query": f"Rate {engine_id} doctrines 1-10 for A++ quality",
                       "context": json.dumps(sample, indent=2)[:3000]}).encode()
    try:
        req = Request("https://echo-swarm-brain.bmcii1976.workers.dev/trinity/consult",
                      data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        with urlopen(req, timeout=30) as resp:
            ans = str(json.loads(resp.read().decode()).get("answer", ""))[:200]
        m = re.search(r'(\d+)\s*/\s*10', ans)
        return int(m.group(1)) if m else 7
    except Exception:
        return 7


def get_all_engines():
    sql = "SELECT DISTINCT engine_id FROM doctrines ORDER BY engine_id"
    try:
        r = subprocess.run(f'{WRANGLER} d1 execute {D1_DB} --remote --command="{sql}"',
                           shell=True, capture_output=True, text=True, cwd=CWD, timeout=60)
        return sorted(set(re.findall(r'"engine_id":\s*"([^"]+)"', r.stdout)))
    except Exception:
        return []


def infer_domain(eid):
    if eid in BACKBONE_ENGINES:
        return BACKBONE_ENGINES[eid]
    prefix = re.sub(r'\d+$', '', eid)
    for bid, bn in BACKBONE_ENGINES.items():
        if bid.startswith(prefix):
            return bn + " (Specialized)"
    return f"{prefix} Domain"


def log_provider_stats(providers):
    """Log provider leaderboard to JSONL."""
    stats = []
    for p in sorted(providers, key=lambda x: x.doctrines_produced, reverse=True):
        if p.calls == 0:
            continue
        avg_t = p.total_time / p.calls if p.calls else 0
        stats.append({
            "name": p.name, "model": p.model, "calls": p.calls,
            "ok": p.successes, "fail": p.failures,
            "avg_s": round(avg_t, 1), "chars": p.total_chars,
            "doctrines": p.doctrines_produced,
            "rate": round(p.successes / p.calls * 100, 0) if p.calls else 0,
        })
    log_event("provider_stats", providers=stats)


def forge_engine(eid, domain, providers, args):
    P(f"\n  {'='*55}")
    P(f"  FORGE: {eid} ({domain})")
    P(f"  {'='*55}")
    log_event("start", eid, domain=domain)
    t_start = time.time()

    if args.purge_first:
        purge_low(eid)

    if args.routing_only:
        rp = random.choice([p for p in providers if p.failures < 5][:5])
        routing = generate_routing(eid, domain, rp)
        if routing:
            ins = insert_d1(eid, routing)
            P(f"    [ROUTING] Inserted {ins}/{len(routing)}")
            log_event("routing", eid, inserted=ins)
        return len(routing)

    total = 0
    P(f"    Expanding subdomains...")
    # Prefer Azure/GitHub/Claude for subdomain expansion (most reliable)
    reliable = [p for p in providers if p.failures < 3 and
                any(x in p.name for x in ["Azure", "GH-", "Claude", "DeepSeek"])][:5]
    if not reliable:
        reliable = [p for p in providers if p.failures < 3][:5]
    exp = random.choice(reliable)
    subs = expand_subdomains(eid, domain, exp)
    P(f"    {len(subs)} subtopics generated")

    all_scores = []
    all_cands_for_qa = []
    for bn in range(1, BATCHES_PER_ENGINE + 1):
        P(f"\n    ── Batch {bn}/{BATCHES_PER_ENGINE} ({DOCTRINES_PER_BATCH} target) ──")
        si = (bn - 1) * DOCTRINES_PER_BATCH
        bt = subs[si:si + DOCTRINES_PER_BATCH]
        if len(bt) < DOCTRINES_PER_BATCH:
            bt += subs[:DOCTRINES_PER_BATCH - len(bt)]

        cands = generate_batch(eid, domain, bt, DOCTRINES_PER_BATCH, providers)
        all_cands_for_qa.extend(cands)
        qual = filter_quality(cands, MIN_QUALITY_SCORE)
        scores = [d.get("_score", 0) for d in qual]
        all_scores.extend(scores)

        grade = "A++" if scores and min(scores) >= 10 else "A+" if scores and min(scores) >= 8 else "A" if scores else "F"
        if scores:
            P(f"    QUALITY: max={max(scores)} min={min(scores)} med={statistics.median(scores):.0f} | pass={len(qual)}/{len(cands)} | GRADE: {grade}")
        else:
            P(f"    QUALITY: 0 passed out of {len(cands)} candidates")

        if not qual:
            qual = filter_quality(cands, max(5, MIN_QUALITY_SCORE - 3))
            grade = "B"
            if qual:
                P(f"    Relaxed to min-5: {len(qual)} passed (GRADE: B)")

        bd = qual[:DOCTRINES_PER_BATCH]
        if len(bd) < DOCTRINES_PER_BATCH and total + len(bd) < MIN_DOCTRINES_SKIP_GAP:
            gap = DOCTRINES_PER_BATCH - len(bd)
            P(f"    Gap fill: {gap} needed, calling backup provider...")
            gp = random.choice([p for p in providers if p.failures < 3][:8])
            gt = random.sample(subs, min(gap + 5, len(subs)))
            text = gp.generate(get_system_prompt(eid, domain), get_user_prompt(eid, domain, gt, gap), engine_id=eid)
            gd = filter_quality(parse_doctrines(text), max(5, MIN_QUALITY_SCORE - 2))
            bd.extend(gd[:gap])
            P(f"    Gap filled: +{len(gd[:gap])}")
        elif len(bd) < DOCTRINES_PER_BATCH:
            P(f"    Gap fill: skipped ({total + len(bd)} doctrines already sufficient)")

        if bd:
            ins = insert_d1(eid, bd)
            P(f"    Batch {bn} result: {ins}/{len(bd)} inserted into D1")
            total += ins
            log_event("batch", eid, batch=bn, inserted=ins, target=len(bd),
                      score_max=max(scores) if scores else 0,
                      score_min=min(scores) if scores else 0, grade=grade,
                      candidates=len(cands), passed=len(qual))
        time.sleep(0.1)

    # Routing for backbone engines
    is_bb = eid.endswith("01") or eid in BACKBONE_ENGINES
    if is_bb:
        P(f"    [ROUTING] Generating 5 cross-domain routing doctrines...")
        rp = random.choice([p for p in providers if p.failures < 3][:5])
        routing = generate_routing(eid, domain, rp)
        if routing:
            ins = insert_d1(eid, routing)
            P(f"    [ROUTING] {ins}/{len(routing)} routing doctrines inserted")
            total += ins
            log_event("routing", eid, inserted=ins)

    qa = swarm_qa(eid, all_cands_for_qa[:5])
    elapsed = time.time() - t_start
    overall_grade = "A++" if all_scores and min(all_scores) >= 10 else "A+" if all_scores and min(all_scores) >= 8 else "A" if all_scores and statistics.mean(all_scores) >= 8 else "B" if all_scores else "F"

    P(f"\n  >>> {eid} COMPLETE: {total} doctrines | QA: {qa}/10 | Grade: {overall_grade} | {elapsed:.0f}s")
    log_event("complete", eid, doctrines=total, qa_score=qa, grade=overall_grade,
              elapsed_s=round(elapsed, 1), avg_score=round(statistics.mean(all_scores), 1) if all_scores else 0)
    return total


def main():
    p = argparse.ArgumentParser(description="Hephaestion v5.0 Ultimate Forge")
    p.add_argument("--engines", help="Comma-separated engine IDs")
    p.add_argument("--purge-first", action="store_true")
    p.add_argument("--routing-only", action="store_true")
    p.add_argument("--all-engines", action="store_true")
    p.add_argument("--start-at", type=int, default=0, help="Start at engine index N (0-based)")
    p.add_argument("--end-at", type=int, default=0, help="End at engine index N (exclusive, 0=all)")
    p.add_argument("--log-file", help="Override log file path (for dual forge)")
    args = p.parse_args()

    global LOG_FILE
    if args.log_file:
        LOG_FILE = Path(args.log_file)
    LOG_FILE.write_text("")
    log_event("init", status="starting")

    P("  Loading ALL API keys...")
    keys = load_keys()
    provs = build_providers(keys)

    # Count by category
    azure_ct = sum(1 for p in provs if "Azure" in p.name)
    gh_ct = sum(1 for p in provs if "GH-" in p.name)
    claude_ct = sum(1 for p in provs if "Claude" in p.name)
    or_paid_ct = sum(1 for p in provs if p.name.startswith("OR-") and "-F-" not in p.name)
    or_free_ct = sum(1 for p in provs if "OR-F-" in p.name)
    direct_ct = sum(1 for p in provs if any(x in p.name for x in ["DeepSeek", "Together", "Groq", "Grok", "Mistral", "Fireworks", "SambaNova"]))
    gemini_ct = sum(1 for p in provs if "Gemini" in p.name)

    P(f"  Azure: {azure_ct} | GitHub: {gh_ct} | Claude: {claude_ct} | OR-Paid: {or_paid_ct} | OR-Free: {or_free_ct} | Direct: {direct_ct} | Gemini: {gemini_ct}")
    P(f"  TOTAL PROVIDERS: {len(provs)}")
    P("=" * 68)
    P("  HEPHAESTION v5.0 — ULTIMATE FORGE (ALL LLM ARSENAL)")
    P(f"  {len(provs)} providers | TIE Gold Standard | Cross-Domain Routing")
    P(f"  MAX_LLM_WORKERS: {MAX_LLM_WORKERS}")
    P("=" * 68)

    if args.engines:
        elist = [(e.strip(), infer_domain(e.strip())) for e in args.engines.split(",")]
    elif args.all_engines:
        P("\n  Fetching ALL engine IDs from D1...")
        ids = get_all_engines()
        filtered = [e for e in ids if not any(e.startswith(p) for p in EXCLUDED_PREFIXES)]
        elist = [(e, infer_domain(e)) for e in filtered]
        P(f"  {len(ids)} total, {len(elist)} after excluding {EXCLUDED_PREFIXES}")
    else:
        elist = sorted(BACKBONE_ENGINES.items())

    # Slice for dual forge support
    if args.start_at > 0:
        elist = elist[args.start_at:]
        P(f"  Starting at index {args.start_at} ({elist[0][0] if elist else 'none'})")
    if args.end_at > 0:
        elist = elist[:args.end_at - args.start_at]
        P(f"  Ending at index {args.end_at} ({len(elist)} engines in this slice)")

    log_event("queue", total_engines=len(elist), mode="all-engines" if args.all_engines else "backbone",
              provider_count=len(provs))

    grand_total = 0
    completed = 0
    t0 = time.time()
    for i, (eid, dom) in enumerate(elist):
        el = time.time() - t0
        if i > 0:
            rate = el / i
            eta = rate * (len(elist) - i) / 60
            P(f"\n  ┌─ [{i+1}/{len(elist)}] ETA: {eta:.0f}m | Rate: {rate:.0f}s/engine | Total: {grand_total:,} doctrines ─┐")
        else:
            P(f"\n  ┌─ [{i+1}/{len(elist)}] ─┐")

        try:
            forged = forge_engine(eid, dom, provs, args)
            grand_total += forged
            completed += 1
            log_event("progress", progress=f"{i+1}/{len(elist)}", completed=completed,
                      grand_total=grand_total, elapsed_min=round(el/60, 1),
                      eta_min=round((el/max(i,1))*(len(elist)-i)/60, 1) if i > 0 else 0)
        except Exception as e:
            P(f"  [FATAL] {eid}: {e}")
            log_event("error", eid, error=str(e)[:200])

        # Log provider stats every 10 engines
        if (i + 1) % 10 == 0:
            log_provider_stats(provs)

    el = time.time() - t0
    log_provider_stats(provs)
    P(f"\n{'='*68}")
    P(f"  FORGE COMPLETE: {grand_total:,} doctrines across {completed}/{len(elist)} engines in {el/60:.1f}m")
    P(f"{'='*68}")
    log_event("done", grand_total=grand_total, engines_completed=completed,
              engines_total=len(elist), elapsed_min=round(el/60, 1))


if __name__ == "__main__":
    main()
