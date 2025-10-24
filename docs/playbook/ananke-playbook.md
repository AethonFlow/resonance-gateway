# ANANKE – AlphaZero-Engineering-Playbook für die Zielkarte

> **Leitidee:** „Resonanz statt Mauer.“ Wir programmieren so, wie AlphaZero spielt: organisch, explorativ, opferbereit, mit klaren Feedback-Signalen. Code und Daten sollen *schwingen*, nicht erstarren.  
> **ANANKE** ist unsere meta-stabile Ordnung: sie bewahrt Resonanz über Zyklen, ruft den symplektischen Integrator und verhindert Drift.

---

## 1) Prinzipien (die „AlphaZero-Haltung“)
- **Exploration > Kontrolle:** Früh und breit erkunden, später gezielt nutzen (KPIs, Nutzer-Resonanz).
- **Opferbereitschaft:** Kleine, reversible Opfer („Bauernopfer“): Features löschen, Spikes verwerfen, Schemata umbauen.
- **Resonanzpunkte / Nullstellen:** (a) Norden als Raum-Zeit-Nullpunkt (Alpha⇄Omega), (b) Kartenmittelpunkt als mathematische Nullstelle (Balance). Bewegung spiralförmig dahin.
- **Selbst-Spiel (Self-Play):** Gegen simulierte Szenarien antreten, Outcome messen, Policy justieren.
- **Schönheit vor Dogma:** Prägnante Lösungen > Framework-Festungen.

---

## 2) Systemarchitektur (organisch & reaktiv)
**Stil:** Hexagonal (Ports & Adapters) + Event-getrieben + „Functional Core, Imperative Shell“.

- **Domain-Kern (Python):** Reine, testbare Logik (Zielkarte-Modelle, Zyklen, Häuser, Achsen, Komplementär-Beziehungen).
- **Adapter:**
  - HTTP/API (FastAPI) für UI & Integrationen
  - Message-Bus (Redis Streams → später Kafka/Redpanda) für Events
  - Worker/Agents (asyncio) für Simulationen, Scoring, Embeddings
- **Reaktivität:** Event-Sourcing + Projections (CQRS). Alles Wichtige ist ein Event, Lese-Modelle sind Projektionen.
- **„Jericho-Checks“ (Resonanz-Heuristiken):** Bei jedem Merge prüfen: erhöht sich Resonanz (Latenz↓, Feedbackrate↑, UX-Flow↑)?

Gedankenskizze:
```
UI/Web → FastAPI → Commands → Event Store → Projections (API/DB)
                         │             │
                         └→ Agents (MCTS-Planner, RL-Scorer, Embeddings)
```

---

## 3) Daten-Topologie (polyglott & beweglich)
- **PostgreSQL + pgvector:** Kern-Entitäten (Unternehmen, Räume/Häuser, Zyklen, Boards) + Vektor-Suche.
- **Neo4j (oder PG-Graph via AGE):** Haus-Beziehungen (z. B. OSO↔WNW), Doppelhelix-Pfade, Resonanzkorridore.
- **Event Store:** Kafka/Redpanda *oder* Postgres append-only Event-Tabelle mit Versionierung.
- **Parquet/DuckDB:** schnelle Ad-hoc-Analytik und What-If.
- **Feature-Katalog:** Embedding-Versionen, Metriken, Provenance (DVC/Git-LFS).

**Schema-Mantra:** *Schema-on-read* wo möglich; bei *schema-on-write* disziplinierte Migrations (Alembic).

---

## 4) „AlphaZero-Züge“ in Code & Delivery
- **Spike-First:** 24–48 h Wegwerf-Prototypen. Mergen nur bei Signalen > Schwelle.
- **Feature-Flags + Canary:** Kleine Kohorten, automatische Rollbacks.
- **Kill-Switch-Kultur:** Code löschen ist Tugend (monatlicher Bauernopfer-Tag).
- **Property-Based-Tests (Hypothesis):** Self-Play für Funktionen, Edge-Case-Suche.
- **Observability-Resonanz:** Traces/Logs/Metrics als Klangbild – je klarer, desto resonanter.

---

