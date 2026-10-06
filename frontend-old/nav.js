// Mobile menu toggle for pages that don't load script.js (e.g. stats.html).
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('is-active'));
});
