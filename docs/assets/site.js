document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

// A deterrent to ordinary image saving, not DRM or reliable screenshot detection.
const portraitGuard = document.querySelector('.portrait-guard');
if (portraitGuard) {
  for (const type of ['contextmenu', 'dragstart']) {
    portraitGuard.addEventListener(type, event => event.preventDefault());
  }
  let maskTimer;
  const maskPortrait = () => {
    clearTimeout(maskTimer);
    portraitGuard.classList.add('is-masked');
    maskTimer = setTimeout(() => portraitGuard.classList.remove('is-masked'), 1800);
  };
  // OS screenshot shortcuts often never reach the browser. This only reacts
  // when a matching keyboard event is actually delivered, with no guarantee
  // that painting happens before the OS captures the screen.
  addEventListener('keydown', event => {
    if (event.key === 'PrintScreen' || event.code === 'PrintScreen' ||
        (event.metaKey && event.shiftKey && ['Digit3', 'Digit4', 'Digit5', 'KeyS'].includes(event.code))) {
      maskPortrait();
    }
  });
}

const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  const updateBackToTop = () => { backToTop.hidden = window.scrollY < 240; };
  addEventListener('scroll', updateBackToTop, { passive: true });
  addEventListener('pageshow', updateBackToTop);
  updateBackToTop();
  backToTop.addEventListener('click', () => {
    document.querySelector('.wordmark')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
}

const header = document.querySelector('.site-header');
if (header) new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
}).observe(header);
const workLinks = [...document.querySelectorAll('.work-sidebar a')];
const workSections = [...document.querySelectorAll('[data-work-section]')];
if (workSections.length) {
  let pending = false;
  const highlight = () => {
    pending = false;
    const top = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) +
      (parseFloat(getComputedStyle(workSections[0]).scrollMarginTop) || 0) + 4;
    let current = workSections[0];
    for (const section of workSections) if (section.getBoundingClientRect().top <= top) current = section;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = workSections.at(-1);
    for (const link of workLinks) {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(highlight); } }, { passive: true });
  addEventListener('resize', highlight);
  highlight();
}

// Email text itself is the copy control; the separate mail button opens a composer.
for (const button of document.querySelectorAll('[data-copy-email]')) {
  let timer;
  button.addEventListener('click', async () => {
    const zh = document.documentElement.lang.startsWith('zh');
    const status = button.nextElementSibling;
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail);
      status.textContent = zh ? '已复制' : 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(button);
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = zh ? '已选中，请手动复制' : 'Selected; copy manually';
    }
    clearTimeout(timer);
    timer = setTimeout(() => { status.textContent = ''; }, 2200);
  });
}