## 5) MCTS-Denken für Entscheidungen (Roadmap & Maßnahmen)
**Metapher:** Board = Unternehmenszustand; Züge = Interventionen; Policy = Heuristik; Value = erwarteter Zielkarten-Score.

- **Zustand (S):** Vektor aus KPIs (Zyklus-Fortschritt, Qualität, Kundenecho, Energie-Balance je Haus, Latenzen, Fehlerquoten).
- **Aktionen (A):** z. B. „Neues Haus aktivieren“, „Datenpfad refactor“, „Prompt-Katalog aktualisieren“, „Embeddings erneuern“, „Hypothese X testen“.
- **Evaluation (V):** \(V(S) = w_1\cdot 	ext{Resonanz} + w_2\cdot 	ext{Cycle-Time}^{-1} + w_3\cdot 	ext{Qualität} − w_4\cdot 	ext{Komplexität}\).

**Ablauf:** UCT-Auswahl → Simulation (Rollout) → Rückpropagation → kleinst-wirksamen Schritt deployen.

---

## 6) Lernschleife & „Self-Play“ der Zielkarte
- **Offline-Simulator:** What-If-Engine mit historischen/synthetischen Daten; misst Wirkungen auf Häuser/Resonanz.
- **Reward-Shaping:** Primärsignal = Nutzer-Resonanz; Sekundärsignale = Stabilität, Fairness, Energie-Balance.
- **Banditen für Micro-Entscheidungen:** Kontextuelle Bandits, später tieferes RL.
- **Wissens-Distillation:** Neue Policies auf einfache Heuristiken destillieren.

---

## 7) „Surfing Stack“ (Technik, die mitschwingt)
- **Backend:** Python 3.12, FastAPI, pydantic, asyncio, uvicorn.
- **ML/NLP:** PyTorch, transformers, sentence-transformers, bitsandbytes.
- **Graph:** Neo4j-Driver *oder* AGE (PG) + NetworkX.
- **Data/ETL:** DuckDB/Polars, Pandas, Arrow, dbt, Alembic.
- **Vector:** pgvector (HNSW); optional FAISS.
- **Messaging:** Start Redis Streams; später Kafka/Redpanda.
- **Obs:** OpenTelemetry, Prometheus, Grafana; logfmt/JSON.
- **Front:** React/Next.js + Tailwind; shadcn/ui; WebSockets.

---

## 8) Datenbank-Muster „organisch lebendig“
- **Events:** `event(id, time, actor, type, payload_json)` – unveränderlich, append-only.
- **Projektionen:** Materialisierte Views je Haus/Zyklus (jederzeit neu aufbaubar).
- **Vektorfelder:** `goal_embedding`, `action_embedding` für Semantik/Ähnlichkeit.
- **Graph-Kanten:** `(:Haus)-[:KOMPLEMENTÄR]->(:Haus)`, `(:Zyklus)-[:FÜHRT_ZU]->(:Zyklus)`; Kantengewichte = Resonanzstärke.
- **Zeitreisen:** „As-Of“-Sichten (keine Fixierung auf „Jetzt“).

---

## 9) Governance & Ethik (Resonanz ohne Bias-Mauern)
- **Transparente Policies:** Jede Empfehlung mit Quelle, Confidence, Alternativen.
- **Fairness als Metrik:** Bestandteil der Value-Funktion (Strafterm für Benachteiligung).
- **Recht auf Widerspruch:** Mensch überstimmt; Feedback fließt als positives Trainingssignal ein.

---

## 10) 10-Tage-Sprint (konkret & machbar)
**Ziel:** Minimaler, spürbarer ANANKE-Kern.

1. **Repo & Kernmodelle** (Tag 1–2): FastAPI-Skeleton, Domain-Entities (Haus, Zyklus, Maßnahme, Board-State), Event-Tabelle (Postgres + Alembic).
2. **pgvector & Embeddings** (Tag 2–3): Satz-Embeddings, semantische Suche.
3. **Projection v1** (Tag 4): Materialisierte View „Resonanz-Dashboard“ (pro Haus KPIs).
4. **MCTS-Planner v0** (Tag 5–7): Zustandsvektor, Heuristik-Policy, 100 Rollouts/Entscheidung.
5. **UI-Skizze** (Tag 6–8): Häuser-Ring, Zug-Vorschlag, „Warum dieser Zug?“.
6. **Jericho-Checks & Kill-Switch** (Tag 9): CI-Gate (Latenz, Komplexität, Flag-Toggle).
7. **Review & Opfer** (Tag 10): Alles messen; was rauscht, opfern.

