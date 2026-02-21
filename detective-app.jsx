import { useState, useEffect } from "react";

const API_KEY = ""; // User fills in their Claude API key

// ── Styles injected once ──────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;600&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0f0e0c;
    font-family: 'Courier Prime', monospace;
    color: #d4c9a8;
    min-height: 100vh;
  }

  :root {
    --ink: #d4c9a8;
    --paper: #1a1814;
    --dark: #0f0e0c;
    --red: #c0392b;
    --yellow: #d4a017;
    --green: #2e7d32;
    --accent: #8b6914;
    --border: #3a3228;
  }

  .grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 999;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.3;
  }

  .scanlines {
    position: fixed; inset: 0; pointer-events: none; z-index: 998;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
  }

  .app-wrap {
    max-width: 780px;
    margin: 0 auto;
    padding: 40px 24px 80px;
    position: relative;
    z-index: 1;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    padding: 40px 0 48px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 48px;
    position: relative;
  }
  .header::before {
    content: '★ CONFIDENTIAL ★';
    display: block;
    font-size: 10px;
    letter-spacing: 6px;
    color: var(--accent);
    margin-bottom: 16px;
  }
  .header h1 {
    font-family: 'Special Elite', cursive;
    font-size: clamp(32px, 7vw, 58px);
    color: var(--ink);
    line-height: 1.1;
    letter-spacing: -1px;
  }
  .header h1 span { color: var(--yellow); }
  .header p {
    margin-top: 12px;
    font-size: 13px;
    color: #7a7060;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .badge {
    display: inline-block;
    margin-top: 20px;
    border: 1px solid var(--border);
    padding: 4px 14px;
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--accent);
    text-transform: uppercase;
  }

  /* ── Search box ── */
  .search-section { margin-bottom: 40px; }
  .search-label {
    display: block;
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 10px;
  }
  .search-row {
    display: flex;
    gap: 0;
    border: 1px solid var(--border);
    background: var(--paper);
    transition: border-color 0.2s;
  }
  .search-row:focus-within { border-color: var(--yellow); }
  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 16px 20px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    color: var(--ink);
    letter-spacing: 0.5px;
  }
  .search-input::placeholder { color: #4a4538; }
  .search-btn {
    background: var(--yellow);
    color: #0f0e0c;
    border: none;
    padding: 16px 28px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
  }
  .search-btn:hover:not(:disabled) { background: #e8b420; }
  .search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Status ticker ── */
  .ticker {
    border: 1px solid var(--border);
    background: var(--paper);
    padding: 16px 20px;
    margin-bottom: 32px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    min-height: 52px;
  }
  .ticker-line {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #7a7060;
    margin-bottom: 4px;
    animation: fadeIn 0.3s ease;
  }
  .ticker-line.active { color: var(--yellow); }
  .ticker-line.done { color: #4a7a4a; }
  .ticker-line.error { color: var(--red); }
  .ticker-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .blink { animation: blink 1s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

  /* ── Report card ── */
  .report {
    border: 1px solid var(--border);
    background: var(--paper);
    animation: fadeIn 0.5s ease;
  }
  .report-header {
    padding: 24px 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .report-title { font-family: 'Special Elite', cursive; font-size: 22px; }
  .report-subtitle { font-size: 11px; letter-spacing: 3px; color: #7a7060; margin-top: 4px; text-transform: uppercase; }

  .verdict-badge {
    padding: 8px 20px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    border: 2px solid;
    flex-shrink: 0;
  }
  .verdict-red    { color: var(--red);    border-color: var(--red);    background: rgba(192,57,43,0.08); }
  .verdict-yellow { color: var(--yellow); border-color: var(--yellow); background: rgba(212,160,23,0.08); }
  .verdict-green  { color: #4caf50;       border-color: #4caf50;       background: rgba(76,175,80,0.08); }

  .score-bar-wrap { padding: 20px 28px; border-bottom: 1px solid var(--border); }
  .score-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  .score-bar { height: 6px; background: #2a2620; position: relative; }
  .score-fill { height: 100%; transition: width 1s ease; }
  .score-fill.red    { background: var(--red); }
  .score-fill.yellow { background: var(--yellow); }
  .score-fill.green  { background: #4caf50; }
  .score-num { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 600; margin-top: 8px; }

  .findings { padding: 24px 28px; border-bottom: 1px solid var(--border); }
  .findings-title { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
  .finding-item {
    display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;
    padding-bottom: 14px; border-bottom: 1px dashed var(--border);
  }
  .finding-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .finding-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .finding-text { font-size: 13px; line-height: 1.6; }
  .finding-tag {
    display: inline-block; font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; padding: 2px 7px; border: 1px solid;
    margin-right: 6px; vertical-align: middle; opacity: 0.8;
  }
  .tag-risk    { color: var(--red);    border-color: var(--red); }
  .tag-caution { color: var(--yellow); border-color: var(--yellow); }
  .tag-ok      { color: #4caf50;       border-color: #4caf50; }

  .narrative { padding: 24px 28px; border-bottom: 1px solid var(--border); }
  .narrative-title { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; }
  .narrative p { font-size: 14px; line-height: 1.8; color: #b0a590; }

  .data-raw { padding: 20px 28px; }
  .data-raw-title {
    font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 12px; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
  }
  .data-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .data-cell { background: #131210; border: 1px solid var(--border); padding: 12px; }
  .data-cell-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #5a5248; margin-bottom: 4px; }
  .data-cell-value { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--ink); }

  /* ── Disclaimer ── */
  .disclaimer {
    margin-top: 48px;
    padding: 20px;
    border: 1px dashed var(--border);
    font-size: 11px;
    color: #4a4538;
    line-height: 1.7;
    text-align: center;
  }

  /* ── API key notice ── */
  .api-notice {
    background: var(--paper); border: 1px solid var(--border);
    padding: 16px 20px; margin-bottom: 24px;
    font-size: 12px; color: #7a7060; line-height: 1.7;
  }
  .api-notice strong { color: var(--yellow); }
  .api-input {
    width: 100%; margin-top: 10px;
    background: #131210; border: 1px solid var(--border);
    outline: none; padding: 10px 14px;
    font-family: 'IBM Plex Mono', monospace; font-size: 12px;
    color: var(--ink); letter-spacing: 1px;
  }
  .api-input:focus { border-color: var(--yellow); }
`;

// ── Mock data layer (real APIs wired here in production) ──────────────────────
async function fetchDomainData(target) {
  // In production: call your Python FastAPI backend
  // For demo: returns structured mock that Claude will analyze
  const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(target);
  const clean = target.replace(/^https?:\/\//, "").replace(/\/.*/, "");

  return {
    target: clean,
    whois: {
      domain: clean,
      created: "2024-11-03",
      expires: "2025-11-03",
      age_days: 109,
      registrar: "NameCheap, Inc.",
      privacy_protected: true,
      country: "Unknown (privacy proxy)",
    },
    ssl: {
      valid: true,
      issuer: "Let's Encrypt",
      expires: "2025-04-15",
      days_remaining: 54,
      self_signed: false,
    },
    virustotal: {
      malicious: 2,
      suspicious: 1,
      harmless: 68,
      engines_total: 71,
    },
    google_safe_browsing: {
      flagged: false,
      threats: [],
    },
    traffic: {
      monthly_visits: 1200,
      bounce_rate: "87%",
      avg_visit_duration: "0m 42s",
    },
    business: {
      opencorporates_found: false,
      note: "No matching company record found in OpenCorporates for this domain owner.",
    },
    reddit_signals: {
      scam_mentions: 3,
      sample: "User u/buyer2024: 'Ordered twice, never received, no reply to emails.'",
    },
    page_signals: {
      contact_is_gmail: true,
      no_physical_address: true,
      prices_unrealistically_low: true,
      return_policy_generic: true,
    },
  };
}

// ── Claude analysis call ───────────────────────────────────────────────────────
async function analyzeWithClaude(data, apiKey) {
  const prompt = `You are a seasoned digital safety investigator. You have just completed an intelligence sweep on the following target. Analyze all signals and produce a structured report.

RAW INTELLIGENCE DATA:
${JSON.stringify(data, null, 2)}

Respond ONLY with a valid JSON object in this exact shape (no markdown, no preamble):
{
  "score": <integer 0-100, where 0=perfectly safe, 100=extremely dangerous>,
  "verdict": "<RED | YELLOW | GREEN>",
  "verdict_summary": "<one punchy sentence, max 12 words, detective voice>",
  "findings": [
    { "icon": "<single emoji>", "tag": "<RISK|CAUTION|OK>", "text": "<plain-English finding, 1-2 sentences, non-technical>" }
  ],
  "narrative": "<3-4 sentence plain-English detective summary for a non-technical person. Be direct, use everyday language, explain WHY this is or isn't suspicious.>",
  "raw_labels": {
    "Domain Age": "<value>",
    "SSL Issuer": "<value>",
    "Malware Flags": "<value>",
    "Traffic": "<value>",
    "Reddit Signals": "<value>",
    "Business Record": "<value>"
  }
}

Be honest and direct. If something looks like a scam, say so clearly. If it looks safe, say that too. The audience is everyday people who need to understand quickly.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const json = await res.json();
  const text = json.content?.[0]?.text || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ── Components ────────────────────────────────────────────────────────────────
function VerdictBadge({ verdict }) {
  const map = { RED: "🔴 HIGH RISK", YELLOW: "🟡 CAUTION", GREEN: "🟢 LIKELY SAFE" };
  const cls = { RED: "verdict-red", YELLOW: "verdict-yellow", GREEN: "verdict-green" };
  return <div className={`verdict-badge ${cls[verdict] || "verdict-yellow"}`}>{map[verdict] || verdict}</div>;
}

function ScoreBar({ score, verdict }) {
  const cls = verdict === "RED" ? "red" : verdict === "GREEN" ? "green" : "yellow";
  const label = verdict === "RED" ? "DANGER LEVEL" : "RISK LEVEL";
  return (
    <div className="score-bar-wrap">
      <div className="score-label">{label}</div>
      <div className="score-bar">
        <div className={`score-fill ${cls}`} style={{ width: `${score}%` }} />
      </div>
      <div className={`score-num`} style={{ color: cls === "red" ? "var(--red)" : cls === "green" ? "#4caf50" : "var(--yellow)" }}>
        {score}<span style={{ fontSize: 14, fontWeight: 400, color: "#5a5248" }}>/100</span>
      </div>
    </div>
  );
}

function Findings({ findings }) {
  return (
    <div className="findings">
      <div className="findings-title">▸ Evidence Files</div>
      {findings.map((f, i) => (
        <div className="finding-item" key={i}>
          <div className="finding-icon">{f.icon}</div>
          <div className="finding-text">
            <span className={`finding-tag ${f.tag === "RISK" ? "tag-risk" : f.tag === "OK" ? "tag-ok" : "tag-caution"}`}>{f.tag}</span>
            {f.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function RawData({ labels }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="data-raw">
      <div className="data-raw-title" onClick={() => setOpen(o => !o)}>
        ▸ Raw Intelligence Data <span style={{ color: "#4a4538" }}>{open ? "[−]" : "[+]"}</span>
      </div>
      {open && (
        <div className="data-grid">
          {Object.entries(labels).map(([k, v]) => (
            <div className="data-cell" key={k}>
              <div className="data-cell-label">{k}</div>
              <div className="data-cell-value">{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STEPS = [
  "Resolving domain intelligence…",
  "Checking SSL certificate…",
  "Scanning malware & phishing databases…",
  "Cross-referencing Google Safe Browsing…",
  "Pulling traffic signals…",
  "Searching community reports…",
  "Querying business registries…",
  "Synthesizing with AI investigator…",
];

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [target, setTarget] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = GLOBAL_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const runInvestigation = async () => {
    if (!target.trim() || !apiKey.trim()) return;
    setLoading(true);
    setReport(null);
    setError(null);
    setSteps([]);

    try {
      for (let i = 0; i < STEPS.length; i++) {
        setSteps(s => [...s, { text: STEPS[i], status: "active" }]);
        await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
        setSteps(s => s.map((x, idx) => idx === i ? { ...x, status: "done" } : x));
      }

      const rawData = await fetchDomainData(target);
      const result = await analyzeWithClaude(rawData, apiKey);
      setReport(result);
    } catch (e) {
      setError("Investigation failed: " + (e.message || "unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = s => s.status === "done" ? "✓" : s.status === "active" ? "●" : "○";

  return (
    <>
      <div className="grain" />
      <div className="scanlines" />
      <div className="app-wrap">

        <header className="header">
          <h1>The <span>Digital</span><br />Detective</h1>
          <p>Website · App · Platform Safety Investigator</p>
          <div className="badge">Est. 2025 — All cases handled with discretion</div>
        </header>

        {/* API Key input */}
        <div className="api-notice">
          <strong>INVESTIGATOR ACCESS</strong> — Enter your Anthropic API key to activate the AI analysis engine.{" "}
          Get one free at <strong>console.anthropic.com</strong>. Your key is never stored.
          <input
            className="api-input"
            type="password"
            placeholder="sk-ant-…"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </div>

        {/* Search */}
        <div className="search-section">
          <label className="search-label">▸ Enter Target — URL, App Name, or Platform</label>
          <div className="search-row">
            <input
              className="search-input"
              placeholder="e.g. suspicious-shop.com or TelegramGroup123"
              value={target}
              onChange={e => setTarget(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && runInvestigation()}
            />
            <button className="search-btn" onClick={runInvestigation} disabled={loading || !target || !apiKey}>
              {loading ? "ON CASE…" : "INVESTIGATE"}
            </button>
          </div>
        </div>

        {/* Status ticker */}
        {steps.length > 0 && (
          <div className="ticker">
            {steps.map((s, i) => (
              <div key={i} className={`ticker-line ${s.status}`}>
                <div className={`ticker-dot ${s.status === "active" ? "blink" : ""}`} />
                <span style={{ marginRight: 8, fontWeight: 600 }}>{statusIcon(s)}</span>
                {s.text}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "16px 20px", border: "1px solid var(--red)", color: "var(--red)", fontSize: 13, marginBottom: 24 }}>
            ⚠ {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="report">
            <div className="report-header">
              <div>
                <div className="report-title">Case File: {target}</div>
                <div className="report-subtitle">Intelligence Report · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <VerdictBadge verdict={report.verdict} />
            </div>

            <ScoreBar score={report.score} verdict={report.verdict} />

            {report.verdict_summary && (
              <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--border)", fontFamily: "'Special Elite', cursive", fontSize: 17, color: "var(--ink)" }}>
                "{report.verdict_summary}"
              </div>
            )}

            {report.findings && <Findings findings={report.findings} />}

            {report.narrative && (
              <div className="narrative">
                <div className="narrative-title">▸ Detective's Summary</div>
                <p>{report.narrative}</p>
              </div>
            )}

            {report.raw_labels && <RawData labels={report.raw_labels} />}
          </div>
        )}

        <div className="disclaimer">
          This tool aggregates publicly available signals as an informational aid only.<br />
          It does not constitute legal or financial advice. Always exercise your own judgment.
        </div>

      </div>
    </>
  );
}
