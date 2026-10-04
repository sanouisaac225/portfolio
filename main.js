const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cursorGlow = document.querySelector('#cursorGlow');
const root = document.documentElement;

// Parallaxe de caméra légère : la scène réagit au curseur sans gêner la lecture.
window.addEventListener('pointermove', (event) => {
  if (!cursorGlow || reducedMotion) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
  root.style.setProperty('--pointer-x', `${(event.clientX / window.innerWidth - .5) * 2}`);
  root.style.setProperty('--pointer-y', `${(event.clientY / window.innerHeight - .5) * 2}`);
  const scene = document.querySelector('.hero-scene');
  if (scene && window.innerWidth > 700) {
    scene.style.transform = `perspective(1000px) rotateX(${(event.clientY / window.innerHeight - .5) * -2.2}deg) rotateY(${(event.clientX / window.innerWidth - .5) * 3.2}deg)`;
  }
});

window.addEventListener('pointerleave', () => {
  const scene = document.querySelector('.hero-scene');
  if (scene) scene.style.transform = '';
});

// Réseau de particules en Canvas : décor organique et léger, sans bibliothèque 3D.
const canvas = document.querySelector('#particleCanvas');
const ctx = canvas?.getContext('2d');
let particles = [];
let animationFrame;
let canvasWidth = 0;
let canvasHeight = 0;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = window.innerWidth < 700 ? 28 : 52;
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - .5) * .18,
    vy: (Math.random() - .5) * .18,
    radius: index % 8 === 0 ? 1.8 : Math.random() * 1.2 + .35,
    color: index % 7 === 0 ? '#ff8a4c' : '#b9ff63'
  }));
}

function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  particles.forEach((particle) => {
    if (!reducedMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -10 || particle.x > canvasWidth + 10) particle.vx *= -1;
      if (particle.y < -10 || particle.y > canvasHeight + 10) particle.vy *= -1;
    }
    ctx.beginPath();
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.radius > 1.5 ? .82 : .42;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  particles.forEach((particle, index) => {
    particles.slice(index + 1).forEach((other) => {
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 92) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(185, 255, 99, ${.11 * (1 - distance / 92)})`;
        ctx.lineWidth = .5;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
  });
  if (!reducedMotion) animationFrame = requestAnimationFrame(drawParticles);
}

if (canvas && ctx) {
  resizeCanvas();
  drawParticles();
  window.addEventListener('resize', resizeCanvas);
}

// Apparition progressive des chapitres.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// Repère de navigation synchronisé avec la section visible.
const navLinks = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === entry.target.dataset.section));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
document.querySelectorAll('[data-section]').forEach((section) => sectionObserver.observe(section));

// Menu mobile accessible.
const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');
menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
});
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Ouvrir le menu');
}));

// Filtres de projets : une lecture rapide par domaine.
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach((item) => {
    const selected = item === button;
    item.classList.toggle('is-selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  projectCards.forEach((card) => {
    const visible = filter === 'all' || card.dataset.category === filter || card.dataset.category === 'all';
    card.classList.toggle('is-hidden', !visible);
  });
}));

const year = document.querySelector('#currentYear');
if (year) year.textContent = String(new Date().getFullYear());

window.addEventListener('beforeunload', () => cancelAnimationFrame(animationFrame));
