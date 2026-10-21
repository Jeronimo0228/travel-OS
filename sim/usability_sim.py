#!/usr/bin/env python3
"""Sprint 3 usability simulation (Grok Bot as PO + 5 personas) against production.

Read-only or create-then-delete only. Password via TRAVELOS_DEMO_PASSWORD env var.
SUS answers are derived mechanically from what happened (see sus_answers()).
Output: sim/usability_results.json
"""
import http.cookiejar, json, os, sys, time, urllib.request, urllib.error

BASE = os.environ.get("TRAVELOS_API", "https://api.travel-os.pdpcomunica.com/api")
WEB = os.environ.get("TRAVELOS_WEB", "https://travel-os.pdpcomunica.com")
PW = os.environ["TRAVELOS_DEMO_PASSWORD"]
SLOW_MS = 2000
TAG = f"[UXSIM {int(time.time())}]"


class Client:
    def __init__(self):
        self.jar = http.cookiejar.CookieJar()
        self.op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))

    def req(self, method, path, body=None, base=BASE):
        data = json.dumps(body).encode() if body is not None else None
        r = urllib.request.Request(base + path, data=data, method=method,
                                   headers={"content-type": "application/json"})
        t = time.time()
        try:
            with self.op.open(r, timeout=30) as resp:
                raw = resp.read(); code = resp.status
        except urllib.error.HTTPError as e:
            raw = e.read(); code = e.code
        ms = int((time.time() - t) * 1000)
        try:
            js = json.loads(raw) if raw else None
        except Exception:
            js = None
        return code, js, ms, raw


def items(js):
    if isinstance(js, list): return js
    if isinstance(js, dict):
        for k in ("items", "data", "results", "leads", "quotes"):
            if isinstance(js.get(k), list): return js[k]
    return []


RESULTS = []
CREATED = []  # (client, path) cleanup


def task(persona, tid, name, fn):
    t = time.time()
    try:
        ok, detail = fn()
    except Exception as e:  # noqa
        ok, detail = False, f"exception: {type(e).__name__}: {e}"
    ms = int((time.time() - t) * 1000)
    RESULTS.append(dict(persona=persona, id=tid, task=name, passed=bool(ok), ms=ms, detail=detail))
    print(f"{'PASS' if ok else 'FAIL'} {persona:9} {tid} {name} ({ms} ms) {detail}")


def login(c, email):
    code, js, ms, _ = c.req("POST", "/auth/login", {"email": email, "password": PW})
    return code in (200, 201), f"HTTP {code}"


def persona_staff(label, email, role_tasks):
    c = Client()
    task(label, f"{label}-1", "Iniciar sesion", lambda: login(c, email))
    def lst(path, what):
        def f():
            code, js, ms, _ = c.req("GET", path)
            return code == 200, f"HTTP {code}, {len(items(js))} {what}"
        return f
    task(label, f"{label}-2", "Ver pipeline de leads", lst("/leads", "leads"))
    task(label, f"{label}-3", "Ver cotizaciones", lst("/quotes", "cotizaciones"))
    task(label, f"{label}-4", "Ver reservas del portal", lst("/reservations", "reservas"))
    for tid, name, fn in role_tasks(c):
        task(label, f"{label}-{tid}", name, fn)
    def logout():
        code, *_ = c.req("POST", "/auth/logout")
        code2, *_ = c.req("GET", "/leads")
        return code in (200, 201, 204) and code2 == 401, f"logout HTTP {code}, then /leads HTTP {code2}"
    task(label, f"{label}-Z", "Cerrar sesion (y quedar fuera)", logout)


def lead_cycle(c):
    def f():
        code, js, ms, _ = c.req("POST", "/leads", {"name": f"{TAG} Prueba", "destination": "Cartagena",
                                                    "notes": "simulacion usabilidad, se borra"})
        if code not in (200, 201) or not js or "id" not in js:
            return False, f"create HTTP {code}"
        lid = js["id"]
        g, *_ = c.req("GET", f"/leads/{lid}")
        d, *_ = c.req("DELETE", f"/leads/{lid}")
        g2, *_ = c.req("GET", f"/leads/{lid}")
        if d not in (200, 204): CREATED.append((c, f"/leads/{lid}"))
        return g == 200 and d in (200, 204) and g2 in (403, 404), f"create {code}, read {g}, delete {d}, read-after {g2}"
    return f


def admin_tasks(c):
    def users():
        code, js, *_ = c.req("GET", "/users"); return code == 200, f"HTTP {code}, {len(items(js))} usuarios"
    def audit():
        code, js, *_ = c.req("GET", "/audit-logs"); return code == 200, f"HTTP {code}"
    def branding():
        code, js, *_ = c.req("GET", "/agency/branding"); return code == 200, f"HTTP {code}"
    return [("5", "Gestionar usuarios (listar)", users), ("6", "Revisar auditoria", audit),
            ("7", "Ver marca de la agencia", branding)]


