/* ══════════════════════════════════════════════════════════════════
   ▌ ARCH3D DETAIL MODULE
   ▌ Paste toàn bộ file này vào TRƯỚC thẻ </body> của index.html
   ▌ Yêu cầu: Three.js, OrbitControls, TWEEN đã được load sẵn
   ══════════════════════════════════════════════════════════════════ */

/* ─── 1. INJECT CSS ─────────────────────────────────────────────── */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Nút "View 3D Architecture" xuất hiện sau khi explode */
    #btn-arch3d {
      position: fixed;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(90deg,
        rgba(46,213,115,0.08),
        rgba(46,213,115,0.22),
        rgba(46,213,115,0.08));
      border: 1px solid rgba(46,213,115,0.6);
      border-radius: 30px;
      color: #2ed573;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 1.5px;
      padding: 12px 28px;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.5s ease, transform 0.3s ease,
                  box-shadow 0.3s ease, background 0.3s ease;
      z-index: 50;
      white-space: nowrap;
      text-transform: uppercase;
    }
    #btn-arch3d.visible {
      opacity: 1;
      pointer-events: all;
    }
    #btn-arch3d:hover {
      background: linear-gradient(90deg,
        rgba(46,213,115,0.15),
        rgba(46,213,115,0.38),
        rgba(46,213,115,0.15));
      border-color: #2ed573;
      box-shadow: 0 0 28px rgba(46,213,115,0.45);
      transform: translateX(-50%) translateY(-3px);
    }

    /* ── Overlay toàn màn hình cho không gian 3D chi tiết ── */
    #arch3d-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1,4,9,0);
      backdrop-filter: blur(0px);
      z-index: 300;
      pointer-events: none;
      transition: background 0.6s ease, backdrop-filter 0.6s ease;
    }
    #arch3d-overlay.active {
      background: rgba(1,4,9,0.98);
      backdrop-filter: blur(20px);
      pointer-events: all;
    }
    #arch3d-canvas-wrap {
      width: 100%;
      height: 100%;
      position: relative;
      opacity: 0;
      transition: opacity 0.5s ease 0.3s;
    }
    #arch3d-overlay.active #arch3d-canvas-wrap {
      opacity: 1;
    }
    #arch3d-renderer-canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }

    /* Header bar */
    #arch3d-header {
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 18px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(1,4,9,0.9) 0%, transparent 100%);
      z-index: 10;
      pointer-events: none;
    }
    #arch3d-title {
      color: #2ed573;
      font-family: 'Courier New', monospace;
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-shadow: 0 0 20px rgba(46,213,115,0.7);
    }
    #arch3d-sub {
      color: #4a7a5a;
      font-family: Arial, sans-serif;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    #btn-arch3d-close {
      position: absolute;
      top: 18px; right: 24px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(46,213,115,0.25);
      border-radius: 8px;
      color: #4a7a5a;
      font-family: Arial, sans-serif;
      font-size: 13px;
      padding: 8px 18px;
      cursor: pointer;
      transition: all .3s;
      font-weight: bold;
      letter-spacing: 1px;
      pointer-events: all;
      z-index: 11;
    }
    #btn-arch3d-close:hover {
      background: rgba(46,213,115,0.12);
      border-color: #2ed573;
      color: #2ed573;
      box-shadow: 0 0 18px rgba(46,213,115,0.35);
      transform: translateY(-1px);
    }

    /* Hint bar dưới cùng */
    #arch3d-hint {
      position: absolute;
      bottom: 18px; left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.65);
      border: 1px solid #30363d;
      border-radius: 20px;
      padding: 8px 20px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #8b949e;
      backdrop-filter: blur(8px);
      letter-spacing: 0.5px;
      pointer-events: none;
      white-space: nowrap;
      z-index: 10;
    }

    /* Flow legend top-right */
    #arch3d-legend {
      position: absolute;
      top: 80px; right: 24px;
      background: rgba(0,0,0,0.7);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 16px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #8b949e;
      backdrop-filter: blur(8px);
      line-height: 2;
      z-index: 10;
      pointer-events: none;
    }
    #arch3d-legend .leg-row { display: flex; align-items: center; gap: 8px; }
    #arch3d-legend .leg-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }

    /* SOAR inline panel bên trong không gian 3D */
    #arch3d-soar-panel {
      position: absolute;
      top: 50%; right: 28px;
      transform: translateY(-50%) translateX(30px);
      width: min(420px, 38vw);
      max-height: 80vh;
      background: linear-gradient(160deg, rgba(0,25,18,0.97) 0%, rgba(1,8,6,0.99) 100%);
      border: 1px solid rgba(0,255,204,0.35);
      border-radius: 16px;
      padding: 24px 26px 20px;
      overflow-y: auto;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1);
      z-index: 20;
      box-shadow: 0 20px 60px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,255,204,0.04);
    }
    #arch3d-soar-panel.visible {
      opacity: 1;
      pointer-events: all;
      transform: translateY(-50%) translateX(0px);
    }
    #arch3d-soar-panel::-webkit-scrollbar { width: 5px; }
    #arch3d-soar-panel::-webkit-scrollbar-track { background: transparent; }
    #arch3d-soar-panel::-webkit-scrollbar-thumb {
      background: rgba(0,255,204,0.2); border-radius: 3px;
    }
    #arch3d-soar-panel .asp-title {
      color: #00ffcc;
      font-family: 'Courier New', monospace;
      font-size: 15px;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-shadow: 0 0 20px rgba(0,255,204,0.7);
      margin-bottom: 4px;
    }
    #arch3d-soar-panel .asp-sub {
      color: #4a9a80;
      font-family: Arial, sans-serif;
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    #btn-asp-close {
      float: right;
      background: rgba(0,255,204,0.05);
      border: 1px solid rgba(0,255,204,0.2);
      border-radius: 6px;
      color: #4a9a80;
      font-size: 12px;
      padding: 4px 10px;
      cursor: pointer;
      transition: all .25s;
      font-family: Arial, sans-serif;
      margin-top: -4px;
    }
    #btn-asp-close:hover {
      background: rgba(0,255,204,0.12);
      border-color: #00ffcc; color: #00ffcc;
    }

    /* Mini SOAR cards */
    .asp-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(0,255,204,0.1);
      border-radius: 8px;
      padding: 10px 13px;
      margin-bottom: 8px;
      transition: all .3s cubic-bezier(0.16,1,0.3,1);
      position: relative;
      overflow: hidden;
    }
    .asp-card::before {
      content: '';
      position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
      background: var(--c);
      box-shadow: 0 0 8px var(--c);
      opacity: 0.7;
    }
    .asp-card:hover {
      border-color: var(--c);
      background: rgba(255,255,255,0.05);
      transform: translateX(3px);
    }
    .asp-card .asc-tag {
      font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
      color: var(--c); margin-bottom: 3px; opacity: .85; font-weight: bold;
      font-family: Arial, sans-serif;
    }
    .asp-card .asc-name {
      font-size: 13px; color: #e6edf3; font-weight: bold; margin-bottom: 3px;
    }
    .asp-card .asc-desc {
      font-size: 12px; color: #6b7a85; line-height: 1.5;
    }
    .asp-card .asc-file {
      display: inline-block;
      margin-top: 4px;
      font-size: 10px;
      letter-spacing: 0.8px;
      color: var(--c);
      opacity: 0.65;
      font-family: 'Courier New', monospace;
    }
    /* SOAR layer annotation note (CSS2D trong scene) */
    .soar-annot-note {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.55;
      padding: 7px 12px 7px 10px;
      border-radius: 5px;
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.22s ease;
      background: rgba(2, 8, 6, 0.92);
      backdrop-filter: blur(4px);
    }
    .soar-annot-note.visible { opacity: 1; }
    .soar-annot-note .san-label {
      font-weight: bold;
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }
    .soar-annot-note .san-desc {
      font-size: 10.5px;
      color: #8b949e;
      font-family: Arial, sans-serif;
      display: block;
    }
  `;
  document.head.appendChild(style);
})();

/* ─── 2. INJECT HTML ────────────────────────────────────────────── */
(function injectHTML() {
  // Nút trigger
  const btn = document.createElement('button');
  btn.id = 'btn-arch3d';
  btn.textContent = '⬡  VIEW 3D ARCHITECTURE';
  document.body.appendChild(btn);

  // Overlay chính
  const overlay = document.createElement('div');
  overlay.id = 'arch3d-overlay';
  overlay.innerHTML = `
    <div id="arch3d-canvas-wrap">
      <canvas id="arch3d-renderer-canvas"></canvas>

      <div id="arch3d-header">
        <div>
          <div id="arch3d-title">◈ Ubuntu SOAR Infrastructure — 3D Architecture View</div>
          <div id="arch3d-sub">Suricata · Zeek · Vector · Splunk · Python SOAR Engine · Interactive Data Flow</div>
        </div>
      </div>

      <button id="btn-arch3d-close">✕ CLOSE</button>

      <div id="arch3d-legend">
        <div class="leg-row"><span class="leg-dot" style="background:#ff3366;box-shadow:0 0 5px #ff3366"></span> Network → Suricata</div>
        <div class="leg-row"><span class="leg-dot" style="background:#00aaff;box-shadow:0 0 5px #00aaff"></span> Network → Zeek</div>
        <div class="leg-row"><span class="leg-dot" style="background:#ff3366;box-shadow:0 0 5px #ff3366;opacity:.6"></span> Suricata → Vector</div>
        <div class="leg-row"><span class="leg-dot" style="background:#00aaff;box-shadow:0 0 5px #00aaff;opacity:.6"></span> Zeek → Vector</div>
        <div class="leg-row"><span class="leg-dot" style="background:#ffee00;box-shadow:0 0 5px #ffee00"></span> Vector → Splunk</div>
        <div class="leg-row"><span class="leg-dot" style="background:#00ffcc;box-shadow:0 0 5px #00ffcc"></span> Splunk → SOAR</div>
      </div>

      <div id="arch3d-hint">🖱 Left-click: Rotate &nbsp;|&nbsp; Right-click: Pan &nbsp;|&nbsp; Scroll: Zoom &nbsp;|&nbsp; Click SOAR node for details</div>

      <!-- SOAR inline detail panel -->
      <div id="arch3d-soar-panel">
        <button id="btn-asp-close">✕</button>
        <div class="asp-title">◈ Automated SOAR Pipeline</div>
        <div class="asp-sub">Telemetry Ingestion → Automated Response · 5-Layer Processing Architecture (main.py)</div>

        <div class="asp-card" style="--c:#ff6b6b">
          <div class="asc-tag">Layer 1 · Ingestion</div>
          <div class="asc-name">Log Collection &amp; Aggregation</div>
          <div class="asc-desc">
            Executes concurrent polling via the Splunk CLI utilizing a ThreadPoolExecutor across three primary telemetry sources:
            <b>Zeek</b> (conn/dns/http), <b>Suricata</b> EVE JSON alerts, and
            <b>Winlogbeat</b> (Events 1/3/4/11/22/23/4104/4624/4625/4663/4698).
            Supports a DRY_RUN mode for local JSON file ingestion and implements per-source checkpointing to eliminate redundant processing.
          </div>
          <span class="asc-file">ingestion.py · poll_all_sources()</span>
        </div>

        <div class="asp-card" style="--c:#ff9f43">
          <div class="asc-tag">Layer 2 · Correlation</div>
          <div class="asc-name">Normalization · Deduplication · Correlation</div>
          <div class="asc-desc">
            Aggregates and chronologically sorts telemetry. Performs cross-source deduplication based on unique algorithmic keys
            (src_ip, dst_port, event_type, time_bucket±2s) maintaining a prioritization hierarchy (Winlogbeat > Suricata > Zeek).
            Implements session correlation to dynamically attribute endpoint behavioral artifacts lacking direct source IPs to the identified threat actor.
          </div>
          <span class="asc-file">correlation.py · correlate_pipeline()</span>
        </div>

        <div class="asp-card" style="--c:#54a0ff">
          <div class="asc-tag">Layer 3 · Scoring &amp; Enrichment</div>
          <div class="asc-name">Zero Trust Risk Evaluation · TI Boost</div>
          <div class="asc-desc">
            Applies advanced behavioral rulesets (e.g., R1 Port Scan +20, R2 HTTP C2 +25, R6 PowerShell Bypass +40, R10 DNS Tunnel +40, R12 App Shimming +45)
            coupled with automated temporal score decay. Integrates Threat Intelligence (TI) enrichment via simulated VirusTotal and AbuseIPDB
            API lookups; exceeding predefined thresholds triggers contextual score multipliers (+50 for malicious, +20 for suspicious indicators).
          </div>
          <span class="asc-file">scoring.py · ScoringEngine | enrichment.py · ThreatIntelEnricher</span>
        </div>

        <div class="asp-card" style="--c:#a29bfe">
          <div class="asc-tag">Layer 4 · Decision</div>
          <div class="asc-name">Threshold Evaluation · Action Routing</div>
          <div class="asc-desc">
            Evaluates the cumulative risk score against predefined operational thresholds (e.g., IOC mode: Non-Whitelisted ≥ 50, Whitelisted ≥ 100).
            Automatically triggers primary countermeasures such as the <b>BLOCK_EMAIL</b> directive. Upon detecting critical process-level anomalies
            (e.g., ps_bypass, fin7_app_shimming) with a score ≥ 120, the system automatically initiates a <b>KILL_PROCESS</b> directive for immediate EDR containment.
          </div>
          <span class="asc-file">decision.py · DecisionEngine.evaluate()</span>
        </div>

        <div class="asp-card" style="--c:#00ffcc">
          <div class="asc-tag">Layer 5 · Response</div>
          <div class="asc-name">Automated Remediation Mechanisms</div>
          <div class="asc-desc">
            Executes autonomous remediation strategies:
            <b>(1) Network Isolation</b>: Transmits a POST request to the pfSense API to block the adversary's IP on the WAN interface.
            <b>(2) EDR Containment</b>: Establishes a secure SSH tunnel to the affected endpoint to suspend or terminate malicious processes and forcefully log off compromised sessions.
            <b>(3) Incident Notification</b>: Dispatches a comprehensive SMTP HTML report detailing risk metrics, TI reputation, and firewall status.
          </div>
          <span class="asc-file">response.py · ResponseEngine.execute() | process_containment.py</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
})();

