const STYLESHEET_URL = './styles/main.css';

const FAVICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
        <stop stop-color="#a78bfa"/>
        <stop offset="1" stop-color="#6d28d9"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="18" fill="#100e18"/>
    <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#g)"/>
    <path d="m19 33 8.5 8.5L46 23" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

function appendStylesheet(href) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', resolve, { once: true });
    document.head.append(link);
  });
}

function appendFavicon(svg) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  document.head.append(link);
}

function createBootScreen() {
  const main = document.createElement('main');
  main.className = 'boot-screen';

  const mark = document.createElement('span');
  mark.className = 'boot-screen__mark';
  mark.setAttribute('aria-hidden', 'true');

  const label = document.createElement('p');
  label.className = 'boot-screen__label';
  label.textContent = 'Focus — загрузка…';

  main.append(mark, label);
  return main;
}

async function bootstrap() {
  document.documentElement.style.backgroundColor = '#08070d';
  document.documentElement.style.colorScheme = 'dark';

  appendFavicon(FAVICON_SVG);
  await appendStylesheet(STYLESHEET_URL);

  document.body.replaceChildren(createBootScreen());
}

bootstrap();
