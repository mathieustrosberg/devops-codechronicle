const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function filenameToPrompt(filename) {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/\.md$/, '')
    .replace(/-/g, ' ');
}

async function generateArticle(filepath) {
  const filename = path.basename(filepath);
  const topic = filenameToPrompt(filename);

  console.log(`Génération de l'article pour : "${topic}"`);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `Tu es un expert technique. Génère un article de blog complet en français sur le sujet : "${topic}".
Réponds UNIQUEMENT avec ce format JSON valide :
{
  "title": "Le titre de l'article (une seule ligne)",
  "summary": "Un résumé de 2 phrases maximum (une seule ligne)",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Le contenu complet en Markdown (sans le frontmatter, minimum 300 mots). Pour les blocs de code, utilise des backticks simples uniquement."
}`
      }
    ]
  });

  const data = JSON.parse(response.choices[0].message.content);

  const fileContent = `---
title: "${data.title}"
summary: "${data.summary}"
tags: [${data.tags.map(t => `"${t}"`).join(', ')}]
date: "${new Date().toISOString().split('T')[0]}"
---

${data.content}`;

  fs.writeFileSync(filepath, fileContent, 'utf8');

  console.log(`Titre : ${data.title}`);
  console.log(`Résumé : ${data.summary}`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `title=${data.title}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${data.summary}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `filename=${filename}\n`);
  }
}

async function main() {
  const blogDir = path.join(__dirname, '..', 'blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

  let generated = 0;

  for (const file of files) {
    const filepath = path.join(blogDir, file);
    const content = fs.readFileSync(filepath, 'utf8').trim();

    if (content === '') {
      await generateArticle(filepath);
      generated++;
    }
  }

  if (generated === 0) {
    console.log('Aucun fichier vide trouvé dans blog/');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
