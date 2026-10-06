/* CELPIP Coach v4 · draft checker and CLB estimate
   Transparent heuristics only. This is an estimate, not an official CELPIP score.
   Pure functions so it can be tested outside the browser. */
"use strict";

const CHECKER = (() => {
  const THREATS = [
    { re: /\bor (else|i will|i'll|we will|i am going to)\b/i, label: "'or I will...' sounds like a threat" },
    { re: /\bi will (contact|report|call|sue|go to|complain to|take)\b/i, label: "'I will contact / report / call' sounds like a threat" },
    { re: /\bpublic works\b/i, label: "Mentioning public works sounds like a threat" },
    { re: /\b(legal action|lawyer|lawsuit|sue you|take you to court|tribunal)\b/i, label: "Legal threats hurt your tone score" },
    { re: /\b(call the police|report you|you will regret|you'll regret)\b/i, label: "Threatening language" },
    { re: /\bi demand\b/i, label: "'I demand' is too aggressive" },
  ];
  const CLICHES = [/\bmeets? you well\b/i, /\bfinds? you well\b/i, /\bthis email finds\b/i];
  const INFORMAL = /\b(gonna|wanna|gotta|kinda|sorta|asap|u|ur|thx|pls|plz|lol|ok so|stuff|yeah|nope)\b/gi;

  const YOUR_ERRORS = [
    { re: /\byour welcome\b/gi, fix: "You are welcome" },
    { re: /\b(for|of|to|with|about|in|from|on|at|by) you (help|time|attention|support|reply|response|building|office|team|company|consideration|understanding|assistance|patience|email|letter|message|staff|store|gym|kind|prompt|earliest|records|system|department|organization|property)\b/gi, fix: "your" },
    { re: /\byour (are|were|will|can|could|have|should|would|might|may|did|do|need)\b/gi, fix: "you" },
    { re: /\b(could|would|can|will|should|did|do) your (please|help|send|fix|arrange|let|tell|reply|check|consider|confirm|kindly)\b/gi, fix: "you" },
    { re: /\byou're (building|office|help|time|team|apartment|unit|company|email|reply|support)\b/gi, fix: "your" },
  ];

  const CONNECTORS = ["first", "second", "however", "as a result", "because", "since", "although", "therefore", "in addition", "also", "alternatively", "unfortunately", "for example", "for instance", "finally", "while", "so that", "moreover", "furthermore", "in particular", "otherwise", "overall", "in conclusion", "on the other hand", "admittedly", "even though", "instead", "especially", "if", "when", "so", "then", "after", "until", "which", "as soon as"];
  const STRONG = ["i am writing to", "i am writing about", "would it be possible", "i would appreciate", "could you please", "i look forward to", "as a result", "unfortunately", "in addition", "alternatively", "i would be grateful", "for instance", "admittedly", "i strongly believe", "on the other hand", "it is true that", "i apologize for any inconvenience", "thank you for considering", "follow up", "at your earliest convenience", "i understand that", "i want to assure you", "please feel free", "i am happy to", "would you consider", "in particular", "that is a fair point", "for these reasons", "in my view", "the main reason", "would you be willing", "as you may remember", "i strongly recommend", "i suggest", "i especially enjoyed", "closely matches", "i hope we can", "it was great to hear", "i would love to", "if that is easier", "if that does not work", "i truly appreciate", "i am available", "i have already", "i really enjoy", "some people may argue", "without hesitation", "these concerns are understandable"];

  const wc = (s) => ((s || "").trim().match(/[A-Za-z0-9$][A-Za-z0-9'’.,$%:/-]*/g) || []).length;

  function splitSentences(text) {
    const flat = text
      .replace(/\n+/g, " \n ")
      .replace(/\b([ap])\.m\.(?!\s+[A-Z])/g, "$1§m§")
      .replace(/\b([ap])\.m\.(?=\s+[A-Z])/g, "$1§m.")
      .replace(/\b(Mr|Ms|Mrs|Dr|St|e\.g|i\.e)\./gi, (m) => m.replace(/\./g, "§"));
    return flat
      .split(/(?<=[.!?])\s+|\s*\n\s*/)
      .map((s) => s.replace(/§/g, ".").trim())
      .filter((s) => s.length > 0);
  }

  function parse(subject, body) {
    let sub = (subject || "").trim();
    let text = (body || "").replace(/\r/g, "");
    const m = text.match(/^\s*subject\s*:\s*(.+)\n/i);
    if (m) {
      if (!sub) sub = m[1].trim();
      text = text.slice(m[0].length);
    }
    return { sub, text: text.trim() };
  }

  /* Heuristics cannot tell CLB 11 from CLB 12, so the top band is reported as "CLB 10+". */
  function clbFromScore(s) {
    if (s >= 80) return 10;
    if (s >= 72) return 9;
    if (s >= 64) return 8;
    if (s >= 55) return 7;
    if (s >= 45) return 6;
    if (s >= 35) return 5;
    return 4;
  }
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

  function analyze({ subject = "", body = "", type = "t1", prompt = null } = {}) {
    const { sub, text } = parse(subject, body);
    const lower = text.toLowerCase();
    const words = wc(text);
    const sentences = splitSentences(text).filter((s) => wc(s) > 0);
    const proseSentences = sentences.filter((s) => wc(s) >= 4);
    const flags = [];
    const add = (id, level, title, detail) => flags.push({ id, level, title, detail });

    /* ---- Watch list flags ---- */
    const threatHits = THREATS.filter((t) => t.re.test(text) || t.re.test(sub));
    threatHits.forEach((t) => {
      const mm = (text.match(t.re) || sub.match(t.re) || [""])[0];
      add("threat", "bad", "Threat phrase", `${t.label}: "${mm}". Ask politely with a date instead.`);
    });
    const cliche = CLICHES.some((r) => r.test(text));
    if (cliche) add("cliche", "bad", "Cliche opener", "Cut 'I hope this email meets you well'. Start with who you are.");

    const yourErrs = [];
    YOUR_ERRORS.forEach((e) => {
      const found = text.match(e.re);
      if (found) found.forEach((f) => yourErrs.push({ f, fix: e.fix }));
    });
    yourErrs.forEach((e) => add("your", "bad", "you / your", `"${e.f}" should use "${e.fix}".`));

    const lowerI = (text.match(/(?:^|[\s(,;:])i(?=\s|'(?:m|ve|ll|d)\b|,)/g) || []).length;
    if (lowerI) add("lower-i", "warn", "Lowercase i", `Found ${lowerI} lowercase "i". Always write a capital I.`);

    const longOnes = proseSentences.filter((s) => wc(s) > 35);
    longOnes.forEach((s) => add("long", "bad", "Sentence over 35 words", `${wc(s)} words: "${s.slice(0, 70)}..." Split it in two.`));
    const andChains = proseSentences.filter((s) => (s.match(/\band\b/gi) || []).length >= 4);
    andChains.forEach((s) => { if (wc(s) <= 35) add("runon", "warn", "Possible run-on", `Too many 'and's: "${s.slice(0, 60)}..."`); });

    if (type !== "t2" && !sub) add("subject", "bad", "Missing subject line", "Add a short subject: the issue plus your unit or role.");

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const tail = lines.slice(-3).join(" ");
    const signedAfolabi = /afolabi/i.test(tail);
    if (type !== "t2") {
      if (!signedAfolabi) add("signoff", "bad", "Sign-off is not 'Afolabi'", "End with your real name: Afolabi or Afolabi Adesina.");
      if (!/^(dear|hi|hello|good (morning|afternoon))\b/i.test(lines[0] || "")) add("greeting", "warn", "No greeting", "Start with 'Dear Ms. Patel,' or 'Dear Building Manager,'.");
    }

    if (words < 150 || words > 200) {
      add("count", words < 150 ? "bad" : "warn", "Word count outside 150 to 200", `You have ${words} words. ${words < 150 ? "Add detail to the 'how it hurts me' part." : "Trim extra words."}`);
    }

    const informal = (text.match(INFORMAL) || []).map((s) => s.toLowerCase());
    if (informal.length) add("informal", "warn", "Informal words", `Swap these for formal words: ${[...new Set(informal)].join(", ")}.`);
    const shouting = (text.match(/\b[A-Z]{4,}\b/g) || []).filter((w) => !["ASAP", "PRESTO", "GTA"].includes(w));
    if (shouting.length >= 2) add("caps", "warn", "ALL CAPS", "Capital letters feel like shouting. Use normal case.");
    if (/[!?]{2,}/.test(text)) add("punct", "warn", "Double punctuation", "Use one ! or ? at most.");

    const noAsk = !!(prompt && prompt.noAsk);
    const hasTimeline = noAsk || /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|this week|next week|end of (the )?(week|month)|right away|as soon as possible|weeknights?|tonight)\b/i.test(text) || /\b(after|before|by) \d{1,2}(:\d\d)? ?[ap]\.?m\b/i.test(text) || /\b(january|february|march|april|june|july|august|september|october|november|december) \d{1,2}\b/i.test(text) || /\bwithin (the )?(next )?\w+ (days|weeks|business days|hours)\b/i.test(text);
    if (type !== "t2" && !hasTimeline) add("timeline", "warn", "No polite timeline", "Add a date to your ask: 'by Friday, October 9'.");

    /* ---- Task 2 signals ---- */
    const optionStated = /\boption (a|b)\b/i.test(text);
    const opinion = /\b(i believe|in my opinion|in my view|i would choose|i strongly|i prefer|i support|i think)\b/i.test(text);
    const reasons = (lower.match(/\b(first|firstly|second|secondly|the main reason|another reason|the first reason|the second reason|in addition|moreover|furthermore)\b/g) || []).length;
    const examples = (lower.match(/\b(for example|for instance|such as|when i|a friend of mine|in my experience)\b/g) || []).length;
    const otherSide = /\b(some people|others may|admittedly|it is true that|of course|on the other hand|critics|opponents|although some)\b/i.test(text) || /\bsome \w+ (may|might|could|would) (argue|prefer|say|think|feel|believe|worry)\b/i.test(text);
    const conclusion = /\b(for these reasons|in conclusion|overall|in short|to sum up|therefore|all in all)\b/i.test(text);
    if (type === "t2") {
      if (!optionStated) add("option", "bad", "Say Option A or B", "Name your choice clearly in the first line.");
      if (!otherSide) add("other", "warn", "Other side missing", "Add one or two lines: 'Some people may argue... That is a fair point, but...'");
      if (examples < 1) add("example", "warn", "No examples", "Give each reason a small story: 'For example, ...'");
    }

    /* ---- Categories ---- */
    const paragraphs = text.split(/\n\s*\n/).filter((p) => wc(p) >= 6).length;
    const connectorsUsed = CONNECTORS.filter((c) => new RegExp(`\\b${c}\\b`, "i").test(text));
    const kw = prompt && prompt.keywords ? prompt.keywords.filter((k) => lower.includes(k) || sub.toLowerCase().includes(k)) : [];

    // 1. Content and coherence
    const cc = { key: "cc", label: "Content and coherence", notes: [] };
    let ccs = 0;
    const note = (cat, ok, text2, pts) => { cat.notes.push({ ok, text: text2, pts: ok ? pts : 0, max: pts }); return ok ? pts : 0; };
    if (type === "t2") {
      ccs += note(cc, optionStated && opinion, "Clear opinion with Option A or B", 15);
      ccs += note(cc, reasons >= 2, `Two reasons signposted (${reasons} found)`, 15);
      ccs += note(cc, examples >= 1, `Examples given (${examples} found)`, 12);
      ccs += note(cc, otherSide, "Other side addressed", 12);
      ccs += note(cc, conclusion, "Clear closing line", 6);
    } else {
      const bites = [
        ["Who I am", /\b(my name is|i am a|i am an|i am the|i'm a|i rent|i live|i have been a|as a (tenant|student|member|customer)|i interviewed|i applied|as you may remember|i worked|my interview|i am scheduled|i am [a-z]+ [a-z]+, (a|the))\b/i],
        ["Why I write", /\b(i am writing|i'm writing|reach(ing)? out|i am contacting|i would like to (ask|request|inform|let)|thank you (again )?for|since you asked)\b/i],
        ["How it hurts me / details", /\b(as a result|because|since|affect|difficult|trouble|hard for me|unable to|cannot|could not|can't|stress|cost|problem for me|inconvenien|keeping me|lose sleep)\b/i],
        ["What I want", /\b(could you|would you|would it be possible|i would appreciate|please|i would be grateful|i would like you|i suggest|i recommend|could be moved|let me know)\b/i],
        ["Thank you and name", /\b(thank you|thanks|i appreciate|grateful|enjoy your|take care)\b/i],
      ];
      bites.forEach(([name, re]) => { ccs += note(cc, re.test(text), `Bite: ${name}`, 12); });
    }
    if (paragraphs >= 4) ccs += note(cc, true, `Paragraphs: ${paragraphs} (aim for 4 or more)`, 15);
    else if (paragraphs === 3) { ccs += 8; cc.notes.push({ ok: true, text: "Paragraphs: 3 (aim for 4 or more)", pts: 8, max: 15 }); }
    else note(cc, false, `Paragraphs: ${paragraphs} (aim for 4 or more)`, 15);
    const cn = connectorsUsed.length;
    const cpts = cn >= 5 ? 15 : cn >= 3 ? 10 : cn >= 1 ? 5 : 0;
    ccs += note(cc, cpts > 0, `Linking words: ${cn} different (${connectorsUsed.slice(0, 6).join(", ") || "none"})`, cpts);
    if (prompt && prompt.keywords) {
      const kpts = kw.length >= 3 ? 10 : kw.length === 2 ? 6 : kw.length === 1 ? 3 : 0;
      ccs += note(cc, kpts > 0, `Stays on the prompt (${kw.length} key details)`, kpts);
    } else {
      ccs += note(cc, true, "Prompt details (not checked for this task)", 10);
    }
    cc.score = clamp(ccs);

    // 2. Vocabulary
    const voc = { key: "voc", label: "Vocabulary", notes: [] };
    const toks = (lower.match(/[a-z']+/g) || []);
    const uniq = new Set(toks).size;
    const ratio = toks.length ? uniq / toks.length : 0;
    const longRatio = toks.length ? toks.filter((t) => t.length >= 7).length / toks.length : 0;
    let vs = 40;
    voc.notes.push({ ok: true, text: "Starting points", pts: 40 });
    const rp = ratio >= 0.6 ? 15 : ratio >= 0.5 ? 10 : ratio >= 0.42 ? 5 : 0;
    vs += note(voc, rp > 0, `Word variety ${Math.round(ratio * 100)}% unique`, rp);
    const lp = longRatio >= 0.18 ? 15 : longRatio >= 0.13 ? 10 : longRatio >= 0.09 ? 5 : 0;
    vs += note(voc, lp > 0, `Longer words ${Math.round(longRatio * 100)}% (7+ letters)`, lp);
    const strongHits = STRONG.filter((p) => lower.includes(p));
    const sp = Math.min(30, strongHits.length * 6);
    vs += note(voc, sp > 0, `CLB 10 phrases: ${strongHits.length}${strongHits.length ? " (" + strongHits.slice(0, 3).join(", ") + ")" : ""}`, sp);
    if (cliche) { vs -= 15; voc.notes.push({ ok: false, text: "Cliche opener", pts: -15 }); }
    if (informal.length) { const p = Math.min(20, informal.length * 5); vs -= p; voc.notes.push({ ok: false, text: "Informal words", pts: -p }); }
    if (threatHits.length) { vs -= 10; voc.notes.push({ ok: false, text: "Threat wording", pts: -10 }); }
    voc.score = clamp(vs);

    // 3. Readability
    const rd = { key: "read", label: "Readability", notes: [] };
    let rs = 100;
    rd.notes.push({ ok: true, text: "Starting points", pts: 100 });
    const pen = (cond, text2, pts) => { if (cond) { rs -= pts; rd.notes.push({ ok: false, text: text2, pts: -pts }); } };
    pen(longOnes.length > 0, `${longOnes.length} sentence(s) over 35 words`, Math.min(36, longOnes.length * 12));
    const avg = proseSentences.length ? proseSentences.reduce((a, s) => a + wc(s), 0) / proseSentences.length : 0;
    pen(avg > 26, `Average sentence is long (${avg.toFixed(1)} words)`, 10);
    pen(avg > 0 && avg < 8, `Sentences are very short (${avg.toFixed(1)} words)`, 10);
    pen(yourErrs.length > 0, `${yourErrs.length} you/your mistake(s)`, Math.min(30, yourErrs.length * 10));
    pen(lowerI > 0, `${lowerI} lowercase i`, Math.min(24, lowerI * 8));
    const noCap = proseSentences.filter((s) => /^[a-z]/.test(s)).length;
    pen(noCap > 0, `${noCap} sentence(s) start with a small letter`, Math.min(12, noCap * 4));
    pen(/[!?]{2,}/.test(text), "Double punctuation", 5);
    pen(andChains.length > 0, "Run-on 'and' chains", 6);
    if (rs === 100 && proseSentences.length) rd.notes.push({ ok: true, text: `Clear sentences (average ${avg.toFixed(1)} words)`, pts: 0 });
    rd.score = clamp(rs);

    // 4. Task fulfillment
    const tf = { key: "task", label: "Task fulfillment", notes: [] };
    let ts = 0;
    const wpts = words >= 150 && words <= 200 ? 30 : (words >= 130 && words < 150) || (words > 200 && words <= 230) ? 18 : words >= 100 ? 8 : 0;
    ts += note(tf, wpts > 0, `${words} words (target 150 to 200)`, wpts);
    if (type === "t2") {
      ts += note(tf, optionStated, "Names Option A or B", 25);
      ts += note(tf, reasons >= 2, "At least two reasons", 15);
      ts += note(tf, otherSide, "Responds to the other option", 15);
      ts += note(tf, !threatHits.length && !shouting.length, "Respectful tone", 15);
    } else {
      const sw = wc(sub);
      ts += note(tf, sw > 0, sub ? `Subject line (${sw} words)` : "Subject line missing", sw >= 4 ? 15 : sw > 0 ? 8 : 15);
      ts += note(tf, /^(dear|hi|hello|good (morning|afternoon))\b/i.test(lines[0] || ""), "Greeting", 10);
      ts += note(tf, signedAfolabi, "Signed as Afolabi", 15);
      ts += note(tf, hasTimeline, "Polite timeline in the ask", 15);
      ts += note(tf, !threatHits.length, threatHits.length ? "Threat found" : "No threats", 15);
    }
    tf.score = clamp(ts);

    const cats = [cc, voc, rd, tf];
    cats.forEach((c) => { c.clb = clbFromScore(c.score); });
    let overall = cc.score * 0.3 + voc.score * 0.25 + rd.score * 0.2 + tf.score * 0.25;
    // Hard caps so serious watch-list problems cannot hide behind other points
    if (threatHits.length) overall = Math.min(overall, 79);
    if (words < 100) overall = Math.min(overall, 63);
    overall = clamp(overall);
    const clb = clbFromScore(overall);
    const good = [];
    if (!threatHits.length) good.push("No threats");
    if (!cliche) good.push("No cliche opener");
    if (!yourErrs.length) good.push("you/your all correct");
    if (!longOnes.length && proseSentences.length) good.push("Every sentence under 36 words");
    if (words >= 150 && words <= 200) good.push(`${words} words, right on target`);
    if (type !== "t2" && signedAfolabi) good.push("Signed as Afolabi");
    return { words, sentences: proseSentences.length, avgSentence: avg, flags, good, cats, overall, clb, label: clb >= 10 ? (overall >= 88 ? "CLB 10+" : "CLB 10") : `CLB ${clb}`, subject: sub };
  }

  return { analyze, wordCount: wc, clbFromScore, splitSentences };
})();

if (typeof module !== "undefined") module.exports = CHECKER;
