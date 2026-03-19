/**
 * OriginCheck - AI Humanizer
 * Aggressively rewrites AI-generated text to pass AI detection tools
 */

// ─── Synonym bank ────────────────────────────────────────────────────────────
const SYNONYMS = {
  'furthermore': ['plus', 'also', 'and another thing', 'on top of all that', 'to add to that'],
  'moreover': ['what\'s more', 'on top of that', 'also', 'not only that', 'another point is'],
  'therefore': ['so', 'that\'s why', 'which means', 'because of this', 'as a result'],
  'consequently': ['as a result', 'so', 'which led to', 'that\'s why', 'because of that'],
  'however': ['but', 'still', 'that said', 'even so', 'yet', 'on the flip side'],
  'nevertheless': ['still', 'even so', 'that said', 'regardless', 'anyway'],
  'additionally': ['also', 'on top of that', 'plus', 'and', 'another thing is'],
  'subsequently': ['after that', 'later', 'then', 'following that', 'next'],
  'accordingly': ['so', 'as a result', 'because of this'],
  'crucial': ['really important', 'key', 'critical', 'vital', 'huge'],
  'significant': ['major', 'big', 'important', 'notable', 'serious'],
  'substantial': ['large', 'considerable', 'major', 'big', 'heavy'],
  'implement': ['put in place', 'roll out', 'use', 'apply', 'set up'],
  'utilize': ['use', 'make use of', 'apply', 'put to work'],
  'facilitate': ['help with', 'make easier', 'support', 'enable', 'smooth out'],
  'demonstrate': ['show', 'prove', 'make clear', 'illustrate', 'point out'],
  'leverage': ['use', 'take advantage of', 'rely on', 'tap into', 'make the most of'],
  'robust': ['strong', 'solid', 'reliable', 'well-built', 'tough'],
  'comprehensive': ['thorough', 'complete', 'full', 'wide-ranging', 'in-depth'],
  'intricate': ['complex', 'detailed', 'involved', 'complicated', 'tricky'],
  'meticulous': ['careful', 'thorough', 'precise', 'detailed', 'exact'],
  'vital': ['essential', 'key', 'really important', 'necessary', 'must-have'],
  'pivotal': ['key', 'central', 'critical', 'turning-point', 'game-changing'],
  'delve': ['dig into', 'look at', 'explore', 'examine', 'dive into'],
  'paradigm': ['model', 'approach', 'framework', 'way of thinking', 'mindset'],
  'synergy': ['collaboration', 'teamwork', 'combined effort', 'working together'],
  'innovative': ['new', 'fresh', 'creative', 'novel', 'out-of-the-box'],
  'optimal': ['best', 'ideal', 'most effective', 'perfect'],
  'numerous': ['many', 'a lot of', 'several', 'quite a few', 'tons of'],
  'individuals': ['people', 'folks', 'users', 'everyone'],
  'obtain': ['get', 'acquire', 'gain', 'pick up'],
  'require': ['need', 'call for', 'demand', 'ask for'],
  'provide': ['give', 'offer', 'supply', 'hand over'],
  'ensure': ['make sure', 'guarantee', 'confirm', 'lock in'],
  'enhance': ['improve', 'boost', 'strengthen', 'upgrade', 'make better'],
  'examine': ['look at', 'study', 'review', 'check', 'inspect'],
  'consider': ['think about', 'look at', 'weigh', 'keep in mind'],
  'indicate': ['show', 'suggest', 'point to', 'hint at'],
  'highlight': ['point out', 'stress', 'draw attention to', 'spotlight'],
  'emphasize': ['stress', 'point out', 'make clear', 'hammer home'],
  'achieve': ['reach', 'hit', 'accomplish', 'get to', 'pull off'],
  'establish': ['set up', 'create', 'build', 'form', 'start'],
  'identify': ['find', 'spot', 'pinpoint', 'recognize', 'figure out'],
  'address': ['deal with', 'tackle', 'handle', 'look at', 'take care of'],
  'impact': ['effect', 'influence', 'difference', 'mark'],
  'approach': ['way', 'method', 'strategy', 'angle', 'tactic'],
  'aspect': ['part', 'side', 'element', 'feature', 'detail'],
  'component': ['part', 'piece', 'element', 'section', 'block'],
  'framework': ['structure', 'system', 'setup', 'model', 'skeleton'],
  'methodology': ['method', 'approach', 'process', 'way', 'system'],
  'perspective': ['view', 'angle', 'standpoint', 'take', 'lens'],
  'fundamental': ['basic', 'core', 'key', 'essential', 'underlying'],
  'primarily': ['mainly', 'mostly', 'for the most part', 'largely'],
  'typically': ['usually', 'normally', 'in most cases', 'generally'],
  'generally': ['usually', 'in most cases', 'for the most part', 'on the whole'],
  'specifically': ['in particular', 'especially', 'to be exact', 'namely'],
  'particularly': ['especially', 'in particular', 'notably', 'mainly'],
  'essentially': ['basically', 'at its core', 'in essence', 'really'],
  'effectively': ['in practice', 'in effect', 'practically speaking', 'pretty much'],
  'efficiently': ['quickly and well', 'without wasting time', 'smoothly', 'fast'],
  'accurately': ['correctly', 'precisely', 'exactly', 'spot on'],
  'rapidly': ['quickly', 'fast', 'at a fast pace', 'swiftly'],
  'significantly': ['a lot', 'greatly', 'considerably', 'noticeably', 'way'],
  'highly': ['very', 'really', 'quite', 'super'],
  'extremely': ['very', 'really', 'incredibly', 'insanely'],
  
  // Extra AI-heavy words from the user's specific text
  'orchestrating': ['managing', 'handling', 'setting up', 'running', 'organizing'],
  'logistics': ['planning', 'operations', 'supply chain', 'details', 'movement'],
  'computational': ['technical', 'computer', 'processing', 'math-heavy', 'system'],
  'dynamic': ['changing', 'active', 'live', 'shifting', 'constant'],
  'constraints': ['limits', 'rules', 'restrictions', 'boundaries', 'hurdles'],
  'heuristic': ['problem-solving', 'rule-of-thumb', 'practical', 'trial-and-error', 'adaptive'],
  'strategies': ['plans', 'methods', 'tactics', 'moves', 'approaches'],
  'optimization': ['improvement', 'tuning', 'refining', 'speeding up'],
  'architectures': ['designs', 'setups', 'structures', 'layouts', 'systems'],
  'empirically': ['by testing', 'in practice', 'through observation', 'experimentally'],
  'evaluate': ['test', 'check', 'grade', 'review', 'look at'],
  'methodologies': ['methods', 'ways of doing things', 'processes', 'approaches'],
  'engineered': ['built', 'designed', 'made', 'created', 'put together'],
  'integrated': ['added', 'put into', 'combined', 'built-in', 'merged'],
  'seamlessly': ['smoothly', 'easily', 'without a hitch', 'flawlessly'],
  'logistical': ['practical', 'planning', 'organizational'],
  'mathematics': ['math', 'numbers', 'calculations', 'formulas', 'equations'],
  'decentralized': ['spread out', 'distributed', 'local', 'non-centralized'],
  'processing': ['handling', 'computing', 'working out', 'crunching'],
  'outcomes': ['results', 'what happened', 'effects', 'consequences'],
  'latency': ['delay', 'lag', 'wait time', 'slowdown', 'bottlenecks'],
  'dispatch': ['sending out', 'routing', 'delivery', 'shipping'],
  'intensive': ['heavy', 'demanding', 'tough', 'hard', 'challenging']
};

