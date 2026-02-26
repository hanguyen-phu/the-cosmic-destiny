/* =========================
   STAR BACKGROUND
========================= */

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* Create stars */
for(let i=0;i<200;i++){
  stars.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    size:Math.random()*2,
    speed:Math.random()*0.3
  });
}

/* Shooting star */
function createShootingStar(){
  shootingStars.push({
    x:Math.random()*canvas.width,
    y:0,
    len:Math.random()*80+50,
    speed:Math.random()*6+4,
    opacity:1
  });
}

setInterval(()=>{
  if(Math.random() < 0.3){
    createShootingStar();
  }
},2000);

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  stars.forEach(star=>{
    star.y += star.speed;
    if(star.y > canvas.height) star.y = 0;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
    ctx.fillStyle="white";
    ctx.fill();
  });

  shootingStars.forEach((s,i)=>{
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.len, s.y + s.len);
    ctx.strokeStyle="rgba(255,255,255,"+s.opacity+")";
    ctx.lineWidth=2;
    ctx.stroke();

    s.x += s.speed;
    s.y += s.speed;
    s.opacity -= 0.02;

    if(s.opacity <=0){
      shootingStars.splice(i,1);
    }
  });

  requestAnimationFrame(animate);
}
animate();


/* =========================
   INPUT VALIDATION
========================= */

function isInputValid(){
  const name = document.getElementById("name").value.trim();
  const dob = document.getElementById("dob").value;
  return name && dob;
}


/* =========================
   CARD EFFECT
========================= */

function activateCard(card, callback, e){

  // Nếu thiếu input → hiện modal
  if(!isInputValid()){
    showMysticWarning();
    return;
  }

  const body = document.querySelector(".cosmic-body");

  body.classList.add("active");
  card.classList.add("active");

  createWave(e);

  setTimeout(()=>{
    callback();
  },600);

  setTimeout(()=>{
    card.classList.remove("active");
    body.classList.remove("active");
  },2000);
}

function createWave(e){
  if(!e) return;

  const wave = document.createElement("div");
  wave.className="energy-wave";
  wave.style.left = e.clientX + "px";
  wave.style.top = e.clientY + "px";
  document.body.appendChild(wave);

  setTimeout(()=>wave.remove(),1000);
}


/* =========================
   MYSTIC MODAL WARNING
========================= */

function showMysticWarning(){
  const modal = document.getElementById("mysticModal");
  modal.classList.add("show");

  modal.addEventListener("click", ()=>{
    modal.classList.remove("show");
  }, { once:true });
}


/* =========================
   LIFE PREDICTION - CINEMATIC REMASTER
   Phase 1: Tấm gương sự thật (fog reveal)
   Phase 2: Đồng hồ cát (hourglass sand animation)
   Phase 3: Sợi chỉ sinh mệnh (thread of fate)
   Phase 4: Cải Mệnh (life extension cards)
   + Âm thanh nhịp tim (Web Audio API)
========================= */

/* --- Audio Engine --- */
let _audioCtx = null;
function getAudioCtx(){
  if(!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playHeartbeat(bpm, duration, onDone){
  const ctx = getAudioCtx();
  const beatInterval = 60 / bpm;
  const totalBeats = Math.floor(duration / beatInterval);
  let beat = 0;

  function doubleBeat(t){
    // "lub"
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.connect(g1); g1.connect(ctx.destination);
    o1.frequency.value = 60;
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.4, t + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o1.start(t); o1.stop(t + 0.15);

    // "dub"
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.connect(g2); g2.connect(ctx.destination);
    o2.frequency.value = 50;
    g2.gain.setValueAtTime(0, t + 0.18);
    g2.gain.linearRampToValueAtTime(0.25, t + 0.20);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
    o2.start(t + 0.18); o2.stop(t + 0.32);
  }

  function schedule(){
    if(beat >= totalBeats){
      if(onDone) setTimeout(onDone, 300);
      return;
    }
    const t = ctx.currentTime + 0.05;
    doubleBeat(t);
    beat++;
    setTimeout(schedule, beatInterval * 1000);
  }
  schedule();
}

function playFinalChime(){
  const ctx = getAudioCtx();
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  freqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = f;
    const t = ctx.currentTime + i * 0.18;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    o.start(t); o.stop(t + 1.3);
  });
}

/* ============================================================
   COSMIC HOURGLASS — NEW LIFE PREDICTION SYSTEM
   Phase 0: Lifestyle quiz
   Phase 1: Magic circle scan
   Phase 2: Cosmic hourglass with stardust
   Phase 3: Neck-hold revelation + warp
   Phase 4: Symbol + stats
============================================================ */

/* --- Global life state --- */
let _lifeBaseMax = 0;
let _lifeBonus = 0;
let _lifeAge = 0;
let _lqAnswers = {};
let _cosmicHgRaf = null;
let _warpRaf = null;
let _holdTimer = null;
let _holdProgress = 0;
let _holdActive = false;
let _revealed = false;
let _isPouring = false;   // điều khiển cát có rơi hay không
let _cosmicAge = 0;
let _cosmicMaxLife = 0;

