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

function articlePage(title, tags, content) {
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
    :root { --black: #000; --white: #fff; --gray: #767676; --border: #e0e0e0; --sans: "Helvetica Neue", Helvetica, Arial, sans-serif; --mono: "Space Mono", monospace; }
    body { font-family: var(--mono); background: var(--white); color: var(--black); line-height: 1.6; font-size: 15px; }
    h1, h2, h3 { font-family: var(--sans); }
    header { border-bottom: 1px solid var(--black); padding: 1.25rem 2.5rem; display: flex; align-items: center; justify-content: space-between; }
    header a { font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; text-decoration: none; color: var(--black); font-family: var(--sans); }
    header a:hover { opacity: .5; }
    header span { font-family: var(--sans); }
    main { max-width: 720px; margin: 0 auto; padding: 5rem 2.5rem 8rem; }
    .back { font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); text-decoration: none; display: inline-block; margin-bottom: 3rem; border-bottom: 1px solid transparent; font-family: var(--mono); }
    .back:hover { border-bottom-color: var(--gray); }
    h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700; line-height: 1.1; letter-spacing: -.02em; margin-bottom: 2rem; }
    .tags { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid var(--border); }
    .tag { font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; border: 1px solid var(--black); padding: .25rem .6rem; font-family: var(--mono); }
    .content h2 { font-size: 1.3rem; font-weight: 700; letter-spacing: -.01em; margin: 3rem 0 1rem; font-family: var(--sans); }
    .content h3 { font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin: 2rem 0 .75rem; font-family: var(--sans); }
    .content p { margin-bottom: 1.4rem; color: #111; font-size: .9rem; line-height: 1.75; }
    .content ul, .content ol { margin: .5rem 0 1.4rem 1.25rem; }
    .content li { margin-bottom: .4rem; font-size: .9rem; }
    .content code { font-family: var(--mono); font-size: .85em; background: #f4f4f4; padding: .1rem .35rem; }
    .content pre { background: #f4f4f4; border-left: 3px solid var(--black); padding: 1.25rem 1.5rem; overflow-x: auto; margin-bottom: 1.4rem; }
    .content pre code { background: none; padding: 0; font-size: .8rem; }
    .content strong { font-weight: 700; }
  </style>
</head>
<body>
  <header>
    <a href="../index.html">CodeChronicle</a>
    <span style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gray)">Blog technique</span>
  </header>
  <main>
    <a class="back" href="../index.html">← Index</a>
    <h1>${title}</h1>
    <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <div class="content">${content}</div>
  </main>
</body>
</html>`;
}

function indexPage(articles) {
  const rows = articles.map((a, i) => `
    <a class="row" href="articles/${a.slug}.html">
      <span class="row-index">${String(i + 1).padStart(2, '0')}</span>
      <div class="row-body">
        <h2>${a.title}</h2>
        <p>${a.summary}</p>
      </div>
      <div class="row-meta">
        <span class="date">${a.date}</span>
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
    :root { --black: #000; --white: #fff; --gray: #767676; --border: #e0e0e0; --sans: "Helvetica Neue", Helvetica, Arial, sans-serif; --mono: "Space Mono", monospace; }
    body { font-family: var(--mono); background: var(--white); color: var(--black); }
    h1, h2, h3 { font-family: var(--sans); }
    header { border-bottom: 1px solid var(--black); padding: 1.25rem 2.5rem; display: grid; grid-template-columns: 1fr auto; align-items: center; }
    header h1 { font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; font-family: var(--sans); }
    header p { font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--gray); font-family: var(--sans); }
    .hero { padding: 5rem 2.5rem 4rem; border-bottom: 1px solid var(--border); }
    .hero-label { font-size: .65rem; letter-spacing: .15em; text-transform: uppercase; color: var(--gray); margin-bottom: 1.5rem; font-family: var(--mono); }
    .hero h2 { font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; line-height: .95; letter-spacing: -.04em; font-family: var(--sans); }
    .list-header { display: grid; grid-template-columns: 3rem 1fr auto; gap: 2rem; padding: 1rem 2.5rem; border-bottom: 1px solid var(--border); }
    .list-header span { font-size: .6rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--gray); font-family: var(--mono); }
    .row { display: grid; grid-template-columns: 3rem 1fr auto; gap: 2rem; padding: 1.75rem 2.5rem; border-bottom: 1px solid var(--border); text-decoration: none; color: var(--black); transition: background .15s; align-items: start; }
    .row:hover { background: #f7f7f7; }
    .row-index { font-size: .65rem; color: var(--gray); padding-top: .25rem; font-family: var(--mono); }
    .row-body h2 { font-size: 1.05rem; font-weight: 700; letter-spacing: -.01em; margin-bottom: .5rem; line-height: 1.2; font-family: var(--sans); }
    .row-body p { font-size: .78rem; color: var(--gray); line-height: 1.6; font-family: var(--mono); }
    .row-meta { text-align: right; min-width: 120px; }
    .date { font-size: .65rem; color: var(--gray); display: block; margin-bottom: .6rem; font-family: var(--mono); }
    .tags { display: flex; gap: .3rem; flex-wrap: wrap; justify-content: flex-end; }
    .tag { font-size: .58rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; border: 1px solid #ccc; padding: .2rem .5rem; font-family: var(--mono); }
    .empty { padding: 5rem 2.5rem; color: var(--gray); font-size: .8rem; letter-spacing: .05em; text-transform: uppercase; font-family: var(--mono); }
    footer { padding: 2rem 2.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; }
    footer span { font-size: .6rem; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); font-family: var(--mono); }
  </style>
</head>
<body>
  <header>
    <h1>CodeChronicle</h1>
    <p>Blog technique</p>
  </header>
  <div class="hero">
    <p class="hero-label">Publication automatisée — ${new Date().getFullYear()}</p>
    <h2>Articles<br>& Chroniques</h2>
  </div>
  <div class="list-header">
    <span>N°</span>
    <span>Article</span>
    <span>Date</span>
  </div>
  ${articles.length > 0 ? rows : '<p class="empty">Aucun article disponible.</p>'}
  <footer>
    <span>CodeChronicle — ${articles.length} article${articles.length > 1 ? 's' : ''}</span>
    <span>Généré automatiquement</span>
  </footer>
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
      articlePage(data.title, tags, htmlContent)
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