/* ─── 3. HOOK: Nút hiện/ẩn theo trạng thái explode ─────────────── */
/* Patch vào explodeLayers / collapseLayers của file gốc */
(function patchExplodeCollapse() {
  const btnArch = document.getElementById('btn-arch3d');

  // Chờ đến khi các hàm gốc sẵn sàng
  function waitAndPatch() {
    if (typeof explodeLayers === 'undefined') {
      setTimeout(waitAndPatch, 100);
      return;
    }
    const origExplode   = explodeLayers;
    const origCollapse  = collapseLayers;

    window.explodeLayers = function () {
      origExplode.call(this);
      // Chờ animation xong rồi hiện nút
      setTimeout(() => { btnArch.classList.add('visible'); }, 950);
    };

    window.collapseLayers = function () {
      origCollapse.call(this);
      btnArch.classList.remove('visible');
    };
  }
  waitAndPatch();
})();

/* ─── 4. THREE.JS SCENE CHO KHÔNG GIAN 3D CHI TIẾT ─────────────── */
let arch3dOpen   = false;
let arch3dInited = false;
let arch3dAF     = null; // animation frame id

// Các layer: thứ tự index khớp với LAYERS gốc
// [0]=SOAR, [1]=Zeek, [2]=Suricata, [3]=Vector, [4]=Splunk
const ARCH_NODES = [
  { name: 'Python SOAR\nEngine',  color: 0x00ffcc, emissive: 0x003322, hexStr: '00ffcc', isSoar: true  },
  { name: 'Zeek\nNetMonitor',     color: 0x00aaff, emissive: 0x001133, hexStr: '00aaff', isSoar: false },
  { name: 'Suricata\nIDS/IPS',    color: 0xff3366, emissive: 0x330011, hexStr: 'ff3366', isSoar: false },
  { name: 'Vector\nLog Router',   color: 0xffee00, emissive: 0x332200, hexStr: 'ffee00', isSoar: false },
  { name: 'Splunk\nSIEM',         color: 0xff6600, emissive: 0x221100, hexStr: 'ff6600', isSoar: false },
];