// ─── Sentence openers that scream AI ─────────────────────────────────────────
const AI_OPENERS = [
  { pattern: /^In conclusion,?\s*/i, replacements: ['So,', 'To wrap things up,', 'All in all,', 'When you look at everything,', 'Basically,'] },
  { pattern: /^To summarize,?\s*/i, replacements: ['In short,', 'Basically,', 'To put it simply,', 'Long story short,'] },
  { pattern: /^Ultimately,?\s*/i, replacements: ['At the end of the day,', 'When it comes down to it,', 'In the end,'] },
  { pattern: /^Overall,?\s*/i, replacements: ['All things considered,', 'Looking at the big picture,', 'Taking everything into account,'] },
  { pattern: /^In summary,?\s*/i, replacements: ['To put it briefly,', 'In short,', 'The bottom line is'] },
  { pattern: /^It is important to note that\s*/i, replacements: ['Worth noting:', 'One thing to keep in mind is that', 'Keep in mind that', 'Just so you know,'] },
  { pattern: /^It is worth noting that\s*/i, replacements: ['Interestingly,', 'One thing that stands out is that', 'Notably,'] },
  { pattern: /^It should be noted that\s*/i, replacements: ['Worth mentioning,', 'It\'s worth pointing out that', 'Note that', 'Also,'] },
  { pattern: /^This paper (presents|examines|explores|investigates|focuses on)\s*/i, replacements: ['Here we look at', 'This work covers', 'We explore', 'In this article, we dive into'] },
  { pattern: /^The (purpose|aim|goal|objective) of this (paper|study|research|work) is to\s*/i, replacements: ['This work aims to', 'The goal here is to', 'We set out to'] },
  { pattern: /^In (recent|today\'s) (years|times|world),?\s*/i, replacements: ['These days,', 'Lately,', 'Over the past few years,', 'Nowadays,'] },
  { pattern: /^In the (context|realm|field|domain) of\s*/i, replacements: ['When it comes to', 'In the world of', 'Within', 'Looking at'] },
  { pattern: /^Abstract[—\-]?\s*/i, replacements: ['Overview: ', 'Summary: ', '', 'Quick rundown: '] },
  { pattern: /^Furthermore,?\s*/i, replacements: ['Plus,', 'Also,', 'On top of that,'] }
];

// ─── Filler phrases humans naturally use ─────────────────────────────────────
const HUMAN_FILLERS = [
  'in practice', 'to be fair', 'honestly', 'in reality',
  'as it turns out', 'interestingly enough', 'to put it simply',
  'for what it\'s worth', 'at the end of the day', 'in many ways',
  'you know', 'basically', 'kind of', 'sort of', 'actually'
];

// ─── Transition phrases that feel more natural ───────────────────────────────
const NATURAL_TRANSITIONS = [
  'That said,', 'Even so,', 'Still,', 'At the same time,',
  'On the flip side,', 'With that in mind,', 'Building on this,',
  'Going further,', 'To add to this,', 'Along the same lines,',
  'Plus,', 'And honestly,', 'Because of that,', 'Meaning,'
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Step 1: Replace AI sentence openers ─────────────────────────────────────
function replaceAIOpeners(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map(sentence => {
    for (const { pattern, replacements } of AI_OPENERS) {
      if (pattern.test(sentence)) {
        const replacement = pick(replacements);
        return sentence.replace(pattern, replacement + ' ');
      }
    }
    return sentence;
  }).join(' ');
}

// ─── Step 2: Synonym replacement ─────────────────────────────────────────────
function replaceSynonyms(text, strengthMultiplier = 1) {
  const keys = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${keys.map(k => k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|')})\\b`, 'gi');

  return text.replace(pattern, (match) => {
    const threshold = Math.min(0.85 * strengthMultiplier, 1.0);
    if (Math.random() < threshold) { 
      const lower = match.toLowerCase();
      const choices = SYNONYMS[lower];
      if (!choices) return match;
      const replacement = pick(choices);
      if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    }
    return match;
  });
}

// ─── Step 3: Break up long sentences & vary structure (Burstiness) ────────────
function manipulateSentences(text, strengthMultiplier = 1) {
  text = text.replace(/,\s*which\s+([a-z])/g, (_, c) => {
    return Math.random() < Math.min(0.8 * strengthMultiplier, 0.95) ? `. This ${c}` : `, which ${c}`;
  });

  text = text.replace(/([^.!?]{60,}),\s*and\s+([a-z])/g, (match, before, c) => {
    return Math.random() < Math.min(0.7 * strengthMultiplier, 0.9) ? `${before}. And ${c}` : match;
  });

  text = text.replace(/([^.!?]{50,});\s*([A-Za-z])/g, (match, before, c) => {
    return Math.random() < Math.min(0.8 * strengthMultiplier, 0.95) ? `${before}. ${c.toUpperCase()}` : match;
  });
  
  text = text.replace(/,\s*particularly when\s+([a-z])/g, (_, c) => {
    return Math.random() < Math.min(0.8 * strengthMultiplier, 0.95) ? `. Especially when ${c}` : `, particularly when ${c}`;
  });

  return text;
}

// ─── Step 4: Vary sentence flow ──────────────────────────────────────────────
function varySentenceStructure(text, strengthMultiplier = 1) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const result = [];

  for (let i = 0; i < sentences.length; i++) {
    let s = sentences[i];

    if (i > 0 && i % 4 === 0 && Math.random() < Math.min(0.5 * strengthMultiplier, 0.8)) {
      const trans = pick(NATURAL_TRANSITIONS);
      s = trans + ' ' + s.charAt(0).toLowerCase() + s.slice(1);
    }

    if (s.length > 90 && Math.random() < Math.min(0.4 * strengthMultiplier, 0.7)) {
      const words = s.split(' ');
      const midPoint = Math.floor(words.length / 2);
      if (midPoint > 3) {
        const filler = pick(HUMAN_FILLERS);
        words.splice(midPoint, 0, '—', filler, '—');
        s = words.join(' ');
      }
    }

    result.push(s);
  }

  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].length < 40 && result[i+1].length < 50 && Math.random() < Math.min(0.4 * strengthMultiplier, 0.7)) {
      let first = result[i].trim();
      let second = result[i+1].trim();
      if (first.endsWith('.')) {
        first = first.slice(0, -1);
        second = second.charAt(0).toLowerCase() + second.slice(1);
        result[i] = first + ', and ' + second;
        result.splice(i+1, 1);
      }
    }
  }

  return result.join(' ');
}

// ─── Step 5: Remove overly formal passive constructions ──────────────────────
function reducePassiveVoice(text) {
  text = text.replace(/\bis being\b/gi, 'gets');
  text = text.replace(/\bare being\b/gi, 'get');
  text = text.replace(/\bwas being\b/gi, 'was');
  text = text.replace(/\bhas been shown to\b/gi, 'has proven to');
  text = text.replace(/\bit has been (found|shown|demonstrated) that\b/gi, 'research shows that');
  text = text.replace(/\bit can be (seen|observed|noted) that\b/gi, 'clearly,');
  text = text.replace(/\bwas found to be\b/gi, 'turned out to be');
  text = text.replace(/\bwere found to be\b/gi, 'turned out to be');
  text = text.replace(/\bcan be effectively bridged\b/gi, 'can bridge well');
  text = text.replace(/\bcan be\b/gi, 'can act as');
  text = text.replace(/\bis required\b/gi, 'is needed');
  return text;
}

// ─── Step 6: Add minor human-like imperfections ───────────────────────────────
function addHumanTouch(text, strengthMultiplier = 1) {
  const paragraphs = text.split(/\n+/);

  return paragraphs.map((para, idx) => {
    if (!para.trim()) return para;

    if (idx > 0 && Math.random() < Math.min(0.6 * strengthMultiplier, 0.9)) {
      const starters = [
        "Here's the catch:",
        "But think about it.",
        "It's actually quite simple.",
        "There's a catch, though.",
        "What does this mean?",
        "Why does this matter?",
        "Consider this for a second.",
      ];
      para = pick(starters) + ' ' + para;
    }
    return para;
  }).join('\n\n');
}

// ─── Step 6.5: Informalize (Contractions) ────────────────────────────────────
function applyContractions(text, strengthMultiplier = 1) {
  const chance = Math.min(0.7 * strengthMultiplier, 1.0);
  
  let result = text;
  const contractions = [
    [/\bdo not\b/gi, "don't"],
    [/\bcannot\b/gi, "can't"],
    [/\bI am\b/gi, "I'm"],
    [/\bIt is\b/gi, "It's"],
    [/\bthat is\b/gi, "that's"],
    [/\bthere is\b/gi, "there's"],
    [/\bare not\b/gi, "aren't"],
    [/\bis not\b/gi, "isn't"],
    [/\bdoes not\b/gi, "doesn't"],
    [/\bwill not\b/gi, "won't"],
    [/\bwould not\b/gi, "wouldn't"],
    [/\bcould not\b/gi, "couldn't"],
    [/\bshould not\b/gi, "shouldn't"],
    [/\bhave not\b/gi, "haven't"],
    [/\bhas not\b/gi, "hasn't"]
  ];

  for (const [pattern, replacement] of contractions) {
    result = result.replace(pattern, (match) => {
      const capReplacement = match[0] === match[0].toUpperCase() 
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1) 
        : replacement;
      return Math.random() < chance ? capReplacement : match;
    });
  }

  return result;
}

