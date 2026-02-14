import { useState, useEffect, useRef, useCallback } from "react";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const MenuIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6" x2="19" y2="6"/><line x1="3" y1="12" x2="19" y2="12"/><line x1="3" y1="18" x2="19" y2="18"/>
  </svg>
);
const XIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="4" y1="4" x2={size-4} y2={size-4}/><line x1={size-4} y1="4" x2="4" y2={size-4}/>
  </svg>
);
const ChevronIcon = ({ up }) => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {up ? <polyline points="4,14 10,8 16,14"/> : <polyline points="4,8 10,14 16,8"/>}
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="9" cy="6" r="3"/><path d="M3 18c0-3.31 2.69-6 6-6s6 2.69 6 6"/><path d="M15.5 4.5a2.5 2.5 0 0 1 0 5M19 18c0-2.76-1.57-5.13-3.87-6.25"/>
  </svg>
);
const GridIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="5" height="5"/><rect x="10" y="3" width="5" height="5"/>
    <rect x="3" y="10" width="5" height="5"/><rect x="10" y="10" width="5" height="5"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-4.51"/>
  </svg>
);
const TrendingIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getRoleLabel = (role) => {
  const map = { setter:'SPE', outside:'PL', middle:'MID', opposite:'DIA', libero:'L' };
  return map[role] || role?.toUpperCase().slice(0,3) || '?';
};

const TABS = [
  ['players', UsersIcon, 'Spelers'],
  ['lineup', GridIcon, 'Opstelling'],
  ['subs', RefreshIcon, 'Wissels'],
  ['heatmap', GridIcon, 'Heatmap'],
  ['stats', TrendingIcon, 'Stats'],
  ['matches', GridIcon, 'Wedstrijden'],
];

// ─── BOTTOMSHEET ─────────────────────────────────────────────────────────────
function BottomSheet({ open, onClose, title, children, snapPoints = [0.4, 0.85] }) {
  const [snapIdx, setSnapIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const startY = useRef(null);
  const sheetRef = useRef(null);

  const currentSnap = snapPoints[snapIdx];
  const targetHeight = `${currentSnap * 100}vh`;

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
    setDragDelta(0);
  };

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    setDragDelta(delta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragDelta > 80) {
      if (snapIdx === 0) onClose();
      else setSnapIdx(i => i - 1);
    } else if (dragDelta < -60) {
      if (snapIdx < snapPoints.length - 1) setSnapIdx(i => i + 1);
    }
    setDragDelta(0);
    startY.current = null;
  };

  const cycleSnap = () => {
    if (snapIdx < snapPoints.length - 1) setSnapIdx(i => i + 1);
    else onClose();
  };

  useEffect(() => {
    if (open) setSnapIdx(0);
  }, [open]);

  const translateY = isDragging ? `calc(${dragDelta}px)` : '0px';
  const sheetHeight = isDragging
    ? `calc(${targetHeight} - ${dragDelta}px)`
    : targetHeight;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
        style={{
          height: open ? sheetHeight : '0px',
          minHeight: open ? '120px' : '0px',
          transform: open ? `translateY(${translateY})` : 'translateY(100%)',
          transition: isDragging ? 'none' : 'height 0.35s cubic-bezier(0.32,0.72,0,1), transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 40px rgba(220,38,38,0.25), 0 -1px 0 rgba(220,38,38,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle area */}
        <div
          className="flex-shrink-0 flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{
            width: 40, height: 4,
            background: 'rgba(220,38,38,0.6)',
            borderRadius: 2,
            marginBottom: 8
          }} />
          <div className="flex items-center justify-between w-full px-4 pb-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ color: '#e5e7eb', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em' }}>
              {title}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={cycleSnap}
                style={{ color: '#9ca3af', padding: '4px', borderRadius: 8 }}
              >
                <ChevronIcon up={snapIdx < snapPoints.length - 1} />
              </button>
              <button
                onClick={onClose}
                style={{ color: '#9ca3af', padding: '4px', borderRadius: 8 }}
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation inside sheet */}
        <div className="flex-shrink-0 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex px-2 py-1 gap-1" style={{ minWidth: 'max-content' }}>
            {TABS.map(([id, Icon, label]) => (
              <button
                key={id}
                data-tab={id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: 'transparent',
                  color: '#9ca3af',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => {
                  const active = e.currentTarget.getAttribute('data-active') === 'true';
                  e.currentTarget.style.background = active ? 'rgba(220,38,38,0.2)' : 'transparent';
                  e.currentTarget.style.color = active ? '#fff' : '#9ca3af';
                }}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '12px 16px 24px' }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ─── SLIDING MENU (DESKTOP SIDEBAR) ──────────────────────────────────────────
function SideMenu({ open, onClose, activeTab, setActiveTab, children }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
      )}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 320,
          background: '#0d0d0d',
          borderLeft: '2px solid rgba(220,38,38,0.5)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.7)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: 1
            }}>VCV</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>VCV Tracker</div>
              <div style={{ color: '#6b7280', fontSize: 11 }}>Volleybal Tracker</div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#6b7280', padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <XIcon size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-3 gap-1">
            {TABS.map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: activeTab === id ? 'rgba(220,38,38,0.25)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === id ? '#f87171' : '#9ca3af',
                  border: activeTab === id ? '1px solid rgba(220,38,38,0.4)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {children}
        </div>
      </div>
    </>
  );
}