// Luồng data flows đúng theo kịch bản:
// Network Traffic → Suricata[2]   (src=-1 = network external)
// Network Traffic → Zeek[1]       (src=-1 = network external)
// Suricata[2] → Vector[3]
// Zeek[1]     → Vector[3]
// Vector[3]   → Splunk[4]
// Splunk[4]   → SOAR[0]
const ARCH_FLOWS = [
  { src: -1, dst: 2, color: 0xff3366, speed: 0.0055, label: 'Network → Suricata' }, // Network→Suricata
  { src: -1, dst: 1, color: 0x00aaff, speed: 0.0050, label: 'Network → Zeek'     }, // Network→Zeek
  { src: 2,  dst: 3, color: 0xff3366, speed: 0.0065, label: 'Suricata → Vector'  }, // Suricata→Vector
  { src: 1,  dst: 3, color: 0x00aaff, speed: 0.0060, label: 'Zeek → Vector'      }, // Zeek→Vector
  { src: 3,  dst: 4, color: 0xffee00, speed: 0.0075, label: 'Vector → Splunk'    }, // Vector→Splunk
  { src: 4,  dst: 0, color: 0x00ffcc, speed: 0.0055, label: 'Splunk → SOAR'      }, // Splunk→SOAR
];

// Layout:
//         [NET]  ← Network Traffic (external, top center)
//    [2]Suricata   [1]Zeek
//          [3]Vector
//          [4]Splunk
//          [0]SOAR  (nhô riêng dưới cùng)
const NODE_POSITIONS = [
  new THREE.Vector3( 0,  -7.5,  0),  // [0] SOAR      — dưới cùng
  new THREE.Vector3( 7,   7.0,  0),  // [1] Zeek       — hàng trên phải
  new THREE.Vector3(-7,   7.0,  0),  // [2] Suricata   — hàng trên trái
  new THREE.Vector3( 0,   3.5,  0),  // [3] Vector     — giữa
  new THREE.Vector3( 0,   0.0,  0),  // [4] Splunk     — dưới giữa
];

