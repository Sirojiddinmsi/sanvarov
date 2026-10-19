// Footerdagi yilni avtomatik yangilab turadi
document.getElementById('year').textContent = new Date().getFullYear();

// Qorong'i / yorug' mavzuni almashtirish (tanlov brauzerda eslab qolinadi)
var root = document.documentElement;
var toggle = document.getElementById('theme-toggle');

var saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
root.setAttribute('data-theme', saved === 'light' ? 'light' : 'dark');

function renderToggle() {
  var dark = root.getAttribute('data-theme') === 'dark';
  toggle.textContent = dark ? '☀' : '☾';
  toggle.title = dark ? 'Yorug\' mavzu' : 'Qorong\'i mavzu';
}

toggle.addEventListener('click', function () {
  var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  renderToggle();
});

renderToggle();

// ---------- Lenis: yumshoq aylantirish ----------
// Kutubxona yuklanmasa, sayt oddiy aylantirish bilan ishlayveradi.
var lenis = null;
var hasGsap = !!(window.gsap && window.ScrollTrigger);

if (window.Lenis) {
  lenis = new Lenis({
    duration: 1.3,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true
  });

  if (hasGsap) {
    // Lenis va GSAP bitta soat bilan ishlaydi
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function loop(time) { lenis.raf(time); requestAnimationFrame(loop); })(0);
  }
}

// ---------- Havolalardan bo'limga silliq o'tish ----------
// Zaxira variant (Lenis yo'q bo'lsa): o'zimizning aylantirish.
var scrollAnim = null;

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(y) {
  var start = window.scrollY;
  var dist = y - start;
  if (Math.abs(dist) < 2) return;
  var duration = Math.min(1600, Math.max(900, Math.abs(dist) * 0.9));
  var t0 = null;
  cancelAnimationFrame(scrollAnim);

  function step(ts) {
    if (t0 === null) t0 = ts;
    var p = Math.min(1, (ts - t0) / duration);
    window.scrollTo({ top: start + dist * easeInOut(p), behavior: 'instant' });
    if (p < 1) scrollAnim = requestAnimationFrame(step);
  }
  scrollAnim = requestAnimationFrame(step);
}

document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  var hash = link.getAttribute('href');
  var target = hash === '#' ? null : document.getElementById(hash.slice(1));
  if (hash !== '#' && !target) return;

  e.preventDefault();
  var margin = target ? (parseFloat(getComputedStyle(target).scrollMarginTop) || 0) : 0;

  if (lenis) {
    lenis.scrollTo(target || 0, { offset: -margin, duration: 1.4 });
  } else {
    var y = target ? target.getBoundingClientRect().top + window.scrollY - margin : 0;
    smoothScrollTo(y);
  }
  try { history.pushState(null, '', hash); } catch (err) {}
});

// ---------- Fade Up: elementlar ekranga kirganda pastdan ko'tarilib paydo bo'ladi ----------
// Yashirish GSAP ichida bo'ladi: kutubxona yuklanmasa, hamma narsa ko'rinib turaveradi.
if (hasGsap) {
  var fadeTargets = document.querySelectorAll(
    '.info.top > *, .info.bottom > *, .photo, .section-head, .service, .card, .review, .faq details, footer'
  );

  gsap.set(fadeTargets, { opacity: 0, y: 24 });

  // Element ekranga kirsa (pastdan ham, tepadan ham) paydo bo'ladi,
  // ekrandan chiqib ketsa yana yashirinadi, shunda qaytib kirganda animatsiya yana o'ynaydi.
  function fadeIn(batch) {
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.07,
      overwrite: true
    });
  }

  function fadeReset(batch) {
    gsap.set(batch, { opacity: 0, y: 24, overwrite: true });
  }

  ScrollTrigger.batch(fadeTargets, {
    start: 'top 90%',
    end: 'bottom 10%',
    onEnter: fadeIn,
    onEnterBack: fadeIn,
    onLeave: fadeReset,
    onLeaveBack: fadeReset
  });

  // Rasmlar yuklangach sahifa balandligi o'zgaradi: joylarni qayta hisoblaymiz
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
}

// ---------- Savol-javob akkordeoni ----------
// Savol bosilsa javob yumshoq ochiladi, qayta bosilsa yopiladi. Bittasi ochilsa, boshqasi yopiladi.
var faqItems = document.querySelectorAll('.faq details');

function animateHeight(item, from, to, done) {
  item.style.overflow = 'hidden';
  var anim = item.animate(
    [{ height: from + 'px' }, { height: to + 'px' }],
    { duration: 250, easing: 'ease' }
  );
  item._anim = anim;
  anim.onfinish = function () {
    item.style.overflow = '';
    item._anim = null;
    if (done) done();
    if (hasGsap) ScrollTrigger.refresh();   // balandlik o'zgardi: animatsiya joylarini yangilaymiz
  };
}

function openItem(item) {
  var from = item.offsetHeight;
  item.open = true;
  animateHeight(item, from, item.offsetHeight);
}

function closeItem(item) {
  var from = item.offsetHeight;
  item.open = false;
  var to = item.offsetHeight;
  item.open = true;                          // animatsiya tugaguncha ochiq turadi
  animateHeight(item, from, to, function () { item.open = false; });
}

faqItems.forEach(function (item) {
  item.querySelector('summary').addEventListener('click', function (e) {
    e.preventDefault();
    if (item._anim) return;                  // animatsiya paytida bosishlarni e'tiborsiz qoldiramiz
    if (item.open) {
      closeItem(item);
    } else {
      faqItems.forEach(function (other) {
        if (other !== item && other.open && !other._anim) closeItem(other);
      });
      openItem(item);
    }
  });
});

// Menyu: ekranda turgan bo'limning havolasi ajralib ko'rinadi
var navLinks = document.querySelectorAll('.nav-links a');
var sectionIds = ['xizmatlar', 'ishlarim', 'fikrlar', 'savol-javob'];

function setActive(id) {
  navLinks.forEach(function (a) {
    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
  });
}

if ('IntersectionObserver' in window) {
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  // Sahifaning eng tepasida (hero) hech qaysi havola ajralmasin
  window.addEventListener('scroll', function () {
    if (window.scrollY < 200) setActive('');
  }, { passive: true });
}

// Hero surat: foto.webp bo'lsa ko'rsatadi, bo'lmasa "Surat uchun joy" ramkasi turadi
var photo = document.getElementById('photo');
var img = photo.querySelector('img');

function showPhoto() { photo.classList.add('has-photo'); }
function hidePhoto() { img.remove(); }

if (img.complete) {
  (img.naturalWidth > 0) ? showPhoto() : hidePhoto();
} else {
  img.addEventListener('load', showPhoto);
  img.addEventListener('error', hidePhoto);
}
