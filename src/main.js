import * as THREE from 'three';

/* ---------- Données ---------- */
const PROJECTS = [
  { id: 'tp-sockets', name: 'TP Sockets', rack: 6, side: -1, kind: 'Réseau · C',
    desc: 'Serveur TCP multi-threads et calculatrice UDP en C. Gestion des connexions simultanées et protocole de communication personnalisé.',
    tags: ['C', 'TCP/IP', 'Multi-threads', 'UDP'], link: 'https://github.com/sanouisaac225/tp-sockets' },
  { id: 'anisage', name: 'AniSage', rack: 7, side: 1, kind: 'IA · Web',
    desc: 'Application de recommandation d’animes propulsée par l’API Claude.',
    tags: ['IA', 'API Claude', 'Web'], link: null },
  { id: 'evo-system', name: 'EVO SYSTEM', rack: 8, side: -1, kind: 'Jeu · HTML5',
    desc: 'Jeu navigateur en HTML5/Canvas, projet scolaire : joueur hexagonal, vagues d’ennemis, 10 améliorations et ciblage automatique.',
    tags: ['HTML5', 'Canvas', 'JavaScript', 'Projet scolaire'], link: null },
  { id: 'portfolio', name: 'Ce portfolio', rack: 9, side: 1, kind: 'Web · 3D',
    desc: 'Portfolio en 3D : une salle serveur parcourue au scroll, construite avec Three.js, sans dépendance externe au chargement.',
    tags: ['Three.js', 'JavaScript', 'CSS'], link: 'https://github.com/sanouisaac225/portfolio' }
];

/* ---------- Liste accessible des projets + dialogue ---------- */
const dlg = document.getElementById('pd');
function openProject(p, opener) {
  document.getElementById('pd-kicker').textContent = p.kind;
  document.getElementById('pd-title').textContent = p.name;
  document.getElementById('pd-desc').textContent = p.desc;
  document.getElementById('pd-tags').innerHTML = p.tags.map((t) => `<li>${t}</li>`).join('');
  const l = document.getElementById('pd-link');
  l.innerHTML = p.link
    ? `<a href="${p.link}" target="_blank" rel="noreferrer">Voir le code sur GitHub ↗</a>`
    : 'Code sur demande : écris-moi à <a href="mailto:sanouisaac225@gmail.com">sanouisaac225@gmail.com</a>.';
  dlg.showModal();
  dlg.addEventListener('close', () => opener && opener.focus(), { once: true });
}
const list = document.getElementById('project-list');
PROJECTS.forEach((p) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.className = 'project-btn';
  b.type = 'button';
  b.innerHTML = `<strong>${p.name}</strong><i aria-hidden="true">↗</i><span>${p.tags.join(' · ')}</span>`;
  b.setAttribute('aria-label', `Ouvrir le projet ${p.name}`);
  b.addEventListener('click', () => openProject(p, b));
  li.appendChild(b);
  list.appendChild(li);
});
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