// Vị trí Network Traffic (external source cho Suricata và Zeek)
const NETWORK_POS = new THREE.Vector3(0, 12.0, 0);

let arch3dScene, arch3dCamera, arch3dRenderer, arch3dControls;
let arch3dLabelRenderer;
let arch3dNodeMeshes  = [];
let arch3dFlowStreams  = [];
let arch3dLabelObjs   = [];
let arch3dSoarOpen    = false;
let arch3dNetGrp      = null;

// SOAR explode state
let soarExploded      = false;
let soarSubMeshes     = [];   // { mesh, edges, labelDiv, labelObj, baseY, targetY }
let soarSubGroup      = null; // THREE.Group gắn vào SOAR grp

// 5 sub-layers của SOAR — khớp SOAR_STAGES / sp-card trong code gốc
const SOAR_SUB_LAYERS = [
  {
    name: 'L1 · Ingestion', color: 0xff6b6b, hex: 'ff6b6b',
    note: 'Log Collection & Aggregation',
    desc: 'ThreadPoolExecutor polling · Zeek / Suricata / Winlogbeat · checkpointing',
    key:  'ingestion.py · poll_all_sources()',
  },
  {
    name: 'L2 · Correlation', color: 0xff9f43, hex: 'ff9f43',
    note: 'Normalization · Deduplication · Correlation',
    desc: 'Cross-source dedup (src_ip, dst_port, ±2s bucket) · session attribution',
    key:  'correlation.py · correlate_pipeline()',
  },
  {
    name: 'L3 · Scoring & TI', color: 0x54a0ff, hex: '54a0ff',
    note: 'Zero Trust Risk Evaluation · TI Boost',
    desc: 'Behavioral rulesets + score decay · VirusTotal / AbuseIPDB enrichment',
    key:  'scoring.py · ScoringEngine | enrichment.py',
  },
  {
    name: 'L4 · Decision', color: 0xa29bfe, hex: 'a29bfe',
    note: 'Threshold Evaluation · Action Routing',
    desc: 'IOC threshold eval · BLOCK_EMAIL trigger · KILL_PROCESS at score ≥ 120',
    key:  'decision.py · DecisionEngine.evaluate()',
  },
  {
    name: 'L5 · Response', color: 0x00ffcc, hex: '00ffcc',
    note: 'Automated Remediation Mechanisms',
    desc: 'pfSense WAN block · SSH EDR containment · SMTP incident report',
    key:  'response.py · ResponseEngine.execute()',
  },
];

// Layer hover state
let soarHoveredIdx    = -1;   // index vào soarSubMeshes đang hover (-1 = none)

