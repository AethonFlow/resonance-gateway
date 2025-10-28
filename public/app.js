// --- Utility: State laden ----------------------------------------------------
async function loadState() {
    const res = await fetch('/data/state.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load state.json (${res.status})`);
    return await res.json();
}

// --- Resonanz-Score (heuristisch) -------------------------------------------
function resonanceScore(a, b, core) {
    const wC = 0.5, wN = 0.2, wP = 0.3;
    const isComplement = a.complement === b.id;
    const isNeighbor = a.neighbors.includes(b.id) || b.neighbors.includes(a.id);
    const phaseDelta = Math.abs(a.phase - b.phase);
    const sync = (1 + Math.cos(phaseDelta)) / 2;
    let score = 0;
    if (isComplement) score += wC;
    if (isNeighbor) score += wN;
    score += wP * sync;
    score = Math.min(1, Math.max(0, score * (0.7 + 0.6 * core.coupling)));
    return { score, complement: isComplement, neighbor: isNeighbor };
}

// --- Mini-Agent v0 (Dialog-Sprint) ------------------------------------------
function agentLine(evt) {
    const { houseA, houseB, score, complement, neighbor } = evt;
    if (score >= 0.8) {
        return `✨ Harmonie: ${houseA}↔${houseB}${complement ? " (Komplement)" : ""} – Synthese an CORE!`;
    }
    if (score <= 0.3) {
        return `⚡ Spannung: ${houseA}↔${houseB}${neighbor ? " (Nachbarn)" : ""} – Impuls zum Komplement.`;
    }
    return `… Stabiler Fluss: ${houseA}↔${houseB}`;
}

// --- BeatEngine --------------------------------------------------------------
class BeatEngine {
    constructor(state, onEvent) {
        this.state = state;          // { houses[], core{}, run{} }
        this._timer = null;
        this.onEvent = onEvent || (() => { });
    }

    start() {
        if (this._timer) return;
        const intervalMs = Math.max(60000 / this.state.run.bpm, 50);
        let last = Date.now();
        this._timer = setInterval(() => {
            const now = Date.now();
            const dt = (now - last) / 1000;
            last = now;
            this.tick(dt, now);
        }, intervalMs);
        console.log(`🌀 BeatEngine started @ ${this.state.run.bpm} BPM`);
    }

    stop() {
        if (!this._timer) return;
        clearInterval(this._timer);
        this._timer = null;
        console.log('⏹ BeatEngine stopped');
    }

    tick(dt, nowMs) {
        const TWO_PI = Math.PI * 2;
        const houses = this.state.houses;
        const core = this.state.core;

        // 1) Update house phases + energy
        for (const h of houses) {
            h.phase = (h.phase + TWO_PI * h.freq * dt) % TWO_PI;
            h.energy = Math.min(1, Math.max(0, 0.5 + 0.5 * Math.cos(h.phase)));
        }

        // 2) Core pulse
        core.phase = (core.phase + TWO_PI * 0.5 * dt) % TWO_PI;
        core.energy = Math.min(1, Math.max(0, 0.5 + 0.5 * Math.cos(core.phase)));

        // 3) Pair selection (rotating neighbors vorerst)
        const idx = this.state.run.tick % houses.length;
        const a = houses[idx];
        const b = houses[(idx + 1) % houses.length];
        const r = resonanceScore(a, b, core);

        // 4) Log & buffer
        const evt = { t: nowMs, houseA: a.id, houseB: b.id, ...r };
        const evts = this.state.run.lastEvents;
        evts.push(evt);
        if (evts.length > 32) evts.shift();
        this.state.run.tick += 1;

        // 5) Emit
        this.onEvent(evt, this.state);
        console.log(`[Beat ${this.state.run.tick}] ${a.id}↔${b.id} score=${r.score.toFixed(2)}`);
    }
}

// --- OPTIONAL: Cycle-Export (Hotkey "S" + Button) ----------------------------
async function saveCycleFromState(state, take = 8) {
    const evts = state.run.lastEvents.slice(-take);
    if (evts.length === 0) {
        console.warn('No events to save yet.');
        return { ok: false, msg: 'No events' };
    }
    const summary = {
        beats: evts.length,
        firstPair: `${evts[0].houseA}↔${evts[0].houseB}`,
        lastPair: `${evts[evts.length - 1].houseA}↔${evts[evts.length - 1].houseB}`,
        avgScore: (evts.reduce((s, e) => s + e.score, 0) / evts.length).toFixed(3),
    };
    const body = {
        meta: { source: 'live-resonance', runId: state.run.id },
        events: evts,
        summary
    };
    // POST an separate Save-Function (siehe save-cycle.mjs)
    const r = await fetch('/.netlify/functions/save-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'save failed');
    return { ok: true, id: j.id, summary };
}

// --- UI Wiring ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const saveBtn = document.getElementById('saveBtn'); // optional
    const statusEl = document.getElementById('status');

    // Guard: Falls die Live-Sektion auf manchen Seiten nicht existiert
    if (!startBtn || !stopBtn || !statusEl) {
        console.warn('Live Resonance UI not found. Skipping controls.');
        return;
    }

    const setStatus = (msg) => { statusEl.textContent = msg; };

    // State laden
    let state = null;
    try {
        state = await loadState();
        setStatus('Status: ready. (state.json loaded)');
    } catch (e) {
        console.error(e);
        setStatus('⚠️ Konnte /data/state.json nicht laden. Prüfe Pfad/Server.');
        return;
    }

    // Engine + Agent-Callback
    const engine = new BeatEngine(state, (evt, st) => {
        const beat = st.run.tick;
        const pair = `${evt.houseA}↔${evt.houseB}`;
        const score = evt.score.toFixed(2);
        const coreE = st.core.energy.toFixed(2);
        const line = agentLine(evt);
        setStatus(`Beat ${beat} | ${pair} | score=${score} | coreE=${coreE}\n${line}`);
    });

    // globaler Zugriff für Tools/Hotkeys
    window.__res_engine__ = engine;

    // Buttons
    startBtn.addEventListener('click', () => {
        engine.start();
        setStatus('BeatEngine: running… (Konsole öffnen: F12)');
    });

    stopBtn.addEventListener('click', () => {
        engine.stop();
        setStatus('BeatEngine: stopped.');
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            try {
                const res = await saveCycleFromState(state, 8);
                if (res.ok) setStatus(`💾 Saved cycle ${res.id} (avg=${res.summary.avgScore})`);
            } catch (e) {
                console.error(e);
                setStatus('⚠️ Save failed. Siehe Konsole.');
            }
        });
    }

    // Hotkey: S = Save last 8 beats
    document.addEventListener('keydown', async (e) => {
        if (e.key.toLowerCase() === 's') {
            try {
                const res = await saveCycleFromState(state, 8);
                if (res.ok) setStatus(`💾 Saved cycle ${res.id} (avg=${res.summary.avgScore})`);
            } catch (err) {
                console.error(err);
                setStatus('⚠️ Save failed. Siehe Konsole.');
            }
        }
    });
});
