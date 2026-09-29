import { useEffect, useState } from 'react';
import { Activity, ArrowRight, AudioLines, Check, ChevronDown, CircleHelp, Crosshair, DoorOpen, Eye, Gauge, Keyboard, Pause, Play, RotateCcw, Shield, Sparkles, Volume2 } from 'lucide-react';

type PowerId = 'blink' | 'gravity' | 'cloak' | 'stasis' | 'shield';
type Power = { id: PowerId; name: string; short: string; kind: string; color: string; icon: typeof Crosshair; source: string; desc: string; drain: number };
const powers: Power[] = [
  { id: 'blink', name: 'PHASE SHIFT', short: 'BLINK', kind: 'MOVEMENT', color: '#80f0d2', icon: Crosshair, source: 'PHASE WRAITH', desc: 'Slip through matter. Reappear beyond the impossible.', drain: 18 },
  { id: 'gravity', name: 'GRAVITY WELL', short: 'GRAVITY', kind: 'CONTROL', color: '#a99aff', icon: Activity, source: 'ORBITAL CORE', desc: 'Invert your pull and turn the ceiling into a path.', drain: 22 },
  { id: 'cloak', name: 'SPECTRAL SKIN', short: 'CLOAK', kind: 'STEALTH', color: '#f5c76d', icon: Eye, source: 'VEIL DRONE', desc: 'Disappear from the sentry grid. Keep moving.', drain: 12 },
  { id: 'stasis', name: 'TEMPORAL LOCK', short: 'STASIS', kind: 'CONTROL', color: '#81bdff', icon: Gauge, source: 'CHRONO NODE', desc: 'Freeze the room. Borrow a few seconds from tomorrow.', drain: 26 },
  { id: 'shield', name: 'AEGIS FIELD', short: 'AEGIS', kind: 'DEFENSE', color: '#ff8992', icon: Shield, source: 'WARDEN UNIT', desc: 'Turn hostile energy into a temporary refuge.', drain: 16 },
];
const initialEnergy: Record<PowerId, number> = { blink: 78, gravity: 62, cloak: 91, stasis: 54, shield: 43 };
type Toast = { title: string; message: string; color: string } | null;