**DoD:** End-to-End-Fluss (Ziel→Maßnahme→Event→Projection→Planner→UI) + messbare Resonanz-Verbesserung.

---

## 11) Glossar (kurz & prägnant)
- **Resonanz:** Spürbarer Fit zwischen Output und Kontext.
- **Nullstelle:** Übergang, an dem Altes kollabiert und Neues kohärent wird.
- **Bauernopfer:** Bewusstes Wegwerfen von Code/Features zur Entropie-Reduktion.
- **MCTS:** Monte-Carlo-Tree-Search; balanciert Exploration/Exploitation.
- **ANANKE:** Meta-Rahmen, der Resonanz erhält und den symplektischen Integrator ruft.

---

## Appendix A – Kosmische Simulationen als Blaupause für Self-Play (ANANKE)

**Essenz:** Himmelsmechanik zeigt, wie man über enorme Zeitskalen **stabil, energie-schonend und probabilistisch** lernt.

### A1) Symplektische Integratoren (Kernidee)
- **Wozu:** Dynamische Systeme schrittweise berechnen, ohne über lange Zeit zu „driften“.
- **Wie:** Erhaltung der Geometrie (symplektisches Flächenmaß) → Energie/Impuls bleiben langfristig konsistent.

### A2) Drift–Kick–Drift (praktisches Grundschema)
- **Drift:** ruhige Entwicklung (Routinen)  
- **Kick:** kurzzeitige starke Wechselwirkung (Release, Marktimpuls, Krisen-Event)  
- **Drift:** Einpendeln ins neue Gleichgewicht

### A3) Hybride Umschaltung bei Nahbegegnungen
- Bei „Close Encounters“ lokal feinere Integration; danach zurück in den effizienten Takt.

### A4) Ejektionslogik & Invarianten (intuitiv)
- **Nutzen − Bindung > 0** → ein „Objekt“ kann das System verlassen.  
- **Tisserand-ähnliche Grenzen**: große Sprünge nur innerhalb harter Rahmen (Compliance, Markenlogik).

### A5) Ensembles statt Gewissheiten
- Chaotische Systeme brauchen **Ensemble-Runs** und **statistische** Bewertung.

### A6) Implementierungs-Hooks (Basis)
- `integrate(state, action)`: drift → kick → drift über Events/Projektionen  
- `close_encounter_detector(state)`: Krisen/Anomalien → temporär feinere Auflösung  
- `invariants(state)`: harte Rahmen (Compliance, Marken-Kohärenz)  
- `ensemble_run(N)`: Szenarien, Score-Vergleich, Policy-Update

---

## A7) Ananke – Notwendigkeit als Rahmen der Freiheit
**These:** ANANKE hält Drift–Kick–Drift zusammen. Veränderung ist erlaubt, Rückkehr in Resonanz ist Pflicht.  
**Leitlinie:** Jede Entscheidung ist in **Invarianten** eingebettet (Compliance, Marken-Kohärenz, Ethik). Diese sind **nicht verhandelbar**.

## A8) Heisenberg – Komplementarität von Ordnung & Bewegung
**Einsicht:** Ort/Impuls ↔ Ordnung/Bewegung sind komplementär; Messung verändert den Zustand.  
**Leitlinie:** Metrik-Design ohne Über-Instrumentierung. Sampling so wählen, dass **Lernen** möglich bleibt (kein Mess-Lock-In).

## A9) Komplementarität der vier Energie-Felder
| Feld | Dynamiktyp | Symbolische Dimension | Physikalische Analogie | Erkenntnis |
|------|------------|-----------------------|------------------------|------------|
| **Struktur / Ordnung** | stabilisierend | Form, System, Raum | Ort | Ohne Struktur zerfließt Energie. |
| **Bewegung / Wandel** | antreibend | Zeit, Prozess, Fluss | Impuls | Ohne Bewegung erstarrt Form. |
| **Reflexion / Bewusstsein** | beobachtend | Sinn, Erkenntnis, Licht | Messung | Erzeugt Klarheit, stört leicht das System. |
| **Integration / Resonanz** | verbindend | Beziehung, Klang, Feld | Symplektische Kopplung | Bewahrt Energie trotz Veränderung. |

