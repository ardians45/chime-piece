/**
 * chime-piece — Web 2.0 Science Learning Hub & Academic E-Portfolio
 * Interactive Logic & Canvas Physics Engine (Coral-Pink Blush Aesthetic)
 * Author: Adriana Alya Binti Jefri (UiTM Diploma in Science)
 * ponytail: Native Vanilla JS, zero dependencies, performant 60fps animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initPhysicsCanvas();
  initToolTabs();
  initNavScroll();
  initMobileNav();
});

/* ===================================================================
   1. Interactive Physics Canvas Engine (Hero Section Widget)
   Demonstrates real-time physics principles (Hooke's Law, Gravity, Elasticity)
   =================================================================== */
function initPhysicsCanvas() {
  const canvas = document.getElementById('physicsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = rect.width * window.devicePixelRatio;
    height = canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  let mode = 'orbit'; // 'orbit', 'spring'
  let gravity = 0.25;
  let friction = 0.985;
  let springK = 0.05;

  // Aesthetic Coral-Pink & Science Colors from Dribbble Reference
  const colors = [
    { fill: '#FF7582', glow: 'rgba(255, 117, 130, 0.45)', name: 'Core Nucleus' },
    { fill: '#FF8A95', glow: 'rgba(255, 138, 149, 0.4)', name: 'Proton' },
    { fill: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.35)', name: 'Electron' },
    { fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.35)', name: 'Photon' },
    { fill: '#10B981', glow: 'rgba(16, 185, 129, 0.35)', name: 'Neutron' }
  ];

  class Particle {
    constructor(x, y, radius, colorObj, isFixed = false) {
      this.x = x;
      this.y = y;
      this.originX = x;
      this.originY = y;
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = (Math.random() - 0.5) * 3;
      this.radius = radius;
      this.color = colorObj.fill;
      this.glow = colorObj.glow;
      this.name = colorObj.name;
      this.isFixed = isFixed;
      this.isDragged = false;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = 0.02 + Math.random() * 0.03;
      this.orbitRadius = 45 + Math.random() * 65;
    }

    update(centerX, centerY) {
      if (this.isDragged) return;

      if (mode === 'orbit') {
        if (!this.isFixed) {
          this.angle += this.angularSpeed;
          this.x = centerX + Math.cos(this.angle) * this.orbitRadius;
          this.y = centerY + Math.sin(this.angle) * this.orbitRadius;
        }
      } else if (mode === 'spring') {
        if (!this.isFixed) {
          const dx = this.x - this.originX;
          const dy = this.y - this.originY;
          this.vx -= dx * springK;
          this.vy -= dy * springK;
          this.vy += gravity;

          this.vx *= friction;
          this.vy *= friction;

          this.x += this.vx;
          this.y += this.vy;

          const displayW = width / window.devicePixelRatio;
          const displayH = height / window.devicePixelRatio;
          if (this.x - this.radius < 0) { this.x = this.radius; this.vx *= -0.7; }
          if (this.x + this.radius > displayW) { this.x = displayW - this.radius; this.vx *= -0.7; }
          if (this.y - this.radius < 0) { this.y = this.radius; this.vy *= -0.7; }
          if (this.y + this.radius > displayH) { this.y = displayH - this.radius; this.vy *= -0.7; }
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.shadowColor = this.glow;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // Cute Glossy Shimmer
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();

      ctx.restore();
    }
  }

  let particles = [];
  function setupParticles() {
    particles = [];
    const displayW = width / window.devicePixelRatio;
    const displayH = height / window.devicePixelRatio;
    const centerX = displayW / 2;
    const centerY = displayH / 2;

    particles.push(new Particle(centerX, centerY, 22, colors[0], true));

    for (let i = 0; i < 6; i++) {
      const col = colors[(i % (colors.length - 1)) + 1];
      const p = new Particle(centerX, centerY, 12 + (i % 3) * 3, col);
      p.originX = centerX + (Math.random() - 0.5) * 160;
      p.originY = centerY + (Math.random() - 0.5) * 140;
      particles.push(p);
    }
  }
  setupParticles();

  let draggedParticle = null;

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handleStart(e) {
    const { x, y } = getCanvasCoords(e);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < p.radius + 15) {
        draggedParticle = p;
        p.isDragged = true;
        break;
      }
    }
  }

  function handleMove(e) {
    if (!draggedParticle) return;
    const { x, y } = getCanvasCoords(e);
    draggedParticle.x = x;
    draggedParticle.y = y;
    draggedParticle.vx = 0;
    draggedParticle.vy = 0;
  }

  function handleEnd() {
    if (draggedParticle) {
      draggedParticle.isDragged = false;
      draggedParticle = null;
    }
  }

  canvas.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);

  canvas.addEventListener('touchstart', handleStart, { passive: true });
  window.addEventListener('touchmove', handleMove, { passive: true });
  window.addEventListener('touchend', handleEnd);

  const chipBtns = document.querySelectorAll('.chip-btn');
  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
    });
  });

  function animate() {
    const displayW = width / window.devicePixelRatio;
    const displayH = height / window.devicePixelRatio;
    const centerX = displayW / 2;
    const centerY = displayH / 2;

    ctx.clearRect(0, 0, displayW, displayH);

    if (mode === 'orbit') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 117, 130, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      [55, 88, 120].forEach(r => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    } else if (mode === 'spring') {
      ctx.save();
      ctx.lineWidth = 1.5;
      particles.forEach(p => {
        if (!p.isFixed) {
          ctx.beginPath();
          ctx.moveTo(p.originX, p.originY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(255, 117, 130, 0.35)';
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    if (draggedParticle) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(draggedParticle.originX, draggedParticle.originY);
      ctx.lineTo(draggedParticle.x, draggedParticle.y);
      ctx.strokeStyle = '#FF7582';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    particles.forEach(p => {
      p.update(centerX, centerY);
      p.draw(ctx);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ===================================================================
   2. Tool Tabs Switcher
   =================================================================== */
function initToolTabs() {
  const tabBtns = document.querySelectorAll('.tool-tab-btn');
  const cards = document.querySelectorAll('.tool-detail-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTool = btn.dataset.tool;

      tabBtns.forEach(b => b.classList.remove('active'));
      cards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeCard = document.getElementById(`tool-${targetTool}`);
      if (activeCard) {
        activeCard.classList.add('active');
      }
    });
  });
}

/* ===================================================================
   3. Active Link Scroll Highlighter
   =================================================================== */
function initNavScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => observer.observe(sec));
}

/* ===================================================================
   4. Mobile Navigation Drawer Toggle
   =================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isVisible = navLinks.style.display === 'flex';
    if (isVisible) {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px';
      navLinks.style.left = '20px';
      navLinks.style.right = '20px';
      navLinks.style.background = '#FFFFFF';
      navLinks.style.borderRadius = '20px';
      navLinks.style.padding = '20px';
      navLinks.style.boxShadow = '0 12px 32px rgba(255, 117, 130, 0.18)';
      navLinks.style.border = '1.5px solid #FFE2E7';
    }
  });
}