function initArch3D() {
  if (arch3dInited) return;
  arch3dInited = true;

  const canvas = document.getElementById('arch3d-renderer-canvas');
  const W = window.innerWidth;
  const H = window.innerHeight;

  /* Renderer */
  arch3dRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  arch3dRenderer.setSize(W, H);
  arch3dRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  arch3dRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  arch3dRenderer.toneMappingExposure = 1.0;

  /* CSS2D Renderer cho labels */
  arch3dLabelRenderer = new THREE.CSS2DRenderer();
  arch3dLabelRenderer.setSize(W, H);
  arch3dLabelRenderer.domElement.style.position = 'absolute';
  arch3dLabelRenderer.domElement.style.top = '0';
  arch3dLabelRenderer.domElement.style.left = '0';
  arch3dLabelRenderer.domElement.style.pointerEvents = 'none';
  document.getElementById('arch3d-canvas-wrap').appendChild(arch3dLabelRenderer.domElement);

  /* Scene */
  arch3dScene = new THREE.Scene();
  arch3dScene.background = new THREE.Color(0x010409);
  arch3dScene.fog = new THREE.FogExp2(0x010409, 0.008);

  /* Camera */
  arch3dCamera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
  arch3dCamera.position.set(0, 0, 28);

  /* Controls */
  arch3dControls = new THREE.OrbitControls(arch3dCamera, arch3dRenderer.domElement);
  arch3dControls.enableDamping = true;
  arch3dControls.dampingFactor = 0.07;
  arch3dControls.minDistance = 5;
  arch3dControls.maxDistance = 60;
  arch3dControls.target.set(0, 0, 0);
  arch3dControls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };

  /* Lighting */
  arch3dScene.add(new THREE.AmbientLight(0x0d1117, 4));
  const dir = new THREE.DirectionalLight(0x8bacc8, 1.5);
  dir.position.set(5, 12, 8);
  arch3dScene.add(dir);
  arch3dScene.add(new THREE.PointLight(0x00ffcc, 5, 25));

  /* Grid — hạ xuống thấp để không gian thoáng */
  const grid = new THREE.GridHelper(80, 80, 0x1f2937, 0x111827);
  grid.position.y = -10;
  arch3dScene.add(grid);

  /* ── Build node boxes ── */
  arch3dNodeMeshes = [];
  arch3dLabelObjs = [];

  ARCH_NODES.forEach((nd, i) => {
    const grp = new THREE.Group();
    grp.position.copy(NODE_POSITIONS[i]);
    arch3dScene.add(grp);

    // Glow halo (outer sphere, transparent)
    const haloGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: nd.color,
      transparent: true,
      opacity: nd.isSoar ? 0.06 : 0.04,
      side: THREE.BackSide,
    });
    grp.add(new THREE.Mesh(haloGeo, haloMat));

    // Main box
    const bW = nd.isSoar ? 5.0 : 4.2;
    const bH = nd.isSoar ? 1.6 : 1.3;
    const bD = nd.isSoar ? 2.6 : 2.2;
    const geo = new THREE.BoxGeometry(bW, bH, bD);

    // Rounded-ish edges via EdgesGeometry outline
    const mat = new THREE.MeshStandardMaterial({
      color: nd.color,
      roughness: 0.2,
      metalness: 0.85,
      emissive: nd.emissive,
      emissiveIntensity: nd.isSoar ? 1.5 : 1.0,
      transparent: true,
      opacity: 0.88,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    grp.add(mesh);

    // Edge wireframe
    const edgeMat = new THREE.LineBasicMaterial({
      color: nd.color,
      transparent: true,
      opacity: 0.55,
    });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    grp.add(edges);

    // Point light bên trong mỗi node
    const pt = new THREE.PointLight(nd.color, nd.isSoar ? 3.5 : 2.0, nd.isSoar ? 10 : 7);
    grp.add(pt);

    // Hit box (invisible) để raycaster bắt được
    const hitGeo = new THREE.BoxGeometry(bW + 0.5, bH + 1.5, bD + 0.5);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitGeo, hitMat);
    grp.add(hitBox);

    mesh.userData.nodeIndex = i;
    mesh.userData.isSoar = nd.isSoar;
    hitBox.userData.nodeIndex = i;
    hitBox.userData.isSoar = nd.isSoar;
    hitBox.userData.isHitBox = true;

    // CSS2D Label — đẩy lên cao hơn để không che node
    const div = document.createElement('div');
    div.style.cssText = `
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #${nd.hexStr};
      background: rgba(0,0,0,0.78);
      padding: 4px 10px;
      border-radius: 4px;
      pointer-events: none;
      white-space: pre;
      text-shadow: 0 0 10px #${nd.hexStr};
      border-left: 2px solid #${nd.hexStr};
      text-align: center;
      line-height: 1.5;
      transition: opacity 0.2s ease;
      ${nd.isSoar ? 'font-size:12px; font-weight:bold;' : ''}
    `;
    div.textContent = nd.name;
    const lObj = new THREE.CSS2DObject(div);
    lObj.position.set(0, nd.isSoar ? 2.6 : 2.2, 0);
    grp.add(lObj);
    arch3dLabelObjs.push({ div, obj: lObj });

    arch3dNodeMeshes.push({ grp, mesh, hitBox, halo: haloMat, light: pt, labelDiv: div });
  });

  /* Network Traffic placeholder node (external) */
  const netGrp = new THREE.Group();
  netGrp.position.copy(NETWORK_POS);
  arch3dScene.add(netGrp);

  // Dùng TorusGeometry để trông như luồng mạng
  const netGeo = new THREE.TorusGeometry(1.1, 0.28, 12, 40);
  const netMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0x334455, emissiveIntensity: 1.0,
    roughness: 0.2, metalness: 0.9, transparent: true, opacity: 0.80,
  });
  netGrp.add(new THREE.Mesh(netGeo, netMat));
  netGrp.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(netGeo),
    new THREE.LineBasicMaterial({ color: 0xaaccff, transparent: true, opacity: 0.45 })
  ));
  netGrp.add(new THREE.PointLight(0xaaccff, 2.5, 10));

  // Label Network
  const netDiv = document.createElement('div');
  netDiv.style.cssText = `
    font-family: 'Courier New', monospace; font-size: 11px; color: #aaccff;
    background: rgba(0,0,0,0.78); padding: 4px 10px; border-radius: 4px;
    pointer-events: none; white-space: pre; text-align: center;
    text-shadow: 0 0 8px #aaccff; border-left: 2px solid #aaccff;
    line-height: 1.5;
  `;
  netDiv.textContent = 'Network\nTraffic';
  const netLObj = new THREE.CSS2DObject(netDiv);
  netLObj.position.set(0, 1.8, 0);
  netGrp.add(netLObj);
  arch3dLabelObjs.push({ div: netDiv, obj: netLObj });

  // Lưu ref để animate
  arch3dNetGrp = netGrp;

  /* ── Build data flow streams ── */
  arch3dFlowStreams = [];
  ARCH_FLOWS.forEach((fl) => {
    const stream = buildArch3DStream(fl.color, fl.src, fl.dst);
    arch3dFlowStreams.push({ ...fl, ...stream });
  });

  /* ── Raycaster cho click & hover ── */
  const raycaster3d = new THREE.Raycaster();
  const mouse3d = new THREE.Vector2();

  arch3dRenderer.domElement.addEventListener('click', (e) => {
    const rect = arch3dRenderer.domElement.getBoundingClientRect();
    mouse3d.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse3d.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster3d.setFromCamera(mouse3d, arch3dCamera);

    // Ưu tiên hit vào sub-layer khi đang exploded
    if (soarExploded && soarSubMeshes.length) {
      const subHits = raycaster3d.intersectObjects(soarSubMeshes.map(s => s.mesh), false);
      if (subHits.length > 0) {
        // Click vào sub-layer → không làm gì thêm (panel đã mở)
        return;
      }
    }

    const hitTargets = arch3dNodeMeshes.map(n => n.hitBox);
    const hits = raycaster3d.intersectObjects(hitTargets, false);
    if (hits.length > 0) {
      const obj = hits[0].object;
      if (obj.userData.isSoar) {
        if (!soarExploded) {
          explodeSoarLayers();
          openArch3DSoarPanel();
        } else {
          collapseSoarLayers();
          // Giữ panel mở để vẫn đọc được nội dung
        }
      }
    }
  });

  // Cursor + SOAR layer hover → camera zoom + tooltip
  arch3dRenderer.domElement.addEventListener('mousemove', (e) => {
    const rect = arch3dRenderer.domElement.getBoundingClientRect();
    mouse3d.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse3d.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster3d.setFromCamera(mouse3d, arch3dCamera);

    const hitTargets = arch3dNodeMeshes.map(n => n.hitBox);
    const hits = raycaster3d.intersectObjects(hitTargets, false);
    const hovSoar = hits.some(h => h.object.userData.isSoar);

    // ── Sub-layer hover ──
    if (soarExploded && soarSubMeshes.length) {
      const subHits = raycaster3d.intersectObjects(soarSubMeshes.map(s => s.mesh), false);

      if (subHits.length > 0) {
        const hitMesh = subHits[0].object;
        const idx = soarSubMeshes.findIndex(s => s.mesh === hitMesh);

        if (idx !== -1 && idx !== soarHoveredIdx) {
          soarHoveredIdx = idx;
          onSoarLayerHover(idx);
        }
        arch3dRenderer.domElement.style.cursor = 'pointer';
        return;
      }
    }

    // Không hover sub-layer nào → restore nếu đang zoom
    if (soarHoveredIdx !== -1) {
      soarHoveredIdx = -1;
      onSoarLayerLeave();
    }

    arch3dRenderer.domElement.style.cursor = hovSoar ? 'pointer' : 'default';
  });

  // Mouse rời canvas → restore camera
  arch3dRenderer.domElement.addEventListener('mouseleave', () => {
    if (soarHoveredIdx !== -1) {
      soarHoveredIdx = -1;
      onSoarLayerLeave();
    }
  });

  /* Resize */
  window.addEventListener('resize', () => {
    if (!arch3dOpen) return;
    const w = window.innerWidth, h = window.innerHeight;
    arch3dCamera.aspect = w / h;
    arch3dCamera.updateProjectionMatrix();
    arch3dRenderer.setSize(w, h);
    arch3dLabelRenderer.setSize(w, h);
  });
}