// ─── VOLLEYBALL TRACKER ───────────────────────────────────────────────────────
export default function VolleyballTracker() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  const [isMobile, setIsMobile] = useState(false);

  const [players, setPlayers] = useState([
    { id: 1, name: 'Speler 1', number: 1, role: 'setter' },
    { id: 2, name: 'Speler 2', number: 2, role: 'outside' },
    { id: 3, name: 'Speler 3', number: 3, role: 'middle' },
    { id: 4, name: 'Speler 4', number: 4, role: 'opposite' },
    { id: 5, name: 'Speler 5', number: 5, role: 'outside' },
    { id: 6, name: 'Speler 6', number: 6, role: 'middle' },
    { id: 7, name: 'Libero',   number: 7, role: 'libero', isLibero: true },
  ]);

  const [homeLineup, setHomeLineup] = useState({ 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, libero:7 });
  const [awayLineup, setAwayLineup] = useState({ 1:101, 2:102, 3:103, 4:104, 5:105, 6:106 });
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore]  = useState(0);
  const [sets, setSets] = useState({ home:0, away:0 });
  const [homeTimeouts, setHomeTimeouts] = useState([]);
  const [awayTimeouts, setAwayTimeouts] = useState([]);
  const [servingTeam, setServingTeam] = useState('home');
  const [scoreHistory, setScoreHistory] = useState([]);
  const [heatmapData, setHeatmapData]   = useState([]);
  const [savedHeatmaps, setSavedHeatmaps] = useState([]);
  const [setEnded, setSetEnded] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  const [setWinner, setSetWinner] = useState(null);
  const [matchWinner, setMatchWinner] = useState(null);
  const [showLineupConfirm, setShowLineupConfirm] = useState(false);
  const [substitutions, setSubstitutions] = useState([]);
  const [opponentName, setOpponentName] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showServingDialog, setShowServingDialog] = useState(false);
  const [showPointTypePopup, setShowPointTypePopup] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showNewMatchDialog, setShowNewMatchDialog] = useState(false);
  const [savedMatches, setSavedMatches] = useState([]);
  const [pointStats, setPointStats] = useState({
    home: { direct:0, sideout:0, block:0, attack:0, error:0 },
    away: { direct:0, sideout:0, block:0, attack:0, error:0 },
  });
  const [inServicePosition, setInServicePosition] = useState(true);
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [showServiceFaultPopup, setShowServiceFaultPopup] = useState(null);
  const [substitutionMode, setSubstitutionMode] = useState(false);
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState(null);

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showAlert = (msg) => { setAlertMessage(msg); setTimeout(() => setAlertMessage(null), 2500); };

  const updatePlayer = (id, field, value) => {
    setPlayers(ps => ps.map(p => p.id !== id ? p : { ...p, [field]: value,
      ...(field==='isLibero' && value ? { role:'libero' } : {}),
      ...(field==='isLibero' && !value && p.role==='libero' ? { role:'outside' } : {}),
    }));
  };

  const addPlayer = () => {
    const newId = Math.max(...players.map(p => p.id), 0) + 1;
    setPlayers(ps => [...ps, { id:newId, name:`Speler ${newId}`, number:newId, role:'outside' }]);
  };

  const updateLineup = (team, pos, val) => {
    if (team === 'home') setHomeLineup(l => ({ ...l, [pos]: val }));
    else setAwayLineup(l => ({ ...l, [pos]: val }));
  };

  const confirmLineup = () => {
    setMenuOpen(false);
    setBottomSheetOpen(false);
    if (sets.home === 0 && sets.away === 0 && homeScore === 0 && awayScore === 0) {
      setShowServingDialog(true);
    }
  };

  const rotateHome = () => setHomeLineup(l => ({ 1:l[2],2:l[3],3:l[4],4:l[5],5:l[6],6:l[1], libero:l.libero }));
  const rotateAway = () => setAwayLineup(l => ({ 1:l[2],2:l[3],3:l[4],4:l[5],5:l[6],6:l[1] }));

  const scorePoint = (team, x, y) => {
    if (setEnded || matchEnded) return;
    setInServicePosition(false);
    setShowPointTypePopup({ team, x, y });
  };

  const confirmPointType = (type) => {
    const { team, x, y } = showPointTypePopup;
    setHeatmapData(h => [...h, { team, x, y, type }]);
    setPointStats(prev => ({ ...prev, [team]: { ...prev[team], [type]: prev[team][type]+1 } }));

    let newHome = homeScore, newAway = awayScore;
    if (team === 'home') {
      newHome++;
      setHomeScore(newHome);
      setScoreHistory(h => [...h, { score:`${newHome}-${awayScore}`, team, type }]);
    } else {
      newAway++;
      setAwayScore(newAway);
      setScoreHistory(h => [...h, { score:`${homeScore}-${newAway}`, team, type }]);
    }

    if (team !== servingTeam) {
      team === 'home' ? rotateHome() : rotateAway();
      setServingTeam(team);
    } else {
      setInServicePosition(true);
    }

    const is5th = sets.home === 2 && sets.away === 2;
    const target = is5th ? 15 : 25;
    if (newHome >= target && newHome - newAway >= 2) endSet('home');
    else if (newAway >= target && newAway - newHome >= 2) endSet('away');

    setShowPointTypePopup(null);
  };

  const endSet = (winner) => {
    const ns = winner === 'home' ? { home:sets.home+1, away:sets.away } : { home:sets.home, away:sets.away+1 };
    setSets(ns);
    setSetEnded(true);
    setSetWinner(winner);
    if (heatmapData.length > 0) {
      setSavedHeatmaps(sh => [...sh, { setNumber:sets.home+sets.away+1, data:heatmapData, finalScore:`${homeScore}-${awayScore}`, winner }]);
    }
    if (ns.home === 3 || ns.away === 3) {
      setMatchEnded(true);
      setMatchWinner(ns.home === 3 ? 'home' : 'away');
      setShowSaveDialog(true);
      if (winner === 'home') spawnConfetti();
    } else {
      setShowLineupConfirm(true);
    }
  };

  const spawnConfetti = () => {
    setConfetti(Array.from({length:50},(_,i) => ({ id:i, left:Math.random()*100, delay:Math.random()*2 })));
    setTimeout(() => setConfetti([]), 4000);
  };

  const startNewSet = (keepLineup) => {
    setHomeScore(0); setAwayScore(0);
    setScoreHistory([]); setHeatmapData([]);
    setHomeTimeouts([]); setAwayTimeouts([]);
    setSetEnded(false); setSetWinner(null);
    setShowLineupConfirm(false);
    setSubstitutions([]); setInServicePosition(true);
    setPointStats({ home:{direct:0,sideout:0,block:0,attack:0,error:0}, away:{direct:0,sideout:0,block:0,attack:0,error:0} });
    setServingTeam('home');
    if (!keepLineup) {
      setActiveTab('lineup');
      isMobile ? setBottomSheetOpen(true) : setMenuOpen(true);
    }
  };

  const serviceFault = (servingTeamArg) => {
    if (setEnded || matchEnded) return;
    // De serverende ploeg maakt een fout → tegenstander scoort
    const scoringTeam = servingTeamArg === 'home' ? 'away' : 'home';
    setShowServiceFaultPopup({ scoringTeam });
  };

  const confirmServiceFault = (faultType) => {
    const { scoringTeam } = showServiceFaultPopup;
    setShowServiceFaultPopup(null);
    // Registreer als punt voor de ontvangende ploeg, type = 'error' (servicefout)
    setHeatmapData(h => [...h, { team: scoringTeam, x: 50, y: 50, type: 'servicefault' }]);
    setPointStats(prev => ({ ...prev, [scoringTeam]: { ...prev[scoringTeam], error: prev[scoringTeam].error + 1 } }));

    let newHome = homeScore, newAway = awayScore;
    if (scoringTeam === 'home') {
      newHome++;
      setHomeScore(newHome);
      setScoreHistory(h => [...h, { score:`${newHome}-${awayScore}`, team: scoringTeam, type: 'servicefault', faultType }]);
    } else {
      newAway++;
      setAwayScore(newAway);
      setScoreHistory(h => [...h, { score:`${homeScore}-${newAway}`, team: scoringTeam, type: 'servicefault', faultType }]);
    }

    // Serveerteam wisselt naar de ploeg die het punt scoorde
    if (scoringTeam !== servingTeam) {
      scoringTeam === 'home' ? rotateHome() : rotateAway();
      setServingTeam(scoringTeam);
    } else {
      setInServicePosition(true);
    }

    const is5th = sets.home === 2 && sets.away === 2;
    const target = is5th ? 15 : 25;
    if (newHome >= target && newHome - newAway >= 2) endSet('home');
    else if (newAway >= target && newAway - newHome >= 2) endSet('away');
  };

  const takeTimeout = (team) => {
    const score = `${homeScore}-${awayScore}`;
    if (team === 'home') {
      if (homeTimeouts.length >= 2) { showAlert('⚠️ Max 2 timeouts per set'); return; }
      setHomeTimeouts(t => [...t, score]);
    } else {
      if (awayTimeouts.length >= 2) { showAlert('⚠️ Max 2 timeouts per set'); return; }
      setAwayTimeouts(t => [...t, score]);
    }
  };

  const makeSubstitution = (courtPlayerId) => {
    if (!selectedBenchPlayer) return;
    if (substitutions.length >= 6) { showAlert('⚠️ Max 6 wissels per set'); setSubstitutionMode(false); setSelectedBenchPlayer(null); return; }
    setHomeLineup(l => {
      const pos = Object.entries(l).find(([,v]) => v === courtPlayerId)?.[0];
      if (!pos) return l;
      return { ...l, [pos]: selectedBenchPlayer };
    });
    setSubstitutions(s => [...s, { playerOut:courtPlayerId, playerIn:selectedBenchPlayer }]);
    setSubstitutionMode(false);
    setSelectedBenchPlayer(null);
  };

  const saveMatch = () => {
    if (!opponentName.trim()) { showAlert('⚠️ Vul tegenstander in'); return; }
    const data = { id:Date.now(), opponent:opponentName, date:matchDate, finalScore:sets, winner:matchWinner, savedHeatmaps, substitutions, pointStats, scoreHistory };
    const updated = [...savedMatches, data];
    setSavedMatches(updated);
    setShowSaveDialog(false);
    showAlert('✅ Wedstrijd opgeslagen!');
  };

  const confirmNewMatch = () => {
    if (!opponentName.trim()) { showAlert('⚠️ Vul tegenstander in'); return; }
    setHomeScore(0); setAwayScore(0); setSets({home:0,away:0});
    setHomeTimeouts([]); setAwayTimeouts([]);
    setScoreHistory([]); setHeatmapData([]); setSavedHeatmaps([]);
    setSubstitutions([]); setSetEnded(false); setMatchEnded(false);
    setSetWinner(null); setMatchWinner(null); setInServicePosition(true);
    setPointStats({ home:{direct:0,sideout:0,block:0,attack:0,error:0}, away:{direct:0,sideout:0,block:0,attack:0,error:0} });
    setShowNewMatchDialog(false);
    setShowServingDialog(true);
  };

  // ── Position helpers ──
  // Standaard volleybal rotatie (gezien vanuit eigen helft):
  // Pos 1 = rechts achter (serveur), 2 = rechts voor, 3 = midden voor
  // Pos 4 = links voor, 5 = links achter, 6 = midden achter
  const getPositionStyle = (pos, isAway, playerId = null) => {
    const isServingTeam = isAway ? servingTeam === 'away' : servingTeam === 'home';
    const player = playerId ? players.find(p => p.id === playerId) : null;
    const isSetter = player?.role === 'setter';

    // Voorspelers (2,3,4): aan het net als serverende team of als spelverdeler
    // Teruggetrokken naar 3m-lijn (~33%) als ontvangend team (behalve setter)
    const frontRowTop = (isServingTeam || isSetter) ? '12%' : '33%';
    const frontRowBottom = (isServingTeam || isSetter) ? '88%' : '67%';

    // Home posities
    const homePositions = {
      1: { left: '75%', top: '78%' },
      2: { left: '75%', top: frontRowTop },
      3: { left: '50%', top: frontRowTop },
      4: { left: '25%', top: frontRowTop },
      5: { left: '25%', top: '78%' },
      6: { left: '50%', top: '78%' },
    };
    // Away posities (gespiegeld)
    const awayPositions = {
      1: { left: '25%', top: '22%' },
      2: { left: '25%', top: frontRowBottom },
      3: { left: '50%', top: frontRowBottom },
      4: { left: '75%', top: frontRowBottom },
      5: { left: '75%', top: '22%' },
      6: { left: '50%', top: '22%' },
    };
    const positions = isAway ? awayPositions : homePositions;
    const base = positions[pos] || { left: '50%', top: '50%' };
    return { position: 'absolute', ...base, transform: 'translate(-50%, -50%)' };
  };

  const shirtColors = { home:'#dc2626', away:'#2563eb', libero:'#475569' };

  const renderPlayer = (playerId, position, isAway) => {
    const player = players.find(p => p.id === playerId);
    const isServing = position === 1 && ((isAway && servingTeam==='away') || (!isAway && servingTeam==='home'));
    const color = player?.isLibero ? shirtColors.libero : (isAway ? shirtColors.away : shirtColors.home);
    const isOnCourt = !isAway && Object.values(homeLineup).includes(playerId);

    const handleClick = (e) => {
      e.stopPropagation();
      if (!isAway && substitutionMode && selectedBenchPlayer) {
        makeSubstitution(playerId);
      } else if (!substitutionMode && !showPointTypePopup) {
        const style = getPositionStyle(position, isAway, playerId);
        const x = parseFloat(style.left || 50);
        const y = parseFloat(style.top || 50);
        scorePoint(isAway ? 'home' : 'away', x, y);
      }
    };

    return (
      <div
        key={`${position}-${isAway}`}
        style={{ ...getPositionStyle(position, isAway, playerId), zIndex:20, cursor:'pointer', transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)', width:50, height:50 }}
        onClick={handleClick}
      >
        <svg viewBox="0 0 24 24" style={{ width:'100%', height:'100%', filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>
          <path d="M8 3l4 2 4-2 5 3-3 5v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V11L3 6l5-3z" fill={color} stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"/>
          <text x="12" y="13" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">
            {player?.number || playerId}
          </text>
          <text x="12" y="19" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="4">
            {player ? getRoleLabel(player.role) : '?'}
          </text>
        </svg>
        {isServing && (
          <div style={{ position:'absolute', top:'-22px', left:'50%', transform:'translateX(-50%)' }}>
            <svg viewBox="0 0 100 100" style={{ width:22, height:22, animation:'bounce 1s infinite' }}>
              <defs>
                <radialGradient id="bg" cx="35%" cy="35%">
                  <stop offset="0%" stopColor="#fff"/>
                  <stop offset="100%" stopColor="#fbbf24"/>
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#bg)" stroke="#f59e0b" strokeWidth="2"/>
              <path d="M20 30Q15 50,20 70Q35 75,50 70Q35 50,50 30Q35 25,20 30Z" fill="none" stroke="#d97706" strokeWidth="2.5" opacity="0.8"/>
              <path d="M80 30Q85 50,80 70Q65 75,50 70Q65 50,50 30Q65 25,80 30Z" fill="none" stroke="#d97706" strokeWidth="2.5" opacity="0.8"/>
            </svg>
          </div>
        )}
      </div>
    );
  };

  const renderHomeLineup = () => [1,2,3,4,5,6].map(pos => {
    let id = homeLineup[pos];
    const playerData = players.find(p => p.id === id);
    if (homeLineup.libero && playerData?.role === 'middle' && (pos === 5 || pos === 6)) {
      id = homeLineup.libero;
    }
    return id ? renderPlayer(id, pos, false) : null;
  });

  const renderAwayLineup = () => [1,2,3,4,5,6].map(pos =>
    awayLineup[pos] ? renderPlayer(awayLineup[pos], pos, true) : null
  );

  const fieldPlayers = Object.values(homeLineup).slice(0,6);
  const benchPlayers = players.filter(p => !fieldPlayers.includes(p.id) && p.id !== homeLineup.libero);

  // ── Tab content ──
  const renderTabContent = () => {
    switch (activeTab) {
      case 'players':
        return (
          <div>
            <div style={{ color:'#e5e7eb', fontWeight:700, fontSize:14, marginBottom:10 }}>Spelers Beheer</div>
            {players.map(p => (
              <div key={p.id} style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'10px 12px', marginBottom:8, border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                  <input value={p.name} onChange={e => updatePlayer(p.id, 'name', e.target.value)}
                    style={{ flex:1, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, padding:'5px 8px', color:'#fff', fontSize:13 }}/>
                  <input type="number" value={p.number} onChange={e => updatePlayer(p.id, 'number', +e.target.value)}
                    style={{ width:52, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, padding:'5px 6px', color:'#fff', fontSize:13, textAlign:'center' }}/>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <select value={p.role||'outside'} onChange={e => updatePlayer(p.id,'role',e.target.value)} disabled={p.isLibero}
                    style={{ flex:1, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, padding:'4px 6px', color:'#fff', fontSize:12 }}>
                    <option value="setter">Spelverdeler (SPE)</option>
                    <option value="outside">Passer/Loper (PL)</option>
                    <option value="middle">Midden (MID)</option>
                    <option value="opposite">Diagonaal (DIA)</option>
                    <option value="libero">Libero (L)</option>
                  </select>
                  <label style={{ display:'flex', alignItems:'center', gap:4, color:'#9ca3af', fontSize:12, cursor:'pointer', whiteSpace:'nowrap' }}>
                    <input type="checkbox" checked={!!p.isLibero} onChange={e => updatePlayer(p.id,'isLibero',e.target.checked)} /> L
                  </label>
                  <button onClick={() => setPlayers(ps => ps.filter(pp => pp.id !== p.id))}
                    style={{ background:'rgba(220,38,38,0.3)', color:'#f87171', border:'1px solid rgba(220,38,38,0.4)', borderRadius:7, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addPlayer}
              style={{ width:'100%', background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.3)', borderRadius:10, padding:'10px', fontSize:13, fontWeight:600, cursor:'pointer', marginTop:4 }}>
              + Speler Toevoegen
            </button>
          </div>
        );

      case 'lineup':
        return (
          <div>
            <div style={{ color:'#e5e7eb', fontWeight:700, fontSize:14, marginBottom:10 }}>Opstelling Invoeren</div>
            <div style={{ marginBottom:12 }}>
              <label style={{ color:'#9ca3af', fontSize:12, display:'block', marginBottom:4 }}>Tegenstander</label>
              <input value={opponentName} onChange={e => setOpponentName(e.target.value)} placeholder="Naam tegenstander"
                style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 10px', color:'#fff', fontSize:13, boxSizing:'border-box' }}/>
            </div>
            <div style={{ color:'#f87171', fontWeight:600, fontSize:13, marginBottom:8 }}>Ons Team</div>
            {[1,2,3,4,5,6].map(pos => (
              <div key={pos} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ color:'#6b7280', fontSize:12, width:35, flexShrink:0 }}>Pos {pos}</span>
                <select value={homeLineup[pos]||''} onChange={e => updateLineup('home', pos, +e.target.value)}
                  style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 8px', color:'#fff', fontSize:12 }}>
                  <option value="">—</option>
                  {players.filter(p=>!p.isLibero).map(p => <option key={p.id} value={p.id}>{p.name} #{p.number} ({getRoleLabel(p.role)})</option>)}
                </select>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span style={{ color:'#6b7280', fontSize:12, width:35, flexShrink:0 }}>Libero</span>
              <select value={homeLineup.libero||''} onChange={e => updateLineup('home','libero',+e.target.value)}
                style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 8px', color:'#fff', fontSize:12 }}>
                <option value="">—</option>
                {players.filter(p=>p.isLibero).map(p => <option key={p.id} value={p.id}>{p.name} #{p.number}</option>)}
              </select>
            </div>
            <button onClick={confirmLineup}
              style={{ width:'100%', background:'rgba(34,197,94,0.2)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.4)', borderRadius:10, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              ✓ Bevestig Opstelling
            </button>
          </div>
        );

      case 'subs':
        return (
          <div>
            <div style={{ color:'#e5e7eb', fontWeight:700, fontSize:14, marginBottom:10 }}>Wissels ({substitutions.length}/6)</div>
            <div style={{ color:'#9ca3af', fontSize:12, marginBottom:12 }}>
              Klik een bankspeler aan → dan een veldspeler om te wisselen.
            </div>
            <div style={{ color:'#f87171', fontWeight:600, fontSize:12, marginBottom:8 }}>Bank</div>
            {benchPlayers.length === 0 && (
              <div style={{ color:'#6b7280', fontSize:12, textAlign:'center', padding:16 }}>Alle spelers staan op het veld</div>
            )}
            {benchPlayers.map(p => (
              <div key={p.id}
                onClick={() => { setSubstitutionMode(true); setSelectedBenchPlayer(p.id); setBottomSheetOpen(false); setMenuOpen(false); showAlert(`Selecteer veldspeler voor ${p.name}`); }}
                style={{ background: selectedBenchPlayer===p.id ? 'rgba(220,38,38,0.25)' : 'rgba(255,255,255,0.05)', border:`1px solid ${selectedBenchPlayer===p.id ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius:10, padding:'10px 12px', marginBottom:8, display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#fff', flexShrink:0 }}>{p.number}</div>
                <div>
                  <div style={{ color:'#fff', fontWeight:600, fontSize:13 }}>{p.name}</div>
                  <div style={{ color:'#9ca3af', fontSize:11 }}>{getRoleLabel(p.role)}</div>
                </div>
              </div>
            ))}
            {substitutions.length > 0 && (
              <>
                <div style={{ color:'#f87171', fontWeight:600, fontSize:12, marginTop:12, marginBottom:8 }}>Gedane Wissels</div>
                {substitutions.map((s,i) => {
                  const pIn = players.find(p=>p.id===s.playerIn);
                  const pOut = players.find(p=>p.id===s.playerOut);
                  return (
                    <div key={i} style={{ color:'#9ca3af', fontSize:12, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color:'#4ade80' }}>{pIn?.name||'?'} #{pIn?.number}</span>
                      <span style={{ margin:'0 6px' }}>↔</span>
                      <span style={{ color:'#f87171' }}>{pOut?.name||'?'} #{pOut?.number}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );

      case 'heatmap':
        return (
          <div>
            <div style={{ color:'#e5e7eb', fontWeight:700, fontSize:14, marginBottom:10 }}>Heatmap</div>
            <div style={{ color:'#9ca3af', fontSize:12, marginBottom:12 }}>Punten: {heatmapData.length} deze set</div>
            {savedHeatmaps.length > 0 ? savedHeatmaps.map((hm, i) => (
              <div key={i}
                onClick={() => setShowHeatmapOverlay(showHeatmapOverlay===i ? null : i)}
                style={{ background: showHeatmapOverlay===i ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${showHeatmapOverlay===i ? 'rgba(234,179,8,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius:10, padding:'10px 12px', marginBottom:8, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'#fff', fontWeight:600, fontSize:13 }}>Set {hm.setNumber}</span>
                  <span style={{ color: hm.winner==='home' ? '#4ade80' : '#f87171', fontSize:12 }}>
                    {hm.winner==='home' ? '✓ Gewonnen' : '✗ Verloren'} ({hm.finalScore})
                  </span>
                </div>
                {showHeatmapOverlay===i && <div style={{ color:'#fbbf24', fontSize:11, marginTop:4 }}>👁️ Overlay actief op veld</div>}
              </div>
            )) : (
              <div style={{ color:'#6b7280', fontSize:12, textAlign:'center', padding:24 }}>Nog geen sets gespeeld</div>
            )}
          </div>
        );

      case 'stats':
        return (
          <div>
            <div style={{ color:'#e5e7eb', fontWeight:700, fontSize:14, marginBottom:12 }}>Statistieken</div>
            {['home','away'].map(team => (
              <div key={team} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
                <div style={{ color: team==='home' ? '#f87171' : '#60a5fa', fontWeight:700, fontSize:13, marginBottom:8 }}>
                  {team==='home' ? '🔴 Ons Team' : '🔵 Tegenstander'}
                </div>
                {Object.entries(pointStats[team]).map(([key, val]) => (
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color:'#9ca3af', fontSize:12 }}>{{ direct:'Ace', sideout:'Sideout', block:'Blok', attack:'Aanval', error:'Fout' }[key]}</span>
                    <span style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{val}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:6 }}>
                  <span style={{ color:'#e5e7eb', fontWeight:600, fontSize:12 }}>Totaal</span>
                  <span style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{Object.values(pointStats[team]).reduce((a,b)=>a+b,0)}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'matches':
        return (
          <div>
            <div style={{ color:'#e5e7eb', fontWeight:700, fontSize:14, marginBottom:12 }}>Wedstrijden Beheer</div>
            <button onClick={() => setShowNewMatchDialog(true)}
              style={{ width:'100%', background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.3)', borderRadius:10, padding:'11px', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:8 }}>
              ➕ Nieuwe Wedstrijd
            </button>
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
              <div style={{ color:'#9ca3af', fontSize:12 }}>Huidige stand:</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>{homeScore} – {awayScore}</div>
              <div style={{ color:'#9ca3af', fontSize:12 }}>Sets: {sets.home} – {sets.away}</div>
              {opponentName && <div style={{ color:'#9ca3af', fontSize:12 }}>vs. {opponentName}</div>}
            </div>
            {savedMatches.length === 0 ? (
              <div style={{ color:'#6b7280', fontSize:12, textAlign:'center', padding:16 }}>Nog geen wedstrijden opgeslagen</div>
            ) : (
              savedMatches.slice().reverse().map(m => (
                <div key={m.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#fff', fontWeight:600, fontSize:13 }}>{m.opponent}</span>
                    <span style={{ color: m.winner==='home' ? '#4ade80' : '#f87171', fontSize:12, fontWeight:700 }}>
                      {m.finalScore.home}–{m.finalScore.away}
                    </span>
                  </div>
                  <div style={{ color:'#6b7280', fontSize:11 }}>{new Date(m.date).toLocaleDateString('nl-NL')}</div>
                </div>
              ))
            )}
          </div>
        );

      default: return null;
    }
  };

  const typeLabels = { direct:'⚡', sideout:'🔄', block:'🛡️', attack:'⚔️', error:'❌' };

  // ── Main UI ──
  return (
    <div style={{ height:'100vh', width:'100vw', background:'#000', color:'#fff', overflow:'hidden', display:'flex', flexDirection:'column', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(220,38,38,0.4); border-radius:4px; }
        select option { background: #1a1a1a; }
      `}</style>

      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} style={{ position:'fixed', left:`${c.left}%`, top:'-10px', width:10, height:10, background:'#fbbf24', borderRadius:'50%', pointerEvents:'none', zIndex:100, animation:`bounce 0.6s ${c.delay}s infinite` }} />
      ))}

      {/* ── TOP BAR ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', background:'rgba(0,0,0,0.9)', borderBottom:'1px solid rgba(220,38,38,0.3)', flexShrink:0, zIndex:30 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#7f1d1d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, letterSpacing:0.5 }}>VCV</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#f87171' }}>Volleybal Tracker</div>
        </div>

        {/* Score */}
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.06)', borderRadius:12, padding:'6px 14px', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            <span style={{ fontSize:22, fontWeight:900, color:'#f87171', lineHeight:1 }}>{homeScore}</span>
            <span style={{ fontSize:9, color:'#6b7280' }}>VCV</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'0 4px' }}>
            <span style={{ color:'#374151', fontSize:14, fontWeight:700 }}>–</span>
            <span style={{ fontSize:9, color:'#6b7280' }}>{sets.home}:{sets.away}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            <span style={{ fontSize:22, fontWeight:900, color:'#60a5fa', lineHeight:1 }}>{awayScore}</span>
            <span style={{ fontSize:9, color:'#6b7280' }}>{opponentName||'TEG'}</span>
          </div>
        </div>

        {/* Menu button */}
        <button
          onClick={() => isMobile ? setBottomSheetOpen(true) : setMenuOpen(m => !m)}
          style={{ background: menuOpen||bottomSheetOpen ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.07)', border: `1px solid rgba(220,38,38,${menuOpen||bottomSheetOpen ? 0.6 : 0.2})`, borderRadius:10, padding:'7px 10px', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600 }}
        >
          <MenuIcon />
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        {/* Court area */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'8px', position:'relative' }}>

          {/* Volleyball court */}
          <div style={{ position:'relative', width:'min(calc(100vw - 24px), calc((100vh - 140px) * 0.55))', height:'min(calc((100vw - 24px) / 0.55), calc(100vh - 140px))', maxHeight:'calc(100vh - 140px)' }}>
            
            {/* Away half */}
            <div
              onClick={e => {
                if (substitutionMode || showPointTypePopup) return;
                const rect = e.currentTarget.getBoundingClientRect();
                scorePoint('home', ((e.clientX-rect.left)/rect.width)*100, ((e.clientY-rect.top)/rect.height)*100);
              }}
              style={{ position:'absolute', top:0, left:0, right:0, height:'50%', background:'linear-gradient(180deg, #1f2937 0%, #374151 100%)', borderRadius:'8px 8px 0 0', cursor:'pointer', border:'2px solid rgba(255,255,255,0.15)', borderBottom:'none', overflow:'hidden' }}
            >
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(1.5rem,8vw,4rem)', fontWeight:900, color:'rgba(255,255,255,0.08)', pointerEvents:'none', userSelect:'none' }}>
                {opponentName||'AWAY'}
              </div>
              {/* 3m line */}
              <div style={{ position:'absolute', bottom:'33%', left:0, right:0, borderBottom:'2px dashed rgba(255,255,255,0.2)' }}/>
              {renderAwayLineup()}

              {/* Heatmap dots */}
              {heatmapData.filter(d=>d.team==='home').map((p,i) => (
                <div key={i} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, transform:'translate(-50%,-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(239,68,68,0.5)', pointerEvents:'none', zIndex:10 }}/>
              ))}
              {showHeatmapOverlay!==null && savedHeatmaps[showHeatmapOverlay]?.data.filter(d=>d.team==='home').map((p,i) => (
                <div key={`ov-${i}`} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, transform:'translate(-50%,-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(251,191,36,0.6)', border:'2px solid #fbbf24', pointerEvents:'none', zIndex:11 }}/>
              ))}

              {/* TO linksboven, Servicefout rechtsboven */}
              <button onClick={e=>{e.stopPropagation();takeTimeout('away');}} style={{ position:'absolute', top:6, left:6, background:'rgba(234,179,8,0.85)', color:'#000', border:'none', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:800, cursor:'pointer', zIndex:30, boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>TO</button>
              <button onClick={e=>{e.stopPropagation();serviceFault('away');}} style={{ position:'absolute', top:6, right:6, background: servingTeam==='away' ? 'rgba(220,38,38,0.85)' : 'rgba(100,100,100,0.5)', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:800, cursor: servingTeam==='away' ? 'pointer' : 'not-allowed', zIndex:30, boxShadow:'0 2px 8px rgba(0,0,0,0.4)', opacity: servingTeam==='away' ? 1 : 0.5 }}>Sf</button>
            </div>

            {/* Net */}
            <div style={{ position:'absolute', top:'50%', left:0, right:0, height:6, background:'linear-gradient(90deg, #111 0%, #222 50%, #111 100%)', transform:'translateY(-50%)', zIndex:15, borderTop:'2px solid #fbbf24', borderBottom:'2px solid #fbbf24' }}/>

            {/* Home half */}
            <div
              onClick={e => {
                if (substitutionMode || showPointTypePopup) return;
                const rect = e.currentTarget.getBoundingClientRect();
                scorePoint('away', ((e.clientX-rect.left)/rect.width)*100, ((e.clientY-rect.top)/rect.height)*100);
              }}
              style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%', background:'linear-gradient(0deg, #1f2937 0%, #374151 100%)', borderRadius:'0 0 8px 8px', cursor:'pointer', border:'2px solid rgba(255,255,255,0.15)', borderTop:'none', overflow:'hidden' }}
            >
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(1.5rem,8vw,4rem)', fontWeight:900, color:'rgba(255,255,255,0.08)', pointerEvents:'none', userSelect:'none' }}>VCV</div>
              {/* 3m line */}
              <div style={{ position:'absolute', top:'33%', left:0, right:0, borderBottom:'2px dashed rgba(255,255,255,0.2)' }}/>
              {renderHomeLineup()}

              {/* Heatmap dots */}
              {heatmapData.filter(d=>d.team==='away').map((p,i) => (
                <div key={i} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, transform:'translate(-50%,-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(59,130,246,0.5)', pointerEvents:'none', zIndex:10 }}/>
              ))}
              {showHeatmapOverlay!==null && savedHeatmaps[showHeatmapOverlay]?.data.filter(d=>d.team==='away').map((p,i) => (
                <div key={`ov-${i}`} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, transform:'translate(-50%,-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(251,191,36,0.6)', border:'2px solid #fbbf24', pointerEvents:'none', zIndex:11 }}/>
              ))}

              {/* TO linksonder, Servicefout rechtsonder */}
              <button onClick={e=>{e.stopPropagation();takeTimeout('home');}} style={{ position:'absolute', bottom:6, left:6, background:'rgba(234,179,8,0.85)', color:'#000', border:'none', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:800, cursor:'pointer', zIndex:30, boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>TO</button>
              <button onClick={e=>{e.stopPropagation();serviceFault('home');}} style={{ position:'absolute', bottom:6, right:6, background: servingTeam==='home' ? 'rgba(220,38,38,0.85)' : 'rgba(100,100,100,0.5)', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:800, cursor: servingTeam==='home' ? 'pointer' : 'not-allowed', zIndex:30, boxShadow:'0 2px 8px rgba(0,0,0,0.4)', opacity: servingTeam==='home' ? 1 : 0.5 }}>Sf</button>
            </div>
          </div>
        </div>

        {/* Score history strip (right side, compact) */}
        <div style={{ width:52, background:'rgba(0,0,0,0.6)', borderLeft:'1px solid rgba(255,255,255,0.06)', overflowY:'auto', flexShrink:0, display:'flex', flexDirection:'column', padding:'6px 4px', gap:2 }}>
          <div style={{ color:'#6b7280', fontSize:9, textAlign:'center', marginBottom:4 }}>LOG</div>
          {scoreHistory.slice(-20).reverse().map((s,i) => (
            <div key={i} style={{ background: s.team==='home' ? 'rgba(220,38,38,0.2)' : 'rgba(37,99,235,0.2)', borderRadius:4, padding:'3px 2px', textAlign:'center' }}>
              <div style={{ color:'#fff', fontSize:9, fontWeight:700 }}>{s.score}</div>
              <div style={{ color:'#9ca3af', fontSize:7 }}>{typeLabels[s.type]||'•'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM NAV (mobile quick actions) ── */}
      {isMobile && (
        <div style={{ display:'flex', background:'rgba(0,0,0,0.95)', borderTop:'1px solid rgba(220,38,38,0.25)', padding:'6px 8px', gap:6, flexShrink:0, zIndex:30 }}>
          {TABS.slice(0,4).map(([id, Icon, label]) => (
            <button key={id}
              onClick={() => { setActiveTab(id); setBottomSheetOpen(true); }}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'transparent', border:'none', color: activeTab===id&&bottomSheetOpen ? '#f87171' : '#6b7280', cursor:'pointer', padding:'4px 2px', borderRadius:8 }}>
              <Icon />
              <span style={{ fontSize:9, fontWeight:600 }}>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── MOBILE BOTTOMSHEET ── */}
      {isMobile && (
        <BottomSheet
          open={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          title={TABS.find(t=>t[0]===activeTab)?.[2] || 'Menu'}
          snapPoints={[0.45, 0.88]}
        >
          {/* Tab switcher inside sheet */}
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {TABS.map(([id,,label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ padding:'5px 10px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', background: activeTab===id ? 'rgba(220,38,38,0.25)' : 'rgba(255,255,255,0.06)', color: activeTab===id ? '#f87171' : '#9ca3af', border: `1px solid ${activeTab===id ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                {label}
              </button>
            ))}
          </div>
          {renderTabContent()}
        </BottomSheet>
      )}

      {/* ── DESKTOP SIDE MENU ── */}
      {!isMobile && (
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderTabContent()}
        </SideMenu>
      )}

      {/* ── MODALS ── */}

      {/* Alert */}
      {alertMessage && (
        <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#1a1a1a', border:'1px solid rgba(220,38,38,0.4)', borderRadius:16, padding:'20px 28px', zIndex:200, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.8)', minWidth:220 }}>
          <div style={{ color:'#fff', fontSize:16, marginBottom:14 }}>{alertMessage}</div>
          <button onClick={()=>setAlertMessage(null)} style={{ background:'rgba(220,38,38,0.2)', color:'#f87171', border:'1px solid rgba(220,38,38,0.3)', borderRadius:8, padding:'8px 20px', cursor:'pointer', fontWeight:600 }}>OK</button>
        </div>
      )}

      {/* Serving dialog */}
      {showServingDialog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150 }}>
          <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'28px 24px', maxWidth:320, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>🏐 Wie serveert eerst?</div>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={()=>{setServingTeam('home');setShowServingDialog(false);}}
                style={{ flex:1, background:'rgba(220,38,38,0.2)', color:'#f87171', border:'1px solid rgba(220,38,38,0.4)', borderRadius:12, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                🔴 Ons Team
              </button>
              <button onClick={()=>{setServingTeam('away');setShowServingDialog(false);}}
                style={{ flex:1, background:'rgba(37,99,235,0.2)', color:'#60a5fa', border:'1px solid rgba(37,99,235,0.4)', borderRadius:12, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                🔵 Tegenstander
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Point type popup */}
      {showPointTypePopup && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150 }}>
          <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'24px 20px', maxWidth:300, width:'90%' }}>
            <div style={{ textAlign:'center', fontWeight:800, fontSize:17, marginBottom:4 }}>Punt Type</div>
            <div style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:18 }}>
              {showPointTypePopup.team==='home' ? '🔴 Ons Team' : '🔵 Tegenstander'} scoort
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['direct','⚡ Ace','#2563eb'],['sideout','🔄 Sideout','#16a34a'],['block','🛡️ Blok','#7c3aed'],['attack','⚔️ Aanval','#ea580c'],['error','❌ Fout','#dc2626']].map(([t,l,c]) => (
                <button key={t} onClick={()=>confirmPointType(t)}
                  style={{ background:`${c}22`, color:'#fff', border:`1px solid ${c}55`, borderRadius:10, padding:'12px 8px', fontSize:13, fontWeight:600, cursor:'pointer', gridColumn: t==='error'?'span 2':undefined }}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowPointTypePopup(null)}
              style={{ width:'100%', marginTop:10, background:'rgba(255,255,255,0.05)', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:10, fontSize:13, cursor:'pointer' }}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      {/* Service fault popup */}
      {showServiceFaultPopup && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150 }}>
          <div style={{ background:'#1a1a1a', border:'1px solid rgba(220,38,38,0.3)', borderRadius:20, padding:'24px 20px', maxWidth:300, width:'90%' }}>
            <div style={{ textAlign:'center', fontWeight:800, fontSize:17, marginBottom:4 }}>⚠️ Service Fout</div>
            <div style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:20 }}>
              {showServiceFaultPopup.scoringTeam==='home' ? '🔴 Ons Team' : '🔵 Tegenstander'} krijgt het punt
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={()=>confirmServiceFault('net')}
                style={{ background:'rgba(37,99,235,0.15)', color:'#fff', border:'1px solid rgba(37,99,235,0.35)', borderRadius:12, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>🥅</span>
                <span>Bal in het Net</span>
              </button>
              <button onClick={()=>confirmServiceFault('out')}
                style={{ background:'rgba(234,179,8,0.15)', color:'#fff', border:'1px solid rgba(234,179,8,0.35)', borderRadius:12, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>↗️</span>
                <span>Bal Uit</span>
              </button>
              <button onClick={()=>confirmServiceFault('footfault')}
                style={{ background:'rgba(139,92,246,0.15)', color:'#fff', border:'1px solid rgba(139,92,246,0.35)', borderRadius:12, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>👟</span>
                <span>Voetfout</span>
              </button>
            </div>
            <button onClick={()=>setShowServiceFaultPopup(null)}
              style={{ width:'100%', marginTop:12, background:'rgba(255,255,255,0.05)', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:10, fontSize:13, cursor:'pointer' }}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      {/* Set ended */}
      {setEnded && !matchEnded && showLineupConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150 }}>
          <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'28px 24px', maxWidth:320, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{setWinner==='home' ? '🎉' : '😢'}</div>
            <div style={{ fontWeight:800, fontSize:20, marginBottom:6 }}>{setWinner==='home' ? 'Set Gewonnen!' : 'Set Verloren'}</div>
            <div style={{ color:'#9ca3af', marginBottom:20 }}>Stand sets: {sets.home} – {sets.away}</div>
            <div style={{ marginBottom:12, color:'#e5e7eb', fontSize:14 }}>Opstelling behouden?</div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>startNewSet(true)}
                style={{ flex:1, background:'rgba(34,197,94,0.2)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.4)', borderRadius:10, padding:12, fontWeight:700, cursor:'pointer' }}>Ja</button>
              <button onClick={()=>startNewSet(false)}
                style={{ flex:1, background:'rgba(59,130,246,0.2)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.4)', borderRadius:10, padding:12, fontWeight:700, cursor:'pointer' }}>Nee</button>
            </div>
          </div>
        </div>
      )}

      {/* Match ended + save */}
      {showSaveDialog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150 }}>
          <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'28px 24px', maxWidth:340, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>{matchWinner==='home' ? '🏆' : '😢'}</div>
            <div style={{ fontWeight:800, fontSize:20, marginBottom:6 }}>{matchWinner==='home' ? 'Gewonnen!' : 'Verloren'}</div>
            <div style={{ color:'#fff', fontSize:22, fontWeight:700, marginBottom:16 }}>{sets.home} – {sets.away}</div>
            {!opponentName && (
              <input value={opponentName} onChange={e=>setOpponentName(e.target.value)} placeholder="Tegenstander naam..."
                style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:13, marginBottom:12, boxSizing:'border-box' }}/>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={saveMatch}
                style={{ flex:1, background:'rgba(34,197,94,0.2)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.4)', borderRadius:10, padding:12, fontWeight:700, cursor:'pointer' }}>💾 Opslaan</button>
              <button onClick={()=>{setShowSaveDialog(false);setShowNewMatchDialog(true);}}
                style={{ flex:1, background:'rgba(255,255,255,0.05)', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:12, cursor:'pointer' }}>Sla over</button>
            </div>
          </div>
        </div>
      )}

      {/* New match dialog */}
      {showNewMatchDialog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:150 }}>
          <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'24px 20px', maxWidth:320, width:'90%' }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>Nieuwe Wedstrijd</div>
            <label style={{ color:'#9ca3af', fontSize:12, display:'block', marginBottom:4 }}>Tegenstander</label>
            <input value={opponentName} onChange={e=>setOpponentName(e.target.value)} placeholder="Naam tegenstander"
              style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:13, marginBottom:12, boxSizing:'border-box' }}/>
            <label style={{ color:'#9ca3af', fontSize:12, display:'block', marginBottom:4 }}>Datum</label>
            <input type="date" value={matchDate} onChange={e=>setMatchDate(e.target.value)}
              style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'9px 12px', color:'#fff', fontSize:13, marginBottom:18, boxSizing:'border-box' }}/>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={confirmNewMatch}
                style={{ flex:1, background:'rgba(34,197,94,0.2)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.4)', borderRadius:10, padding:12, fontWeight:700, cursor:'pointer' }}>▶️ Start</button>
              <button onClick={()=>setShowNewMatchDialog(false)}
                style={{ flex:1, background:'rgba(255,255,255,0.05)', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:12, cursor:'pointer' }}>Annuleer</button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution mode indicator */}
      {substitutionMode && (
        <div style={{ position:'fixed', top:70, left:'50%', transform:'translateX(-50%)', background:'rgba(234,179,8,0.9)', color:'#000', borderRadius:20, padding:'8px 16px', fontSize:13, fontWeight:700, zIndex:60, backdropFilter:'blur(4px)', boxShadow:'0 4px 20px rgba(234,179,8,0.4)' }}>
          Selecteer veldspeler om te wisselen
          <button onClick={()=>{setSubstitutionMode(false);setSelectedBenchPlayer(null);}} style={{ marginLeft:8, background:'none', border:'none', cursor:'pointer', fontSize:14 }}>✕</button>
        </div>
      )}
    </div>
  );
}
