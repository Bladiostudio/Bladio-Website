(function(){
  // Year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav
  const btn = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // HERO CANVAS — robust, DPI-aware, correct sizing
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const section = canvas.parentElement; // .hero
  let cssW = 0, cssH = 0, dpr = 1;
  let particles = [];
  let running = true;

  function resize(){
    if (!section) return;
    const rect = section.getBoundingClientRect();
    // Fallback if rect gives zeros (e.g., display:none edge cases)
    cssW = Math.max(1, Math.floor(rect.width));
    cssH = Math.max(1, Math.floor(rect.height));
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap at 2 for perf
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels

    // particle count based on CSS pixel area
    const target = Math.max(80, Math.floor((cssW * cssH) / 28000)); // density
    if (particles.length < target) {
      for (let i = particles.length; i < target; i++) particles.push(spawn(true));
    } else if (particles.length > target) {
      particles.length = target;
    }
  }

  function spawn(randomPos=false){
    const x = randomPos ? Math.random() * cssW : (Math.random() < 0.5 ? 0 : cssW);
    const y = randomPos ? Math.random() * cssH : Math.random() * cssH;
    const speed = 0.15 + Math.random() * 0.35;
    const angle = Math.random() * Math.PI * 2;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 1.6 + 0.3,
      a: 0.25 + Math.random() * 0.3
    };
  }

  function tick(){
    if (!running) return;
    ctx.clearRect(0, 0, cssW, cssH);
    for (let i=0; i<particles.length; i++){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // soft wrap (teleport to opposite edge to avoid corner-sticking)
      if (p.x < -5)  p.x = cssW + 5;
      if (p.x > cssW + 5) p.x = -5;
      if (p.y < -5)  p.y = cssH + 5;
      if (p.y > cssH + 5) p.y = -5;

      ctx.beginPath();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = 'rgba(46,204,113,1)';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  // Avoid layout thrash: run after first frame & font load
  function start(){
    resize();
    requestAnimationFrame(tick);
  }

  // Resize hooks
  const ro = new ResizeObserver(resize);
  ro.observe(section);
  window.addEventListener('resize', resize);
  // In case fonts or styles shift layout after load
  window.addEventListener('load', resize);

  start();

  // Expose a tiny API for debug (optional) !! DONT USE ON DEPLOYED SITE !!
  window.__bladioHero = {
    pause(){ running = false; },
    play(){ if (!running){ running = true; tick(); } },
    resize
  };
})();