/* ── SOAR Explode / Collapse ─────────────────────────────────────── */
function explodeSoarLayers() {
  if (soarExploded) return;
  soarExploded = true;

  const soarNode = arch3dNodeMeshes[0]; // index 0 = SOAR
  // Ẩn main SOAR mesh + label
  soarNode.mesh.visible  = false;
  soarNode.mesh.children.forEach(c => { c.visible = false; });
  if (soarNode.labelDiv) soarNode.labelDiv.style.opacity = '0';

  // Tạo Group gắn vào SOAR group (kế thừa position)
  soarSubGroup = new THREE.Group();
  arch3dScene.add(soarSubGroup);
  // Đặt position khớp với SOAR node (có float offset → dùng worldPosition)
  soarSubGroup.position.copy(soarNode.grp.position);

  soarSubMeshes = [];

  const SL_W = 4.8, SL_H = 0.38, SL_D = 2.4;
  const SL_GAP = 0.55;  // khoảng trống rõ ràng giữa các layer

  SOAR_SUB_LAYERS.forEach((sl, i) => {
    const geo = new THREE.BoxGeometry(SL_W, SL_H, SL_D);
    const mat = new THREE.MeshStandardMaterial({
      color: sl.color,
      roughness: 0.2, metalness: 0.85,
      emissive: sl.color,
      emissiveIntensity: 0.5,
      transparent: true, opacity: 0.0,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const edgeMat = new THREE.LineBasicMaterial({
      color: sl.color, transparent: true, opacity: 0.0,
    });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    mesh.add(edges);

    // Bắt đầu từ y=0 (vị trí SOAR), sẽ tween ra
    mesh.position.set(0, 0, 0);
    soarSubGroup.add(mesh);

    // ── Annotation line: kéo ngang từ cạnh TRÁI layer ra ──
    const LINE_LEN = 3.5;
    const LINE_X1  = -(SL_W / 2);           // điểm bắt đầu tại cạnh trái
    const LINE_X0  = LINE_X1 - LINE_LEN;    // điểm cuối (xa hơn về trái)
    const lineGeo  = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(LINE_X1, 0, 0),
      new THREE.Vector3(LINE_X0, 0, 0),
    ]);
    const lineMat2 = new THREE.LineBasicMaterial({
      color: sl.color, transparent: true, opacity: 0.0,
    });
    const annotLine = new THREE.Line(lineGeo, lineMat2);
    mesh.add(annotLine);

    // ── Annotation note: CSS2D ở đầu đường line (bên trái) ──
    const nDiv = document.createElement('div');
    nDiv.className = 'soar-annot-note';
    nDiv.style.borderRight = `2px solid #${sl.hex}`;
    nDiv.style.borderLeft  = 'none';
    nDiv.style.boxShadow   = `0 0 14px #${sl.hex}44, inset 0 0 8px #${sl.hex}0a`;
    nDiv.style.textAlign   = 'right';
    nDiv.innerHTML = `<span class="san-label" style="color:#${sl.hex};text-shadow:0 0 10px #${sl.hex}88">${sl.name}</span><span class="san-desc">${sl.desc}</span>`;
    const nObj = new THREE.CSS2DObject(nDiv);
    nObj.position.set(LINE_X0 - 0.25, 0, 0);
    mesh.add(nObj);

    // L1(i=0) trên cùng → L5(i=4) dưới cùng
    const stackCenterY = 0.0;
    const rank = (SOAR_SUB_LAYERS.length - 1) / 2 - i;
    const targetY = stackCenterY + rank * (SL_H + SL_GAP);

    soarSubMeshes.push({ mesh, edges, annotLine, lineMat: lineMat2, nDiv, nObj, targetY });

    // TWEEN: fade in opacity + tween Y
    const posProxy  = { y: 0 };
    const opProxy   = { v: 0 };

    new TWEEN.Tween(posProxy)
      .to({ y: targetY }, 900)
      .delay(i * 60)
      .easing(TWEEN.Easing.Back.Out)
      .onUpdate(() => { mesh.position.y = posProxy.y; })
      .start();

    new TWEEN.Tween(opProxy)
      .to({ v: 0.88 }, 600)
      .delay(i * 60)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        mat.opacity = opProxy.v;
        edgeMat.opacity = opProxy.v * 0.6;
      })
      .start();
  });

  // Hint update
  document.getElementById('arch3d-hint').textContent =
    '🖱 Click SOAR again to collapse layers | Panel on right shows layer details';
}

