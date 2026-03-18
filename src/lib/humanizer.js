/**
 * OriginCheck - AI Humanizer
 * Aggressively rewrites AI-generated text to pass AI detection tools
 */

// ─── Synonym bank ────────────────────────────────────────────────────────────
const SYNONYMS = {
  'furthermore': ['on top of that', 'also', 'and another thing', 'beyond that'],
  'moreover': ['what\'s more', 'on top of that', 'also', 'not only that'],
  'therefore': ['so', 'that\'s why', 'which means', 'because of this'],
  'consequently': ['as a result', 'so', 'which led to', 'that\'s why'],
  'however': ['but', 'still', 'that said', 'even so', 'yet'],
  'nevertheless': ['still', 'even so', 'that said', 'regardless'],
  'additionally': ['also', 'on top of that', 'plus', 'and'],
  'subsequently': ['after that', 'later', 'then', 'following that'],
  'accordingly': ['so', 'as a result', 'because of this'],
  'crucial': ['really important', 'key', 'critical', 'vital'],
  'significant': ['major', 'big', 'important', 'notable'],
  'substantial': ['large', 'considerable', 'major', 'big'],
  'implement': ['put in place', 'roll out', 'use', 'apply'],
  'utilize': ['use', 'make use of', 'apply'],
  'facilitate': ['help with', 'make easier', 'support', 'enable'],
  'demonstrate': ['show', 'prove', 'make clear', 'illustrate'],
  'leverage': ['use', 'take advantage of', 'rely on', 'tap into'],
  'robust': ['strong', 'solid', 'reliable', 'well-built'],
  'comprehensive': ['thorough', 'complete', 'full', 'wide-ranging'],
  'intricate': ['complex', 'detailed', 'involved', 'complicated'],
  'meticulous': ['careful', 'thorough', 'precise', 'detailed'],
  'vital': ['essential', 'key', 'really important', 'necessary'],
  'pivotal': ['key', 'central', 'critical', 'turning-point'],
  'delve': ['dig into', 'look at', 'explore', 'examine'],
  'paradigm': ['model', 'approach', 'framework', 'way of thinking'],
  'synergy': ['collaboration', 'teamwork', 'combined effort'],
  'innovative': ['new', 'fresh', 'creative', 'novel'],
  'optimal': ['best', 'ideal', 'most effective'],
  'numerous': ['many', 'a lot of', 'several', 'quite a few'],
  'individuals': ['people', 'folks', 'users', 'users'],
  'obtain': ['get', 'acquire', 'gain'],
  'require': ['need', 'call for', 'demand'],
  'provide': ['give', 'offer', 'supply'],
  'ensure': ['make sure', 'guarantee', 'confirm'],
  'enhance': ['improve', 'boost', 'strengthen'],
  'examine': ['look at', 'study', 'review', 'check'],
  'consider': ['think about', 'look at', 'weigh'],
  'indicate': ['show', 'suggest', 'point to'],
  'highlight': ['point out', 'stress', 'draw attention to'],
  'emphasize': ['stress', 'point out', 'make clear'],
  'achieve': ['reach', 'hit', 'accomplish', 'get to'],
  'establish': ['set up', 'create', 'build', 'form'],
  'identify': ['find', 'spot', 'pinpoint', 'recognize'],
  'address': ['deal with', 'tackle', 'handle', 'look at'],
  'impact': ['effect', 'influence', 'difference'],
  'approach': ['way', 'method', 'strategy', 'angle'],
  'aspect': ['part', 'side', 'element', 'feature'],
  'component': ['part', 'piece', 'element', 'section'],
  'framework': ['structure', 'system', 'setup', 'model'],
  'methodology': ['method', 'approach', 'process', 'way'],
  'perspective': ['view', 'angle', 'standpoint', 'take'],
  'fundamental': ['basic', 'core', 'key', 'essential'],
  'primarily': ['mainly', 'mostly', 'for the most part'],
  'typically': ['usually', 'normally', 'in most cases', 'generally'],
  'generally': ['usually', 'in most cases', 'for the most part'],
  'specifically': ['in particular', 'especially', 'to be exact'],
  'particularly': ['especially', 'in particular', 'notably'],
  'essentially': ['basically', 'at its core', 'in essence', 'really'],
  'effectively': ['in practice', 'in effect', 'practically speaking'],
  'efficiently': ['quickly and well', 'without wasting time', 'smoothly'],
  'accurately': ['correctly', 'precisely', 'exactly'],
  'rapidly': ['quickly', 'fast', 'at a fast pace'],
  'significantly': ['a lot', 'greatly', 'considerably', 'noticeably'],
  'highly': ['very', 'really', 'quite'],
  'extremely': ['very', 'really', 'incredibly'],
};