function App() {
  const [active, setActive] = useState<PowerId>('blink');
  const [energy, setEnergy] = useState(initialEnergy);
  const [charge, setCharge] = useState(42);
  const [toast, setToast] = useState<Toast>(null);
  const [playing, setPlaying] = useState(true);
  const [sound, setSound] = useState(false);
  const [help, setHelp] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [playerX, setPlayerX] = useState(19);
  const [playerY, setPlayerY] = useState(59);
  const [gravityOn, setGravityOn] = useState(false);
  const [cloakOn, setCloakOn] = useState(false);
  const [shieldOn, setShieldOn] = useState(false);
  const [stasisOn, setStasisOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const current = powers.find(p => p.id === active)!;

  useEffect(() => {
    const t = setInterval(() => {
      setEnergy(e => Object.fromEntries(Object.entries(e).map(([id, value]) => [id, Math.min(100, value + (id === active ? 0.4 : 0.17))])) as Record<PowerId, number>);
      setCharge(v => Math.min(100, v + 0.08));
    }, 180);
    return () => clearInterval(t);
  }, [active]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

  const borrow = (p: Power) => {
    if (!playing) return;
    if (energy[p.id] < p.drain) { setToast({ title: 'SIGNAL TOO WEAK', message: `${p.name} needs more charge to borrow.`, color: p.color }); return; }
    setActive(p.id); setEnergy(e => ({ ...e, [p.id]: Math.max(0, e[p.id] - p.drain) }));
    setToast({ title: 'BORROWED', message: `${p.name} · borrowed from ${p.source.toLowerCase()}`, color: p.color });
    if (p.id === 'cloak') setCloakOn(true);
    if (p.id === 'gravity') setGravityOn(v => !v);
    if (p.id === 'shield') setShieldOn(true);
    if (p.id === 'stasis') setStasisOn(v => !v);
  };
  const walk = (dx: number, dy: number) => {
    if (!playing) return;
    setPlayerX(x => Math.max(5, Math.min(84, x + dx)));
    setPlayerY(y => Math.max(28, Math.min(62, y + dy)));
    setCharge(c => Math.max(0, c - 0.7));
    if (playerX > 72 && !doorOpen) {
      setDoorOpen(true); setCycle(c => c + 1);
      setToast({ title: 'SECTOR BREACHED', message: 'A new memory fragment has been recovered.', color: '#80f0d2' });
    }
  };
  const action = () => {
    if (!playing) return;
    if (active === 'blink') {
      if (energy.blink < 8) { setToast({ title: 'PHASE LOW', message: 'The borrowed signal is nearly spent.', color: current.color }); return; }
      setEnergy(e => ({ ...e, blink: e.blink - 8 })); setPlayerX(x => Math.min(84, x + 17));
    } else if (active === 'gravity') setGravityOn(v => !v);
    else if (active === 'cloak') setCloakOn(v => !v);
    else if (active === 'stasis') setStasisOn(v => !v);
    else setShieldOn(v => !v);
    setToast({ title: `${current.short} ACTIVE`, message: 'Borrowed power engaged. Your charge is the cost.', color: current.color });
  };
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') walk(-3, 0);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') walk(3, 0);
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') walk(0, gravityOn ? 3 : -3);
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') walk(0, gravityOn ? -3 : 3);
      if (e.code === 'Space') action();
      if (e.key.toLowerCase() === 'e') { const next = (powers.findIndex(p => p.id === active) + 1) % powers.length; borrow(powers[next]); }
      if (e.key === 'Escape') setPlaying(v => !v);
    };
    window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
  });
  const restart = () => { setEnergy(initialEnergy); setCharge(42); setActive('blink'); setPlayerX(19); setPlayerY(59); setGravityOn(false); setCloakOn(false); setShieldOn(false); setStasisOn(false); setDoorOpen(false); setCycle(1); setPlaying(true); };

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><span/></span><span>BORROW<span className="brand-dot">.</span></span><span className="brand-divider"/><span className="chapter-tag">FIELD STUDY 01</span></a><div className="top-right"><div className="live-indicator"><i/> SIGNAL STABLE</div><div className="top-divider"/><button className="icon-button" aria-label="Toggle sound" onClick={() => setSound(!sound)}>{sound ? <Volume2 size={17}/> : <AudioLines size={17}/>}</button><button className="icon-button" aria-label="Help" onClick={() => setHelp(!help)}><CircleHelp size={17}/></button><div className="avatar">N<span>7</span></div></div></header>
    <section className="content" id="top">
      <div className="intro-row"><div><div className="eyebrow"><span className="eyebrow-line"/> ARCHIVE 09 <span className="eyebrow-slash">/</span> THE HOLLOW CIRCUIT</div><h1>Borrow what you need.<br/><em>Pay what it costs.</em></h1><p className="intro-copy">The station remembers every power it gives away. Find your way through the dark before it remembers you.</p></div><div className="level-meta"><div className="meta-label">CURRENT LOCATION</div><div className="meta-place"><span className="location-dot"/> THE SUNKEN ARRAY <ChevronDown size={15}/></div><div className="meta-sub">Sector 04 <span>·</span> {String(cycle).padStart(2,'0')}:14 local</div></div></div>
      <div className="game-layout">
        <div className="game-column"><div className="game-frame"><div className="game-topline"><span><span className="game-live"/> LIVE SIMULATION <span className="topline-sep">/</span> {playing ? 'RUNNING' : 'PAUSED'}</span><span className="game-coords">X {String(Math.round(playerX * 12)).padStart(4,'0')} <span>·</span> Z {gravityOn ? '+084' : '-032'}</span></div>
          <div className={`world ${gravityOn ? 'gravity-mode' : ''} ${stasisOn ? 'stasis-mode' : ''}`}>
            <div className="world-wash"/><div className="stars star-one"/><div className="stars star-two"/><div className="scanline"/>
            <div className="world-title"><span>ENVIRONMENTAL SCAN</span><strong>HOLLOW<span>—</span>04</strong><small>ATMOSPHERE UNSTABLE</small></div><div className="world-label label-left"><i/> DEAD CIRCUIT <b>01</b></div><div className="world-label label-right">POWER SOURCE <i/></div>
            <div className="arch arch-one"/><div className="arch arch-two"/><div className="beam beam-a"/><div className="beam beam-b"/><div className="platform platform-a"/><div className="platform platform-b"/><div className="platform platform-c"/><div className="platform platform-d"/><div className="platform platform-e"/><div className="platform platform-f"/>
            <div className="hazard hazard-a"><span/></div><div className="hazard hazard-b"><span/></div><div className="hazard hazard-c"><span/></div>
            <div className="source source-wraith" title="Phase wraith — click to borrow"><span className="source-eye"/><span className="source-orbit"/><span className="source-name">WRAITH</span></div><div className="source source-core" title="Orbital core — click to borrow"><div className="core-ring"/><div className="core-sphere"/><span className="source-name">CORE</span></div><div className="source source-drone" title="Veil drone — click to borrow"><span className="drone-eye"/><span className="source-name">VEIL</span></div>
            <button className="exit-gate" onClick={() => {setPlayerX(81); if(!doorOpen){setDoorOpen(true);setCycle(c=>c+1);setToast({title:'SECTOR BREACHED',message:'A new memory fragment has been recovered.',color:'#80f0d2'});}}}><span className="gate-rune">⌁</span><span className="gate-label">EXIT<br/>GATE</span></button>
            <div className={`player ${cloakOn ? 'cloaked' : ''} ${shieldOn ? 'shielded' : ''}`} style={{ left: `${playerX}%`, top: `${playerY}%` }}><span className="player-glow"/><span className="player-body"><i/><b/><span/></span><span className="player-shadow"/></div>
            {doorOpen && <div className="gate-open-label">PATH RESTORED</div>}
            {gravityOn && <div className="mode-chip gravity-chip"><Activity size={11}/> GRAVITY INVERTED</div>}{cloakOn && <div className="mode-chip cloak-chip"><Eye size={11}/> SPECTRAL SKIN</div>}{stasisOn && <div className="stasis-overlay"><div><span>TIME HELD</span><strong>00:07</strong></div></div>}
            {!playing && <div className="pause-overlay"><div><Pause size={22}/><strong>SIMULATION PAUSED</strong><span>Take a breath, Borrower.</span></div></div>}
            <div className="world-bottom"><span><span className="world-bottom-dot"/> BIO-SIGNATURE <b>DETECTED</b></span><span>GRAVITY <b>{gravityOn ? 'INVERTED' : '0.8 G'}</b></span></div>
          </div>
          <div className="game-controls"><div className="control-hint"><span className="keycap">W</span><span className="keycap">A</span><span className="keycap">S</span><span className="keycap">D</span><span className="hint-label">MOVE</span><span className="control-spacer"/><span className="keycap wide">SPACE</span><span className="hint-label">USE POWER</span><span className="keycap">E</span><span className="hint-label">CYCLE</span></div><div className="sim-buttons"><button className="game-action" onClick={action}><Play size={13} fill="currentColor"/> {current.short}</button><button className="icon-button mini" aria-label={playing ? 'Pause simulation' : 'Resume simulation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14}/> : <Play size={14}/>}</button><button className="icon-button mini" aria-label="Restart level" onClick={restart}><RotateCcw size={14}/></button></div></div>
        </div></div>
        <aside className="side-panel"><section className="resource-card"><div className="panel-kicker"><span>YOUR RESERVES</span><span className="pulse-dot"/> LIVE</div><div className="resource-heading"><div><h2>Borrowing<br/>capacity</h2><p>Shared neural charge</p></div><div className="charge-ring" style={{'--charge':`${charge}%`} as React.CSSProperties}><div><strong>{Math.round(charge)}</strong><small>%</small></div></div></div><div className="charge-track"><span style={{width:`${charge}%`}}/></div><div className="resource-footer"><span>NEURAL RESERVE</span><span>RECHARGING <i>↑</i></span></div></section>
          <section className="power-section"><div className="section-heading"><div><span className="panel-kicker">AVAILABLE SIGNALS</span><h2>Borrow a power</h2></div><span className="signal-count">0{powers.length}</span></div><p className="power-note">One signal at a time. Every gift takes something back.</p><div className="power-list">{powers.map((p, i) => {const Icon=p.icon; const selected=active===p.id; return <button key={p.id} className={`power-card ${selected?'selected':''}`} style={{'--power':p.color} as React.CSSProperties} onClick={() => borrow(p)}><span className="power-icon"><Icon size={16}/></span><span className="power-info"><span className="power-name">{p.name}</span><span className="power-type">{p.kind} <i>·</i> {p.source}</span></span><span className="power-right"><span className="borrow-cost">−{p.drain}</span><span className="power-meter"><i style={{width:`${energy[p.id]}%`}}/></span></span><span className="power-index">0{i+1}</span>{selected && <span className="selected-line"/>}</button>;})}</div><div className="tradeoff-note"><Sparkles size={14}/><p><strong>Borrowing is a trade.</strong><br/>Active signals draw from your neural reserve. Let one go to recover the rest.</p><button aria-label="Dismiss tip" onClick={() => setToast({title:'SIGNAL ECONOMY',message:'Using powers costs shared neural reserve. Inactive borrowed powers slowly recharge.',color:'#80f0d2'})}>↗</button></div></section>
          <section className="objective"><div className="objective-icon"><DoorOpen size={16}/></div><div><span className="panel-kicker">ACTIVE OBJECTIVE</span><strong>Find the signal source</strong><span className="objective-sub">Reach the gate beyond the dead circuit.</span></div><span className="objective-status"><span/></span></section>
        </aside></div>
      <div className="bottom-row"><div className="mission-progress"><span className="panel-kicker">MEMORY FRAGMENTS</span><div className="fragment-track"><i/><i/><i/><i/><i/></div><span className="fragment-count">{String(Math.min(cycle,5)).padStart(2,'0')} <b>/ 05</b></span><span className="progress-divider"/><span className="progress-caption">THE STATION IS STARTING TO REMEMBER YOU</span></div><div className="bottom-caption">A BORROWER'S GUIDE <span>—</span> REV. 01.09</div></div>
    </section>
    <footer className="footer"><span>© 2089 <i>·</i> EIDOLON RESEARCH DIVISION</span><span className="footer-center"><span/> SYSTEMS NOMINAL <i>·</i> SESSION {String(cycle).padStart(2,'0')}-C</span><span>BUILT FOR THE IN-BETWEEN <b>✳</b></span></footer>
    {toast && <div className="toast" style={{'--power':toast.color} as React.CSSProperties}><span className="toast-icon"><Check size={14}/></span><span><b>{toast.title}</b><small>{toast.message}</small></span></div>}
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setHelp(false)}>×</button><div className="eyebrow"><span className="eyebrow-line"/> BORROWER'S FIELD NOTES</div><h2>Everything has a cost.</h2><p>Choose a signal to borrow it from its source. Your neural reserve recharges over time, but borrowing a power drains its signal energy.</p><div className="help-shortcuts"><span><Keyboard size={16}/> <b>WASD / ARROWS</b> Move through the array</span><span><span className="keycap wide">SPACE</span> <b>USE POWER</b> Activate your borrowed signal</span><span><span className="keycap">E</span> <b>CYCLE</b> Borrow the next signal</span><span><span className="keycap">ESC</span> <b>PAUSE</b> Suspend the simulation</span></div><button className="modal-continue" onClick={() => setHelp(false)}>BACK TO THE ARRAY <ArrowRight size={14}/></button></section></div>}
  </main>;
}

export default App;
