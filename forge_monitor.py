#!/usr/bin/env python3
"""
HEPHAESTION v6.0 ULTIMATE FORGE MONITOR
=========================================
Deep dashboard for ALL forge forks with comprehensive telemetry.
Reads JSONL logs from all active forge processes.

Usage: python -u forge_monitor.py
       python -u forge_monitor.py --refresh 3
       python -u forge_monitor.py --once
       python -u forge_monitor.py --compact
"""
import json, sys, time, os, argparse, statistics
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

sys.stdout.reconfigure(line_buffering=True)

# ═══════════════════════════════════════════════════════════════
# LOG FILE REGISTRY — Add new forks here
# ═══════════════════════════════════════════════════════════════
LOG_FILES = {
    "A":      Path("C:/Users/bobmc/hephaestion_forge_A.jsonl"),
    "B":      Path("C:/Users/bobmc/hephaestion_forge_B.jsonl"),
    "C":      Path("C:/Users/bobmc/hephaestion_forge_C.jsonl"),
    "LM":     Path("C:/Users/bobmc/hephaestion_forge_LM.jsonl"),
    "ENC":    Path("C:/Users/bobmc/hephaestion_forge_ENCORE.jsonl"),
}
LEGACY_LOG = Path("C:/Users/bobmc/hephaestion_v4_log.jsonl")

# Fork display colors and labels
FORK_META = {
    "A":   {"color": "\033[96m",  "label": "Fork A (Main-1)"},
    "B":   {"color": "\033[95m",  "label": "Fork B (Main-2)"},
    "C":   {"color": "\033[92m",  "label": "Fork C (Gap)"},
    "LM":  {"color": "\033[93m",  "label": "Fork LM (Landman)"},
    "ENC": {"color": "\033[94m",  "label": "Fork ENC (ENCORE)"},
    "S":   {"color": "\033[37m",  "label": "Legacy (v4)"},
}

# ═══════════════════════════════════════════════════════════════
# ANSI COLORS
# ═══════════════════════════════════════════════════════════════
RST  = "\033[0m"
BOLD = "\033[1m"
DIM  = "\033[2m"
ITAL = "\033[3m"
ULINE = "\033[4m"
RED  = "\033[91m"
GRN  = "\033[92m"
YEL  = "\033[93m"
BLU  = "\033[94m"
MAG  = "\033[95m"
CYN  = "\033[96m"
WHT  = "\033[97m"
BGRED  = "\033[41m"
BGGRN  = "\033[42m"
BGYEL  = "\033[43m"
BGCYN  = "\033[46m"
BGRN   = "\033[92m\033[1m"
BRED   = "\033[91m\033[1m"
BYEL   = "\033[93m\033[1m"
BCYN   = "\033[96m\033[1m"

W = 80  # Terminal width assumption


def grade_color(g):
    return {"A++": BGRN, "A+": GRN, "A": GRN, "B": YEL, "F": RED}.get(g, WHT)


def status_icon(s):
    return {"ok": f"{GRN}✓{RST}", "error": f"{RED}✗{RST}", "disabled": f"{RED}⊘{RST}"}.get(s, "?")


def human_time(seconds):
    if seconds < 60:
        return f"{seconds:.0f}s"
    elif seconds < 3600:
        return f"{seconds/60:.1f}m"
    elif seconds < 86400:
        return f"{seconds/3600:.1f}h"
    else:
        return f"{seconds/86400:.1f}d"


def human_chars(n):
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n/1_000:.0f}K"
    return str(n)


def bar_graph(value, maximum, width=40, fill_char="█", empty_char="░", color=CYN):
    if maximum <= 0:
        return f"{color}{empty_char * width}{RST}"
    pct = min(value / maximum, 1.0)
    filled = int(width * pct)
    return f"{color}{fill_char * filled}{DIM}{empty_char * (width - filled)}{RST}"