// ─── Sentence openers that scream AI ─────────────────────────────────────────
const AI_OPENERS = [
  { pattern: /^In conclusion,?\s*/i, replacements: ['So,', 'To wrap things up,', 'All in all,', 'When you look at everything,'] },
  { pattern: /^To summarize,?\s*/i, replacements: ['In short,', 'Basically,', 'To put it simply,'] },
  { pattern: /^Ultimately,?\s*/i, replacements: ['At the end of the day,', 'When it comes down to it,', 'In the end,'] },
  { pattern: /^Overall,?\s*/i, replacements: ['All things considered,', 'Looking at the big picture,', 'Taking everything into account,'] },
  { pattern: /^In summary,?\s*/i, replacements: ['To put it briefly,', 'In short,', 'The bottom line is'] },
  { pattern: /^It is important to note that\s*/i, replacements: ['Worth noting:', 'One thing to keep in mind is that', 'Keep in mind that'] },
  { pattern: /^It is worth noting that\s*/i, replacements: ['Interestingly,', 'One thing that stands out is that', 'Notably,'] },
  { pattern: /^It should be noted that\s*/i, replacements: ['Worth mentioning,', 'It\'s worth pointing out that', 'Note that'] },
  { pattern: /^This paper (presents|examines|explores|investigates)\s*/i, replacements: ['Here we look at', 'This work covers', 'We explore'] },
  { pattern: /^The (purpose|aim|goal|objective) of this (paper|study|research|work) is to\s*/i, replacements: ['This work aims to', 'The goal here is to', 'We set out to'] },
  { pattern: /^In (recent|today\'s) (years|times|world),?\s*/i, replacements: ['These days,', 'Lately,', 'Over the past few years,'] },
  { pattern: /^In the (context|realm|field|domain) of\s*/i, replacements: ['When it comes to', 'In the world of', 'Within'] },
];

// ─── Filler phrases humans naturally use ─────────────────────────────────────
const HUMAN_FILLERS = [
  'in practice,', 'to be fair,', 'honestly,', 'in reality,',
  'as it turns out,', 'interestingly enough,', 'to put it simply,',
  'for what it\'s worth,', 'at the end of the day,', 'in many ways,',
];

// ─── Transition phrases that feel more natural ───────────────────────────────
const NATURAL_TRANSITIONS = [
  'That said,', 'Even so,', 'Still,', 'At the same time,',
  'On the flip side,', 'With that in mind,', 'Building on this,',
  'Going further,', 'To add to this,', 'Along the same lines,',
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
  // Build a regex that matches whole words only
  const keys = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  return text.replace(pattern, (match) => {
    // scale 0.75 by strength multiplier. Cap at 0.95.
    const threshold = Math.min(0.75 * strengthMultiplier, 0.95);
    if (Math.random() < threshold) { 
      const lower = match.toLowerCase();
      const choices = SYNONYMS[lower];
      if (!choices) return match;
      const replacement = pick(choices);
      // Preserve original capitalization
      if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    }
    return match;
  });
}

// ─── Step 3: Break up long, formal compound sentences ────────────────────────
function breakLongSentences(text, strengthMultiplier = 1) {
  // Split on ", which " → ". This/It "
  text = text.replace(/,\s*which\s+([a-z])/g, (_, c) => {
    return Math.random() < Math.min(0.6 * strengthMultiplier, 0.9) ? `. This ${c}` : `, which ${c}`;
  });

  // Split on ", and " in long sentences
  text = text.replace(/([^.!?]{80,}),\s*and\s+([a-z])/g, (match, before, c) => {
    return Math.random() < Math.min(0.5 * strengthMultiplier, 0.9) ? `${before}. And ${c}` : match;
  });

  // Split on "; " in long sentences
  text = text.replace(/([^.!?]{60,});\s*([A-Z])/g, (match, before, c) => {
    return Math.random() < Math.min(0.6 * strengthMultiplier, 0.9) ? `${before}. ${c}` : match;
  });

  return text;
}

// ─── Step 4: Vary sentence structure ─────────────────────────────────────────
function varySentenceStructure(text, strengthMultiplier = 1) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const result = [];

  for (let i = 0; i < sentences.length; i++) {
    let s = sentences[i];

    // Occasionally prepend a natural transition (not too often)
    if (i > 0 && i % 5 === 0 && Math.random() < Math.min(0.4 * strengthMultiplier, 0.8)) {
      s = pick(NATURAL_TRANSITIONS) + ' ' + s.charAt(0).toLowerCase() + s.slice(1);
    }

    // Occasionally add a short clarifying clause
    if (s.length > 120 && Math.random() < Math.min(0.3 * strengthMultiplier, 0.7)) {
      const midPoint = s.lastIndexOf(' ', Math.floor(s.length / 2));
      if (midPoint > 0) {
        const filler = pick(HUMAN_FILLERS);
        s = s.slice(0, midPoint) + ' — ' + filler + ' —' + s.slice(midPoint);
      }
    }

    result.push(s);
  }

  return result.join(' ');
}

// ─── Step 5: Remove overly formal passive constructions ──────────────────────
function reducePassiveVoice(text) {
  // "is/are/was/were + past participle" → active where possible
  text = text.replace(/\bis being\b/g, 'gets');
  text = text.replace(/\bare being\b/g, 'get');
  text = text.replace(/\bwas being\b/g, 'was');
  text = text.replace(/\bhas been shown to\b/gi, 'has proven to');
  text = text.replace(/\bit has been (found|shown|demonstrated) that\b/gi, 'research shows that');
  text = text.replace(/\bit can be (seen|observed|noted) that\b/gi, 'clearly,');
  text = text.replace(/\bwas found to be\b/gi, 'turned out to be');
  text = text.replace(/\bwere found to be\b/gi, 'turned out to be');
  return text;
}

// ─── Step 6: Add minor human-like imperfections ───────────────────────────────
function addHumanTouch(text) {
  const paragraphs = text.split(/\n+/);

  return paragraphs.map((para, idx) => {
    if (!para.trim()) return para;

    // Occasionally start a paragraph with a short punchy sentence
    if (idx > 0 && Math.random() > 0.75) {
      const starters = [
        'Here\'s the thing.',
        'This matters.',
        'Think about it this way.',
        'It\'s not as simple as it sounds.',
        'There\'s more to it than that.',
      ];
      para = pick(starters) + ' ' + para;
    }

    return para;
  }).join('\n\n');
}

// ─── Step 7: Fix up spacing and punctuation artifacts ────────────────────────
function cleanUp(text) {
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/ ,/g, ',')
    .replace(/ \./g, '.')
    .replace(/\. ([a-z])/g, (m, c) => '. ' + c) // ensure space after period
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    .trim();
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function humanizeText(text, options = {}, onProgress) {
  if (!text || !text.trim()) return '';

  let strengthMultiplier = 1;
  if (options.strength === 'Low') strengthMultiplier = 0.5;
  if (options.strength === 'High') strengthMultiplier = 1.5;

  onProgress?.({ progress: 10, message: 'Analyzing text structure...' });
  await delay(600 + Math.random() * 400);

  onProgress?.({ progress: 25, message: 'Replacing AI vocabulary...' });
  let processed = replaceSynonyms(text, strengthMultiplier);
  await delay(400 + Math.random() * 300);

  onProgress?.({ progress: 40, message: 'Rewriting sentence openers...' });
  processed = replaceAIOpeners(processed);
  await delay(400 + Math.random() * 300);

  onProgress?.({ progress: 55, message: 'Breaking up formal structures...' });
  processed = breakLongSentences(processed, strengthMultiplier);
  await delay(400 + Math.random() * 300);

  onProgress?.({ progress: 68, message: 'Reducing passive voice...' });
  processed = reducePassiveVoice(processed);
  await delay(300 + Math.random() * 200);

  onProgress?.({ progress: 80, message: 'Varying sentence flow...' });
  processed = varySentenceStructure(processed, strengthMultiplier);
  await delay(300 + Math.random() * 200);

  onProgress?.({ progress: 90, message: 'Adding natural tone...' });
  processed = addHumanTouch(processed);
  await delay(300 + Math.random() * 200);

  onProgress?.({ progress: 98, message: 'Finalizing...' });
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