function collapseSoarLayers() {
  if (!soarExploded) return;
  soarExploded = false;

  // Reset hover state nếu đang hover
  if (soarHoveredIdx !== -1) {
    soarHoveredIdx = -1;
    onSoarLayerLeave();
  }

  // Ẩn annotations ngay
  soarSubMeshes.forEach(s => { s.nDiv.classList.remove('visible'); s.lineMat.opacity = 0; });

  soarSubMeshes.forEach((s, i) => {
    const posProxy = { y: s.mesh.position.y };
    const opProxy  = { v: s.mesh.material.opacity };

    new TWEEN.Tween(posProxy)
      .to({ y: 0 }, 700)
      .delay(i * 40)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => { s.mesh.position.y = posProxy.y; })
      .start();

    new TWEEN.Tween(opProxy)
      .to({ v: 0 }, 500)
      .delay(i * 40)
      .easing(TWEEN.Easing.Cubic.In)
      .onUpdate(() => {
        s.mesh.material.opacity = opProxy.v;
        s.edges.material.opacity = opProxy.v * 0.6;
      })
      .onComplete(() => {
        if (i === SOAR_SUB_LAYERS.length - 1) {
          // Xoá group khi animation xong
          arch3dScene.remove(soarSubGroup);
          soarSubGroup = null;
          soarSubMeshes = [];
          // Hiện lại SOAR main mesh + label
          const soarNode = arch3dNodeMeshes[0];
          soarNode.mesh.visible = true;
          soarNode.mesh.children.forEach(c => { c.visible = true; });
          if (soarNode.labelDiv) soarNode.labelDiv.style.opacity = '1';
        }
      })
      .start();
  });

  document.getElementById('arch3d-hint').textContent =
    '🖱 Left-click: Rotate | Right-click: Pan | Scroll: Zoom | Click SOAR node for details';
}

/* ── Layer hover: annotation line + note, dim others ── */
function onSoarLayerHover(idx) {
  const smsh = soarSubMeshes[idx];
  if (!smsh) return;

  soarSubMeshes.forEach((s, i) => {
    const mat = s.mesh.material;
    if (i === idx) {
      mat.emissiveIntensity    = 1.4;
      mat.opacity              = 1.0;
      s.edges.material.opacity = 0.95;
      s.lineMat.opacity        = 0.85;
      s.nDiv.classList.add('visible');
    } else {
      mat.emissiveIntensity    = 0.1;
      mat.opacity              = 0.18;
      s.edges.material.opacity = 0.08;
      s.lineMat.opacity        = 0.0;
      s.nDiv.classList.remove('visible');
    }
  });
}

function onSoarLayerLeave() {
  soarSubMeshes.forEach((s) => {
    s.mesh.material.emissiveIntensity = 0.5;
    s.mesh.material.opacity           = 0.88;
    s.edges.material.opacity          = 0.53;
    s.lineMat.opacity                 = 0.0;
    s.nDiv.classList.remove('visible');
  });
}
function buildArch3DStream(colorHex, srcIdx, dstIdx) {
  const pCount = 4, pLength = 16;
  const N = pCount * pLength;
  const positions = new Float32Array(N * 3);
  const colors    = new Float32Array(N * 3);
  const baseColor = new THREE.Color(colorHex);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.18, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
  });
  const pts = new THREE.Points(geo, mat);
  arch3dScene.add(pts);

  const offsets = new Float32Array(N);
  let idx = 0;
  for (let i = 0; i < pCount; i++) {
    const base = i / pCount;
    for (let j = 0; j < pLength; j++) {
      offsets[idx] = base - j * 0.007;
      const fade = Math.pow(1 - j / (pLength - 1), 1.5);
      const c = baseColor.clone().multiplyScalar(fade);
      if (j < 2) c.lerp(new THREE.Color(0xffffff), 0.6);
      colors[idx * 3]     = c.r;
      colors[idx * 3 + 1] = c.g;
      colors[idx * 3 + 2] = c.b;
      idx++;
    }
  }
  geo.attributes.color.needsUpdate = true;

  return { geo, offsets, pts, N, srcIdx, dstIdx };
}