/* ── Lifestyle quiz logic ── */
function selectLQ(btn){
  const key = btn.dataset.key;
  btn.closest('.lq-options').querySelectorAll('.lq-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  _lqAnswers[key] = parseInt(btn.dataset.val);
  const keys = ['sleep','exercise','diet','stress','vice'];
  const allDone = keys.every(k => k in _lqAnswers);
  document.getElementById('cosmicPredictBtn').disabled = !allDone;
}

/* ── Seeded RNG ── */
function seededRand(seed){
  let s = seed;
  return function(){
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/* ── Calculate life expectancy ── */
function calcLifeExpectancy(dob, answers){
  const d = new Date(dob);
  const birthYear = d.getFullYear();
  const age = new Date().getFullYear() - birthYear;
  let total = 72;
  const lsScore = Object.values(answers).reduce((s, v) => s + v, 0);
  total += lsScore;
  if(age < 25) total += 5;
  else if(age < 35) total += 2;
  const userEl = getElementByYear(birthYear);
  const curEl  = getElementByYear(new Date().getFullYear());
  const sinhPairs = [["Mộc","Hỏa"],["Hỏa","Thổ"],["Thổ","Kim"],["Kim","Thủy"],["Thủy","Mộc"]];
  const khacPairs = [["Mộc","Thổ"],["Thổ","Thủy"],["Thủy","Hỏa"],["Hỏa","Kim"],["Kim","Mộc"]];
  if(sinhPairs.some(([a,b]) => (a===userEl&&b===curEl)||(b===userEl&&a===curEl))) total += 2;
  if(khacPairs.some(([a,b]) => a===userEl&&b===curEl)) total -= 1;
  const seed = birthYear * 1000 + (d.getMonth() + 1) * 100 + d.getDate();
  const rng = seededRand(seed);
  total += Math.floor(rng() * 11) - 5;
  let specialEvent = null;
  const rare = rng();
  if(rare < 0.01){ total = 999; specialEvent = 'immortal'; }
  else if(rare < 0.02){ specialEvent = 'reborn'; total = Math.floor(rng() * 20) + age + 5; }
  if(total < age + 5 && !specialEvent) total = age + 5;
  if(total > 120 && !specialEvent) total = 120;
  return { total, age, lifeLeft: total - age, lsScore, specialEvent };
}

/* ── Bottom symbol ── */
function getBottomSymbol(total, specialEvent){
  if(specialEvent === 'immortal') return { emoji: '♾️', label: 'Vĩnh Hằng — Linh Hồn Ngươi Không Bị Thời Gian Trói Buộc', color: '#ffd700' };
  if(specialEvent === 'reborn') return { emoji: '🔄', label: 'Luân Hồi Mở Lối — Hành Trình Mới Của Ngươi Bắt Đầu', color: '#c084fc' };
  if(total >= 90) return { emoji: '🌳', label: 'Thọ Nguyên Viên Mãn — Linh Hồn Ngươi Đầy Đủ Ánh Sáng', color: '#00ff88' };
  if(total >= 75) return { emoji: '💥', label: 'Thiên Tinh Hạ Thế — Cuộc Đời Ngươi Thật Mạnh Mẽ', color: '#ff6b35' };
  return { emoji: '🌊', label: 'Tĩnh Tâm — Lòng Ngươi Phẳng Lặng Như Mặt Hồ', color: '#38bdf8' };
}

/* --- Main entry: show lifestyle quiz --- */
function predictLife(){
  _lqAnswers = {};
  _revealed = false;
  _holdProgress = 0;
  _holdActive = false;

  const panel = document.getElementById('lifestylePanel');
  const arena = document.getElementById('cosmicArena');
  const lifeNumber = document.getElementById('lifeNumber');
  const lifeStats = document.getElementById('lifeStatsBar');

  if(panel){ panel.style.display = ''; }
  if(arena){ arena.style.display = 'none'; }
  if(lifeNumber){ lifeNumber.style.display = 'none'; lifeNumber.innerHTML = ''; }
  if(lifeStats){ lifeStats.style.display = 'none'; }

  document.querySelectorAll('.lq-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('cosmicPredictBtn').disabled = true;
  document.getElementById("lifePage").classList.add("show");
}

/* ── Start cosmic hourglass after quiz ── */
function startCosmicHourglass(){
  const dob = document.getElementById("dob").value;
  if(!dob) return;
  const result = calcLifeExpectancy(dob, _lqAnswers);
  _cosmicAge    = result.age;
  _cosmicMaxLife = result.total;
  _lifeBaseMax  = result.total;
  _lifeAge      = result.age;

  document.getElementById('lifestylePanel').style.display = 'none';
  const arena = document.getElementById('cosmicArena');
  arena.style.display = 'block';

  const mcWrap  = document.getElementById('magicCircleWrap');
  const columns = document.getElementById('arenaColumns');
  const warpCvs = document.getElementById('warpCanvas');

  mcWrap.style.display  = 'flex';
  mcWrap.style.opacity  = '0';
  mcWrap.style.transition = 'opacity .4s ease';
  void mcWrap.offsetWidth;
  mcWrap.style.opacity  = '1';
  columns.style.display = 'none';
  columns.style.opacity = '0';
  warpCvs.style.opacity = '0';

  document.getElementById('hgRevelation').style.opacity   = '0';
  document.getElementById('hgRevelation').style.transform = 'translateY(20px)';
  document.getElementById('hgBottomSymbol').style.opacity = '0';
  document.getElementById('arenaResultExtra').innerHTML   = '';

  if(_cosmicHgRaf){ cancelAnimationFrame(_cosmicHgRaf); _cosmicHgRaf = null; }
  if(_warpRaf)    { cancelAnimationFrame(_warpRaf);     _warpRaf = null; }

  buildMagicCircle(result, () => {
    mcWrap.style.transition = '.7s';
    mcWrap.style.opacity    = '0';
    setTimeout(() => {
      mcWrap.style.display = 'none';
      buildCSSHourglass(result);
    }, 700);
  });
}


/* ============================================================
   PHASE 1 — MAGIC CIRCLE SCAN
============================================================ */
function buildMagicCircle(result, onDone){
  const cvs = document.getElementById('magicCircleCanvas');
  const SIZE = Math.min(window.innerWidth, window.innerHeight) * 0.72;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  cvs.width = SIZE * DPR; cvs.height = SIZE * DPR;
  cvs.style.width = SIZE + 'px'; cvs.style.height = SIZE + 'px';
  const c = cvs.getContext('2d');
  c.scale(DPR, DPR);
  const CX = SIZE/2, CY = SIZE/2, R = SIZE * 0.42;

  let startT = null;
  const SCAN_DUR = 3200;
  let scanDone = false;
  const scanLineY_start = CY - R;

  const label = document.getElementById('mcLabel');
  const scanTexts = ['⬡ ĐANG QUÉT THIÊN CƠ ⬡','✦ ĐỌC DỮ LIỆU VŨ TRỤ ✦','⚙ PHÂN TÍCH NGŨ HÀNH ⚙','⬡ TÍNH TOÁN THIÊN MỆNH ⬡'];
  let textIdx = 0;
  const textTimer = setInterval(() => { textIdx = (textIdx+1) % scanTexts.length; label.textContent = scanTexts[textIdx]; }, 800);

  // Rune symbols around the circle
  const runes = ['☿','♄','♃','♂','☉','☽','♀','⚸','⚳','⚴'];

  function frame(ts){
    if(!startT) startT = ts;
    const el = ts - startT;
    const prog = Math.min(el / SCAN_DUR, 1);
    const ease = t => t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
    const ep = ease(prog);

    c.clearRect(0,0,SIZE,SIZE);

    // Outer ring
    c.beginPath();
    c.arc(CX, CY, R, 0, Math.PI*2);
    c.strokeStyle = `rgba(0,220,200,${0.3 + 0.2*Math.sin(el*0.004)})`;
    c.lineWidth = 1.5;
    c.stroke();

    // Inner rotating rings
    for(let i = 0; i < 3; i++){
      const r2 = R * (0.7 - i * 0.12);
      const rot = el * 0.001 * (i%2===0 ? 1 : -1) * (i+1);
      c.save();
      c.translate(CX, CY); c.rotate(rot);
      c.beginPath();
      c.arc(0, 0, r2, 0, Math.PI * 2 * Math.min(prog * 1.3, 1));
      c.strokeStyle = `rgba(${i===0?'0,200,255':i===1?'150,50,255':'255,100,200'},${0.5+0.3*Math.sin(el*0.003+i)})`;
      c.lineWidth = i===0 ? 2 : 1;
      c.stroke();
      c.restore();
    }

    // Rune markers
    runes.forEach((r, i) => {
      const angle = (i/runes.length) * Math.PI*2 - Math.PI/2 + el*0.0005;
      const rx = CX + (R+14) * Math.cos(angle);
      const ry = CY + (R+14) * Math.sin(angle);
      const alpha = 0.3 + 0.4 * Math.sin(el*0.003 + i);
      c.save();
      c.fillStyle = `rgba(0,230,200,${alpha})`;
      c.font = '14px serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(r, rx, ry);
      c.restore();
    });

    // Pentagon star (pentagram)
    c.save();
    c.translate(CX, CY); c.rotate(el * 0.0003);
    c.beginPath();
    for(let i = 0; i < 5; i++){
      const a = (i * 4 / 5) * Math.PI * 2 - Math.PI/2;
      const px = R * 0.55 * Math.cos(a), py = R * 0.55 * Math.sin(a);
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath();
    c.strokeStyle = `rgba(200,100,255,${0.25 + 0.2*Math.sin(el*0.002)})`;
    c.lineWidth = 1;
    c.stroke();
    c.restore();

    // SCAN LINE sweeping downward
    const scanY = CY - R + ep * R * 2;
    const scanAlpha = Math.max(0, 1 - (prog > 0.85 ? (prog-0.85)/0.15 : 0));
    const sg = c.createLinearGradient(CX - R, scanY, CX + R, scanY);
    sg.addColorStop(0, 'rgba(0,255,200,0)');
    sg.addColorStop(0.5, `rgba(0,255,200,${scanAlpha * 0.8})`);
    sg.addColorStop(1, 'rgba(0,255,200,0)');
    c.fillStyle = sg;
    c.fillRect(CX - R, scanY - 3, R*2, 6);

    // Glow under scan line (scanned region)
    const rgGrad = c.createLinearGradient(0, CY-R, 0, scanY);
    rgGrad.addColorStop(0, 'rgba(0,180,255,0)');
    rgGrad.addColorStop(1, `rgba(0,180,255,${scanAlpha*0.05})`);
    c.fillStyle = rgGrad;
    c.beginPath(); c.arc(CX, CY, R, 0, Math.PI*2); c.fill();

    // Center number flash when done
    if(prog > 0.9){
      const alpha2 = (prog - 0.9) / 0.1;
      c.save();
      c.globalAlpha = alpha2;
      c.fillStyle = '#00ffee';
      c.font = `bold ${Math.floor(R*0.5)}px Playfair Display, serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.shadowColor = 'cyan'; c.shadowBlur = 30;
      c.fillText(result.specialEvent === 'immortal' ? '∞' : result.total, CX, CY);
      c.restore();
    }

    if(prog < 1){
      requestAnimationFrame(frame);
    } else {
      clearInterval(textTimer);
      if(!scanDone){ scanDone = true; setTimeout(onDone, 400); }
    }
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   PHASE 2 — COSMIC HOURGLASS
   Bigger canvas, realistic glass with refraction, stardust,
   neck touch-hold fully working via pointer events
============================================================ */
function buildCSSHourglass(result){
  /* Reset neck touch state */
  const _nt = document.getElementById('hgNeckTouch');
  if(_nt){ _nt.style.opacity='1'; _nt.style.pointerEvents='auto'; }
  _revealed = false; _holdActive = false; _holdProgress = 0;

  /* Show the two-column layout */
  const columns = document.getElementById('arenaColumns');
  columns.style.display = 'grid';
  void columns.offsetWidth;
  columns.style.transition = '1s ease';
  columns.style.opacity = '1';

  /* Set live numbers */
  document.getElementById('hgLivedNum').textContent  = result.age;
  document.getElementById('hgRemainNum').textContent = result.specialEvent === 'immortal' ? '∞' : result.lifeLeft;

  /* Sand ratios */
  const lifeTotal  = result.total === 999 ? 100 : result.total;
  const topRatio   = Math.max(0.04, 1 - result.age / lifeTotal);
  const botRatio   = Math.min(0.96, result.age / lifeTotal);

  /* Determine elemental glow color from birth year */
  const birthYear = new Date(document.getElementById('dob').value).getFullYear();
  const userEl    = getElementByYear(birthYear);
  const elGlow    = {Kim:'220,210,180',Mộc:'80,220,100',Thủy:'0,160,255',Hỏa:'255,80,20',Thổ:'200,150,50'}[userEl] || '100,200,255';

  /* Apply glow to wrapper */
  const wrapper = document.getElementById('hgWrapper');
  wrapper.style.filter = `drop-shadow(0 0 35px rgba(${elGlow},.35)) drop-shadow(0 0 70px rgba(${elGlow},.15))`;

  /* Animate sand after short delay */
  setTimeout(() => {
    const sandTop = document.getElementById('sandTop');
    const sandBot = document.getElementById('sandBottom');
    sandTop.style.height = (topRatio * 88) + '%';
    sandBot.style.height = (botRatio * 88) + '%';
  }, 300);

  /* Populate magic ring runes */
  const runes = ['☿','♄','♃','♂','☉','☽'];
  ['ringTop','ringBottom'].forEach(id => {
    const ring = document.getElementById(id);
    // remove old runes
    ring.querySelectorAll('.rune').forEach(r => r.remove());
    runes.forEach((r, i) => {
      const span = document.createElement('span');
      span.className = 'rune';
      span.textContent = r;
      const angle = (i / runes.length) * 360;
      const rad = (angle - 90) * Math.PI / 180;
      const radius = 96;
      span.style.cssText = `
        position:absolute;
        left:${110 + radius * Math.cos(rad) - 8}px;
        top:${110 + radius * Math.sin(rad) - 8}px;
        animation-delay:${i * 0.5}s;
      `;
      ring.appendChild(span);
    });
  });

  /* Start stardust canvas animation */
  startStardustCanvas(result, topRatio);

  /* Setup hold interaction */
  setupNeckHold(result);
}

/* ── Stardust canvas overlay ── */
function startStardustCanvas(result, topRatio){
  const cvs = document.getElementById('stardustCanvas');
  const wrapper = document.getElementById('hgWrapper');
  const W = wrapper.offsetWidth  || 220;
  const H = wrapper.offsetHeight || 530;
  const DPR = Math.min(window.devicePixelRatio||1,2);
  cvs.width  = W * DPR; cvs.height = H * DPR;
  const c = cvs.getContext('2d');
  c.scale(DPR, DPR);

  const NECK_Y = H * 0.5;
  const NECK_X = W * 0.5;

  let grains = [];

  function spawn(){
    grains.push({
      x    : NECK_X + (Math.random()-.5)*8,
      y    : NECK_Y,
      vx   : (Math.random()-.5)*1.2,
      vy   : 1.4 + Math.random()*2.0,
      r    : .8 + Math.random()*.9,
      alpha: 1,
      hue  : 40 + Math.random()*40,  // gold/white
      trail: []
    });
  }

  function frame(){
    if(_revealed){
  c.clearRect(0,0,W,H);
  return;
}
    c.clearRect(0,0,W,H);
    // 🔥 Chỉ rơi khi đang giữ
if(_isPouring && !_revealed){
  const intensity = _holdProgress / 100;
  if(Math.random() < 0.35 + intensity){
    spawn();
  }
}

    grains.forEach(g => {
      if(!g.settled){
        g.trail.push({x:g.x,y:g.y});
        if(g.trail.length > 6) g.trail.shift();
        g.vy += .14; g.x += g.vx; g.y += g.vy;
        const botSurf = NECK_Y + (H*.42) * result.age/(result.total===999?100:result.total) + 4;
        if(g.y >= botSurf) {
          g.settled = true;
          // bloom flash
          const bx = g.x, by = botSurf;
          const bloom = c.createRadialGradient(bx,by,0,bx,by,12);
          bloom.addColorStop(0,`rgba(255,220,100,.9)`);
          bloom.addColorStop(1,'rgba(0,0,0,0)');
          c.fillStyle = bloom;
          c.beginPath(); c.arc(bx,by,12,0,Math.PI*2); c.fill();
        }
      }
      if(!g.settled){
        // trail
        g.trail.forEach((pt,ti) => {
          if(ti===0) return;
          const ta = (ti/g.trail.length)*.45*g.alpha;
          c.strokeStyle=`hsla(${g.hue},90%,80%,${ta})`;
          c.lineWidth=g.r*.7;
          c.beginPath();c.moveTo(g.trail[ti-1].x,g.trail[ti-1].y);c.lineTo(pt.x,pt.y);c.stroke();
        });
        const gg=c.createRadialGradient(g.x,g.y,0,g.x,g.y,g.r*3);
        gg.addColorStop(0,`hsla(${g.hue},100%,88%,${g.alpha})`);
        gg.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle=gg;
        c.beginPath();c.arc(g.x,g.y,g.r*3,0,Math.PI*2);c.fill();
      }
    });
    if(_revealed){
  grains = [];
  c.clearRect(0,0,W,H);
}else{
  grains = grains.filter(g => !g.settled && g.y < H);
}
    _cosmicHgRaf = requestAnimationFrame(frame);
  }
  if(_cosmicHgRaf){ cancelAnimationFrame(_cosmicHgRaf); _cosmicHgRaf=null; }
  _cosmicHgRaf = requestAnimationFrame(frame);
}

/* ── Setup neck touch hold (pointer events) ── */
function setupNeckHold(result){
  const nb = document.getElementById('hgNeckTouch');
  const arc = document.getElementById('holdArc');
  // Full circle dasharray = 2*PI*34 ≈ 213.6
  const FULL = 213.6;

  // Clone to remove old listeners
  const fresh = nb.cloneNode(true);
  nb.parentNode.replaceChild(fresh, nb);
  const btn = document.getElementById('hgNeckTouch');
  const arcEl = document.getElementById('holdArc');

  let holdInterval = null;

  function startHold(e){
    e.preventDefault();
    if(_revealed) return;
    _holdActive = true;
    _isPouring = true;
    _holdProgress = 0;
    btn.classList.add('holding');
    playHeartbeat(80, 4);
    startWarpEffect(document.getElementById('warpCanvas'));
    if(navigator.vibrate) navigator.vibrate([30,20,30]);

    holdInterval = setInterval(() => {
      if(!_holdActive){ clearInterval(holdInterval); holdInterval=null; return; }
      _holdProgress += 2.5;
      // Update SVG arc
      const offset = FULL - (FULL * _holdProgress / 100);
      arcEl.style.strokeDashoffset = offset;
      if(_holdProgress >= 100){
        clearInterval(holdInterval); holdInterval=null;
        _holdActive = false;
        _revealed   = true;
        btn.classList.remove('holding');
        revealCosmicResult(result);
      }
    }, 50);
  }

  function endHold(){
    if(_revealed) return;
    _holdActive   = false;
    _isPouring = false;
    _holdProgress = 0;
    btn.classList.remove('holding');
    arcEl.style.strokeDashoffset = FULL;
    if(holdInterval){ clearInterval(holdInterval); holdInterval=null; }
    stopWarpEffect();
  }

  btn.addEventListener('pointerdown',  startHold, {passive:false});
  btn.addEventListener('pointerup',    endHold);
  btn.addEventListener('pointerleave', endHold);
  btn.addEventListener('pointercancel',endHold);
}

function revealCosmicResult(result){
   _isPouring = false;
  _revealed  = true;

  if(_cosmicHgRaf){
    cancelAnimationFrame(_cosmicHgRaf);
    _cosmicHgRaf = null;
  }

  const cvs = document.getElementById('stardustCanvas');
  if(cvs){
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0,0,cvs.width,cvs.height);
  }
  _isPouring = false;
  if(_cosmicHgRaf){ cancelAnimationFrame(_cosmicHgRaf); _cosmicHgRaf=null; }
  stopWarpEffect();
  playFinalChime();

  const wrapper  = document.getElementById('hgWrapper');
  const revEl    = document.getElementById('hgRevelation');
  const revNum   = document.getElementById('hgRevNumber');
  const revSub   = document.getElementById('hgRevSub');
  const symEl    = document.getElementById('hgBottomSymbol');

  /* 1. Freeze hourglass — sand stops, singularity blazes */
  wrapper.classList.add('frozen');
  /* Hide neck touch after reveal */
  const neckTouchEl = document.getElementById('hgNeckTouch');
  if(neckTouchEl){ neckTouchEl.style.transition='opacity .5s'; neckTouchEl.style.opacity='0'; neckTouchEl.style.pointerEvents='none'; }

  /* 2. Scan sweep across bottom bulb */
  const sweep = document.createElement('div');
  sweep.className = 'scan-sweep';
  document.getElementById('hgBottom').appendChild(sweep);
  setTimeout(() => sweep.remove(), 900);

  /* 3. Reveal number with evaporate effect */
  setTimeout(() => {
    const sym = getBottomSymbol(result.total, result.specialEvent);
    const displayNum = result.specialEvent === 'immortal' ? '∞' : String(result.total);

    revNum.textContent = displayNum;
    revNum.style.color = sym.color;
    revNum.style.textShadow = `0 0 30px ${sym.color}, 0 0 80px ${sym.color}88`;

    revEl.style.transition = 'opacity .7s ease, transform .7s ease';
    revEl.style.opacity    = '1';
    revEl.style.transform  = 'translateY(0)';

    /* 4. Typewriter */
    setTimeout(() => {
      const txt = result.specialEvent === 'immortal'
        ? 'Thiên mệnh vô cực — Ngươi vượt ngoài dòng thời gian'
        : result.specialEvent === 'reborn'
        ? 'Chuyển sinh — Hành trình mới chờ đợi ở thế giới khác'
        : `Thiên mệnh: ${result.total} tuổi — Còn lại ${result.lifeLeft} năm`;
      typeWriterEffect(revSub, txt, 45);
    }, 400);

    /* 5. Symbol */
    setTimeout(() => {
      symEl.style.transition = 'opacity 1s ease';
      symEl.style.opacity    = '1';
      symEl.innerHTML = `
        <div class="sym-label" style="color:${sym.color};text-shadow:0 0 12px ${sym.color}">${sym.emoji} ${sym.label}</div>
      `;
    }, 1400);

    /* 6. Stats + bonus */
    setTimeout(() => showLifestyleInfluence(result.lsScore, result.total, result.age), 2200);

  }, 600);
}

function typeWriterEffect(el, text, delay){
  el.textContent='';
  let i=0;
  const iv=setInterval(()=>{
    el.textContent+=text[i]; i++;
    if(i>=text.length) clearInterval(iv);
  }, delay);
}

function showLifestyleInfluence(lsScore, total, age){
  const container = document.getElementById('arenaResultExtra');
  container.innerHTML = '';

  // Bonus/dark block
  let bonusHTML = '';
  if(lsScore > 0){
    bonusHTML = `<div class="arena-bonus">
      <div class="arena-bonus-title" style="color:#00ff88">✦ BONUS LIGHT — Vũ trụ ban phước</div>
      <div class="arena-bonus-text">Lối sống tích cực cộng thêm cho ngươi <strong style="color:#00ff88">+${lsScore} năm</strong> vào thiên mệnh</div>
    </div>`;
  } else if(lsScore < 0){
    bonusHTML = `<div class="arena-bonus dark">
      <div class="arena-bonus-title" style="color:#ff4444">☁ DARK MATTER — Bóng tối đã nuốt thời gian</div>
      <div class="arena-bonus-text">Lối sống tiêu cực trừ đi của ngươi <strong style="color:#ff4444">${lsScore} năm</strong></div>
    </div>`;
  }

  // Stat values
  const clamp = v => Math.min(100, Math.max(10, v));
  const loveV   = clamp(50 + Math.floor((total - 60) * 0.8));
  const moneyV  = clamp(50 + Math.floor((lsScore + 13) * 2));
  const healthV = clamp(50 + Math.floor((lsScore + 13) * 3));

  const statColor = (v) => v >= 80 ? '#00ff88' : v >= 55 ? '#00ccff' : '#ff6666';

  const statsHTML = `<div class="arena-stats" style="margin-top:16px">
    ${[['Tình duyên',loveV],['Tiền bạc',moneyV],['Sức khỏe',healthV]].map(([label,val])=>`
    <div class="arena-stat-row">
      <div class="arena-stat-label"><span>${label}</span><span style="color:${statColor(val)}">${val}%</span></div>
      <div class="arena-stat-bar"><div class="arena-stat-fill" style="background:linear-gradient(90deg,${statColor(val)},${statColor(val)}88)" data-w="${val}"></div></div>
    </div>`).join('')}
  </div>`;

  container.innerHTML = bonusHTML + statsHTML;
  container.style.animation = 'fadeUp .8s ease';

  // Animate bars
  setTimeout(() => {
    container.querySelectorAll('.arena-stat-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 300);
}

/* ── Warp effect ── */
let _warpStars  = [];
let _warpActive = false;

function startWarpEffect(cvs){
  if(_warpActive) return;
  _warpActive = true;
  cvs.width  = window.innerWidth;
  cvs.height = window.innerHeight;
  const c = cvs.getContext('2d');
  _warpStars = Array.from({length:200},()=>({
    x:Math.random()*cvs.width, y:Math.random()*cvs.height,
    z:Math.random()*cvs.width, speed:2
  }));
  cvs.style.transition = 'opacity .5s';
  cvs.style.opacity    = '0.3';

  function warpFrame(){
    if(!_warpActive){ c.clearRect(0,0,cvs.width,cvs.height); return; }
    c.clearRect(0,0,cvs.width,cvs.height);
    _warpStars.forEach(s=>{
      s.z -= s.speed*4;
      if(s.z<=0){s.z=cvs.width;s.x=Math.random()*cvs.width;s.y=Math.random()*cvs.height;}
      const sx=(s.x-cvs.width/2)*(cvs.width/s.z)+cvs.width/2;
      const sy=(s.y-cvs.height/2)*(cvs.width/s.z)+cvs.height/2;
      const len=8*(cvs.width-s.z)/cvs.width;
      const alpha=.3+.7*(1-s.z/cvs.width);
      c.strokeStyle=`rgba(0,220,255,${alpha})`;
      c.lineWidth=.5+len*.05;
      c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+len,sy);c.stroke();
    });
    _warpRaf = requestAnimationFrame(warpFrame);
  }
  _warpRaf = requestAnimationFrame(warpFrame);
}

function stopWarpEffect(){
  _warpActive = false;
  if(_warpRaf){ cancelAnimationFrame(_warpRaf); _warpRaf=null; }
  const cvs = document.getElementById('warpCanvas');
  if(cvs){ cvs.style.transition='opacity 1s'; cvs.style.opacity='0'; }
}

function closePage(){
  document.getElementById("lifePage").classList.remove("show");
  // Stop any running animations
  if(_cosmicHgRaf){ cancelAnimationFrame(_cosmicHgRaf); _cosmicHgRaf = null; }
  if(_warpRaf){ cancelAnimationFrame(_warpRaf); _warpRaf = null; }
  _warpActive = false;
  _revealed = false;
  _holdActive = false;
  _holdProgress = 0;
  _lqAnswers = {};
  _lifeBonus = 0;

  // Reset legacy stat bars if they exist in DOM from inline injection
  ['loveBar','moneyBar','healthBar'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.width = '0%';
  });
}


/* =========================
   ZODIAC DATA
========================= */

/* ======================================================
   CONSTELLATION DATA (tọa độ sao cho 12 cung hoàng đạo)
   Tọa độ tương đối trong canvas zodiacCanvas
====================================================== */
const CONSTELLATION_DATA = {
  "Ma Kết": {
    stars: [[300,120],[260,180],[340,180],[220,260],[280,250],[360,250],[400,200],[300,330],[240,380],[340,380]],
    lines: [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[4,5],[3,7],[7,8],[7,9]],
    color: "#4ecdc4"
  },
  "Bảo Bình": {
    stars: [[200,200],[280,160],[360,190],[440,170],[260,280],[340,260],[420,290],[300,350]],
    lines: [[0,1],[1,2],[2,3],[0,4],[4,5],[5,6],[5,7]],
    color: "#00d4ff"
  },
  "Song Ngư": {
    stars: [[200,150],[260,200],[300,160],[340,210],[380,170],[200,300],[260,280],[300,320],[340,290],[380,330]],
    lines: [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[8,9],[4,9]],
    color: "#6e8efb"
  },
  "Bạch Dương": {
    stars: [[280,100],[320,140],[260,200],[340,210],[300,270],[380,280]],
    lines: [[0,1],[1,2],[1,3],[2,4],[3,5]],
    color: "#ff6b35"
  },
  "Kim Ngưu": {
    stars: [[200,160],[280,130],[360,150],[440,130],[300,240],[260,300],[340,300],[300,380]],
    lines: [[0,1],[1,2],[2,3],[1,4],[4,5],[4,6],[5,7],[6,7]],
    color: "#c8a96e"
  },
  "Song Tử": {
    stars: [[220,100],[220,180],[220,260],[220,340],[380,100],[380,180],[380,260],[380,340],[300,200]],
    lines: [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[1,8],[5,8],[2,6]],
    color: "#f7d794"
  },
  "Cự Giải": {
    stars: [[280,120],[340,140],[300,220],[260,280],[340,280],[300,350]],
    lines: [[0,1],[0,2],[1,2],[2,3],[2,4],[3,5],[4,5]],
    color: "#a8d8ea"
  },
  "Sư Tử": {
    stars: [[200,150],[260,120],[320,140],[380,160],[440,150],[300,220],[260,290],[340,290],[300,360]],
    lines: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[5,7],[6,8],[7,8]],
    color: "#ffd700"
  },
  "Xử Nữ": {
    stars: [[260,100],[300,160],[260,230],[300,290],[350,250],[400,300],[350,360],[300,400]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[3,7]],
    color: "#7bc67e"
  },
  "Thiên Bình": {
    stars: [[300,120],[200,200],[400,200],[260,300],[340,300],[300,380]],
    lines: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,5],[4,5]],
    color: "#b0a0ff"
  },
  "Bọ Cạp": {
    stars: [[200,140],[260,160],[320,180],[380,200],[420,250],[400,310],[360,350],[320,380],[280,360],[240,330]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]],
    color: "#cc2936"
  },
  "Nhân Mã": {
    stars: [[220,200],[290,150],[360,180],[430,140],[300,260],[240,320],[360,320],[300,390]],
    lines: [[0,1],[1,2],[2,3],[1,4],[4,5],[4,6],[5,7],[6,7]],
    color: "#ff8c42"
  }
};

/* ======================================================
   ELEMENT AURA THEMES
====================================================== */
const ELEMENT_THEMES = {
  "Lửa": {
    primary: "#ff4500",
    secondary: "#ff8c00",
    glow: "rgba(255,69,0,0.6)",
    particle: "🔥",
    bodyClass: "theme-fire"
  },
  "Nước": {
    primary: "#006994",
    secondary: "#00bfff",
    glow: "rgba(0,191,255,0.6)",
    particle: "💧",
    bodyClass: "theme-water"
  },
  "Khí": {
    primary: "#c0c0c0",
    secondary: "#e8e8ff",
    glow: "rgba(200,200,255,0.5)",
    particle: "✨",
    bodyClass: "theme-air"
  },
  "Đất": {
    primary: "#556b2f",
    secondary: "#8b6914",
    glow: "rgba(139,105,20,0.6)",
    particle: "🍃",
    bodyClass: "theme-earth"
  }
};

/* ======================================================
   CONSTELLATION DRAWING ENGINE
====================================================== */

let constellationAnimFrame = null;

let constellationResetTimer = null;

function drawConstellation(zodiacName){
  const canvas = document.getElementById("zodiacCanvas");
  if(!canvas) return;

  // Dừng mọi animation và timer cũ
  if(constellationAnimFrame) cancelAnimationFrame(constellationAnimFrame);
  if(constellationResetTimer) clearTimeout(constellationResetTimer);

  canvas.width = 360;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext("2d");
  const data = CONSTELLATION_DATA[zodiacName];
  if(!data) return;

  const cw = canvas.width;  // 460
  const ch = canvas.height;

  // Scale nhỏ + đẩy xa sang trái để chòm sao nằm gọn trong 280px đầu
  const scale = 0.7;
  const offsetX = -10;
  const offsetY = ch / 2 - 190;

  function buildStars(){
    return data.stars.map(([x, y]) => ({
      x: x * scale + offsetX + (Math.random()-0.5)*8,
      y: y * scale + offsetY + (Math.random()-0.5)*8,
      radius: Math.random()*2 + 2.5,
      twinkle: Math.random()*Math.PI*2
    }));
  }

  let stars = buildStars();
  const lines = data.lines;
  const color = data.color;

  // Tổng thời gian vẽ: 8 giây (chậm rãi)
  const totalDuration = 8000;

  let lineProgress = 0;
  let startTime = null;
  let glowStars = new Array(stars.length).fill(false);
  let drawingDone = false;

  function render(timestamp){
    if(!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    lineProgress = Math.min(lines.length, (elapsed / totalDuration) * lines.length);

    // Kiểm tra vẽ xong
    if(!drawingDone && lineProgress >= lines.length){
      drawingDone = true;
      // Sau 5 giây → reset và vẽ lại
      constellationResetTimer = setTimeout(()=>{
        drawingDone = false;
        startTime = null;
        lineProgress = 0;
        glowStars = new Array(stars.length).fill(false);
        stars = buildStars();
      }, 5000);
    }

    ctx.clearRect(0, 0, cw, ch);

    // Vẽ các đường đã hoàn thành
    for(let i = 0; i < Math.floor(lineProgress); i++){
      const [a, b] = lines[i];
      const sx = stars[a].x, sy = stars[a].y;
      const ex = stars[b].x, ey = stars[b].y;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);

      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0, color + "cc");
      grad.addColorStop(1, color + "44");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.shadowBlur = 0;

      glowStars[a] = true;
      glowStars[b] = true;
    }

    // Vẽ đường đang kéo (partial) — đầu bút sáng hơn
    const currentLineIdx = Math.floor(lineProgress);
    if(currentLineIdx < lines.length){
      const frac = lineProgress - currentLineIdx;
      const [a, b] = lines[currentLineIdx];
      const sx = stars[a].x, sy = stars[a].y;
      const ex = stars[b].x, ey = stars[b].y;
      const tx = sx + (ex-sx)*frac;
      const ty = sy + (ey-sy)*frac;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Hào quang đầu bút (điểm đang di chuyển)
      const tipGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, 14);
      tipGlow.addColorStop(0, color + "ff");
      tipGlow.addColorStop(0.4, color + "88");
      tipGlow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(tx, ty, 14, 0, Math.PI*2);
      ctx.fillStyle = tipGlow;
      ctx.fill();
    }

    // Vẽ các ngôi sao
    const now = timestamp / 1000;
    stars.forEach((star, i) => {
      const twinkle = 0.75 + 0.25 * Math.sin(now * 1.8 + star.twinkle);
      const isGlowing = glowStars[i];

      if(isGlowing){
        // Bloom ngoài
        const bloom = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 9);
        bloom.addColorStop(0, color + "55");
        bloom.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 9, 0, Math.PI*2);
        ctx.fillStyle = bloom;
        ctx.fill();

        // Nhân sáng
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 3.5 * twinkle, 0, Math.PI*2);
        ctx.fillStyle = color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Lõi sao
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius * twinkle, 0, Math.PI*2);
      ctx.fillStyle = isGlowing ? "white" : "rgba(255,255,255,0.55)";
      if(isGlowing){
        ctx.shadowBlur = 14;
        ctx.shadowColor = "white";
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    constellationAnimFrame = requestAnimationFrame(render);
  }

  constellationAnimFrame = requestAnimationFrame(render);
}

/* ======================================================
   ELEMENT AURA SYSTEM
====================================================== */

let auraParticles = [];
let auraAnimFrame = null;

function applyElementAura(element){
  // Remove old themes
  document.body.classList.remove("theme-fire","theme-water","theme-air","theme-earth");

  const theme = ELEMENT_THEMES[element];
  if(!theme) return;

  document.body.classList.add(theme.bodyClass);

  // Update CSS variables
  document.documentElement.style.setProperty("--aura-primary", theme.primary);
  document.documentElement.style.setProperty("--aura-secondary", theme.secondary);
  document.documentElement.style.setProperty("--aura-glow", theme.glow);

  // Spawn particles
  spawnAuraParticles(theme);
}

function removeElementAura(){
  document.body.classList.remove("theme-fire","theme-water","theme-air","theme-earth");
  if(auraAnimFrame) cancelAnimationFrame(auraAnimFrame);
  // Remove particle container
  const pc = document.getElementById("auraParticleContainer");
  if(pc) pc.remove();
}

function spawnAuraParticles(theme){
  // Remove old
  let pc = document.getElementById("auraParticleContainer");
  if(pc) pc.remove();

  pc = document.createElement("div");
  pc.id = "auraParticleContainer";
  pc.style.cssText = `
    position:fixed; inset:0; pointer-events:none; z-index:1;
    overflow:hidden;
  `;
  document.body.appendChild(pc);

  // Spawn particles continuously for 5 seconds
  let count = 0;
  const maxParticles = 30;
  const interval = setInterval(()=>{
    if(count >= maxParticles){ clearInterval(interval); return; }
    count++;

    const p = document.createElement("div");
    p.className = "aura-particle";
    p.innerText = theme.particle;

    const startX = Math.random() * window.innerWidth;
    const duration = 3 + Math.random() * 4;
    const size = 16 + Math.random() * 24;

    let endX, endY, animation;

    if(theme.bodyClass === "theme-fire"){
      // Particles float up
      endX = startX + (Math.random()-0.5)*200;
      p.style.cssText = `
        position:absolute; left:${startX}px; bottom:0; font-size:${size}px;
        opacity:0; animation:particleFireRise ${duration}s ease-out forwards;
      `;
    } else if(theme.bodyClass === "theme-water"){
      // Particles ripple/fall
      p.style.cssText = `
        position:absolute; left:${startX}px; top:${Math.random()*window.innerHeight*0.5}px;
        font-size:${size}px; opacity:0;
        animation:particleWaterFall ${duration}s ease-in forwards;
      `;
    } else if(theme.bodyClass === "theme-air"){
      // Drift sideways
      p.style.cssText = `
        position:absolute; left:0; top:${Math.random()*window.innerHeight}px;
        font-size:${size}px; opacity:0;
        animation:particleAirDrift ${duration}s linear forwards;
      `;
    } else {
      // Leaves fall
      p.style.cssText = `
        position:absolute; left:${startX}px; top:-30px;
        font-size:${size}px; opacity:0;
        animation:particleLeafFall ${duration}s ease-in forwards;
      `;
    }

    pc.appendChild(p);
    setTimeout(()=>p.remove(), duration * 1000 + 500);
  }, 200);
}


/* =========================
   ZODIAC REVEAL (UPGRADED)
========================= */

function zodiacReveal(){

  const dob = document.getElementById("dob").value;
  if(!dob){
    showMysticWarning();
    return;
  }

  const date = new Date(dob);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const zodiac = getZodiac(day, month);
  const image = document.getElementById("zodiacImage");

  image.classList.remove("show");
  image.src = "uploads/star/" + zodiac.image;
  setTimeout(()=>{ image.classList.add("show"); }, 600);

  const page = document.getElementById("zodiacPage");
  const result = document.getElementById("zodiacResult");
  const desc = document.getElementById("zodiacDescription");

  page.classList.add("show");

  // Di chuyển canvas ra body và apply inline style để đảm bảo hiển thị
  const cnv = document.getElementById("zodiacCanvas");
  if(cnv){
    // Move ra body (thoát stacking context của page-overlay)
    if(cnv.parentElement !== document.body){
      document.body.appendChild(cnv);
    }
    // Apply style trực tiếp để đảm bảo không bị ghi đè
    cnv.style.cssText = `
      display:block !important;
      position:fixed !important;
      top:0 !important;
      left:0 !important;
      width:360px !important;
      height:100vh !important;
      z-index:3000 !important;
      pointer-events:none !important;
    `;
  }

  // Apply element aura theme
  applyElementAura(zodiac.element);

  // Draw constellation
  setTimeout(()=>{
    drawConstellation(zodiac.name);
  }, 300);

  result.innerHTML = zodiac.symbol + " " + zodiac.name;

  desc.innerHTML = `
    <p><strong>Nguyên tố:</strong> ${zodiac.element}</p>
    <p>${zodiac.description}</p>
    <p style="margin-top:20px; font-style:italic; color:#ffd700;">
      🔮 Lời tiên tri: ${zodiac.prophecy}
    </p>
    <div id="compatibilityBox" style="margin-top:30px;"></div>
  `;

  setTimeout(()=> result.classList.add("show"), 400);
  setTimeout(()=> desc.classList.add("show"), 1000);

  // Show compatibility collision
  setTimeout(()=>{
    showCompatibility(zodiac);
  }, 1200);
}

function closeZodiac(){
  const page = document.getElementById("zodiacPage");
  const result = document.getElementById("zodiacResult");
  const desc = document.getElementById("zodiacDescription");

  page.classList.remove("show");
  result.classList.remove("show");
  desc.classList.remove("show");

  // Ẩn canvas khi đóng
  const cnv = document.getElementById("zodiacCanvas");
  if(cnv) cnv.style.display = "none";

  // Stop constellation + clear reset timer
  if(constellationAnimFrame) cancelAnimationFrame(constellationAnimFrame);
  if(constellationResetTimer) clearTimeout(constellationResetTimer);

  // Remove aura
  removeElementAura();
}

function getZodiac(day, month){

  const signs = [

    {
      name:"Ma Kết",
      symbol:"♑",
      image:"Capricorn.png",
      start:[12,22],
      end:[1,19],
      element:"Đất",
      description:"Chiến lược gia bẩm sinh, luôn âm thầm tính toán con đường dẫn đến quyền lực.",
      prophecy:"Trong vòng 12 tháng tới, một thử thách lớn sẽ buộc ngươi phải lựa chọn giữa an toàn và tham vọng. Nếu đủ bản lĩnh bước qua nỗi sợ, ngươi sẽ đạt được vị trí mà trước đây ngươi từng nghĩ mình chưa xứng đáng."
      ,
      compatibility:{ "Kim Ngưu":95,"Xử Nữ":92,"Cự Giải":60,"Bạch Dương":50 }
    },

    {
      name:"Bảo Bình",
      symbol:"♒",
      image:"Aquarius.png",
      start:[1,20],
      end:[2,18],
      element:"Khí",
      description:"Kẻ suy nghĩ vượt thời đại, không ai hiểu hết được chiều sâu bên trong.",
      prophecy:"Một ý tưởng từng bị người khác coi thường sẽ bất ngờ trở thành cơ hội vàng. Đừng để sự nghi ngờ của người đời dập tắt tầm nhìn của ngươi."
      ,
      compatibility:{ "Song Tử":93,"Thiên Bình":90,"Bọ Cạp":50,"Kim Ngưu":55 }
    },

    {
      name:"Song Ngư",
      symbol:"♓",
      image:"Pisces.png",
      start:[2,19],
      end:[3,20],
      element:"Nước",
      description:"Tâm hồn nhạy cảm, trực giác mạnh mẽ hơn bất kỳ lý trí nào.",
      prophecy:"Một cuộc gặp gỡ định mệnh sẽ khiến thế giới nội tâm của ngươi rung chuyển. Hãy lắng nghe trực giác — nó sẽ dẫn ngươi đến đúng nơi thuộc về."
      ,
      compatibility:{ "Cự Giải":94,"Bọ Cạp":91,"Song Tử":55,"Nhân Mã":60 }
    },

    {
      name:"Bạch Dương",
      symbol:"♈",
      image:"Aries.png",
      start:[3,21],
      end:[4,19],
      element:"Lửa",
      description:"Người tiên phong không biết sợ hãi.",
      prophecy:"Một cuộc cạnh tranh sẽ xuất hiện. Nếu ngươi dám bước lên trước, phần thưởng sẽ vượt xa mong đợi ban đầu."
      ,
      compatibility:{ "Sư Tử":95,"Nhân Mã":90,"Ma Kết":50,"Cự Giải":55 }
    },

    {
      name:"Kim Ngưu",
      symbol:"♉",
      image:"Taurus.png",
      start:[4,20],
      end:[5,20],
      element:"Đất",
      description:"Kiên định, thực tế và trung thành.",
      prophecy:"Sự kiên nhẫn của ngươi sắp được đền đáp. Một khoản tài chính hoặc cơ hội đầu tư bất ngờ sẽ xuất hiện."
      ,
      compatibility:{ "Ma Kết":95,"Xử Nữ":90,"Bảo Bình":55,"Sư Tử":60 }
    },

    {
      name:"Song Tử",
      symbol:"♊",
      image:"Gemini.png",
      start:[5,21],
      end:[6,20],
      element:"Khí",
      description:"Trí tuệ linh hoạt và khả năng thích nghi vượt trội.",
      prophecy:"Một chuyến đi hoặc thay đổi môi trường sẽ mở ra một mối quan hệ mới mang tính bước ngoặt."
      ,
      compatibility:{ "Bảo Bình":93,"Thiên Bình":88,"Song Ngư":55,"Xử Nữ":50 }
    },

    {
      name:"Cự Giải",
      symbol:"♋",
      image:"Cancer.png",
      start:[6,21],
      end:[7,22],
      element:"Nước",
      description:"Người bảo hộ cảm xúc và gia đình.",
      prophecy:"Một người thân sẽ cần sự hỗ trợ của ngươi. Khi ngươi cho đi chân thành, vận mệnh sẽ trả lại gấp nhiều lần."
      ,
      compatibility:{ "Song Ngư":94,"Bọ Cạp":90,"Bạch Dương":55,"Thiên Bình":60 }
    },

    {
      name:"Sư Tử",
      symbol:"♌",
      image:"Leo.png",
      start:[7,23],
      end:[8,22],
      element:"Lửa",
      description:"Sinh ra để lãnh đạo và tỏa sáng.",
      prophecy:"Ánh đèn sân khấu đang đến gần. Một cơ hội thể hiện bản thân sẽ thay đổi cách người khác nhìn về ngươi."
      ,
      compatibility:{ "Bạch Dương":95,"Nhân Mã":92,"Kim Ngưu":60,"Bọ Cạp":55 }
    },

    {
      name:"Xử Nữ",
      symbol:"♍",
      image:"Virgo.png",
      start:[8,23],
      end:[9,22],
      element:"Đất",
      description:"Sự tỉ mỉ chính là sức mạnh.",
      prophecy:"Một chi tiết nhỏ mà người khác bỏ qua sẽ trở thành chìa khóa thành công của ngươi."
      ,
      compatibility:{ "Kim Ngưu":90,"Ma Kết":92,"Song Tử":50,"Nhân Mã":55 }
    },

    {
      name:"Thiên Bình",
      symbol:"♎",
      image:"Libra.png",
      start:[9,23],
      end:[10,22],
      element:"Khí",
      description:"Người tìm kiếm sự cân bằng và công lý.",
      prophecy:"Một quyết định quan trọng đang đến. Nếu giữ được sự tỉnh táo, ngươi sẽ đạt được sự ổn định lâu dài."
      ,
      compatibility:{ "Song Tử":88,"Bảo Bình":90,"Cự Giải":60,"Ma Kết":55 }
    },

    {
      name:"Bọ Cạp",
      symbol:"♏",
      image:"Scorpio.png",
      start:[10,23],
      end:[11,21],
      element:"Nước",
      description:"Mãnh liệt và đầy chiều sâu.",
      prophecy:"Một bí mật sẽ được hé lộ. Hãy chuẩn bị tinh thần để đối mặt với sự thật và tái sinh mạnh mẽ hơn."
      ,
      compatibility:{ "Song Ngư":91,"Cự Giải":90,"Sư Tử":55,"Bảo Bình":50 }
    },

    {
      name:"Nhân Mã",
      symbol:"♐",
      image:"Sagittarius.png",
      start:[11,22],
      end:[12,21],
      element:"Lửa",
      description:"Kẻ yêu tự do và chân trời mới.",
      prophecy:"Một chuyến hành trình xa sẽ mang lại cơ hội thay đổi vận mệnh. Đừng sợ rời khỏi vùng an toàn."
      ,
      compatibility:{ "Sư Tử":92,"Bạch Dương":90,"Song Ngư":60,"Xử Nữ":55 }
    }
  ];

  for(let sign of signs){
    if(
      (month === sign.start[0] && day >= sign.start[1]) ||
      (month === sign.end[0] && day <= sign.end[1])
    ){
      return sign;
    }
  }

  return signs[0];
}

/* ======================================================
   ZODIAC COMPATIBILITY - COLLISION EFFECT (NÂNG CẤP)
====================================================== */

function showCompatibility(zodiac){
  const box = document.getElementById("compatibilityBox");

  let html = `
    <h3 style="font-size:22px;margin-bottom:20px;color:#ffd700;text-shadow:0 0 10px gold;">
      💘 Độ tương hợp vận mệnh
    </h3>
    <div class="compat-grid">
  `;

  for(let sign in zodiac.compatibility){
    const percent = zodiac.compatibility[sign];
    html += `
      <div class="compat-item" onclick="triggerCollision('${zodiac.symbol}','${sign}',${percent})"
           title="Xem hiệu ứng va chạm">
        <div class="compat-label">${sign}</div>
        <div class="compat-bar-wrap">
          <div class="compat-bar" data-percent="${percent}"></div>
        </div>
        <div class="compat-percent">${percent}%</div>
      </div>
    `;
  }

  html += `</div>
    <p style="margin-top:15px;font-size:13px;opacity:0.6;">✨ Nhấn vào để xem độ tương hợp</p>
  `;

  box.innerHTML = html;

  // Animate bars
  setTimeout(()=>{
    box.querySelectorAll(".compat-bar").forEach(bar=>{
      bar.style.width = bar.dataset.percent + "%";
    });
  }, 300);
}

/* ======================================================
   COLLISION ANIMATION
====================================================== */

function triggerCollision(mySymbol, crushSign, percent){
  // Tạo backdrop tối riêng (div) để không bị reset mỗi frame
  let backdrop = document.getElementById("collisionBackdrop");
  if(!backdrop){
    backdrop = document.createElement("div");
    backdrop.id = "collisionBackdrop";
    backdrop.style.cssText = `
      position:fixed; inset:0; z-index:9998;
      background:rgba(0,0,8,0.88);
      backdrop-filter:blur(3px);
      pointer-events:none;
      opacity:0; transition:opacity 0.4s ease;
    `;
    document.body.appendChild(backdrop);
  }
  setTimeout(()=>{ backdrop.style.opacity = "1"; }, 10);

  // Canvas animation phía trên backdrop
  let overlay = document.getElementById("collisionOverlay");
  if(!overlay){
    overlay = document.createElement("canvas");
    overlay.id = "collisionOverlay";
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9999;
      pointer-events:auto; width:100%; height:100%;
    `;
    document.body.appendChild(overlay);
  }

  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;

  const ctx = overlay.getContext("2d");
  const W = overlay.width;
  const H = overlay.height;

  const cx = W / 2;
  const cy = H / 2;

  // Find crush sign symbol
  const allSigns = {
    "Ma Kết":"♑","Bảo Bình":"♒","Song Ngư":"♓","Bạch Dương":"♈",
    "Kim Ngưu":"♉","Song Tử":"♊","Cự Giải":"♋","Sư Tử":"♌",
    "Xử Nữ":"♍","Thiên Bình":"♎","Bọ Cạp":"♏","Nhân Mã":"♐"
  };
  const crushSymbol = allSigns[crushSign] || "★";

  const highCompat = percent >= 80;

  let phase = "approach"; // approach → impact → result
  let t = 0;

  // Ball positions
  let ballA = { x: -80, y: cy, vx: 12, symbol: mySymbol, color: "#00d4ff" };
  let ballB = { x: W + 80, y: cy, vx: -12, symbol: crushSymbol, color: "#ff6b9d" };

  // Particles for explosion
  let particles = [];

  function spawnExplosion(x, y, type){
    const count = type === "supernova" ? 80 : 40;
    for(let i=0;i<count;i++){
      const angle = (Math.PI*2/count)*i + Math.random()*0.5;
      const speed = type === "supernova"
        ? 4 + Math.random()*10
        : 2 + Math.random()*5;
      particles.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        life: 1,
        decay: 0.015 + Math.random()*0.02,
        size: type === "supernova" ? 3+Math.random()*6 : 2+Math.random()*4,
        color: type === "supernova"
          ? `hsl(${Math.random()*60+30},100%,${60+Math.random()*30}%)`
          : `hsl(${Math.random()*30+200},80%,60%)`
      });
    }
  }

  let impacted = false;
  let resultShown = false;
  let resultAlpha = 0;
  let resultText = highCompat
    ? "💫 THIÊN ĐỊNH VƯƠNG ĐÔI 💫"
    : "💥 KHÔNG HỢP DÙ ĐẦU THAI LẠI";
  let cameraShake = 0;

  function drawBall(ball, alpha){
    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow
    const grd = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, 60);
    grd.addColorStop(0, ball.color + "88");
    grd.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 60, 0, Math.PI*2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core circle
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 38, 0, Math.PI*2);
    ctx.fillStyle = ball.color + "44";
    ctx.strokeStyle = ball.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = ball.color;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Symbol
    ctx.font = "bold 32px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    ctx.fillText(ball.symbol, ball.x, ball.y);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  function renderCollision(ts){
    t++;

    const shakeX = cameraShake > 0 ? (Math.random()-0.5)*cameraShake : 0;
    const shakeY = cameraShake > 0 ? (Math.random()-0.5)*cameraShake : 0;
    if(cameraShake > 0) cameraShake *= 0.85;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.clearRect(-50, -50, W+100, H+100);

    // Background handled by #collisionBackdrop div (no canvas fill needed)

    if(phase === "approach"){
      ballA.x += ballA.vx;
      ballB.x += ballB.vx;

      drawBall(ballA, 1);
      drawBall(ballB, 1);

      // Collision detection
      const dist = Math.abs(ballA.x - ballB.x);
      if(dist < 90 && !impacted){
        impacted = true;
        phase = "impact";
        cameraShake = highCompat ? 25 : 18;
        spawnExplosion(cx, cy, highCompat ? "supernova" : "bounce");

        if(highCompat){
          // Balls merge
          ballA.vx = 0;
          ballB.vx = 0;
        } else {
          // Balls bounce back
          ballA.vx = -8;
          ballB.vx = 8;
        }
      }
    }

    if(phase === "impact"){
      if(highCompat){
        // Pulsating merge effect
        const pulse = 1 + 0.3 * Math.sin(t*0.2);
        const alpha = 1 - (t - 60) / 80;

        ballA.x = cx - 20 * Math.cos(t*0.05);
        ballB.x = cx + 20 * Math.cos(t*0.05);

        drawBall(ballA, Math.max(0, alpha > 0 ? 1 : 0));
        drawBall(ballB, Math.max(0, alpha > 0 ? 1 : 0));

        // Supernova ring
        if(t > 20){
          const ringR = (t-20) * 3;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(255,215,0,${Math.max(0, 1-ringR/400)})`;
          ctx.lineWidth = 4;
          ctx.shadowBlur = 30;
          ctx.shadowColor = "gold";
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else {
        // Bounce back
        ballA.x += ballA.vx;
        ballB.x += ballB.vx;
        ballA.vx *= 0.97;
        ballB.vx *= 0.97;

        drawBall(ballA, 1);
        drawBall(ballB, 1);

        // Crack effect
        if(t < 30){
          ctx.save();
          ctx.strokeStyle = `rgba(255,100,100,${1-t/30})`;
          ctx.lineWidth = 2;
          for(let i=0;i<8;i++){
            const angle = (Math.PI*2/8)*i;
            const len = 20 + Math.random()*40;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle)*len, cy + Math.sin(angle)*len);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Particles
      particles.forEach((p,i)=>{
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= p.decay;

        if(p.life > 0){
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
      particles = particles.filter(p=>p.life>0);

      if(t > 100){
        phase = "result";
        t = 0;
      }
    }

    if(phase === "result"){
      resultAlpha = Math.min(1, t/30);

      // Remaining particles
      particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= p.decay;
        if(p.life > 0){
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life * resultAlpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
      particles = particles.filter(p=>p.life>0);

      // Hiện HTML div khi t==1 (dùng HTML để font tiếng Việt không bị lỗi)
      if(t === 1){
        let htmlResult = document.getElementById("collisionResultText");
        if(!htmlResult){
          htmlResult = document.createElement("div");
          htmlResult.id = "collisionResultText";
          document.body.appendChild(htmlResult);
        }
        htmlResult.style.cssText = `
          position:fixed;
          top:50%; left:50%;
          transform:translate(-50%,-50%);
          z-index:10000;
          text-align:center;
          pointer-events:none;
          opacity:0;
          transition:opacity 0.8s ease;
        `;
        htmlResult.innerHTML = highCompat
          ? `<div style="
                font-size:clamp(18px,2.5vw,30px);
                font-weight:bold;
                color:gold;
                font-family:'Playfair Display','Georgia',serif;
                text-shadow:0 0 20px gold,0 0 40px orange;
                letter-spacing:2px;">
              💫 THIÊN ĐỊNH VƯƠNG ĐÔI 💫
             </div>
             <div style="
                margin-top:14px;
                font-size:clamp(14px,1.5vw,20px);
                color:#ffe;
                font-family:'EB Garamond','Georgia',serif;
                text-shadow:0 0 10px gold;">
               Độ tương hợp: ${percent}% ✨
             </div>
             `
          : `<div style="
                font-size:clamp(16px,2vw,26px);
                font-weight:bold;
                color:#ff6666;
                font-family:'Playfair Display','Georgia',serif;
                text-shadow:0 0 20px red,0 0 40px #ff0000;
                letter-spacing:1px;">
              💥 KHÔNG HỢP DÙ ĐẦU THAI LẠI
             </div>
             <div style="
                margin-top:14px;
                font-size:clamp(13px,1.4vw,18px);
                color:#faa;
                font-family:'EB Garamond','Georgia',serif;
                text-shadow:0 0 10px red;">
               Độ tương hợp: ${percent}% 💔
             </div>
             `;

        setTimeout(()=>{ htmlResult.style.opacity = "1"; }, 50);
      }

      // KHÔNG tự động đóng — chờ người dùng click (xử lý ở onclick bên dưới)
    }

    ctx.restore();
    requestAnimationFrame(renderCollision);
  }

  requestAnimationFrame(renderCollision);

  function closeCollision(){
    clearInterval(checkDone);
    const htmlResult = document.getElementById("collisionResultText");
    const backdrop = document.getElementById("collisionBackdrop");
    if(htmlResult){
      htmlResult.style.transition = "opacity 0.5s ease";
      htmlResult.style.opacity = "0";
      setTimeout(()=>htmlResult.remove(), 500);
    }
    if(backdrop){
      backdrop.style.opacity = "0";
      setTimeout(()=>backdrop.remove(), 500);
    }
    overlay.style.transition = "opacity 0.5s ease";
    overlay.style.opacity = "0";
    setTimeout(()=>overlay.remove(), 500);
  }

  // Chỉ đóng khi người dùng click — và chỉ khi đã đến phase result
  let animDone = false;
  const checkDone = setInterval(()=>{
    if(phase === "result" && t > 30){
      animDone = true;
      clearInterval(checkDone);
    }
  }, 100);

  overlay.onclick = ()=>{
    if(!animDone) return;
    closeCollision();
  };
}


/* Parallax 3D đã bị tắt theo yêu cầu */

/* =========================
   ENERGY FLOW - REMASTERED
========================= */

const ELEMENT_DATA = {
  "Kim":{
    color:"#d4d4d4", glow:"#c8c8e8", shadow:"silver",
    bodyClass:"env-kim",
    symbol:"⚔", artifact:"⚔️",
    title:"MỆNH KIM",
    subtitle:"Kim loại tinh luyện • Khí chất sắc bén",
    prophecy:"Ngươi mang trong mình khí chất của kim loại được tôi luyện qua lửa. Những thử thách sắp tới không nhằm đánh gục ngươi, mà để mài giũa ngươi trở nên sắc bén và vững vàng hơn. Khi thời cơ đến, ngươi sẽ là người nắm quyền chủ động và đưa ra quyết định then chốt thay đổi cục diện.",
    oracle:`Trong màn đêm vô tận của vũ trụ, có những linh hồn được đúc nên từ kim loại nguyên chất — không phải vàng hào nhoáng, không phải đồng thô thiển, mà là thứ kim khí hiếm hoi chỉ xuất hiện khi trời đất hội tụ đủ lửa và thời gian. Ngươi là một trong số đó.

Thiên cơ đã định: trong chu kỳ ba năm tới, có một khoảnh khắc mà vũ trụ sẽ mở ra cánh cửa không phải dành cho tất cả mọi người — chỉ dành cho những ai đã trải qua đủ thử thách mà vẫn giữ được phẩm chất nguyên vẹn. Ngươi đã từng bị ngọn lửa thiêu đốt, từng chịu đựng búa tạ của số phận, nhưng mỗi lần như vậy, ngươi không tan chảy — ngươi được định hình lại, sắc bén hơn, thuần khiết hơn.

Hãy cẩn thận với những kẻ đến gần ngươi bằng lời ngọt ngào nhưng ẩn chứa hỏa khí. Kim gặp Hỏa mạnh sẽ bị nung chảy hình dạng — không phải để tiêu diệt, mà để tái sinh. Nhưng trong giai đoạn chuyển tiếp đó, ngươi sẽ tạm thời mất đi ranh giới của chính mình. Hãy biết ai thực sự tôi luyện ngươi, và ai chỉ muốn xem ngươi chảy tan.

Tinh tú Kim Tinh đang hướng về phía ngươi. Một quyết định tài chính hoặc pháp lý sẽ xuất hiện vào thời điểm ngươi chưa kịp chuẩn bị — nhưng chính bản năng sắc bén như kiếm của ngươi sẽ giúp ngươi nhìn thấu bản chất vấn đề khi người khác vẫn còn mơ hồ. Đừng do dự. Lưỡi kiếm chần chừ là lưỡi kiếm gỉ sét.

Số mệnh đã khắc lên vận trình của ngươi một điều: ngươi sinh ra không phải để theo sau — ngươi sinh ra để đi trước và để người khác nương tựa vào sự vững chắc của ngươi.`,
    career:"Thích hợp: Tài chính, pháp lý, kỹ thuật chính xác",
    love:"Hợp với mệnh Thổ và Thủy. Cần kiên nhẫn với mệnh Hỏa.",
    sinh:"Thổ sinh Kim", khac:"Hỏa khắc Kim",
    sinhColor:"#ffaa33", khacColor:"#ff4444",
    audioFreq:[523,659,784]
  },
  "Mộc":{
    color:"#66ff99", glow:"#00cc66", shadow:"lime",
    bodyClass:"env-moc",
    symbol:"🌿", artifact:"🌿",
    title:"MỆNH MỘC",
    subtitle:"Sinh khí của đất • Linh hồn vươn xa",
    prophecy:"Năng lượng của ngươi giống như mầm cây vươn lên giữa đất trời. Dù gặp trở ngại, ngươi vẫn có khả năng tái sinh và phát triển mạnh mẽ hơn trước. Trong thời gian tới, sự kiên trì và lòng nhân ái của ngươi sẽ mở ra những cánh cửa mới mà ngươi chưa từng nghĩ tới.",
    oracle:`Từ thuở hồng hoang khi trời và đất còn chưa phân định, đã có một nguồn sinh khí âm thầm chảy trong lòng đất — không ồn ào, không vội vã, nhưng không gì có thể ngăn cản. Đó là khí Mộc. Và ngươi mang trong mình dòng chảy đó.

Những người mang mệnh Mộc thường bị người đời hiểu lầm là yếu đuối bởi sự mềm mại và lòng trắc ẩn của họ. Nhưng thiên cơ biết rõ: không có gì mạnh hơn rễ cây bám sâu vào đá núi qua ngàn năm phong hóa. Ngươi không chinh phục bằng sức mạnh — ngươi chinh phục bằng sự bền bỉ mà ngay cả thời gian cũng phải nghiêng mình.

Vũ trụ đã quan sát ngươi. Trong những đêm ngươi tự hỏi liệu con đường mình đang đi có ý nghĩa gì không — có một lực lượng vô hình đang ghi chép từng bước đi của ngươi. Không có giọt mồ hôi nào rơi xuống mà đất không hấp thụ, không có nỗi đau nào ngươi chịu đựng mà không trở thành dưỡng chất cho gốc rễ của ngươi.

Mộc Tinh đang chuyển vị. Trong chu kỳ sắp tới, một người — có thể là người lạ, có thể là kẻ ngươi đã biết từ lâu — sẽ xuất hiện như Thủy tưới Mộc: họ sẽ mang đến điều ngươi thiếu thốn nhất mà không cần ngươi cất lời cầu xin. Hãy đón nhận sự nuôi dưỡng đó mà không ngại ngùng — đây không phải sự yếu đuối, đây là vũ trụ cân bằng khí số cho ngươi.

Nhưng hãy đề phòng hướng Tây — khí Kim đang ẩn náu ở đó. Không phải để tiêu diệt, mà để thử thách ranh giới của ngươi. Hãy nhớ: cây không sợ bị tỉa cành, vì mỗi lần như vậy, nó lại đâm chồi mạnh mẽ hơn về hướng ánh sáng.`,
    career:"Thích hợp: Giáo dục, nghệ thuật, y tế, nông nghiệp",
    love:"Hợp với mệnh Thủy và Hỏa. Cẩn thận với mệnh Kim.",
    sinh:"Thủy sinh Mộc", khac:"Kim khắc Mộc",
    sinhColor:"#66ccff", khacColor:"#d4d4d4",
    audioFreq:[392,494,587]
  },
  "Thủy":{
    color:"#66ccff", glow:"#0077ff", shadow:"cyan",
    bodyClass:"env-thuy",
    symbol:"🌊", artifact:"💎",
    title:"MỆNH THỦY",
    subtitle:"Dòng chảy vô hình • Trí tuệ thâm sâu",
    prophecy:"Ngươi sở hữu dòng chảy nội tâm sâu sắc và linh hoạt. Khi người khác còn do dự, ngươi đã âm thầm tìm ra lối đi riêng. Sắp tới sẽ có một bước ngoặt bất ngờ, và chính sự mềm dẻo cùng trực giác nhạy bén sẽ giúp ngươi vượt qua sóng gió để tiến về phía trước.",
    oracle:`Nước không có hình dạng cố định — nó là mọi hình dạng và không là hình dạng nào. Đây không phải sự thiếu kiên định, đây là sự thông tuệ cao nhất mà vũ trụ ban tặng cho những linh hồn đã trải qua nhiều kiếp luân hồi. Ngươi là một trong những linh hồn đó.

Từ thuở tiền kiếp, ngươi đã học cách thấm vào mọi ngóc ngách của thực tại — những kẽ nứt mà người khác không nhìn thấy, những con đường ẩn mà bản đồ thông thường không ghi chép. Đó là lý do tại sao ngươi thường cảm nhận được điều sắp xảy ra trước khi nó thực sự xảy ra. Trực giác của ngươi không phải may mắn ngẫu nhiên — đó là ký ức tích lũy từ vô số kiếp người đang tự biểu hiện.

Thủy Tinh đang ở vị trí thuận lợi. Những con sóng ngầm của vận mệnh đang đẩy ngươi về phía một bờ mà ngươi chưa từng đặt chân. Đừng cưỡng lại dòng chảy đó — hãy buông mình và tin vào sức đẩy vô hình. Những người mang mệnh Thủy thường mắc một sai lầm duy nhất: họ phân tích quá nhiều đến mức để lỡ khoảnh khắc thiên định mà chỉ cần họ nhắm mắt và bước.

Có một kẻ thù âm thầm đang tìm cách làm ngươi tù túng — đó là chính ngươi khi ngươi để Thổ khí xâm nhập vào tâm trí: sự nghi ngờ, sự trì trệ, nỗi sợ định hình. Hãy giữ cho dòng chảy nội tâm luôn lưu thông. Nước đứng yên sẽ thành ao tù. Nước chảy mãi sẽ thành đại dương.

Trong ba mùa tới, có một cuộc gặp gỡ được tinh tú sắp đặt — người đó sẽ nhìn thấy phần sâu thẳm nhất của ngươi mà ngay cả ngươi chưa dám nhìn nhận. Đừng tháo chạy khỏi sự thấu hiểu đó.`,
    career:"Thích hợp: Triết học, tâm lý, nghiên cứu, ngoại giao",
    love:"Hợp với mệnh Kim và Mộc. Khắc khẩu với mệnh Thổ.",
    sinh:"Kim sinh Thủy", khac:"Thổ khắc Thủy",
    sinhColor:"#d4d4d4", khacColor:"#ffaa33",
    audioFreq:[261,329,392]
  },
  "Hỏa":{
    color:"#ff6666", glow:"#ff2200", shadow:"red",
    bodyClass:"env-hoa",
    symbol:"🔥", artifact:"🔥",
    title:"MỆNH HỎA",
    subtitle:"Ngọn lửa bất diệt • Hào khí ngàn thu",
    prophecy:"Ngọn lửa trong ngươi không bao giờ tắt. Ngươi có khả năng truyền cảm hứng và tạo ra đột phá khi người khác còn e dè. Một giai đoạn bùng nổ đang đến gần, nếu ngươi dám hành động quyết liệt, thành quả đạt được sẽ vượt xa kỳ vọng ban đầu.",
    oracle:`Kể từ khi vũ trụ bùng nổ từ hư vô mà thành, lửa là nguyên tố đầu tiên tồn tại — trước khi có đất, trước khi có nước, trước khi có không khí để thở. Ngươi mang trong mình ký ức của ngọn lửa nguyên thủy đó. Và ký ức đó không bao giờ nguội tắt.

Có những linh hồn sinh ra để sưởi ấm — và có những linh hồn sinh ra để soi sáng. Ngươi thuộc về cả hai. Khả năng truyền cảm hứng của ngươi không phải kỹ năng được học — đó là thiên phú được khắc vào mệnh số. Khi ngươi bước vào một căn phòng, nhiệt độ thay đổi. Khi ngươi lên tiếng, người khác lắng nghe dù họ không hiểu tại sao.

Nhưng ngươi phải hiểu một nghịch lý thiêng liêng: ngọn lửa mạnh nhất không phải ngọn lửa bùng cháy dữ dội nhất — mà là ngọn lửa biết cách kiểm soát để không thiêu rụi những gì ngươi yêu quý. Hỏa khí trong ngươi đang ở đỉnh cao. Nếu ngươi không học cách dẫn hướng nó, nó sẽ đốt cháy cả những cây cầu ngươi cần để đi tiếp.

Hỏa Tinh đang giao hội với vị trí khởi nguyên của ngươi — điều này chỉ xảy ra một lần trong mười hai năm. Đây là cửa sổ vũ trụ mà ngươi không được để lỡ. Một cơ hội sẽ đến dưới dạng thử thách — nó sẽ trông như nguy hiểm trước khi trông như cơ hội. Chính những linh hồn Hỏa như ngươi mới có can đảm bước vào.

Chỉ có Thủy mới có thể dập tắt ngươi — nhưng Thủy cũng là thứ duy nhất có thể biến ngươi thành hơi nước và bay cao hơn bao giờ hết. Hãy chọn loại Thủy khí nào ngươi muốn gặp.`,
    career:"Thích hợp: Lãnh đạo, truyền thông, nghệ sĩ, thể thao",
    love:"Hợp với mệnh Mộc và Thổ. Xung đột với mệnh Thủy.",
    sinh:"Mộc sinh Hỏa", khac:"Thủy khắc Hỏa",
    sinhColor:"#66ff99", khacColor:"#66ccff",
    audioFreq:[440,554,659]
  },
  "Thổ":{
    color:"#ffcc66", glow:"#cc8800", shadow:"orange",
    bodyClass:"env-tho",
    symbol:"⛰", artifact:"🏔",
    title:"MỆNH THỔ",
    subtitle:"Vững như núi thái • Trường tồn bất biến",
    prophecy:"Ngươi là nền móng vững chắc giữa những biến động. Sự bền bỉ và tinh thần trách nhiệm giúp ngươi xây dựng thành công từng bước một. Thời gian tới, những nỗ lực thầm lặng của ngươi sẽ được đền đáp, mang lại sự ổn định và thành tựu lâu dài.",
    oracle:`Núi không cần phải chứng minh mình là núi. Nó không cần gió để đứng, không cần ánh sáng để tồn tại, không cần sự công nhận của ai để vươn lên đến tận mây. Ngươi là ngọn núi đó — và đây vừa là sức mạnh, vừa là thử thách lớn nhất của ngươi trong kiếp này.

Những người mang mệnh Thổ thường mang gánh nặng của người khác mà không ai biết. Họ trở thành nền tảng để người khác xây dựng, trở thành điểm tựa để người khác dựa vào, và đôi khi — trong những đêm tối nhất — họ tự hỏi liệu có ai từng hỏi thăm về nền móng dưới tòa nhà đẹp đẽ mà mọi người đang ngưỡng mộ không. Vũ trụ biết. Và vũ trụ đang chuẩn bị đền đáp.

Thổ Tinh chuyển cung trong chu kỳ này mang theo một thông điệp: sự tích lũy thầm lặng của ngươi sắp đến ngưỡng vỡ òa. Như đất đã hấp thụ đủ nước sẽ cho ra mùa màng bội thu — công sức ngươi gieo trồng trong nhiều năm qua sắp hiển lộ thành quả rõ ràng nhất mà ngươi từng thấy. Nhưng hãy kiên nhẫn thêm chút nữa — quả chín cần đúng thời điểm.

Hãy đề phòng Mộc khí xâm lấn — những người mang mệnh Mộc có thể vô tình làm lung lay nền tảng ngươi đã xây dựng, không phải vì ác ý mà vì rễ của họ đâm sâu đến những nơi ngươi muốn giữ nguyên vẹn. Hãy giữ ranh giới mà không cần giữ khoảng cách.

Điều cuối cùng thiên cơ muốn nhắn nhủ với ngươi: Ngươi không cần thay đổi để được yêu thương. Nhưng ngươi cần học cách để người khác thấy bên trong ngọn núi đó — có một trái tim đang đập ấm áp hơn bất kỳ ngọn Hỏa nào.`,
    career:"Thích hợp: Bất động sản, xây dựng, quản lý, kinh doanh",
    love:"Hợp với mệnh Hỏa và Kim. Mâu thuẫn với mệnh Mộc.",
    sinh:"Hỏa sinh Thổ", khac:"Mộc khắc Thổ",
    sinhColor:"#ff6666", khacColor:"#66ff99",
    audioFreq:[174,220,261]
  }
};

const ELEMENT_POSITIONS = {
  "Hỏa":{cx:300,cy:90},
  "Thổ":{cx:490,cy:240},
  "Kim":{cx:400,cy:460},
  "Thủy":{cx:200,cy:460},
  "Mộc":{cx:110,cy:240}
};

const SINH_CYCLE = ["Mộc","Hỏa","Thổ","Kim","Thủy"];
const KHAC_CYCLE = ["Mộc","Thổ","Thủy","Hỏa","Kim"];

let envAnimFrame = null;
let envCanvas = null;
let currentUserElement = null;
let tooltipTimeout = null;

function startAmbientEnvironment(element){
  stopAmbientEnvironment();
  const data = ELEMENT_DATA[element];
  document.body.classList.remove("env-kim","env-moc","env-thuy","env-hoa","env-tho");
  document.body.classList.add(data.bodyClass);

  envCanvas = document.createElement("canvas");
  envCanvas.id = "envCanvas";
  envCanvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2001;";
  document.getElementById("energyPage").appendChild(envCanvas);
  envCanvas.width = window.innerWidth;
  envCanvas.height = window.innerHeight;
  const ctx = envCanvas.getContext("2d");
  let particles = [];
  let t = 0;

  function spawnParticle(){
    const p = {
      x:Math.random()*envCanvas.width, y:envCanvas.height+20,
      vx:(Math.random()-0.5)*1.5, vy:-(1+Math.random()*2.5),
      life:1, size:6+Math.random()*10, rotation:Math.random()*Math.PI*2
    };
    if(element==="Thủy"){p.y=-20; p.vy=1+Math.random()*2;}
    if(element==="Mộc"){p.y=-30; p.vy=0.8+Math.random()*1.5; p.vx=(Math.random()-0.5)*2;}
    if(element==="Thổ"){p.y=Math.random()*envCanvas.height; p.vy=(Math.random()-0.5)*0.4;}
    particles.push(p);
  }

  function renderEnv(){
    t++;
    ctx.clearRect(0,0,envCanvas.width,envCanvas.height);
    if(t%3===0) spawnParticle();
    if(particles.length>90) particles.shift();

    particles.forEach((p,i)=>{
      p.x += p.vx + Math.sin(t*0.02+i)*0.3;
      p.y += p.vy;
      p.rotation += 0.03;
      p.life -= 0.003;
      const alpha = Math.min(p.life*0.5, 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rotation);
      ctx.font = p.size+"px serif";
      ctx.textAlign="center"; ctx.textBaseline="middle";
      if(element==="Hỏa") ctx.fillText("🔥",0,0);
      else if(element==="Thủy") ctx.fillText("💧",0,0);
      else if(element==="Mộc") ctx.fillText("🍃",0,0);
      else if(element==="Kim"){
        ctx.shadowBlur=8; ctx.shadowColor="silver";
        for(let s=0;s<4;s++){
          const sa=(Math.PI/2)*s;
          ctx.beginPath(); ctx.moveTo(0,0);
          ctx.lineTo(Math.cos(sa)*p.size*1.5,Math.sin(sa)*p.size*1.5);
          ctx.lineWidth=1.5; ctx.strokeStyle=`rgba(210,210,240,${alpha})`; ctx.stroke();
        }
        ctx.shadowBlur=0;
      }
      else if(element==="Thổ"){
        ctx.fillStyle=`rgba(200,160,80,${alpha*0.7})`;
        ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
      if(p.y<-60||p.y>envCanvas.height+60||p.life<=0) particles.splice(i,1);
    });

    if(element==="Hỏa"){
      const hg=ctx.createRadialGradient(envCanvas.width/2,envCanvas.height,0,envCanvas.width/2,envCanvas.height,envCanvas.height*0.5);
      hg.addColorStop(0,"rgba(255,60,0,0.05)"); hg.addColorStop(1,"transparent");
      ctx.fillStyle=hg; ctx.fillRect(0,0,envCanvas.width,envCanvas.height);
    }
    envAnimFrame = requestAnimationFrame(renderEnv);
  }
  envAnimFrame = requestAnimationFrame(renderEnv);
}

function stopAmbientEnvironment(){
  document.body.classList.remove("env-kim","env-moc","env-thuy","env-hoa","env-tho");
  if(envAnimFrame){cancelAnimationFrame(envAnimFrame); envAnimFrame=null;}
  const ec=document.getElementById("envCanvas"); if(ec) ec.remove();
}

function playElementSound(element){
  try{
    const ac=new (window.AudioContext||window.webkitAudioContext)();
    const freqs=ELEMENT_DATA[element].audioFreq;
    const waves={"Kim":"sawtooth","Mộc":"sine","Thủy":"sine","Hỏa":"square","Thổ":"triangle"};
    freqs.forEach((freq,i)=>{
      const osc=ac.createOscillator(); const gain=ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type=waves[element]||"sine"; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0,ac.currentTime+i*0.3);
      gain.gain.linearRampToValueAtTime(0.1,ac.currentTime+i*0.3+0.1);
      gain.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+i*0.3+1.5);
      osc.start(ac.currentTime+i*0.3); osc.stop(ac.currentTime+i*0.3+1.5);
    });
  }catch(e){}
}

function ascensionReveal(element, onComplete){
  const overlay=document.createElement("div");
  overlay.id="ascensionOverlay";
  overlay.style.cssText="position:fixed;inset:0;z-index:9000;background:rgba(0,0,8,0.97);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:0;";
  document.body.appendChild(overlay);

  const allEl=["Kim","Mộc","Thủy","Hỏa","Thổ"];
  const colors={Kim:"#d4d4d4",Mộc:"#66ff99","Thủy":"#66ccff","Hỏa":"#ff6666","Thổ":"#ffcc66"};
  const syms={Kim:"⚔️",Mộc:"🌿","Thủy":"💧","Hỏa":"🔥","Thổ":"⛰️"};

  const orbCont=document.createElement("div");
  orbCont.style.cssText="display:flex;gap:30px;align-items:center;justify-content:center;flex-wrap:wrap;";
  overlay.appendChild(orbCont);

  // Dùng 'Cormorant Garamond' hỗ trợ tiếng Việt đầy đủ, không bị lỗi chữ Đ
  const viFont="'Cormorant Garamond', 'EB Garamond', Georgia, serif";

  const titleEl=document.createElement("div");
  titleEl.style.cssText=`
    margin-top:44px;
    font-family:${viFont};
    font-size:18px;
    font-weight:600;
    color:rgba(255,255,255,0.55);
    letter-spacing:5px;
    text-align:center;
    line-height:1.8;
  `;
  titleEl.textContent="— Thần Khí Đang Phán Xét —";
  overlay.appendChild(titleEl);

  // Tên mệnh — dùng Cinzel vì chỉ có chữ Latin + tên nguyên tố
  const nameEl=document.createElement("div");
  nameEl.style.cssText=`
    margin-top:18px;
    font-family:'Cinzel', serif;
    font-size:32px;
    font-weight:700;
    letter-spacing:8px;
    opacity:0;
    transition: opacity 0.8s ease, text-shadow 0.8s ease;
    text-align:center;
  `;
  overlay.appendChild(nameEl);

  const orbs=[];
  allEl.forEach((el,i)=>{
    const orb=document.createElement("div");
    orb.style.cssText=`width:80px;height:80px;border-radius:50%;
      background:radial-gradient(circle at 35% 35%,${colors[el]},rgba(0,0,0,0.6));
      border:2px solid ${colors[el]};
      box-shadow:0 0 20px ${colors[el]}66;
      display:flex;align-items:center;justify-content:center;
      font-size:30px;opacity:0;transform:scale(0);
      animation:orbAppear 0.5s ease ${i*0.15}s forwards;`;
    orb.textContent=syms[el]; orb.dataset.element=el;
    orbCont.appendChild(orb); orbs.push(orb);
  });

  setTimeout(()=>{
    titleEl.textContent="— Vận Mệnh Đang Hội Tụ —";
    orbs.forEach(orb=>{
      if(orb.dataset.element!==element){
        orb.style.transition="all 0.6s ease";
        orb.style.opacity="0"; orb.style.transform="scale(2) rotate(45deg)";
        setTimeout(()=>orb.remove(),700);
      }
    });
  },1800);

  setTimeout(()=>{
    const winner=orbs.find(o=>o.dataset.element===element);
    if(winner){
      const wd=ELEMENT_DATA[element];
      winner.style.transition="all 1.2s ease";
      winner.style.width="150px"; winner.style.height="150px";
      winner.style.fontSize="64px";
      winner.style.boxShadow=`0 0 60px ${wd.color}, 0 0 120px ${wd.color}88`;

      // "Mệnh Mộc" — dùng font hỗ trợ tiếng Việt cho "Mệnh", Cinzel cho tên nguyên tố
      nameEl.innerHTML=`<span style="font-family:${viFont};font-size:28px;letter-spacing:4px;">Mệnh</span> <span style="font-family:'Cinzel',serif;">${element}</span>`;
      nameEl.style.color=wd.color;
      nameEl.style.textShadow=`0 0 20px ${wd.color}, 0 0 50px ${wd.color}66`;
      nameEl.style.opacity="1";

      titleEl.style.color=wd.color;
      titleEl.style.textShadow=`0 0 15px ${wd.color}66`;

      const ring=document.createElement("div");
      ring.style.cssText=`position:absolute;width:300px;height:300px;border-radius:50%;
        border:3px solid ${wd.color};opacity:0;
        animation:supernovaRing 1.5s ease-out forwards;pointer-events:none;`;
      overlay.appendChild(ring);
    }
    playElementSound(element);
  },2800);

  setTimeout(()=>{
    overlay.style.transition="opacity 0.8s ease"; overlay.style.opacity="0";
    setTimeout(()=>{ overlay.remove(); if(onComplete) onComplete(); },800);
  },4200);
}

function showTarotCard(element){
  const data=ELEMENT_DATA[element];
  const old=document.getElementById("tarotCardWrapper"); if(old) old.remove();

  const card2=document.getElementById("energyCard2");
  if(!card2) return;

  const relationsEl=document.getElementById("energyRelations");
  card2.innerHTML="";
  if(relationsEl) card2.appendChild(relationsEl);

  // Container chứa 2 lá bài ngang nhau
  const dualWrapper=document.createElement("div");
  dualWrapper.id="tarotCardWrapper";
  dualWrapper.style.cssText="display:flex;justify-content:center;align-items:flex-start;gap:24px;flex-wrap:wrap;width:100%;";
  card2.insertBefore(dualWrapper, card2.firstChild);

  // ── LÁ BÀI 1: Thông tin mệnh ──
  const wrap1=document.createElement("div");
  wrap1.style.cssText="perspective:1200px;cursor:pointer;user-select:none;flex-shrink:0;";
  wrap1.innerHTML=`
    <div class="tarot-card" id="tarotCard1">
      <div class="tarot-front">
        <div class="tarot-front-inner">
          <div class="tarot-rune">✦ ✦ ✦</div>
          <div class="tarot-front-symbol">${data.symbol}</div>
          <div class="tarot-rune">✦ ✦ ✦</div>
          <div class="tarot-tap-hint">Giải mã</div>
        </div>
      </div>
      <div class="tarot-back">
        <div class="tarot-back-inner">
          <div class="tarot-element-name" style="color:${data.color};text-shadow:0 0 20px ${data.shadow}">
            ${data.artifact} ${data.title}
          </div>
          <div class="tarot-subtitle">${data.subtitle}</div>
          <div class="tarot-divider" style="background:${data.color}"></div>
          <div class="tarot-section">
            <div class="tarot-section-label">⚡ Sự nghiệp</div>
            <div class="tarot-section-text">${data.career}</div>
          </div>
          <div class="tarot-section">
            <div class="tarot-section-label">💖 Tình duyên</div>
            <div class="tarot-section-text">${data.love}</div>
          </div>
          <div class="tarot-cycle-row">
            <div class="tarot-cycle sinh">
              <span class="cycle-label">✦ Tương sinh</span>
              <span class="cycle-val" style="color:${data.sinhColor}">${data.sinh}</span>
            </div>
            <div class="tarot-cycle khac">
              <span class="cycle-label">✧ Tương khắc</span>
              <span class="cycle-val" style="color:${data.khacColor}">${data.khac}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  dualWrapper.appendChild(wrap1);

  let flipped1=false;
  wrap1.onclick=()=>{
    flipped1=!flipped1;
    document.getElementById("tarotCard1").style.transform=flipped1?"rotateY(180deg)":"rotateY(0deg)";
    if(flipped1) playElementSound(element);
  };

  // ── LÁ BÀI 2: Lời tiên tri ──
  const wrap2=document.createElement("div");
  wrap2.style.cssText="perspective:1200px;cursor:pointer;user-select:none;flex-shrink:0;";

  // Chia oracle thành các đoạn
  const paragraphs=data.oracle.trim().split(/\n\n+/);
  const oracleHtml=paragraphs.map(p=>`<p style="margin:0 0 10px 0;line-height:1.65;">${p.trim()}</p>`).join("");

  wrap2.innerHTML=`
    <div class="tarot-card" id="tarotCard2">
      <div class="tarot-front">
        <div class="tarot-front-inner">
          <div class="tarot-rune">✧ ✧ ✧</div>
          <div class="tarot-front-symbol">🔮</div>
          <div class="tarot-rune">✧ ✧ ✧</div>
          <div class="tarot-tap-hint">Thiên Cơ Bất Lộ</div>
        </div>
      </div>
      <div class="tarot-back tarot-back-oracle">
        <div class="tarot-back-inner tarot-oracle-inner">
          <div class="tarot-element-name" style="color:${data.color};text-shadow:0 0 20px ${data.shadow};margin-bottom:6px;">
            🔮 Thiên Cơ Phán Quyết
          </div>
          <div class="tarot-divider" style="background:${data.color};margin-bottom:10px;"></div>
          <div class="tarot-oracle-text">
            ${oracleHtml}
          </div>
        </div>
      </div>
    </div>`;
  dualWrapper.appendChild(wrap2);

  let flipped2=false;
  wrap2.onclick=()=>{
    flipped2=!flipped2;
    document.getElementById("tarotCard2").style.transform=flipped2?"rotateY(180deg)":"rotateY(0deg)";
    if(flipped2) playElementSound(element);
  };
}

function setupInteractiveWheel(element){
  const svg=document.getElementById("fiveSVG"); if(!svg) return;

  // Xóa lines cũ
  svg.querySelectorAll(".flow-sinh,.flow-khac").forEach(el=>el.remove());

  // Xóa style cũ của tất cả nodes
  ["Kim","Mộc","Thủy","Hỏa","Thổ"].forEach(e=>{
    const c=document.getElementById("el-"+e);
    if(!c) return;
    c.removeAttribute("filter");
    c.style.opacity="0.55";
    c.style.animation="";
  });

  const pos=ELEMENT_POSITIONS;

  // Vẽ toàn bộ vòng TƯƠNG SINH (5 nét xanh liền, mờ)
  for(let i=0;i<5;i++){
    const from=SINH_CYCLE[i];
    const to=SINH_CYCLE[(i+1)%5];
    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",pos[from].cx); line.setAttribute("y1",pos[from].cy);
    line.setAttribute("x2",pos[to].cx);   line.setAttribute("y2",pos[to].cy);
    line.setAttribute("stroke","#00dd88");
    line.setAttribute("stroke-width","2.5");
    line.setAttribute("opacity","0.35");
    line.classList.add("flow-sinh");
    line.dataset.from=from; line.dataset.to=to;
    svg.insertBefore(line,svg.firstChild);
  }

  // Vẽ toàn bộ vòng TƯƠNG KHẮC (5 nét đỏ đứt, mờ)
  for(let i=0;i<5;i++){
    const from=KHAC_CYCLE[i];
    const to=KHAC_CYCLE[(i+1)%5];
    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",pos[from].cx); line.setAttribute("y1",pos[from].cy);
    line.setAttribute("x2",pos[to].cx);   line.setAttribute("y2",pos[to].cy);
    line.setAttribute("stroke","#ff3333");
    line.setAttribute("stroke-width","1.5");
    line.setAttribute("stroke-dasharray","8 6");
    line.setAttribute("opacity","0.25");
    line.classList.add("flow-khac");
    line.dataset.from=from; line.dataset.to=to;
    svg.insertBefore(line,svg.firstChild);
  }

  // Phát sáng node của user theo màu mệnh
  const elementColors={
    "Kim":"#d4d4d4","Mộc":"#00ff88","Thủy":"#00ccff","Hỏa":"#ff4444","Thổ":"#ffaa33"
  };
  const userColor=elementColors[element]||"#ffffff";
  const userNode=document.getElementById("el-"+element);
  if(userNode){
    userNode.style.opacity="1";
    userNode.style.filter=`drop-shadow(0 0 14px ${userColor}) drop-shadow(0 0 28px ${userColor}88)`;
    userNode.style.animation=`userNodePulse_${element} 2s ease-in-out infinite`;

    // Inject keyframe animation dynamically
    const styleId="userPulseStyle";
    const old=document.getElementById(styleId); if(old) old.remove();
    const st=document.createElement("style");
    st.id=styleId;
    st.textContent=`
      @keyframes userNodePulse_${element} {
        0%,100% { filter: drop-shadow(0 0 10px ${userColor}) drop-shadow(0 0 20px ${userColor}66); }
        50%      { filter: drop-shadow(0 0 22px ${userColor}) drop-shadow(0 0 45px ${userColor}aa); }
      }
    `;
    document.head.appendChild(st);
  }

  // Highlight default (user element)
  highlightElement(element, element, svg);

  // Bind hover/click cho từng node
  ["Kim","Mộc","Thủy","Hỏa","Thổ"].forEach(e=>{
    const circle=document.getElementById("el-"+e);
    if(!circle) return;
    circle.style.cursor="pointer";
    circle.onmouseenter=()=>{ highlightElement(e, element, svg); };
    circle.onmouseleave=()=>{ highlightElement(element, element, svg); };
    circle.onclick=(ev)=>{ ev.stopPropagation(); showElementTooltip(e, element, circle); };
  });
}

function highlightElement(hovered, userElement, svg){
  const sinhIdx=SINH_CYCLE.indexOf(hovered);
  const khacIdx=KHAC_CYCLE.indexOf(hovered);
  const sinhRelated=new Set([
    SINH_CYCLE[(sinhIdx+1)%5],
    SINH_CYCLE[(sinhIdx+4)%5]
  ]);
  const khacRelated=new Set([
    KHAC_CYCLE[(khacIdx+1)%5],
    KHAC_CYCLE[(khacIdx+4)%5]
  ]);

  const elementColors={
    "Kim":"#d4d4d4","Mộc":"#00ff88","Thủy":"#00ccff","Hỏa":"#ff4444","Thổ":"#ffaa33"
  };
  const userColor=elementColors[userElement]||"#ffffff";

  ["Kim","Mộc","Thủy","Hỏa","Thổ"].forEach(e=>{
    const c=document.getElementById("el-"+e);
    if(!c) return;
    const isUser=(e===userElement);
    const isHovered=(e===hovered);
    const inSinh=sinhRelated.has(e);
    const inKhac=khacRelated.has(e);

    if(isHovered){
      c.style.opacity="1";
      c.style.filter=`drop-shadow(0 0 18px white)`;
    } else if(isUser){
      // Giữ glow màu mệnh
      c.style.opacity="1";
      c.style.filter=`drop-shadow(0 0 14px ${userColor}) drop-shadow(0 0 28px ${userColor}88)`;
    } else if(inSinh){
      c.style.opacity="0.9";
      c.style.filter=`drop-shadow(0 0 10px #00ffaa88)`;
    } else if(inKhac){
      c.style.opacity="0.8";
      c.style.filter=`drop-shadow(0 0 8px #ff444466)`;
    } else {
      c.style.opacity="0.45";
      c.style.filter="";
    }
  });

  // Highlight lines
  svg.querySelectorAll(".flow-sinh").forEach(l=>{
    const from=l.dataset.from; const to=l.dataset.to;
    const active=(from===hovered&&sinhRelated.has(to))||(to===hovered&&sinhRelated.has(from));
    if(active){
      l.setAttribute("stroke-width","5");
      l.setAttribute("opacity","1");
      l.style.filter="drop-shadow(0 0 8px #00ffaa)";
    } else {
      l.setAttribute("stroke-width","2.5");
      l.setAttribute("opacity","0.3");
      l.style.filter="";
    }
  });

  svg.querySelectorAll(".flow-khac").forEach(l=>{
    const from=l.dataset.from; const to=l.dataset.to;
    const active=(from===hovered&&khacRelated.has(to))||(to===hovered&&khacRelated.has(from));
    if(active){
      l.setAttribute("stroke-width","4");
      l.setAttribute("opacity","0.95");
      l.style.filter="drop-shadow(0 0 6px #ff4444)";
    } else {
      l.setAttribute("stroke-width","1.5");
      l.setAttribute("opacity","0.2");
      l.style.filter="";
    }
  });
}

function drawEnergyFlows(activeElement,svg){
  // Kept for compatibility — logic moved into setupInteractiveWheel
}

function showElementTooltip(targetElement,userElement,svgCircle){
  const ex=document.getElementById("elementTooltip"); if(ex) ex.remove();
  if(tooltipTimeout) clearTimeout(tooltipTimeout);

  const sinhIdx=SINH_CYCLE.indexOf(userElement);
  const khacIdx=KHAC_CYCLE.indexOf(userElement);
  const generatesMe=SINH_CYCLE[(sinhIdx+4)%5];
  const iGenerate=SINH_CYCLE[(sinhIdx+1)%5];
  const iOvercome=KHAC_CYCLE[(khacIdx+1)%5];
  const overcomeMe=KHAC_CYCLE[(khacIdx+4)%5];

  let icon="✦", relation, relationColor, relationDesc;

  if(targetElement===userElement){
    icon="⚡"; relation="Mệnh của ngươi"; relationColor=ELEMENT_DATA[userElement].color;
    relationDesc=ELEMENT_DATA[userElement].prophecy.substring(0,90)+"...";
  } else if(targetElement===generatesMe){
    icon="🟢"; relation="Tương sinh — Sinh ngươi"; relationColor="#00ffaa";
    relationDesc=`${targetElement} sinh ${userElement}. Hợp tác thuận lợi.`;
  } else if(targetElement===iGenerate){
    icon="🟢"; relation="Tương sinh — Ngươi sinh"; relationColor="#00ffaa";
    relationDesc=`${userElement} sinh ${targetElement}. Ngươi là nguồn sức mạnh.`;
  } else if(targetElement===iOvercome){
    icon="🔴"; relation="Tương khắc — Ngươi khắc"; relationColor="#ff6666";
    relationDesc=`${userElement} khắc ${targetElement}. Ngươi chiếm lợi thế.`;
  } else if(targetElement===overcomeMe){
    icon="🔴"; relation="Tương khắc — Bị khắc"; relationColor="#ff3333";
    relationDesc=`${targetElement} khắc ${userElement}. Cẩn thận khi tiếp xúc.`;
  } else {
    icon="○"; relation="Trung tính"; relationColor="#aaa";
    relationDesc="Hai mệnh không có tương tác đặc biệt.";
  }

  const tip=document.createElement("div");
  tip.id="elementTooltip";
  const rect=svgCircle.getBoundingClientRect();
  tip.style.cssText=`
    position:fixed;left:${rect.left+rect.width/2}px;top:${rect.top-14}px;
    transform:translate(-50%,-100%);
    background:rgba(0,0,15,0.95);border:1px solid ${relationColor};
    border-radius:10px;padding:12px 18px;z-index:9500;max-width:230px;
    text-align:center;box-shadow:0 0 16px ${relationColor}55;
    font-family:'Cinzel',serif;pointer-events:none;
    animation:tooltipAppear 0.2s ease forwards;`;
  tip.innerHTML=`
    <div style="font-size:11px;color:${relationColor};letter-spacing:1px;margin-bottom:5px;">${icon} ${relation}</div>
    <div style="font-size:11px;color:#ccc;line-height:1.5;font-family:sans-serif;">${relationDesc}</div>`;
  document.body.appendChild(tip);
  tooltipTimeout=setTimeout(()=>{const t=document.getElementById("elementTooltip");if(t)t.remove();},3000);
}

function energyFlow(){
  const name=document.getElementById("name").value.trim();
  const dob=document.getElementById("dob").value;
  if(!name||!dob){showMysticWarning(); return;}

  const birthYear=new Date(dob).getFullYear();
  const element=getElementByYear(birthYear);
  currentUserElement=element;

  const page=document.getElementById("energyPage");
  const result=document.getElementById("energyResult");
  const prophecy=document.getElementById("energyProphecy");
  const relations=document.getElementById("energyRelations");

  result.className="energy-result energy-"+element;
  result.innerHTML=""; prophecy.innerHTML=""; relations.innerHTML="";
  result.classList.remove("show-step"); prophecy.classList.remove("show-step"); relations.classList.remove("show-step");
  const oldCard=document.getElementById("tarotCardWrapper"); if(oldCard) oldCard.remove();

  page.classList.add("show");

  ascensionReveal(element, ()=>{
    startAmbientEnvironment(element);
    // Dùng rAF để đảm bảo cả 2 render trong cùng 1 frame
    requestAnimationFrame(()=>{
      showTarotCard(element);
      setupInteractiveWheel(element);
    });
  });
  const svgOuter=document.querySelector(".outer-ring");
  const colors={"Kim":"#cccccc","Mộc":"#00ff88","Thủy":"#00ccff","Hỏa":"#ff4444","Thổ":"#ffaa33"};
  if(svgOuter) svgOuter.style.stroke=colors[element];
}

function getElementByYear(year){
  // Ngũ hành mệnh theo bảng Nạp Âm (60 hoa giáp), chuẩn tử vi truyền thống
  // Giáp Tý 1984 = pair 0, mỗi cặp 2 năm liên tiếp, chu kỳ 30 cặp = 60 năm
  const napAmTable = [
    'Kim',  // Giáp Tý, Ất Sửu   - Hải Trung Kim
    'Hỏa',  // Bính Dần, Đinh Mão - Lư Trung Hỏa
    'Mộc',  // Mậu Thìn, Kỷ Tị   - Đại Lâm Mộc
    'Thổ',  // Canh Ngọ, Tân Mùi  - Lộ Bàng Thổ
    'Kim',  // Nhâm Thân, Quý Dậu - Kiếm Phong Kim
    'Hỏa',  // Giáp Tuất, Ất Hợi  - Sơn Đầu Hỏa
    'Thủy', // Bính Tý, Đinh Sửu  - Giản Hạ Thủy
    'Thổ',  // Mậu Dần, Kỷ Mão   - Thành Đầu Thổ
    'Kim',  // Canh Thìn, Tân Tị  - Bạch Lạp Kim
    'Mộc',  // Nhâm Ngọ, Quý Mùi  - Dương Liễu Mộc
    'Thổ',  // Giáp Thân, Ất Dậu  - Đại Dịch Thổ
    'Thủy', // Bính Tuất, Đinh Hợi - Ốc Thượng Thổ
    'Mộc',  // Mậu Tý, Kỷ Sửu    - Tích Lịch Hỏa
    'Hỏa',  // Canh Dần, Tân Mão  - Tùng Bách Mộc
    'Thổ',  // Nhâm Thìn, Quý Tị  - Trường Lưu Thủy
    'Kim',  // Giáp Ngọ, Ất Mùi   - Sa Trung Kim
    'Thủy', // Bính Thân, Đinh Dậu - Sơn Hạ Hỏa
    'Thổ',  // Mậu Tuất, Kỷ Hợi   - Bình Địa Mộc
    'Mộc',  // Canh Tý, Tân Sửu   - Bích Thượng Thổ
    'Kim',  // Nhâm Dần, Quý Mão  - Kim Bạch Kim
    'Thủy', // Giáp Thìn, Ất Tị   - Phúc Đăng Hỏa
    'Thổ',  // Bính Ngọ, Đinh Mùi - Thiên Hà Thủy
    'Mộc',  // Mậu Thân, Kỷ Dậu   - Đại Trạch Thổ
    'Hỏa',  // Canh Tuất, Tân Hợi  - Thoa Xuyến Kim
    'Kim',  // Nhâm Tý, Quý Sửu   - Tang Đố Mộc
    'Hỏa',  // Giáp Dần, Ất Mão   - Đại Khê Thủy
    'Thổ',  // Bính Thìn, Đinh Tị  - Sa Trung Thổ
    'Mộc',  // Mậu Ngọ, Kỷ Mùi   - Thiên Thượng Hỏa
    'Thủy', // Canh Thân, Tân Dậu  - Thạch Lựu Mộc
    'Hỏa',  // Nhâm Tuất, Quý Hợi  - Đại Hải Thủy
  ];
  const pairIndex = (((Math.floor((year - 1984) / 2)) % 30) + 30) % 30;
  return napAmTable[pairIndex];
}

function closeEnergy(){
  document.getElementById("energyPage").classList.remove("show");
  document.getElementById("energyResult").classList.remove("show");
  stopAmbientEnvironment();
  ["Kim","Mộc","Thủy","Hỏa","Thổ"].forEach(e=>{
    const el=document.getElementById("el-"+e);
    if(el){el.classList.remove("element-active-circle");el.style.animation="";el.style.cursor="";}
  });
  const svg=document.getElementById("fiveSVG");
  if(svg) svg.querySelectorAll(".flow-sinh,.flow-khac").forEach(el=>el.remove());
  const tip=document.getElementById("elementTooltip"); if(tip) tip.remove();
  const oldCard=document.getElementById("tarotCardWrapper"); if(oldCard) oldCard.remove();
  // Reset card2 to just show relations placeholder
  const card2=document.getElementById("energyCard2");
  const rel=document.getElementById("energyRelations");
  if(card2){ card2.innerHTML=""; if(rel){rel.innerHTML="";rel.classList.remove("show-step"); card2.appendChild(rel);} }
  currentUserElement=null;
}


/* =========================
   LIXI SYSTEM
========================= */

let lixiOpened = false;

const lixiValues = [10000,20000,50000,100000,200000,500000];

function openLixi(){
  document.getElementById("lixiPage").classList.add("show");
  document.getElementById("lixiResult").innerHTML = "";
  lixiOpened = false;

  const items = document.querySelectorAll(".lixi-item");
  items.forEach(item=>{ item.classList.remove("lixi-opened"); });
}

function closeLixi(){
  document.getElementById("lixiPage").classList.remove("show");
}

function openEnvelope(el){
  if(lixiOpened) return;
  lixiOpened = true;

  const randomIndex = Math.floor(Math.random() * lixiValues.length);
  const amount = lixiValues[randomIndex];

  el.classList.add("lixi-opened");

  const resultBox = document.getElementById("lixiResult");
  resultBox.innerHTML =
    "🎉 Được phép lì xì: " + amount.toLocaleString('vi-VN') + " VNĐ 🎉";

  resultBox.innerHTML += `
    <div style="margin-top:30px;">
      <button onclick="openDonate()" class="lixi-again-btn">
        🧧 Lì xì
      </button>
    </div>
  `;
}

function openDonate(){
  document.getElementById("lixiPage").classList.remove("show");
  document.getElementById("donatePage").classList.add("show");
}

function closeDonate(){
  document.getElementById("donatePage").classList.remove("show");
}