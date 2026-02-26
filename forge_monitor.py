#!/usr/bin/env python3
"""
HEPHAESTION v5.2 DUAL FORGE MONITOR — Deep Dashboard
======================================================
Shows: Dual forge progress, LLM provider leaderboard, grades, D1 inserts, ETA.
Reads JSONL logs from both forge processes (A + B).

Usage: python -u temp_forge_monitor_v4.py
       python -u temp_forge_monitor_v4.py --refresh 3
"""
import json, sys, time, os, argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict

sys.stdout.reconfigure(line_buffering=True)

LOG_FILES = {
    "A": Path("C:/Users/bobmc/hephaestion_forge_A.jsonl"),
    "B": Path("C:/Users/bobmc/hephaestion_forge_B.jsonl"),
    "C": Path("C:/Users/bobmc/hephaestion_forge_C.jsonl"),
}
# Fallback to single log if dual not found
LEGACY_LOG = Path("C:/Users/bobmc/hephaestion_v4_log.jsonl")

RST = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[91m"
GRN = "\033[92m"
YEL = "\033[33m"
BLU = "\033[34m"
CYN = "\033[36m"
MAG = "\033[35m"
WHT = "\033[97m"
BGRN = "\033[92m\033[1m"


def grade_color(g):
    return {"A++": BGRN, "A+": GRN, "A": GRN, "B": YEL, "F": RED}.get(g, WHT)


def load_events_from(path):
    if not path.exists():
        return []
    events = []
    for line in path.read_text(encoding="utf-8", errors="replace").strip().splitlines():
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return events


def load_all_events():
    """Load events from both forge logs, tagged with forge ID."""
    all_events = []
    forge_events = {}
    for fid, path in LOG_FILES.items():
        evts = load_events_from(path)
        for e in evts:
            e["_forge"] = fid
        forge_events[fid] = evts
        all_events.extend(evts)
    # Fallback to legacy single log
    if not all_events:
        evts = load_events_from(LEGACY_LOG)
        for e in evts:
            e["_forge"] = "S"
        forge_events["S"] = evts
        all_events.extend(evts)
    return all_events, forge_events


def render(all_events, forge_events):
    os.system("cls" if os.name == "nt" else "clear")

    completes = [e for e in all_events if e.get("type") == "complete"]
    batches = [e for e in all_events if e.get("type") == "batch"]
    llm_calls = [e for e in all_events if e.get("type") == "llm_call"]
    d1_inserts = [e for e in all_events if e.get("type") == "d1_insert"]
    d1_errors = [e for e in all_events if e.get("type") == "d1_error"]
    errors = [e for e in all_events if e.get("type") == "error"]
    purges = [e for e in all_events if e.get("type") == "purge"]
    routings = [e for e in all_events if e.get("type") == "routing"]
    done_evts = [e for e in all_events if e.get("type") == "done"]

    engines_done = len(completes)
    # 37 already done before dual forge + 2579 remaining from original queue
    total_remaining = 2579
    total_engines = total_remaining + 37  # pre-completed
    grand_total = sum(c.get("doctrines", 0) for c in completes)

    # ─── HEADER ───
    num_forges = sum(1 for fid, evts in forge_events.items() if evts)
    print(f"{BOLD}{CYN}╔══════════════════════════════════════════════════════════════════╗")
    print(f"║  HEPHAESTION v5.2 — DUAL FORGE MONITOR                         ║")
    print(f"║  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  |  {num_forges} Forge{'s' if num_forges > 1 else ''} Active                       ║")
    print(f"╚══════════════════════════════════════════════════════════════════╝{RST}\n")

    # ─── OVERALL PROGRESS BAR ───
    pct = (37 + engines_done) / total_engines * 100 if total_engines > 0 else 0
    bar_len = 50
    filled = int(bar_len * pct / 100)
    bar = f"{'█' * filled}{'░' * (bar_len - filled)}"
    print(f"  {BOLD}Progress:{RST} [{CYN}{bar}{RST}] {BOLD}{pct:.1f}%{RST}")
    print(f"  {BOLD}Engines:{RST}   {GRN}{37 + engines_done}{RST}/{total_engines}  |  "
          f"{BOLD}Doctrines:{RST} {GRN}{grand_total:,}{RST}  |  "
          f"{BOLD}Purged:{RST} {sum(p.get('purged', 0) for p in purges)}  |  "
          f"{BOLD}Routing:{RST} {sum(r.get('inserted', 0) for r in routings)}")

    total_d1_err = len(d1_errors)
    total_fatal = len(errors)
    print(f"  {BOLD}D1 Errors:{RST} {RED if total_d1_err else DIM}{total_d1_err}{RST}  |  "
          f"{BOLD}Fatal:{RST} {RED if total_fatal else DIM}{total_fatal}{RST}")

    # ─── PER-FORGE STATUS ───
    print(f"\n  {BOLD}{'─'*20} FORGE STATUS {'─'*27}{RST}")
    for fid in sorted(forge_events.keys()):
        evts = forge_events[fid]
        if not evts:
            continue
        f_completes = [e for e in evts if e.get("type") == "complete"]
        f_starts = [e for e in evts if e.get("type") == "start"]
        f_queue = [e for e in evts if e.get("type") == "queue"]
        f_total_eng = f_queue[0].get("total_engines", "?") if f_queue else "?"
        f_done = len(f_completes)
        f_docs = sum(c.get("doctrines", 0) for c in f_completes)
        f_rates = [c.get("elapsed_s", 0) for c in f_completes]
        f_avg = sum(f_rates) / len(f_rates) if f_rates else 0
        f_remaining = (f_total_eng - f_done) if isinstance(f_total_eng, int) else "?"
        f_eta_min = (f_remaining * f_avg / 60) if isinstance(f_remaining, int) and f_avg > 0 else "?"
        f_eta_str = f"{f_eta_min:.0f}m ({f_eta_min/60:.1f}h)" if isinstance(f_eta_min, (int, float)) else "?"

        # Active engine
        active_eng = f_starts[-1].get("engine", "?") if f_starts else "?"
        active_dom = f_starts[-1].get("domain", "") if f_starts else ""
        active_done = active_eng in [c.get("engine") for c in f_completes]

        label = f"Forge {fid}"
        color = CYN if fid == "A" else MAG if fid == "B" else GRN
        print(f"    {color}{BOLD}{label}{RST}: {GRN}{f_done}{RST}/{f_total_eng} engines | "
              f"{f_docs:,} doctrines | avg {f_avg:.0f}s/eng | ETA: {f_eta_str}")
        if not active_done and f_starts:
            print(f"      {BOLD}▶{RST} {active_eng} ({active_dom})")

    # ─── COMBINED ETA ───
    if engines_done > 0:
        all_rates = [c.get("elapsed_s", 0) for c in completes]
        # Combined: both forges running in parallel, each doing engines_per_min
        forge_rates = {}
        for fid, evts in forge_events.items():
            fc = [e for e in evts if e.get("type") == "complete"]
            if fc:
                fr = [c.get("elapsed_s", 0) for c in fc]
                forge_rates[fid] = sum(fr) / len(fr) if fr else 999
        if forge_rates:
            combined_epm = sum(60 / r for r in forge_rates.values())  # engines per minute
            remaining = total_remaining - engines_done
            eta_min = remaining / combined_epm if combined_epm > 0 else 99999
            print(f"\n  {BOLD}Combined Rate:{RST} {GRN}{combined_epm:.2f}{RST} engines/min = "
                  f"{GRN}{combined_epm * 60:.1f}{RST} engines/hr  |  "
                  f"{BOLD}ETA:{RST} {YEL}{eta_min:.0f}m ({eta_min/60:.1f}h = {eta_min/1440:.1f}d){RST}")

    # ─── DONE BANNER ───
    if done_evts:
        for d in done_evts:
            fid = d.get("_forge", "?")
            print(f"\n  {BGRN}*** FORGE {fid} COMPLETE: {d.get('grand_total', 0):,} doctrines "
                  f"across {d.get('engines_completed', 0)} engines in {d.get('elapsed_min', 0):.1f}m ***{RST}")

    # ─── GRADE DISTRIBUTION ───
    grade_counts = defaultdict(int)
    for b in batches:
        grade_counts[b.get("grade", "?")] += 1
    if grade_counts:
        print(f"\n  {BOLD}{'─'*20} GRADE DISTRIBUTION {'─'*21}{RST}")
        total_batches = sum(grade_counts.values())
        for g in ["A++", "A+", "A", "B", "F"]:
            cnt = grade_counts.get(g, 0)
            if cnt > 0:
                pct = cnt / total_batches * 100
                bar = "█" * max(1, int(pct / 2))
                gc = grade_color(g)
                print(f"    {gc}{g:>4}{RST}: {cnt:>5} batches ({pct:4.1f}%) {gc}{bar}{RST}")

    # ─── QA SCORES ───
    qa_scores = [c.get("qa_score", 0) for c in completes if c.get("qa_score")]
    if qa_scores:
        avg_qa = sum(qa_scores) / len(qa_scores)
        qa_color = GRN if avg_qa >= 7 else YEL if avg_qa >= 5 else RED
        print(f"\n  {BOLD}Swarm QA:{RST} {qa_color}avg {avg_qa:.1f}/10{RST} | min {min(qa_scores)} | max {max(qa_scores)}")

    # ─── LLM PROVIDER LEADERBOARD ───
    print(f"\n  {BOLD}{'─'*20} LLM PROVIDER LEADERBOARD {'─'*17}{RST}")
    prov_stats = defaultdict(lambda: {"ok": 0, "fail": 0, "total_s": 0.0, "chars": 0, "calls": 0, "disabled": False})
    for lc in llm_calls:
        name = lc.get("provider", "?")
        prov_stats[name]["calls"] += 1
        prov_stats[name]["total_s"] += lc.get("elapsed_s", 0)
        if lc.get("status") == "ok":
            prov_stats[name]["ok"] += 1
            prov_stats[name]["chars"] += lc.get("chars", 0)
        elif lc.get("status") == "disabled":
            prov_stats[name]["disabled"] = True
        else:
            prov_stats[name]["fail"] += 1

    if prov_stats:
        sorted_provs = sorted(prov_stats.items(), key=lambda x: x[1]["ok"], reverse=True)
        print(f"    {'Provider':<22} {'Calls':>5} {'OK':>5} {'Fail':>5} {'Rate':>5} {'Avg(s)':>7} {'Chars':>10} {'Status':>8}")
        print(f"    {'─'*22} {'─'*5} {'─'*5} {'─'*5} {'─'*5} {'─'*7} {'─'*10} {'─'*8}")
        for name, s in sorted_provs[:25]:
            rate = s["ok"] / s["calls"] * 100 if s["calls"] else 0
            avg_s = s["total_s"] / s["calls"] if s["calls"] else 0
            rc = GRN if rate >= 80 else YEL if rate >= 50 else RED
            status = f"{RED}DEAD{RST}" if s["disabled"] else f"{GRN}OK{RST}" if rate >= 50 else f"{YEL}SLOW{RST}"
            print(f"    {name:<22} {s['calls']:>5} {GRN}{s['ok']:>5}{RST} "
                  f"{RED if s['fail'] else DIM}{s['fail']:>5}{RST} "
                  f"{rc}{rate:>4.0f}%{RST} {avg_s:>6.1f}s {s['chars']:>10,} {status}")

    # ─── RECENT COMPLETIONS ───
    recent = completes[-20:]
    if recent:
        print(f"\n  {BOLD}{'─'*20} RECENT COMPLETIONS {'─'*21}{RST}")
        print(f"    {'Forge':>5} {'Engine':<14} {'Docs':>5} {'QA':>4} {'Grade':>6} {'Avg':>5} {'Time':>6}")
        print(f"    {'─'*5} {'─'*14} {'─'*5} {'─'*4} {'─'*6} {'─'*5} {'─'*6}")
        for c in recent:
            fid = c.get("_forge", "?")
            eid = c.get("engine", "")
            doc = c.get("doctrines", 0)
            qa = c.get("qa_score", "?")
            g = c.get("grade", "?")
            avg = c.get("avg_score", 0)
            el = c.get("elapsed_s", 0)
            gc = grade_color(g)
            fc = CYN if fid == "A" else MAG if fid == "B" else GRN
            qc = GRN if isinstance(qa, int) and qa >= 7 else YEL if isinstance(qa, int) and qa >= 5 else RED
            print(f"    {fc}{fid:>5}{RST} {eid:<14} {doc:>5} {qc}{qa:>4}{RST} {gc}{g:>6}{RST} {avg:>5.1f} {el:>5.0f}s")

    # ─── ERRORS ───
    if errors:
        print(f"\n  {BOLD}{RED}{'─'*20} FATAL ERRORS {'─'*27}{RST}")
        for e in errors[-5:]:
            print(f"    {RED}{e.get('_forge', '?')}|{e.get('engine', '?')}: {e.get('error', '?')[:65]}{RST}")

    # ─── FOOTER ───
    total_events = len(all_events)
    total_llm = len(llm_calls)
    ok_llm = len([l for l in llm_calls if l.get("status") == "ok"])
    print(f"\n  {DIM}Logs: {', '.join(str(p) for p in LOG_FILES.values())} | "
          f"Events: {total_events} | LLM: {ok_llm}/{total_llm} ok{RST}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--refresh", type=int, default=5)
    p.add_argument("--once", action="store_true")
    args = p.parse_args()

    if args.once:
        all_ev, forge_ev = load_all_events()
        render(all_ev, forge_ev)
        return

    print(f"  Watching forge logs ... (refresh every {args.refresh}s)", flush=True)
    last_count = 0
    while True:
        all_ev, forge_ev = load_all_events()
        if len(all_ev) != last_count:
            render(all_ev, forge_ev)
            last_count = len(all_ev)
        time.sleep(args.refresh)


if __name__ == "__main__":
    main()