def spark_line(values, width=20):
    """Mini sparkline from a list of numbers."""
    if not values:
        return ""
    blocks = " ▁▂▃▄▅▆▇█"
    mn, mx = min(values), max(values)
    rng = mx - mn if mx != mn else 1
    step = len(values) / width if len(values) > width else 1
    sampled = []
    for i in range(min(width, len(values))):
        idx = int(i * step)
        sampled.append(values[min(idx, len(values) - 1)])
    return "".join(blocks[min(int((v - mn) / rng * 8), 8)] for v in sampled)


# ═══════════════════════════════════════════════════════════════
# DATA LOADING
# ═══════════════════════════════════════════════════════════════
def load_events_from(path):
    if not path.exists():
        return []
    events = []
    try:
        for line in path.read_text(encoding="utf-8", errors="replace").strip().splitlines():
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    except Exception:
        pass
    return events


def load_all():
    all_events = []
    forge_events = {}
    for fid, path in LOG_FILES.items():
        evts = load_events_from(path)
        for e in evts:
            e["_forge"] = fid
        forge_events[fid] = evts
        all_events.extend(evts)
    # Legacy fallback
    if not all_events:
        evts = load_events_from(LEGACY_LOG)
        for e in evts:
            e["_forge"] = "S"
        forge_events["S"] = evts
        all_events.extend(evts)
    # Also load legacy if it has data (for combined stats)
    elif LEGACY_LOG.exists():
        evts = load_events_from(LEGACY_LOG)
        if evts:
            for e in evts:
                e["_forge"] = "S"
            forge_events["S"] = evts
            all_events.extend(evts)
    return all_events, forge_events


