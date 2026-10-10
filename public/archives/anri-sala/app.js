const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('#sidebar');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.querySelector('span').textContent = open ? '×' : '＋';
  });
}

document.querySelectorAll('.sidebar nav a').forEach((a) => {
  a.addEventListener('click', () => sidebar.classList.remove('open'));
});

const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('.sidebar nav a')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-28% 0px -60% 0px', threshold: 0 });
sections.forEach((section) => observer.observe(section));

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.work-card');
filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const value = button.dataset.filter;
  cards.forEach((card) => {
    const year = Number.parseInt(card.dataset.year, 10);
    const show = value === 'all' || (value === '2020s' && year >= 2020) || (value === '2010s' && year >= 2010 && year < 2020) || (value === '2000s' && year >= 2000 && year < 2010) || (value === '1990s' && year < 2000);
    card.classList.toggle('is-hidden', !show);
  });
}));

const videoModal = document.querySelector('#videoModal');
const videoFrame = document.querySelector('#videoFrame');
const videoTitle = document.querySelector('#videoModalTitle');
const videoFallback = document.querySelector('#videoFallback');
const closeVideo = () => {
  if (!videoModal) return;
  videoModal.hidden = true;
  videoModal.setAttribute('aria-hidden', 'true');
  videoFrame.src = 'about:blank';
  document.body.classList.remove('modal-open');
};
document.querySelectorAll('.js-video').forEach((button) => button.addEventListener('click', () => {
  videoFrame.src = button.dataset.videoUrl;
  videoTitle.textContent = button.dataset.videoTitle || '视频';
  videoFallback.href = button.dataset.videoUrl;
  videoModal.hidden = false;
  videoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}));
document.querySelectorAll('[data-close-video]').forEach((item) => item.addEventListener('click', closeVideo));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeVideo();
});
