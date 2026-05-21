# CodeChronicle

![Deploy](https://github.com/mathieustrosberg/devops-codechronicle/actions/workflows/deploy.yml/badge.svg)
![Generate Article](https://github.com/mathieustrosberg/devops-codechronicle/actions/workflows/generate-article.yml/badge.svg)

Blog technique automatisé — génération de contenu via IA, déploiement sur InfinityFree.

**Site en ligne → [codechronicle.infinityfree.me](https://codechronicle.infinityfree.me)**

---

## Fonctionnement

```
1. Créer un fichier .md vide dans blog/  →  ouvrir une PR vers main
2. GitHub Actions génère l'article via OpenAI  →  commente la PR
3. Merger la PR  →  site HTML généré + notification Discord + déploiement FTP
```

---

## Architecture

```
devops-codechronicle/
├── .github/
│   └── workflows/
│       ├── generate-article.yml   # Déclenché à l'ouverture d'une PR
│       └── deploy.yml             # Déclenché au merge sur main
├── blog/                          # Fichiers Markdown (générés par l'IA)
├── public/                        # Site statique généré
│   ├── index.html
│   └── articles/
├── scripts/
│   ├── generate.js                # Génération d'article via OpenAI
│   └── build.js                   # Conversion Markdown → HTML
├── package.json
└── README.md
```

---

## Workflows GitHub Actions

### `generate-article.yml` — PR vers `main`

| Étape | Description |
|-------|-------------|
| Checkout | Récupère la branche de la PR |
| Generate article | Appelle l'API OpenAI avec le nom du fichier comme prompt |
| Commit | Sauvegarde le contenu généré dans la branche |
| Artifact | Archive le fichier `.md` généré |
| Comment PR | Poste le titre et le résumé dans la PR |

### `deploy.yml` — Push sur `main`

| Étape | Description |
|-------|-------------|
| Build | Génère le site HTML depuis les fichiers Markdown |
| Discord | Envoie une notification avec titre, résumé et lien |
| FTP Deploy | Upload `public/` vers `htdocs/` sur InfinityFree |
| Validate | Vérifie que le site répond correctement |

---

## Configuration

### Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `OPENAI_API_KEY` | Clé API OpenAI pour la génération d'articles |
| `FTP_HOST` | Hôte FTP InfinityFree (ex: `ftpupload.net`) |
| `FTP_USER` | Nom d'utilisateur FTP |
| `FTP_PASSWORD` | Mot de passe FTP |
| `DISCORD_WEBHOOK_URL` | URL du webhook Discord |

### Variable GitHub requise

| Variable | Description |
|----------|-------------|
| `SITE_URL` | URL publique du blog (ex: `https://codechronicle.infinityfree.me`) |

> Settings → Secrets and variables → Actions

---

## Ajouter un article

```bash
# 1. Créer une branche
git checkout -b feature/mon-article

# 2. Ajouter un fichier vide (le nom = le sujet de l'article)
touch blog/2026-05-21-mon-sujet.md

# 3. Pousser et ouvrir une PR vers main
git add blog/2026-05-21-mon-sujet.md
git commit -m "feat: add article mon-sujet"
git push origin feature/mon-article
```

GitHub Actions génère automatiquement le contenu et commente la PR.

---

## Stack

- **Node.js** — scripts de génération et de build
- **OpenAI API** — génération de contenu
- **GitHub Actions** — CI/CD
- **InfinityFree** — hébergement web (FTP)
- **Discord Webhook** — notifications