# ═══════════════════════════════════════════════════════════════
# RENDERING
# ═══════════════════════════════════════════════════════════════
def render(all_events, forge_events, compact=False):
    os.system("cls" if os.name == "nt" else "clear")

    # Classify events
    completes  = [e for e in all_events if e.get("type") == "complete"]
    batches    = [e for e in all_events if e.get("type") == "batch"]
    llm_calls  = [e for e in all_events if e.get("type") == "llm_call"]
    d1_inserts = [e for e in all_events if e.get("type") == "d1_insert"]
    d1_errors  = [e for e in all_events if e.get("type") == "d1_error"]
    errors     = [e for e in all_events if e.get("type") == "error"]
    purges     = [e for e in all_events if e.get("type") == "purge"]
    routings   = [e for e in all_events if e.get("type") == "routing"]
    done_evts  = [e for e in all_events if e.get("type") == "done"]
    starts     = [e for e in all_events if e.get("type") == "start"]

    engines_done = len(completes)
    grand_total_docs = sum(c.get("doctrines", 0) for c in completes)
    total_d1_ins = sum(d.get("inserted", 0) for d in d1_inserts)
    total_purged = sum(p.get("purged", 0) for p in purges)
    total_routing = sum(r.get("inserted", 0) for r in routings)
    num_active_forks = sum(1 for fid, evts in forge_events.items() if evts and fid != "S")

    # Compute total engine count across all forks
    total_engines_all = 0
    for fid, evts in forge_events.items():
        q = [e for e in evts if e.get("type") == "queue"]
        if q:
            total_engines_all += q[0].get("total_engines", 0)

    if total_engines_all == 0:
        total_engines_all = max(engines_done, 2614)

    # ═══════════════════════════════════════════════════════════
    # HEADER
    # ═══════════════════════════════════════════════════════════
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{BOLD}{CYN}╔{'═' * (W-2)}╗")
    title = "HEPHAESTION v6.0 — ULTIMATE FORGE MONITOR"
    pad = W - 4 - len(title)
    print(f"║  {title}{' ' * pad}║")
    sub = f"{now}  │  {num_active_forks} Fork{'s' if num_active_forks != 1 else ''} Active  │  {len(all_events):,} Events"
    pad2 = W - 4 - len(sub)
    print(f"║  {sub}{' ' * max(0, pad2)}║")
    print(f"╚{'═' * (W-2)}╝{RST}\n")

    # ═══════════════════════════════════════════════════════════
    # OVERALL PROGRESS
    # ═══════════════════════════════════════════════════════════
    pct = engines_done / total_engines_all * 100 if total_engines_all > 0 else 0
    print(f"  {BOLD}Overall Progress:{RST}")
    print(f"  [{bar_graph(engines_done, total_engines_all, 60)}] {BOLD}{pct:.1f}%{RST}")
    print()

    # Key metrics row
    ok_llm = sum(1 for l in llm_calls if l.get("status") == "ok")
    fail_llm = sum(1 for l in llm_calls if l.get("status") == "error")
    total_chars = sum(l.get("chars", 0) for l in llm_calls if l.get("status") == "ok")

    print(f"  {BOLD}Engines:{RST}    {GRN}{engines_done:,}{RST} / {total_engines_all:,} complete")
    print(f"  {BOLD}Doctrines:{RST}  {GRN}{grand_total_docs:,}{RST} generated  │  {CYN}{total_d1_ins:,}{RST} inserted into D1")
    print(f"  {BOLD}LLM Calls:{RST}  {GRN}{ok_llm:,}{RST} ok  │  {RED if fail_llm else DIM}{fail_llm:,}{RST} failed  │  {CYN}{human_chars(total_chars)}{RST} chars")
    print(f"  {BOLD}Purged:{RST}     {YEL}{total_purged:,}{RST}  │  {BOLD}Routing:{RST} {CYN}{total_routing:,}{RST}  │  "
          f"{BOLD}D1 Errors:{RST} {RED if len(d1_errors) else DIM}{len(d1_errors)}{RST}  │  "
          f"{BOLD}Fatal:{RST} {RED if len(errors) else DIM}{len(errors)}{RST}")

    # ═══════════════════════════════════════════════════════════
    # PER-FORK STATUS — The heart of the monitor
    # ═══════════════════════════════════════════════════════════
    print(f"\n  {BOLD}{'━' * (W-4)}{RST}")
    print(f"  {BOLD}  FORK STATUS{RST}")
    print(f"  {BOLD}{'━' * (W-4)}{RST}")

    combined_epm = 0.0
    total_remaining = 0

    for fid in ["A", "B", "C", "LM", "ENC", "S"]:
        evts = forge_events.get(fid, [])
        if not evts:
            continue

        meta = FORK_META.get(fid, {"color": WHT, "label": f"Fork {fid}"})
        fc = meta["color"]
        fl = meta["label"]

        f_completes = [e for e in evts if e.get("type") == "complete"]
        f_starts    = [e for e in evts if e.get("type") == "start"]
        f_batches   = [e for e in evts if e.get("type") == "batch"]
        f_llm       = [e for e in evts if e.get("type") == "llm_call"]
        f_llm_ok    = [e for e in f_llm if e.get("status") == "ok"]
        f_d1        = [e for e in evts if e.get("type") == "d1_insert"]
        f_queue     = [e for e in evts if e.get("type") == "queue"]
        f_done_evts = [e for e in evts if e.get("type") == "done"]
        f_errors    = [e for e in evts if e.get("type") == "error"]

        f_total_eng = f_queue[0].get("total_engines", "?") if f_queue else "?"
        f_done = len(f_completes)
        f_docs = sum(c.get("doctrines", 0) for c in f_completes)
        f_d1_total = sum(d.get("inserted", 0) for d in f_d1)
        f_chars = sum(l.get("chars", 0) for l in f_llm_ok)

        # Timing
        f_rates = [c.get("elapsed_s", 0) for c in f_completes if c.get("elapsed_s", 0) > 0]
        f_avg = statistics.mean(f_rates) if f_rates else 0
        f_med = statistics.median(f_rates) if f_rates else 0
        f_min_t = min(f_rates) if f_rates else 0
        f_max_t = max(f_rates) if f_rates else 0

        # ETA
        f_remaining = (f_total_eng - f_done) if isinstance(f_total_eng, int) else 0
        total_remaining += f_remaining
        f_eta_s = f_remaining * f_avg if f_avg > 0 else 0
        if f_avg > 0:
            combined_epm += 60.0 / f_avg

        # Scores
        f_scores = [c.get("avg_score", 0) for c in f_completes if c.get("avg_score", 0) > 0]
        f_avg_score = statistics.mean(f_scores) if f_scores else 0
        f_qa = [c.get("qa_score", 0) for c in f_completes if c.get("qa_score")]
        f_avg_qa = statistics.mean(f_qa) if f_qa else 0

        # Grades
        f_grade_counts = defaultdict(int)
        for b in f_batches:
            f_grade_counts[b.get("grade", "?")] += 1
        f_app = f_grade_counts.get("A++", 0)
        f_ap = f_grade_counts.get("A+", 0)
        f_a = f_grade_counts.get("A", 0)
        f_b = f_grade_counts.get("B", 0)
        f_f = f_grade_counts.get("F", 0)
        f_total_batches = sum(f_grade_counts.values())
        f_app_pct = f_app / f_total_batches * 100 if f_total_batches else 0

        # Active engine
        active_eng = f_starts[-1].get("engine", "?") if f_starts else "?"
        active_dom = f_starts[-1].get("domain", "") if f_starts else ""
        active_done = active_eng in [c.get("engine") for c in f_completes]
        is_finished = len(f_done_evts) > 0

        # Progress bar
        f_pct = f_done / f_total_eng * 100 if isinstance(f_total_eng, int) and f_total_eng > 0 else 0

        # Status indicator
        if is_finished:
            status_str = f"{BGRN}COMPLETE{RST}"
        elif f_errors and len(f_errors) > 3:
            status_str = f"{BRED}ERRORS{RST}"
        elif not active_done and f_starts:
            status_str = f"{GRN}BUILDING{RST}"
        else:
            status_str = f"{YEL}IDLE{RST}"

        print(f"\n  {fc}{BOLD}┌─ {fl} ─── {status_str} {fc}{'─' * max(1, W - 10 - len(fl) - 20)}┐{RST}")

        # Progress bar
        eng_str = f"{f_done}" if not isinstance(f_total_eng, int) else f"{f_done}/{f_total_eng}"
        print(f"  {fc}│{RST}  [{bar_graph(f_done, f_total_eng if isinstance(f_total_eng, int) else f_done, 45, color=fc)}] {BOLD}{f_pct:.1f}%{RST} ({eng_str})")

        # Key stats
        print(f"  {fc}│{RST}  {BOLD}Doctrines:{RST} {GRN}{f_docs:,}{RST}  │  {BOLD}D1:{RST} {CYN}{f_d1_total:,}{RST}  │  "
              f"{BOLD}LLM:{RST} {GRN}{len(f_llm_ok)}{RST}/{len(f_llm)} calls  │  {BOLD}Chars:{RST} {human_chars(f_chars)}")

        # Timing stats
        if f_rates:
            print(f"  {fc}│{RST}  {BOLD}Time/eng:{RST} avg {YEL}{human_time(f_avg)}{RST}  med {human_time(f_med)}  "
                  f"min {human_time(f_min_t)}  max {human_time(f_max_t)}  │  "
                  f"{BOLD}ETA:{RST} {YEL}{human_time(f_eta_s)}{RST}")

        # Quality
        if f_total_batches > 0:
            grade_str = f"{BGRN}A++:{f_app}{RST}"
            if f_ap: grade_str += f"  {GRN}A+:{f_ap}{RST}"
            if f_b: grade_str += f"  {YEL}B:{f_b}{RST}"
            if f_f: grade_str += f"  {RED}F:{f_f}{RST}"
            score_str = f"avg {GRN}{f_avg_score:.1f}{RST}/15" if f_avg_score else ""
            qa_str = f"QA {f_avg_qa:.1f}/10" if f_avg_qa else ""
            print(f"  {fc}│{RST}  {BOLD}Grades:{RST} {grade_str}  ({BGRN}{f_app_pct:.0f}% A++{RST})  │  {score_str}  │  {qa_str}")

        # Active engine
        if not is_finished:
            if not active_done and f_starts:
                # Count LLM calls for active engine
                active_llm = [l for l in f_llm if l.get("engine") == active_eng]
                active_ok = sum(1 for l in active_llm if l.get("status") == "ok")
                active_fail = sum(1 for l in active_llm if l.get("status") != "ok")
                active_batches = [b for b in f_batches if b.get("engine") == active_eng]
                print(f"  {fc}│{RST}  {BOLD}▶ ACTIVE:{RST} {BCYN}{active_eng}{RST} ({active_dom})  │  "
                      f"Batches: {len(active_batches)}/2  │  LLM: {GRN}{active_ok}{RST} ok / {RED if active_fail else DIM}{active_fail}{RST} fail")

        # Last 3 completions (compact)
        if f_completes and not compact:
            last3 = f_completes[-3:]
            for c in last3:
                gc = grade_color(c.get("grade", "?"))
                print(f"  {fc}│{RST}    {DIM}✓ {c.get('engine', '?'):<12} {c.get('doctrines', 0):>3} docs  "
                      f"{gc}{c.get('grade', '?'):>4}{RST}  score {c.get('avg_score', 0):.1f}  "
                      f"{human_time(c.get('elapsed_s', 0))}{RST}")

        # Errors
        if f_errors:
            for e in f_errors[-2:]:
                print(f"  {fc}│{RST}    {RED}✗ {e.get('engine', '?')}: {e.get('error', '?')[:55]}{RST}")

        print(f"  {fc}{BOLD}└{'─' * (W-4)}┘{RST}")

    # ═══════════════════════════════════════════════════════════
    # COMBINED RATE & ETA
    # ═══════════════════════════════════════════════════════════
    if combined_epm > 0 and total_remaining > 0:
        eta_min = total_remaining / combined_epm
        print(f"\n  {BOLD}Combined Throughput:{RST}  {GRN}{combined_epm:.2f}{RST} engines/min = "
              f"{GRN}{combined_epm * 60:.1f}{RST} engines/hr")
        print(f"  {BOLD}Remaining:{RST}           {YEL}{total_remaining:,}{RST} engines  │  "
              f"{BOLD}ETA:{RST} {BYEL}{human_time(eta_min * 60)}{RST}")

    # ═══════════════════════════════════════════════════════════
    # DONE BANNERS
    # ═══════════════════════════════════════════════════════════
    for d in done_evts:
        fid = d.get("_forge", "?")
        fc = FORK_META.get(fid, {}).get("color", WHT)
        print(f"\n  {BGGRN}{BOLD} ★ FORGE {fid} COMPLETE: {d.get('grand_total', 0):,} doctrines "
              f"across {d.get('engines_completed', 0)} engines in {human_time(d.get('elapsed_min', 0) * 60)} {RST}")

    # ═══════════════════════════════════════════════════════════
    # GRADE DISTRIBUTION (combined)
    # ═══════════════════════════════════════════════════════════
    grade_counts = defaultdict(int)
    for b in batches:
        grade_counts[b.get("grade", "?")] += 1
    if grade_counts:
        total_b = sum(grade_counts.values())
        print(f"\n  {BOLD}{'━' * (W-4)}{RST}")
        print(f"  {BOLD}  GRADE DISTRIBUTION ({total_b:,} batches){RST}")
        print(f"  {BOLD}{'━' * (W-4)}{RST}")
        for g in ["A++", "A+", "A", "B", "F"]:
            cnt = grade_counts.get(g, 0)
            if cnt > 0:
                pct = cnt / total_b * 100
                gc = grade_color(g)
                bar = bar_graph(cnt, total_b, 40, color=gc.replace(BOLD, ""))
                print(f"    {gc}{g:>4}{RST}: {cnt:>5}  ({pct:5.1f}%)  {bar}")

    # ═══════════════════════════════════════════════════════════
    # QA SCORES
    # ═══════════════════════════════════════════════════════════
    qa_scores = [c.get("qa_score", 0) for c in completes if c.get("qa_score")]
    if qa_scores:
        avg_qa = statistics.mean(qa_scores)
        qa_color = GRN if avg_qa >= 7 else YEL if avg_qa >= 5 else RED
        qa_spark = spark_line(qa_scores[-40:])
        print(f"\n  {BOLD}Swarm QA:{RST} {qa_color}avg {avg_qa:.1f}/10{RST}  │  "
              f"min {min(qa_scores)}  max {max(qa_scores)}  │  {DIM}{qa_spark}{RST}")

    # ═══════════════════════════════════════════════════════════
    # DOCTRINE QUALITY SCORES
    # ═══════════════════════════════════════════════════════════
    all_avg_scores = [c.get("avg_score", 0) for c in completes if c.get("avg_score", 0) > 0]
    if all_avg_scores:
        score_spark = spark_line(all_avg_scores[-40:])
        print(f"  {BOLD}Quality:{RST}  {GRN}avg {statistics.mean(all_avg_scores):.1f}{RST}/15  │  "
              f"min {min(all_avg_scores):.1f}  max {max(all_avg_scores):.1f}  │  {DIM}{score_spark}{RST}")

    # ═══════════════════════════════════════════════════════════
    # LLM PROVIDER LEADERBOARD
    # ═══════════════════════════════════════════════════════════
    prov_stats = defaultdict(lambda: {
        "ok": 0, "fail": 0, "total_s": 0.0, "chars": 0, "calls": 0,
        "disabled": False, "docs": 0, "ok_times": [],
    })
    for lc in llm_calls:
        name = lc.get("provider", "?")
        prov_stats[name]["calls"] += 1
        prov_stats[name]["total_s"] += lc.get("elapsed_s", 0)
        if lc.get("status") == "ok":
            prov_stats[name]["ok"] += 1
            prov_stats[name]["chars"] += lc.get("chars", 0)
            prov_stats[name]["ok_times"].append(lc.get("elapsed_s", 0))
        elif lc.get("status") == "disabled":
            prov_stats[name]["disabled"] = True
        else:
            prov_stats[name]["fail"] += 1

    if prov_stats:
        sorted_provs = sorted(prov_stats.items(), key=lambda x: x[1]["ok"], reverse=True)
        active_provs = [(n, s) for n, s in sorted_provs if s["ok"] > 0 or s["calls"] > 0]
        dead_provs = [(n, s) for n, s in sorted_provs if s["disabled"]]

        print(f"\n  {BOLD}{'━' * (W-4)}{RST}")
        print(f"  {BOLD}  LLM PROVIDER LEADERBOARD ({len(active_provs)} providers, {len(dead_provs)} disabled){RST}")
        print(f"  {BOLD}{'━' * (W-4)}{RST}")
        print(f"    {'Provider':<24} {'Calls':>5} {'OK':>5} {'Fail':>5} {'Rate':>5} {'Avg':>6} {'Med':>6} {'Chars':>8} {'St':>4}")
        print(f"    {'─'*24} {'─'*5} {'─'*5} {'─'*5} {'─'*5} {'─'*6} {'─'*6} {'─'*8} {'─'*4}")

        for name, s in active_provs[:30]:
            rate = s["ok"] / s["calls"] * 100 if s["calls"] else 0
            avg_s = s["total_s"] / s["calls"] if s["calls"] else 0
            med_s = statistics.median(s["ok_times"]) if s["ok_times"] else 0
            rc = GRN if rate >= 80 else YEL if rate >= 50 else RED

            if s["disabled"]:
                status = f"{RED}⊘{RST}"
            elif rate >= 80:
                status = f"{GRN}●{RST}"
            elif rate >= 50:
                status = f"{YEL}◐{RST}"
            elif s["ok"] > 0:
                status = f"{RED}◔{RST}"
            else:
                status = f"{RED}○{RST}"

            fail_color = RED if s["fail"] > 0 else DIM
            print(f"    {name:<24} {s['calls']:>5} {GRN}{s['ok']:>5}{RST} "
                  f"{fail_color}{s['fail']:>5}{RST} "
                  f"{rc}{rate:>4.0f}%{RST} {avg_s:>5.1f}s {med_s:>5.1f}s "
                  f"{human_chars(s['chars']):>8} {status}")

    if not compact:
        # ═══════════════════════════════════════════════════════════
        # RECENT LLM CALLS (last 15 successful)
        # ═══════════════════════════════════════════════════════════
        recent_ok = [l for l in llm_calls if l.get("status") == "ok"][-15:]
        if recent_ok:
            print(f"\n  {BOLD}{'━' * (W-4)}{RST}")
            print(f"  {BOLD}  RECENT LLM CALLS{RST}")
            print(f"  {BOLD}{'━' * (W-4)}{RST}")
            for lc in recent_ok:
                fid = lc.get("_forge", "?")
                fc = FORK_META.get(fid, {}).get("color", WHT)
                ch = lc.get("chars", 0)
                ch_color = GRN if ch > 10000 else YEL if ch > 1000 else RED if ch < 100 else WHT
                print(f"    {GRN}✓{RST} {fc}{fid:>3}{RST}  {lc.get('provider', '?'):<22} "
                      f"{lc.get('engine', '?'):<12} {lc.get('elapsed_s', 0):>5.1f}s  "
                      f"{ch_color}{human_chars(ch):>6}{RST}")

        # ═══════════════════════════════════════════════════════════
        # RECENT COMPLETIONS (last 20)
        # ═══════════════════════════════════════════════════════════
        recent_comp = completes[-20:]
        if recent_comp:
            print(f"\n  {BOLD}{'━' * (W-4)}{RST}")
            print(f"  {BOLD}  RECENT COMPLETIONS{RST}")
            print(f"  {BOLD}{'━' * (W-4)}{RST}")
            print(f"    {'Fork':>4} {'Engine':<14} {'Docs':>5} {'QA':>4} {'Grade':>6} {'Score':>6} {'Time':>7}")
            print(f"    {'─'*4} {'─'*14} {'─'*5} {'─'*4} {'─'*6} {'─'*6} {'─'*7}")
            for c in recent_comp:
                fid = c.get("_forge", "?")
                fc = FORK_META.get(fid, {}).get("color", WHT)
                eid = c.get("engine", "")
                doc = c.get("doctrines", 0)
                qa = c.get("qa_score", "?")
                g = c.get("grade", "?")
                avg = c.get("avg_score", 0)
                el = c.get("elapsed_s", 0)
                gc = grade_color(g)
                qc = GRN if isinstance(qa, (int, float)) and qa >= 7 else YEL if isinstance(qa, (int, float)) and qa >= 5 else RED
                doc_color = GRN if doc >= 40 else YEL if doc >= 20 else RED
                print(f"    {fc}{fid:>4}{RST} {eid:<14} {doc_color}{doc:>5}{RST} {qc}{qa:>4}{RST} "
                      f"{gc}{g:>6}{RST} {avg:>5.1f} {human_time(el):>7}")

    # ═══════════════════════════════════════════════════════════
    # DOMAIN PROGRESS (top domains by completion)
    # ═══════════════════════════════════════════════════════════
    if completes and not compact:
        domain_stats = defaultdict(lambda: {"done": 0, "docs": 0, "engines": []})
        for c in completes:
            eid = c.get("engine", "")
            import re as _re
            prefix = _re.sub(r'\d+$', '', eid)
            domain_stats[prefix]["done"] += 1
            domain_stats[prefix]["docs"] += c.get("doctrines", 0)
            domain_stats[prefix]["engines"].append(eid)

        sorted_domains = sorted(domain_stats.items(), key=lambda x: x[1]["done"], reverse=True)
        if len(sorted_domains) > 3:
            print(f"\n  {BOLD}{'━' * (W-4)}{RST}")
            print(f"  {BOLD}  DOMAIN PROGRESS (top 15 of {len(sorted_domains)} domains){RST}")
            print(f"  {BOLD}{'━' * (W-4)}{RST}")
            print(f"    {'Domain':<10} {'Done':>5} {'Docs':>6}  {'Engines'}")
            print(f"    {'─'*10} {'─'*5} {'─'*6}  {'─'*40}")
            for prefix, ds in sorted_domains[:15]:
                eng_list = ", ".join(sorted(ds["engines"])[-5:])
                if len(ds["engines"]) > 5:
                    eng_list += f" (+{len(ds['engines'])-5})"
                print(f"    {CYN}{prefix:<10}{RST} {GRN}{ds['done']:>5}{RST} {ds['docs']:>6}  {DIM}{eng_list}{RST}")

    # ═══════════════════════════════════════════════════════════
    # ERRORS
    # ═══════════════════════════════════════════════════════════
    if errors:
        print(f"\n  {BOLD}{RED}{'━' * (W-4)}{RST}")
        print(f"  {BOLD}{RED}  FATAL ERRORS ({len(errors)}){RST}")
        print(f"  {BOLD}{RED}{'━' * (W-4)}{RST}")
        for e in errors[-8:]:
            fid = e.get("_forge", "?")
            fc = FORK_META.get(fid, {}).get("color", WHT)
            print(f"    {fc}{fid}{RST} │ {RED}{e.get('engine', '?')}: {e.get('error', '?')[:60]}{RST}")

    # ═══════════════════════════════════════════════════════════
    # FOOTER
    # ═══════════════════════════════════════════════════════════
    log_str = "  ".join(f"{fid}:{p.name}" for fid, p in LOG_FILES.items() if p.exists())
    print(f"\n  {DIM}{'─' * (W-4)}")
    print(f"  Logs: {log_str}")
    print(f"  Total: {len(all_events):,} events │ {ok_llm:,}/{len(llm_calls):,} LLM ok │ "
          f"{grand_total_docs:,} doctrines │ {engines_done:,} engines{RST}")


def main():
    p = argparse.ArgumentParser(description="Hephaestion v6.0 Ultimate Forge Monitor")
    p.add_argument("--refresh", type=int, default=5, help="Refresh interval in seconds")
    p.add_argument("--once", action="store_true", help="Print once and exit")
    p.add_argument("--compact", action="store_true", help="Compact mode (fewer sections)")
    args = p.parse_args()

    if args.once:
        all_ev, forge_ev = load_all()
        render(all_ev, forge_ev, compact=args.compact)
        return

    print(f"  Watching forge logs ... (refresh every {args.refresh}s)", flush=True)
    last_count = 0
    while True:
        try:
            all_ev, forge_ev = load_all()
            if len(all_ev) != last_count:
                render(all_ev, forge_ev, compact=args.compact)
                last_count = len(all_ev)
            time.sleep(args.refresh)
        except KeyboardInterrupt:
            print(f"\n  {DIM}Monitor stopped.{RST}")
            break
        except Exception as e:
            print(f"\n  {RED}Monitor error: {e}{RST}")
            time.sleep(args.refresh)


if __name__ == "__main__":
    main()