def gerente_tasks(c):
    def metrics():
        code, js, *_ = c.req("GET", "/metrics/operations"); return code == 200, f"HTTP {code}"
    def prio():
        code, js, ms, _ = c.req("GET", "/ai/leads/prioritized")
        return code == 200, f"HTTP {code} en {ms} ms"
    def denied():
        code, *_ = c.req("GET", "/audit-logs"); return code in (200, 403), f"HTTP {code} (control de acceso por rol)"
    return [("5", "Ver tablero de operaciones", metrics), ("6", "Priorizar leads con IA", prio),
            ("7", "Consultar auditoria segun rol", denied)]


def asesor_tasks(c):
    def reminders():
        code, js, *_ = c.req("GET", "/tasks/reminders"); return code == 200, f"HTTP {code}"
    def users_denied():
        code, *_ = c.req("PATCH", "/users/x/role", {"role": "ADMIN"}); return code == 403, f"HTTP {code} (debe ser 403)"
    return [("5", "Crear, abrir y borrar un lead", lead_cycle(c)), ("6", "Ver recordatorios", reminders),
            ("7", "Intentar cambiar un rol (debe negarse)", users_denied)]


def traveler():
    c = Client()
    def web():
        code, _, ms, raw = c.req("GET", "/login", base=WEB); return code == 200, f"HTTP {code} en {ms} ms"
    def no_token():
        code, *_ = c.req("GET", "/portal/reservation"); return code in (401, 403), f"HTTP {code} sin enlace (debe negarse)"
    def bad_token():
        code, *_ = c.req("GET", "/portal/itinerary?token=invalido"); return code in (400, 401, 403, 404), f"HTTP {code} con enlace invalido"
    def health():
        code, js, ms, _ = c.req("GET", "/health"); return code == 200, f"HTTP {code} en {ms} ms"
    task("viajero", "viajero-1", "Abrir la web publica", web)
    task("viajero", "viajero-2", "Portal sin enlace se protege", no_token)
    task("viajero", "viajero-3", "Enlace invalido se rechaza", bad_token)
    task("viajero", "viajero-4", "Servicio disponible", health)


def sus_answers(rs):
    """Positive items (1,3,5,7,9) = 1 + round(4*pass_rate), minus 1 if any task > SLOW_MS.
    Negative items (2,4,6,8,10) = 6 - positive. Clamped to 1..5."""
    p = sum(r["passed"] for r in rs) / len(rs)
    pos = 1 + round(4 * p) - (1 if any(r["ms"] > SLOW_MS for r in rs) else 0)
    pos = max(1, min(5, pos)); neg = 6 - pos
    return [pos if i % 2 == 0 else neg for i in range(10)]


def sus(ans):
    return 2.5 * sum((a - 1) if i % 2 == 0 else (5 - a) for i, a in enumerate(ans))


def main():
    persona_staff("admin", "admin@demo.travelos.local", admin_tasks)
    persona_staff("gerente", "gerente@demo.travelos.local", gerente_tasks)
    persona_staff("asesor1", "valentina@demo.travelos.local", asesor_tasks)
    persona_staff("asesor2", "mateo@demo.travelos.local", asesor_tasks)
    traveler()
    # leftover check (as admin)
    c = Client(); login(c, "admin@demo.travelos.local")
    code, js, *_ = c.req("GET", "/leads?search=UXSIM")
    left = [l for l in items(js) if "UXSIM" in json.dumps(l)]
    code2, js2, *_ = c.req("GET", "/leads")
    left += [l for l in items(js2) if "UXSIM" in json.dumps(l) and l not in left]
    personas = {}
    for r in RESULTS: personas.setdefault(r["persona"], []).append(r)
    summary = {}
    for p, rs in personas.items():
        a = sus_answers(rs)
        summary[p] = dict(passed=sum(r["passed"] for r in rs), total=len(rs), sus_answers=a, sus=sus(a))
    out = dict(run_at=time.strftime("%Y-%m-%d %H:%M:%S %z"), base=BASE, tasks=RESULTS, personas=summary,
               total_passed=sum(r["passed"] for r in RESULTS), total=len(RESULTS),
               sus_avg=round(sum(s["sus"] for s in summary.values()) / len(summary), 1),
               leftovers=len(left), uncleaned=len(CREATED))
    json.dump(out, open(os.path.join(os.path.dirname(__file__), "usability_results.json"), "w"), indent=2, ensure_ascii=False)
    print(json.dumps({k: v for k, v in out.items() if k != "tasks"}, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