/* ---------- Détection : 3D ou repli 2D ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer = null;
if (!reduce) {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }
}
if (!renderer) {
  document.documentElement.classList.add('no3d');
} else {
  start(renderer);
}

function start(r) {
  const small = Math.min(innerWidth, innerHeight) < 700 || navigator.hardwareConcurrency <= 4;
  const RACKS = small ? 11 : 14;
  const PITCH = 1.9, HALF = 2.2, RACK_W = 1.7, RACK_D = 1.2, RACK_H = 3.4, UNITS = 14, LEDS = 6;
  const DEPTH = RACKS * PITCH;

  r.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  r.setSize(innerWidth, innerHeight, false);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0d12);
  scene.fog = new THREE.Fog(0x0b0d12, 5, small ? 24 : 32);
  const cam = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 80);
  cam.position.set(0, 1.7, 6);

  /* Lumières */
  scene.add(new THREE.AmbientLight(0x9aa6c0, 1.3));
  const camLight = new THREE.PointLight(0xdff0ff, 22, 16, 1.4);
  scene.add(camLight);
  const glow = new THREE.PointLight(0x35ff8a, 14, 14, 1.6);
  scene.add(glow);

  /* Sol, plafond, grille */
  const zMid = -DEPTH / 2 + 4;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 + 4, DEPTH + 30), new THREE.MeshStandardMaterial({ color: 0x14171f, roughness: 0.4, metalness: 0.5 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, zMid); scene.add(floor);
  const grid = new THREE.GridHelper(DEPTH + 30, Math.round((DEPTH + 30) / 1.2), 0x35ff8a, 0x1d2330);
  grid.scale.x = (HALF * 2) / (DEPTH + 30); grid.position.set(0, 0.01, zMid);
  grid.material.transparent = true; grid.material.opacity = 0.22; scene.add(grid);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 + 4, DEPTH + 30), new THREE.MeshBasicMaterial({ color: 0x090b0f }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.4, zMid); scene.add(ceil);
  const neonGeo = new THREE.BoxGeometry(0.08, 0.03, 1.6);
  const neons = new THREE.InstancedMesh(neonGeo, new THREE.MeshBasicMaterial({ color: 0xdff0ff }), Math.ceil(DEPTH / 3.4) + 4);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < neons.count; i++) { m4.setPosition(0, 4.36, 8 - i * 3.4); neons.setMatrixAt(i, m4); }
  scene.add(neons);

  /* Baies : corps, unités et LED en InstancedMesh */
  const nR = RACKS * 2;
  const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(RACK_D, RACK_H, RACK_W), new THREE.MeshStandardMaterial({ color: 0x232833, roughness: 0.6, metalness: 0.3 }), nR);
  const units = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.19, RACK_W - 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.3 }), nR * UNITS);
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.04, 0.075), new THREE.MeshBasicMaterial({ color: 0xffffff }), nR * UNITS * LEDS);
  const ledData = [];
  let bi = 0, ui = 0, li = 0;
  const col = new THREE.Color();
  for (let i = 0; i < RACKS; i++) {
    for (const side of [-1, 1]) {
      const z = -i * PITCH;
      m4.setPosition(side * (HALF + RACK_D / 2), RACK_H / 2, z); bodies.setMatrixAt(bi++, m4);
      for (let u = 0; u < UNITS; u++) {
        const y = 0.28 + u * 0.226;
        m4.setPosition(side * (HALF - 0.02), y, z); units.setMatrixAt(ui, m4);
        col.setHex(u % 5 === 0 ? 0x3d4657 : 0x2d3442).offsetHSL(0, 0, (Math.random() - 0.5) * 0.03); units.setColorAt(ui++, col);
        for (let k = 0; k < LEDS; k++) {
          m4.setPosition(side * (HALF - 0.055), y, z - 0.62 + k * 0.11); leds.setMatrixAt(li, m4);
          ledData.push({ hex: Math.random() > 0.82 ? 0xffb020 : 0x35ff8a, ph: Math.random() * 10, sp: 1.5 + Math.random() * 6, th: -0.35 + Math.random() * 0.5 });
          li++;
        }
      }
    }
  }
  [bodies, units, leds].forEach((m) => { m.instanceMatrix.needsUpdate = true; scene.add(m); });
  const offCol = new THREE.Color(0x0e1a13);
  function updateLeds(t) {
    for (let i = 0; i < ledData.length; i++) {
      const d = ledData[i];
      if (Math.sin(t * d.sp + d.ph) > d.th) col.setHex(d.hex); else col.copy(offCol);
      leds.setColorAt(i, col);
    }
    leds.instanceColor.needsUpdate = true;
  }
  updateLeds(0);

  /* Halos de baies-projets */
  const halos = PROJECTS.map((p) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(RACK_W - 0.1, RACK_H - 0.2), new THREE.MeshBasicMaterial({ color: 0x35ff8a, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.y = p.side === -1 ? Math.PI / 2 : -Math.PI / 2;
    m.position.set(p.side * (HALF - 0.1), RACK_H / 2, -p.rack * PITCH);
    scene.add(m);
    return m;
  });

  /* Étiquettes projetées */
  const tagsRoot = document.getElementById('tags');
  const tags = PROJECTS.map((p, i) => {
    const b = document.createElement('button');
    b.className = 'tag'; b.type = 'button'; b.tabIndex = -1; b.textContent = `${p.name} ↗`;
    b.addEventListener('click', () => openProject(p, null));
    b.addEventListener('pointerenter', () => { hover = i; });
    b.addEventListener('pointerleave', () => { hover = -1; });
    tagsRoot.appendChild(b);
    return b;
  });
  let hover = -1;

  /* Trajet caméra lié au scroll */
  const ids = ['accueil', 'apropos', 'formation', 'competences', 'projets', 'contact'];
  let keys = [];
  function buildKeys() {
    const el = (id) => document.getElementById(id);
    const top = (id) => el(id).offsetTop;
    const vh = innerHeight;
    const pr = el('projets');
    const r0 = PROJECTS[0].rack * PITCH, r1 = PROJECTS[PROJECTS.length - 1].rack * PITCH;
    const zEnd = -r1 + 3.8;
    keys = [
      [0, 6], [top('apropos'), 3], [top('formation'), -0.5], [top('competences'), -2.5],
      [top('projets'), -r0 + 7],
      [top('projets') + pr.offsetHeight - vh, zEnd],
      [top('contact'), zEnd - 4.5], [document.documentElement.scrollHeight, zEnd - 5.5]
    ];
  }
  function targetZ(y) {
    for (let i = 0; i < keys.length - 1; i++) {
      const [y0, z0] = keys[i], [y1, z1] = keys[i + 1];
      if (y <= y1) { const t = Math.min(1, Math.max(0, (y - y0) / Math.max(1, y1 - y0))); return z0 + (z1 - z0) * t; }
    }
    return keys[keys.length - 1][1];
  }
  buildKeys();

  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener('resize', () => {
    r.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); buildKeys();
  });
  addEventListener('load', buildKeys);

  /* Boucle */
  const clock = new THREE.Clock();
  const v = new THREE.Vector3();
  let camZ = targetZ(scrollY), lastLed = 0, running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); loop(); }
  });
  function loop() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    camZ += (targetZ(scrollY) - camZ) * Math.min(1, dt * 5);
    const cx = mx * 0.9, cy = 1.7 - my * 0.25;
    cam.position.set(cx, cy, camZ);
    cam.lookAt(-mx * 1.2, 1.75 - my * 0.2, camZ - 10);
    camLight.position.set(cx, 2.6, camZ - 1.5);
    glow.position.set(0, 0.8, camZ - 6);
    if (t - lastLed > 0.12) { updateLeds(t); lastLed = t; }
    halos.forEach((h, i) => { h.material.opacity += ((hover === i ? 0.38 : 0.06) - h.material.opacity) * Math.min(1, dt * 10); });
    r.render(scene, cam);
    /* Étiquettes */
    PROJECTS.forEach((p, i) => {
      const z = -p.rack * PITCH, ahead = camZ - z;
      const b = tags[i];
      v.set(p.side * (HALF - 0.1), 3.05, z).project(cam);
      let o = 0;
      if (v.z < 1 && ahead > 1.5 && ahead < 11) o = Math.min(1, (ahead - 1.5) / 2) * Math.min(1, (11 - ahead) / 3);
      b.style.opacity = o.toFixed(2);
      b.style.visibility = o < 0.05 ? 'hidden' : 'visible';
      b.style.pointerEvents = o < 0.5 ? 'none' : 'auto';
      const hw = b.offsetWidth / 2 + 8, px = Math.min(Math.max((v.x * 0.5 + 0.5) * innerWidth, hw), innerWidth - hw);
      b.style.transform = `translate(${px}px, ${(-v.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -50%)`;
    });
    requestAnimationFrame(loop);
  }
  loop();
  window.__sceneReady = true;
}