/* ── Update stream mỗi frame ── */
function updateArch3DStream(stream) {
  const pos = stream.geo.attributes.position.array;

  // Xác định src/dst position
  let srcPos, dstPos;
  if (stream.srcIdx === -1) {
    // Network Traffic external source
    srcPos = NETWORK_POS.clone();
  } else {
    srcPos = NODE_POSITIONS[stream.srcIdx].clone();
  }
  dstPos = NODE_POSITIONS[stream.dstIdx].clone();

  // Curve uốn cong nhẹ qua mid-point
  const mid = srcPos.clone().lerp(dstPos, 0.5);
  // Uốn sang bên một chút để phân biệt các luồng song song
  const offset = (stream.srcIdx === -1 && stream.dstIdx === 2) ? -1.8
               : (stream.srcIdx === -1 && stream.dstIdx === 1) ?  1.8
               : (stream.srcIdx === 2)  ? -0.8
               : (stream.srcIdx === 1)  ?  0.8
               : 0;
  mid.x += offset * 0.5;
  mid.z += 1.2;

  const curve = new THREE.CatmullRomCurve3([srcPos, mid, dstPos]);

  for (let i = 0; i < stream.N; i++) {
    stream.offsets[i] += stream.speed;
    let tt = stream.offsets[i] % 1.0;
    if (tt < 0) tt += 1;
    const p = curve.getPoint(tt);
    pos[i * 3]     = p.x;
    pos[i * 3 + 1] = p.y;
    pos[i * 3 + 2] = p.z;
  }
  stream.geo.attributes.position.needsUpdate = true;
}

/* ── Animate loop cho Arch3D ── */
const arch3dClock = new THREE.Clock();

function arch3dAnimate() {
  arch3dAF = requestAnimationFrame(arch3dAnimate);
  const t = arch3dClock.getElapsedTime();

  arch3dControls.update();

  // Floating cho từng node
  arch3dNodeMeshes.forEach((nd, i) => {
    // Khi SOAR đang exploded thì giữ nguyên Y để sub-layers không trôi
    if (i === 0 && soarExploded) {
      // Đồng bộ soarSubGroup theo grp nếu user rotate
      if (soarSubGroup) {
        soarSubGroup.position.copy(nd.grp.position);
        soarSubGroup.quaternion.copy(arch3dScene.quaternion); // world-space
      }
      return;
    }
    nd.grp.position.y = NODE_POSITIONS[i].y + Math.sin(t * 0.8 + i * 1.1) * 0.12;
    // Pulse glow
    nd.light.intensity = (nd.mesh.userData.isSoar ? 3.5 : 2.0) + Math.sin(t * 1.5 + i) * 0.5;
  });

  // Rotate Network Torus
  if (arch3dNetGrp) {
    arch3dNetGrp.rotation.z = t * 0.6;
    arch3dNetGrp.position.y = NETWORK_POS.y + Math.sin(t * 0.7) * 0.1;
  }

  // Update TWEEN animations (camera zoom, explode, etc.)
  TWEEN.update();

  // Update flows
  arch3dFlowStreams.forEach(fl => updateArch3DStream(fl));

  arch3dRenderer.render(arch3dScene, arch3dCamera);
  arch3dLabelRenderer.render(arch3dScene, arch3dCamera);
}

/* ── Open / Close Arch3D overlay ── */
function openArch3D() {
  arch3dOpen = true;
  const overlay = document.getElementById('arch3d-overlay');
  overlay.classList.add('active');
  initArch3D();
  if (!arch3dAF) arch3dAnimate();
}

function closeArch3D() {
  arch3dOpen = false;
  document.getElementById('arch3d-overlay').classList.remove('active');
  if (arch3dAF) {
    cancelAnimationFrame(arch3dAF);
    arch3dAF = null;
  }
  // Reset SOAR explode state
  if (soarExploded) {
    soarSubMeshes.forEach(s => {
      s.mesh.material.opacity = 0;
    });
    if (soarSubGroup) { arch3dScene.remove(soarSubGroup); soarSubGroup = null; }
    soarSubMeshes = [];
    soarExploded = false;
    const soarNode = arch3dNodeMeshes[0];
    if (soarNode) { soarNode.mesh.visible = true; }
  }
  closeArch3DSoarPanel();
}

/* ── Open / Close SOAR panel bên trong Arch3D ── */
function openArch3DSoarPanel() {
  arch3dSoarOpen = true;
  document.getElementById('arch3d-soar-panel').classList.add('visible');
}
function closeArch3DSoarPanel() {
  arch3dSoarOpen = false;
  document.getElementById('arch3d-soar-panel').classList.remove('visible');
}

/* ─── 5. EVENT LISTENERS ────────────────────────────────────────── */
document.getElementById('btn-arch3d').addEventListener('click', openArch3D);
document.getElementById('btn-arch3d-close').addEventListener('click', closeArch3D);
document.getElementById('btn-asp-close').addEventListener('click', closeArch3DSoarPanel);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && arch3dOpen) {
    if (arch3dSoarOpen) { closeArch3DSoarPanel(); }
    else { closeArch3D(); }
  }
});