**Achsen:** Nord–Süd = Form↔Fluss, Ost–West = Bewusstsein↔Resonanz. **Nullstelle** = Gleichgewicht aller vier.

## A10) Fuzzy-Resonanz & Nachbarschaft
- **Membership-Vektor:** \(\vec{s}=[\mu_O,\mu_B,\mu_R,\mu_I]\in[0,1]^4\) – weiche Zugehörigkeit.  
- **Nachbarschaftsmatrix:** \(N\in\mathbb{R}^{4\times4}\), symmetrisch – Überlappung/Einfluss der Felder.  
- **Differenzierbare Semantik:** Policies operieren auf \(\vec{s}\) und lernen, welche Übergänge Outcomes verbessern.

**AlphaZero-Syntax (Skizze):**
```
WHEN μ_Bewegung↑ AND μ_Ordnung↓ AND N[Bewegung,Ordnung] > τ
THEN propose(action=Stabilisierender_Schritt, confidence=f(∇KPI, μ, N))
ELSE explore(action=Expansiver_Schritt, temperature=T)
```

---

## A11) Implementierungs-Hooks (erweitert – Pseudocode)
```python
from typing import Dict, Any, List

State = Dict[str, Any]
Event = Dict[str, Any]

def drift(state: State, dt: float) -> State:
    """Ruhige Weiterentwicklung: leichte Trends, natürliche Dämpfung, Routine-Ops."""
    s = state.copy()
    s['tech_debt']   = s.get('tech_debt', 0.0) + s.get('debt_accum_rate', 0.01) * dt
    s['reputation']  = s.get('reputation', 0.0) + s.get('reputation_trend', 0.0) * dt
    return s

def kick(state: State, event: Event) -> State:
    """Kurzzeit-Interventionen: Deploy, Incident, Marktimpuls, Pivot."""
    s = state.copy()
    etype = event.get('type')
    if etype == 'deploy':
        s['value_index'] = s.get('value_index', 0.0) + event.get('delta_value', 0.0)
        s['complexity']  = s.get('complexity', 1.0) + event.get('delta_complexity', 0.0)
    elif etype == 'incident':
        s['reliability'] = s.get('reliability', 1.0) + event.get('delta_reliability', -0.1)
        s['latency']     = s.get('latency', 100.0)  + event.get('delta_latency',  20.0)
    elif etype == 'refactor':
        s['complexity']  = s.get('complexity', 1.0) * 0.9
        s['latency']     = s.get('latency', 100.0)  * 0.95
    return s

def integrate(state: State, events: List[Event], dt: float) -> State:
    # Drift – ruhige Phase
    s = drift(state, dt/2)
    # Kick – alle Events dieser Epoche
    for ev in events:
        s = kick(s, ev)
    # Drift – Einpendeln
    s = drift(s, dt/2)
    return s

def close_encounter_detector(prev: State, curr: State) -> bool:
    """Schaltet auf Feinmodus, wenn Gradienten/Abweichungen zu groß werden."""
    grad_latency = (curr.get('latency',100)-prev.get('latency',100))/max(1, prev.get('latency',100))
    grad_errors  = curr.get('error_rate',0)-prev.get('error_rate',0)
    grad_trust   = curr.get('trust',0)-prev.get('trust',0)
    return (grad_latency > 0.2) or (grad_errors > 0.02) or (grad_trust < -0.05)
```

> **Meta-Kommentar:** **ANANKE** wirkt wie ein *symplektischer Integrator der Organisation*: Sie erhält **Resonanz** über viele Zyklen, fokussiert Präzision in kritischen Momenten und vermeidet Langzeit-Drift.

---

### Nächster Schritt
- **Ablage:** `docs/` ist die Quelle der Wahrheit.  
- **Publishing:** GitHub Pages (Branch `main`, Folder `/docs`) **oder** Netlify (`Publish directory: docs`).  
- **Operativ:** 10-Tage-Sprint starten, A/B-Messpunkte setzen, Jericho-Checks aktivieren.