// ─── Step 7: Fix up spacing and punctuation artifacts ────────────────────────
function cleanUp(text) {
  let cleaned = text
    .replace(/\s{2,}/g, ' ')
    .replace(/ ,/g, ',')
    .replace(/ \./g, '.')
    .replace(/ \—/g, '—')
    .replace(/\— /g, '—')
    .replace(/\. ([a-z])/g, (m, c) => '. ' + c.toUpperCase()) 
    .replace(/([.!?])\s*([a-z])/g, (m, p1, p2) => p1 + ' ' + p2.toUpperCase())
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    .replace(/- ([a-z])/gi, '$1')
    .trim();
  
  cleaned = cleaned.replace(/-\s+/g, '');
  
  return cleaned;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function humanizeText(text, options = {}, onProgress) {
  if (!text || !text.trim()) return '';

  let strengthMultiplier = 1;
  if (options.strength === 'Low') strengthMultiplier = 0.5;
  if (options.strength === 'High') strengthMultiplier = 2.0;

  onProgress?.({ progress: 10, message: 'Analyzing text structure...' });
  await delay(600 + Math.random() * 400);

  let processed = text.replace(/-\s+/g, '');

  onProgress?.({ progress: 25, message: 'Replacing AI vocabulary...' });
  processed = replaceSynonyms(processed, strengthMultiplier);
  await delay(400 + Math.random() * 300);

  onProgress?.({ progress: 40, message: 'Rewriting sentence openers...' });
  processed = replaceAIOpeners(processed);
  await delay(400 + Math.random() * 300);

  onProgress?.({ progress: 50, message: 'Breaking up formal structures...' });
  processed = manipulateSentences(processed, strengthMultiplier);
  await delay(400 + Math.random() * 300);

  onProgress?.({ progress: 68, message: 'Reducing passive voice...' });
  processed = reducePassiveVoice(processed);
  await delay(300 + Math.random() * 200);

  onProgress?.({ progress: 80, message: 'Varying sentence flow...' });
  processed = varySentenceStructure(processed, strengthMultiplier);
  await delay(300 + Math.random() * 200);

  onProgress?.({ progress: 88, message: 'Applying informal phrasing...' });
  processed = applyContractions(processed, strengthMultiplier);
  await delay(200 + Math.random() * 100);

  onProgress?.({ progress: 92, message: 'Adding natural tone...' });
  processed = addHumanTouch(processed, strengthMultiplier);
  await delay(300 + Math.random() * 200);

  onProgress?.({ progress: 98, message: 'Finalizing formatting...' });
  processed = cleanUp(processed);
  await delay(200);

  onProgress?.({ progress: 100, message: 'Done!' });
  await delay(200);

  return {
    originalWordCount: text.split(/\s+/).filter(w => w.length > 0).length,
    finalWordCount: processed.split(/\s+/).filter(w => w.length > 0).length,
    humanizedText: processed,
  };
}
