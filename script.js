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
