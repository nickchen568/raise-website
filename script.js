// =================================================
// 上齊影像輸出有限公司 — 互動腳本
// =================================================
(function () {
  'use strict';

  let captchaApi = null; // 文字驗證（Captcha）實例，供聯絡表單共用

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (typeof emailjs !== 'undefined') {
      emailjs.init("Kj0mVuPoRV2eojDGI");
    }
    initHeroSlider();
    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
    initReveal();
    initCounters();
    initLightbox();
    initCaptcha();
    initContactForm();
    initToTop();
    initActiveSection();
    setYear();
  }

  /* ---------- 0. Hero 客戶案例輪播 ---------- */
  function initHeroSlider() {
    const slider = document.getElementById('heroSlider');
    const dotsWrap = document.getElementById('heroDots');
    if (!slider) return;
    const slides = slider.querySelectorAll('.hero-slide');
    if (!slides.length) return;

    let idx = 0;
    let timer = null;
    const interval = 5000;

    // 產生圓點
    if (dotsWrap) {
      slides.forEach((_s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `切換到第 ${i + 1} 張`);
        b.addEventListener('click', () => go(i, true));
        dotsWrap.appendChild(b);
      });
    }
    const dots = dotsWrap ? dotsWrap.querySelectorAll('button') : [];

    const apply = () => {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };

    const go = (n, manual) => {
      idx = (n + slides.length) % slides.length;
      apply();
      if (manual) restart();
    };

    const next = () => go(idx + 1, false);

    const start = () => { timer = setInterval(next, interval); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const restart = () => { stop(); start(); };

    apply();
    start();

    // 切換頁籤時暫停，回來再啟動
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else restart();
    });
  }

  /* ---------- 1. 導航列：捲動變色 ---------- */
  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 2. 手機選單 ---------- */
  function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // 點選單後自動收合
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggle.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ---------- 3. 平滑捲動（補正 header 高度） ---------- */
  function initSmoothScroll() {
    const headerH = () => {
      const h = document.getElementById('header');
      return h ? h.offsetHeight : 72;
    };
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - headerH() + 1;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ---------- 4. 滾動淡入（Intersection Observer） ---------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // 同批進場有微小錯落感
          setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ---------- 5. 數字計數動畫 ---------- */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-num');
    if (!counters.length) return;

    const animate = (el) => {
      const target = +el.getAttribute('data-count') || 0;
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  }

  /* ---------- 6. 客戶案例 Lightbox（一次顯示資料夾全部照片） ---------- */
  function initLightbox() {
    const lb = document.getElementById('lightbox');
    const titleEl = document.getElementById('lbTitle');
    const gridEl = document.getElementById('lbGrid');
    const btnClose = document.getElementById('lbClose');
    const wrap = document.getElementById('casesCards');

    const zoom = document.getElementById('lbZoom');
    const zoomImg = document.getElementById('lbZoomImg');
    const zoomClose = document.getElementById('lbZoomClose');
    const zoomPrev = document.getElementById('lbZoomPrev');
    const zoomNext = document.getElementById('lbZoomNext');
    const zoomCounter = document.getElementById('lbZoomCounter');

    if (!lb || !gridEl || !wrap) return;

    let zoomImages = [];
    let zoomIdx = 0;
    let zoomTotal = 0;

    const updateCounter = () => {
      if (zoomCounter) zoomCounter.textContent = `${zoomIdx + 1} / ${zoomTotal}`;
    };

    const openZoom = (src, alt, idx, imgs) => {
      zoomImages = imgs;
      zoomTotal = imgs.length;
      zoomIdx = idx;
      zoomImg.src = src;
      zoomImg.alt = alt || '';
      updateCounter();
      zoom.classList.add('is-open');
      zoom.setAttribute('aria-hidden', 'false');
    };

    const prevImg = () => {
      zoomIdx = (zoomIdx - 1 + zoomTotal) % zoomTotal;
      zoomImg.src = zoomImages[zoomIdx];
      updateCounter();
    };

    const nextImg = () => {
      zoomIdx = (zoomIdx + 1) % zoomTotal;
      zoomImg.src = zoomImages[zoomIdx];
      updateCounter();
    };

    const closeZoom = () => {
      zoom.classList.remove('is-open');
      zoom.setAttribute('aria-hidden', 'true');
      zoomImg.src = '';
    };

    const open = (card) => {
      const folder = card.getAttribute('data-folder');
      const files = (card.getAttribute('data-files') || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!folder || !files.length) return;

      titleEl.textContent = folder;
      gridEl.innerHTML = '';

      const imgs = files.map((f, i) => {
        const img = document.createElement('img');
        img.src = `客戶案例/${folder}/${f}`;
        img.alt = `${folder} - ${i + 1}`;
        img.loading = 'lazy';
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openZoom(img.src, img.alt, i, imgs));
        gridEl.appendChild(img);
        return img.src;
      });

      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      lb.scrollTop = 0;
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      gridEl.innerHTML = '';
      document.body.style.overflow = '';
      closeZoom();
    };

    wrap.addEventListener('click', (e) => {
      const card = e.target.closest('.case-card');
      if (!card) return;
      e.preventDefault();
      open(card);
    });

    btnClose.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

    zoomClose.addEventListener('click', closeZoom);
    zoomPrev.addEventListener('click', prevImg);
    zoomNext.addEventListener('click', nextImg);
    zoom.addEventListener('click', (e) => { if (e.target === zoom) closeZoom(); });

    document.addEventListener('keydown', (e) => {
      if (!zoom.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeZoom();
      else if (e.key === 'ArrowLeft') prevImg();
      else if (e.key === 'ArrowRight') nextImg();
    });
  }

  /* ---------- 7. 文字驗證（Captcha） ---------- */
  function initCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    const input = document.getElementById('captchaInput');
    const refreshBtn = document.getElementById('captchaRefresh');
    const hint = document.getElementById('captchaHint');
    const submitBtn = document.getElementById('submitBtn');
    if (!canvas || !input || !submitBtn) return null;

    // 排除容易看錯的字元（I O 0 1 S Z）
    const CHARS = 'ABCDEFGHJKLMNPQRTUVWXY23456789';
    let code = '';

    const rand = (min, max) => Math.random() * (max - min) + min;

    function draw() {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      code = '';
      for (let i = 0; i < 4; i++) {
        code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      }

      // 背景
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);

      // 干擾線
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.floor(rand(120, 200))},${Math.floor(rand(120, 200))},${Math.floor(rand(120, 200))},0.45)`;
        ctx.lineWidth = rand(0.8, 1.8);
        ctx.beginPath();
        ctx.moveTo(rand(0, w), rand(0, h));
        ctx.lineTo(rand(0, w), rand(0, h));
        ctx.stroke();
      }

      // 干擾點
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${Math.floor(rand(100, 190))},${Math.floor(rand(100, 190))},${Math.floor(rand(100, 190))},0.4)`;
        ctx.beginPath();
        ctx.arc(rand(0, w), rand(0, h), rand(0.6, 1.4), 0, Math.PI * 2);
        ctx.fill();
      }

      // 文字
      const step = w / (code.length + 1);
      for (let i = 0; i < code.length; i++) {
        ctx.save();
        ctx.translate(step * (i + 0.5) + rand(-3, 3), h / 2 + rand(-4, 4));
        ctx.rotate(rand(-0.28, 0.28));
        ctx.font = 'bold 30px "Segoe UI", Arial, "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgb(${Math.floor(rand(20, 90))},${Math.floor(rand(20, 90))},${Math.floor(rand(60, 140))})`;
        ctx.fillText(code.charAt(i), 0, 0);
        ctx.restore();
      }
    }

    function setHint(text, kind) {
      if (!hint) return;
      hint.textContent = text;
      hint.classList.remove('is-ok', 'is-err');
      if (kind) hint.classList.add(kind);
    }

    // 檢查輸入是否正確
    function check(showHint) {
      const val = input.value.trim().toUpperCase();
      const ok = !!val && val === code;
      input.classList.toggle('is-ok', ok);
      input.classList.toggle('is-err', !ok && val.length > 0);
      submitBtn.disabled = !ok;
      if (showHint) {
        if (ok) setHint('✓ 驗證碼正確，可以送出表單。', 'is-ok');
        else if (val.length > 0) setHint('✗ 驗證碼不正確，請重新輸入。', 'is-err');
      }
      return ok;
    }

    function refresh() {
      draw();
      input.value = '';
      input.classList.remove('is-ok', 'is-err');
      submitBtn.disabled = true;
      setHint('請輸入圖片中的 4 碼文字（不分大小寫），輸入正確才能送出表單。');
    }

    input.addEventListener('input', () => check(true));
    if (refreshBtn) refreshBtn.addEventListener('click', refresh);
    canvas.addEventListener('click', refresh);

    refresh();

    captchaApi = {
      isValid: () => check(false),
      reset: refresh
    };
    return captchaApi;
  }

  /* ---------- 8. 聯絡表單（EmailJS 發送） ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const btn = document.getElementById('submitBtn');
    const captcha = captchaApi;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      const data = Object.fromEntries(new FormData(form).entries());
      const required = ['name', 'phone', 'email', 'message'];
      const miss = required.filter(k => !String(data[k] || '').trim());
      if (miss.length) {
        status.classList.add('is-err');
        status.textContent = '請填寫所有必填欄位';
        return;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      if (!emailOk) {
        status.classList.add('is-err');
        status.textContent = '電子信箱格式有誤';
        return;
      }

      // 文字驗證
      if (captcha && !captcha.isValid()) {
        status.classList.add('is-err');
        status.textContent = '請輸入正確的驗證碼';
        return;
      }

      btn.classList.add('is-loading');
      btn.disabled = true;

      try {
        await emailjs.send(
          'service_g9vmmbh',
          'template_k2q03un',
          {
            from_name:    data.name,
            from_phone:   data.phone,
            from_email:   data.email,
            service:      data.service || '未選擇',
            message:      data.message,
          }
        );
        status.classList.add('is-ok');
        status.textContent = '✓ 訊息已送出，我們將儘快與您聯繫！';
        form.reset();
        if (captcha) captcha.reset();
      } catch (err) {
        console.error('EmailJS error:', err);
        status.classList.add('is-err');
        status.textContent = '✗ 傳送失敗，請直接來電 (02) 2656-2287 或 email: raise.image@msa.hinet.net';
      } finally {
        btn.classList.remove('is-loading');
        btn.disabled = captcha ? !captcha.isValid() : false;
      }
    });
  }

  /* ---------- 9. 回到頂端 ---------- */
  function initToTop() {
    const btn = document.getElementById('toTop');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('is-show', window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- 10. 當前區塊高亮 ---------- */
  function initActiveSection() {
    const links = Array.from(document.querySelectorAll('.nav-link'));
    const map = new Map();
    links.forEach(l => {
      const id = l.getAttribute('href');
      const sec = id && document.querySelector(id);
      if (sec) map.set(sec, l);
    });
    if (!map.size || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    map.forEach((_l, sec) => io.observe(sec));
  }

  /* ---------- 11. 年份 ---------- */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }
})();
