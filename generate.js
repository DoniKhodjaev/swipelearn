#!/usr/bin/env node
/**
 * SwipeLearn Card Generator
 * Generates additional cards via Claude Haiku API and saves to JSON files.
 * 
 * Usage:
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   node generate.js --topic excel --level 3 --count 50
 *   node generate.js --all --count 100   (100 cards per topic per level)
 * 
 * Output: cards-generated.js (auto-loaded by the app)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('❌ Set ANTHROPIC_API_KEY environment variable');
  console.error('   export ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

const PROMPTS = {
  excel:l=>`Ты преподаватель Excel. Сгенерируй одну УНИКАЛЬНУЮ обучающую карточку уровня ${l}/5 (1=новичок,5=эксперт) на РУССКОМ. Тема: полезная функция, формула, приём или лайфхак Excel. Ответь СТРОГО в формате JSON без markdown-обёрток:\n{"title":"Название","subtitle":"Категория","body":"Объяснение 2-4 предложения","example":"=ФОРМУЛА или пример","tip":"Практический совет"}`,
  vba:l=>`Ты преподаватель VBA для Excel. Сгенерируй одну УНИКАЛЬНУЮ карточку уровня ${l}/5 на РУССКОМ. JSON:\n{"title":"Название","subtitle":"Категория VBA","body":"Объяснение","example":"Sub/Function код","tip":"Совет"}`,
  addin:l=>`Ты эксперт надстроек Excel/Office. Карточка уровня ${l}/5 на РУССКОМ. JSON:\n{"title":"Название","subtitle":"Тип надстройки","body":"Описание","example":"Пример","tip":"Совет"}`,
  german:l=>`Ты преподаватель немецкого. Карточка уровня ${l}/5 на РУССКОМ. Чередуй: слово/грамматику. JSON:\n{"title":"Немецкое слово или правило","subtitle":"Часть речи / тема","body":"Перевод и объяснение","example":"Пример на немецком с переводом","tip":"Мнемоника"}`,
  english:l=>`Ты преподаватель английского. Карточка уровня ${l}/5 на РУССКОМ. JSON:\n{"title":"English word or rule","subtitle":"Part of speech / topic","body":"Перевод и объяснение","example":"Example + перевод","tip":"Совет"}`,
  japanese:l=>`Ты преподаватель японского. Карточка уровня ${l}/5 на РУССКОМ. JSON:\n{"title":"漢字/ひらがな","subtitle":"Ромадзи","body":"Перевод","example":"Пример на японском с переводом","tip":"Мнемоника"}`,
  ib:l=>`Ты инвестиционный банкир. Карточка уровня ${l}/5 на РУССКОМ. JSON:\n{"title":"Термин IB","subtitle":"Область","body":"Объяснение","example":"Пример/кейс","tip":"Совет"}`,
  pe:l=>`Ты специалист Private Equity. Карточка уровня ${l}/5 на РУССКОМ. JSON:\n{"title":"Термин PE","subtitle":"Область","body":"Объяснение","example":"Пример","tip":"Совет"}`,
  cb:l=>`Ты эксперт Commercial Banking. Карточка уровня ${l}/5 на РУССКОМ. JSON:\n{"title":"Термин","subtitle":"Область","body":"Объяснение","example":"Пример","tip":"Совет"}`,
};

function callAPI(prompt, seenTitles) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt + `\nНЕ повторяй эти темы: ${[...seenTitles].slice(-30).join(', ')}`
      }],
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { reject(json.error); return; }
          const text = (json.content || []).map(b => b.text || '').join('');
          const clean = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
          const match = clean.match(/\{[\s\S]*\}/);
          if (match) resolve(JSON.parse(match[0]));
          else reject('No JSON found');
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generate(topic, level, count) {
  const prompt = PROMPTS[topic]?.(level);
  if (!prompt) { console.error(`Unknown topic: ${topic}`); return []; }

  const cards = [];
  const seen = new Set();
  let errors = 0;

  for (let i = 0; i < count; i++) {
    try {
      const card = await callAPI(prompt, seen);
      if (card && card.title && !seen.has(card.title)) {
        card.l = level;
        cards.push(card);
        seen.add(card.title);
        process.stdout.write(`\r  ${topic} L${level}: ${cards.length}/${count}`);
      } else {
        i--; // retry
        errors++;
        if (errors > count * 2) break;
      }
      await sleep(200); // rate limiting
    } catch (e) {
      console.error(`\n  Error: ${e.message || e}`);
      errors++;
      if (errors > 10) break;
      await sleep(1000);
    }
  }
  console.log(`\r  ${topic} L${level}: ${cards.length}/${count} ✓`);
  return cards;
}

async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i += 2) flags[args[i].replace('--', '')] = args[i + 1];

  const topics = flags.all !== undefined ? Object.keys(PROMPTS) : [flags.topic || 'excel'];
  const levels = flags.level ? [parseInt(flags.level)] : [1, 2, 3, 4, 5];
  const countPerLevel = parseInt(flags.count || '20');

  console.log(`🎓 SwipeLearn Card Generator`);
  console.log(`   Topics: ${topics.join(', ')}`);
  console.log(`   Levels: ${levels.join(', ')}`);
  console.log(`   Count per level: ${countPerLevel}`);
  console.log(`   Total target: ${topics.length * levels.length * countPerLevel} cards\n`);

  const allCards = {};
  for (const topic of topics) {
    allCards[topic] = [];
    console.log(`📚 ${topic.toUpperCase()}`);
    for (const level of levels) {
      const cards = await generate(topic, level, countPerLevel);
      allCards[topic].push(...cards);
    }
    console.log(`   Total: ${allCards[topic].length} cards\n`);
  }

  // Save as loadable JS
  const outFile = path.join(__dirname, 'cards-generated.js');
  const js = `// Auto-generated cards - ${new Date().toISOString()}
const CARDS_GENERATED = ${JSON.stringify(allCards, null, 2)};
if (typeof CARDS_DB !== 'undefined') {
  Object.entries(CARDS_GENERATED).forEach(([key, cards]) => {
    if (CARDS_DB[key]) CARDS_DB[key].push(...cards);
    else CARDS_DB[key] = cards;
  });
}`;
  fs.writeFileSync(outFile, js);
  
  const total = Object.values(allCards).reduce((s, c) => s + c.length, 0);
  console.log(`✅ Generated ${total} cards → ${outFile}`);
  console.log(`   Add to index.html: <script src="cards-generated.js"><\/script>`);
}

main().catch(console.error);
