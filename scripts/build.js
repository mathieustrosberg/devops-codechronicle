const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ARTICLES_DIR = path.join(PUBLIC_DIR, 'articles');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slug(filename) {
  return filename.replace(/\.md$/, '');
}

function articlePage(title, tags, content, articleSlug) {
  const imageUrl = `https://picsum.photos/seed/${articleSlug}/1400/600?grayscale`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — CodeChronicle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --black: #000; --white: #fff; --gray: #767676; --border: #e0e0e0; --max: 720px; --sans: "Helvetica Neue", Helvetica, Arial, sans-serif; --mono: "Space Mono", monospace; }
    body { font-family: var(--mono); background: var(--white); color: var(--black); line-height: 1.6; font-size: 15px; }
    h1, h2, h3 { font-family: var(--sans); }
    #progress-bar { position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: var(--black); z-index: 200; transition: width .08s linear; }
    .container { max-width: var(--max); margin: 0 auto; padding: 0 2.5rem; }
    header { border-bottom: 1px solid var(--black); padding-top: 1.25rem; padding-bottom: 1.25rem; }
    header .container { display: flex; align-items: center; justify-content: space-between; }
    header a { font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; text-decoration: none; color: var(--black); font-family: var(--sans); }
    header a:hover { opacity: .5; }
    header span { font-family: var(--sans); font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: var(--gray); }
    .hero-img { width: 100%; height: 420px; object-fit: cover; display: block; filter: grayscale(100%); }
    main { padding: 4rem 0 8rem; }
    .back { font-size: .65rem; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); text-decoration: none; display: inline-block; margin-bottom: 2.5rem; border-bottom: 1px solid transparent; }
    .back:hover { border-bottom-color: var(--gray); }
    h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; line-height: 1.1; letter-spacing: -.02em; margin-bottom: 2rem; }
    .tags { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid var(--border); }
    .tag { font-size: .6rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; border: 1px solid var(--black); padding: .2rem .6rem; }
    .content h2 { font-size: 1.3rem; font-weight: 700; letter-spacing: -.01em; margin: 3rem 0 1rem; font-family: var(--sans); }
    .content h3 { font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin: 2rem 0 .75rem; font-family: var(--sans); }
    .content p { margin-bottom: 1.4rem; color: #111; font-size: .875rem; line-height: 1.8; }
    .content ul, .content ol { margin: .5rem 0 1.4rem 1.25rem; }
    .content li { margin-bottom: .4rem; font-size: .875rem; line-height: 1.7; }
    .content code { font-family: var(--mono); font-size: .82em; background: #f4f4f4; padding: .1rem .35rem; }
    .content pre { background: #f4f4f4; border-left: 3px solid var(--black); padding: 1.25rem 1.5rem; overflow-x: auto; margin-bottom: 1.4rem; }
    .content pre code { background: none; padding: 0; font-size: .78rem; }
    .content strong { font-weight: 700; }
  </style>
</head>
<body>
  <div id="progress-bar"></div>
  <header>
    <div class="container">
      <a href="../index.html">CodeChronicle</a>
      <span>Blog technique</span>
    </div>
  </header>
  <img class="hero-img" src="${imageUrl}" alt="${title}" />
  <main>
    <div class="container">
      <a class="back" href="../index.html">← Index</a>
      <h1>${title}</h1>
      <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="content">${content}</div>
    </div>
  </main>
  <script>
    var bar = document.getElementById('progress-bar');
    window.addEventListener('scroll', function() {
      var scrolled = document.documentElement.scrollTop || document.body.scrollTop;
      var total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      bar.style.width = (scrolled / total * 100) + '%';
    });
  </script>
</body>
</html>`;
}

function indexPage(articles) {
  const rows = articles.map((a, i) => `
    <a class="row" href="articles/${a.slug}.html">
      <img class="row-img" src="https://picsum.photos/seed/${a.slug}/300/200?grayscale" alt="${a.title}" />
      <div class="row-body">
        <div class="row-top">
          <span class="row-index">${String(i + 1).padStart(2, '0')}</span>
          <span class="date">${a.date}</span>
        </div>
        <h2>${a.title}</h2>
        <p>${a.summary}</p>
        <div class="tags">${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </a>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeChronicle — Blog technique</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --black: #000; --white: #fff; --gray: #767676; --border: #e0e0e0; --max: 720px; --sans: "Helvetica Neue", Helvetica, Arial, sans-serif; --mono: "Space Mono", monospace; }
    body { font-family: var(--mono); background: var(--white); color: var(--black); }
    h1, h2, h3 { font-family: var(--sans); }
    #progress-bar { position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: var(--black); z-index: 200; transition: width .08s linear; }
    .container { max-width: var(--max); margin: 0 auto; padding: 0 2.5rem; }
    header { border-bottom: 1px solid var(--black); padding-top: 1.25rem; padding-bottom: 1.25rem; }
    header .container { display: grid; grid-template-columns: 1fr auto; align-items: center; }
    header h1 { font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; font-family: var(--sans); }
    header p { font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--gray); font-family: var(--sans); }
    .hero { padding: 5rem 0 4rem; border-bottom: 1px solid var(--border); }
    .hero-label { font-size: .65rem; letter-spacing: .15em; text-transform: uppercase; color: var(--gray); margin-bottom: 1.5rem; font-family: var(--mono); }
    .hero h2 { font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; line-height: .95; letter-spacing: -.04em; font-family: var(--sans); }
    .list-header { display: flex; gap: 1.5rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border); }
    .list-header span { font-size: .6rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--gray); font-family: var(--mono); }
    .row { display: grid; grid-template-columns: 140px 1fr; gap: 2rem; padding: 2rem 0; border-bottom: 1px solid var(--border); text-decoration: none; color: var(--black); transition: background .15s; align-items: start; }
    .row:hover { background: #f7f7f7; }
    .row-img { width: 140px; height: 95px; object-fit: cover; filter: grayscale(100%); display: block; flex-shrink: 0; }
    .row-top { display: flex; align-items: center; gap: 1rem; margin-bottom: .6rem; }
    .row-index { font-size: .6rem; color: var(--gray); font-family: var(--mono); }
    .date { font-size: .6rem; color: var(--gray); font-family: var(--mono); }
    .row-body h2 { font-size: 1.05rem; font-weight: 700; letter-spacing: -.01em; margin-bottom: .5rem; line-height: 1.2; font-family: var(--sans); }
    .row-body p { font-size: .75rem; color: var(--gray); line-height: 1.6; margin-bottom: .8rem; font-family: var(--mono); }
    .tags { display: flex; gap: .3rem; flex-wrap: wrap; }
    .tag { font-size: .55rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; border: 1px solid #ccc; padding: .15rem .45rem; font-family: var(--mono); }
    .empty { padding: 5rem 0; color: var(--gray); font-size: .8rem; letter-spacing: .05em; text-transform: uppercase; font-family: var(--mono); }
    footer { padding: 2rem 0; border-top: 1px solid var(--border); display: flex; justify-content: space-between; }
    footer span { font-size: .6rem; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); font-family: var(--mono); }
  </style>
</head>
<body>
  <div id="progress-bar"></div>
  <header>
    <div class="container">
      <h1>CodeChronicle</h1>
      <p>Blog technique</p>
    </div>
  </header>
  <div class="hero">
    <div class="container">
      <p class="hero-label">Publication automatisée — ${new Date().getFullYear()}</p>
      <h2>Articles<br>& Chroniques</h2>
    </div>
  </div>
  <div class="container">
    <div class="list-header">
      <span>${articles.length} article${articles.length > 1 ? 's' : ''}</span>
    </div>
    ${articles.length > 0 ? rows : '<p class="empty">Aucun article disponible.</p>'}
    <footer>
      <span>CodeChronicle</span>
      <span>Généré automatiquement</span>
    </footer>
  </div>
  <script>
    var bar = document.getElementById('progress-bar');
    window.addEventListener('scroll', function() {
      var scrolled = document.documentElement.scrollTop || document.body.scrollTop;
      var total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      bar.style.width = (scrolled / total * 100) + '%';
    });
  </script>
</body>
</html>`;
}

function build() {
  ensureDir(PUBLIC_DIR);
  ensureDir(ARTICLES_DIR);

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const articles = [];

  for (const file of files) {
    const filepath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filepath, 'utf8').trim();

    if (!raw) continue;

    const { data, content } = matter(raw);

    if (!data.title) continue;

    const articleSlug = slug(file);
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const htmlContent = marked(content);

    fs.writeFileSync(
      path.join(ARTICLES_DIR, `${articleSlug}.html`),
      articlePage(data.title, tags, htmlContent, articleSlug)
    );

    articles.push({
      slug: articleSlug,
      title: data.title,
      summary: data.summary || '',
      date: data.date || '',
      tags,
    });

    console.log(`Généré : ${articleSlug}.html`);
  }

  articles.sort((a, b) => b.date.localeCompare(a.date));

  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), indexPage(articles));

  console.log(`Site généré : ${articles.length} article(s)`);
}

build();
