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
