/**
 * CELPIP Email Coach · Lessons 1-3 (gaps, tone, timed draft)
 * Personal use · localStorage only · no backend
 */

const STORAGE_KEY = "celpip-email-coach-v1";

const BITE_NAMES = [
  "Who I am",
  "Why I write",
  "How it hurts me",
  "What I want",
  "Thank you + name",
];

const THREAT_WORDS = [
  "sue", "lawyer", "lawsuit", "court", "police", "report you",
  "or else", "demand", "immediately or", "you'll regret", "you will regret",
  "complaint to the media", "expose you",
];

const WEAK_OPENERS = [
  "i hope this email meets you well",
  "i hope this email finds you well",
  "hope this email finds you well",
  "hope you're doing well",
];

/** @type {Array<{id:string,title:string,prompt:string,context:object,bites:Array}>} */
const SCENARIOS = [
  {
    id: "lobby-light",
    title: "Broken lobby light",
    prompt:
      "You live in Flat 12B at Oakwood Apartments. The lobby light on your floor has been broken for a week. It is dark and unsafe at night. Write to the building manager.",
    context: {
      name: "Afolabi Adesina",
      role: "tenant in Flat 12B",
      place: "Oakwood Apartments",
      problem: "broken lobby light",
      impact: "dark and unsafe at night",
      ask: "repair the light",
      timeline: "within 3 days",
      subjectGood: ["lobby light", "flat 12b", "broken", "repair", "light"],
    },
    bites: [
      {
        type: "choice",
        title: "Bite 1 · Who I am",
        hint: "Say who you are and where you live. Keep it short.",
        promptLine: "Pick the strongest opening:",
        choices: [
          {
            text: "I am a tenant in Flat 12B at Oakwood Apartments.",
            good: true,
            tip: null,
          },
          {
            text: "I hope this email meets you well. I live here.",
            good: false,
            tip: "Skip the empty greeting. Name your flat and building.",
          },
          {
            text: "Hi, someone from the building here.",
            good: false,
            tip: "Too vague. State your flat number clearly.",
          },
        ],
        assemble: (c) => c,
      },
      {
        type: "choice",
        title: "Bite 2 · Why I write",
        hint: "State the problem in one clear sentence.",
        promptLine: "Why are you writing?",
        choices: [
          {
            text: "I am writing because the lobby light on my floor has been broken for a week.",
            good: true,
            tip: null,
          },
          {
            text: "There might be something wrong with the lights maybe.",
            good: false,
            tip: "Be specific: which light, how long, and that it is broken.",
          },
          {
            text: "Fix the light or I will call a lawyer.",
            good: false,
            tip: "No threats. CELPIP wants firm and polite · not aggressive.",
          },
        ],
        assemble: (c) => c,
      },
      {
        type: "fill",
        title: "Bite 3 · How it hurts me",
        hint: "Explain the impact on you. Use the blanks.",
        template: "This is a problem because the hallway is {impact}, so I feel {feeling} when I come home at night.",
        fields: [
          {
            key: "impact",
            kind: "select",
            options: [
              { value: "dark and hard to see", good: true },
              { value: "a bit annoying", good: false, tip: "Stronger: safety and visibility matter more than mild annoyance." },
              { value: "fine during the day", good: false, tip: "Focus on the night-time risk." },
            ],
          },
          {
            key: "feeling",
            kind: "select",
            options: [
              { value: "unsafe", good: true },
              { value: "slightly bored", good: false, tip: "Link the feeling to safety or inconvenience." },
              { value: "ready to sue", good: false, tip: "Threat language hurts your score. Stay polite." },
            ],
          },
        ],
        assemble: (vals) =>
          `This is a problem because the hallway is ${vals.impact}, so I feel ${vals.feeling} when I come home at night.`,
      },
      {
        type: "fill",
        title: "Bite 4 · What I want",
        hint: "Clear ask + polite timeline. No threats.",
        template: "Could you please {ask} {timeline}?",
        fields: [
          {
            key: "ask",
            kind: "select",
            options: [
              { value: "arrange for the lobby light to be repaired", good: true },
              { value: "do something about this somehow", good: false, tip: "Name the action: repair or replace the light." },
              { value: "fix it right now or face consequences", good: false, tip: "Drop the threat. Ask politely for a repair." },
            ],
          },
          {
            key: "timeline",
            kind: "select",
            options: [
              { value: "within the next three days", good: true },
              { value: "whenever you feel like it", good: false, tip: "Add a polite, realistic timeline." },
              { value: "immediately or I will move out tomorrow", good: false, tip: "Too harsh. Try a calm deadline." },
            ],
          },
        ],
        assemble: (vals) => `Could you please ${vals.ask} ${vals.timeline}?`,
      },
      {
        type: "fill",
        title: "Bite 5 · Thank you + name",
        hint: "Close politely and sign with your name.",
        template: "{thanks}\n\n{name}",
        fields: [
          {
            key: "thanks",
            kind: "select",
            options: [
              { value: "Thank you for your prompt attention to this matter.", good: true },
              { value: "Whatever.", good: false, tip: "A short thank-you keeps the tone polite." },
              { value: "I hope this email meets you well. Bye.", good: false, tip: "Avoid that filler phrase. Use a clear thank-you." },
            ],
          },
          {
            key: "name",
            kind: "text",
            placeholder: "Your full name",
            className: "wide",
            validate: (v) => {
              const t = (v || "").trim();
              if (t.length < 2) return { ok: false, tip: "Type your name so the email is complete." };
              if (t.toLowerCase() === "name") return { ok: false, tip: "Use your real name, not the word Name." };
              return { ok: true };
            },
          },
        ],
        assemble: (vals) => `${vals.thanks}\n\n${vals.name.trim()}`,
      },
    ],
    subjectOptions: [
      { text: "Broken lobby light · Flat 12B · request for repair", good: true },
      { text: "Hello", good: false, tip: "Subject should name the issue and your flat." },
      { text: "URGENT!!! FIX NOW OR ELSE", good: false, tip: "No shouting or threats in the subject." },
    ],
  },

  {
    id: "noisy-neighbor",
    title: "Noisy neighbour",
    prompt:
      "You live in Unit 4A. For two weeks, the neighbour above you has played loud music after 11 p.m. You cannot sleep. Write to the property manager.",
    context: {
      name: "Afolabi Adesina",
      role: "resident of Unit 4A",
      place: "your building",
      problem: "loud music after 11 p.m.",
      impact: "cannot sleep",
      ask: "speak with the neighbour / enforce quiet hours",
      timeline: "this week",
    },
    bites: [
      {
        type: "choice",
        title: "Bite 1 · Who I am",
        hint: "Identify yourself with your unit number.",
        promptLine: "Best opening:",
        choices: [
          { text: "I am a resident of Unit 4A.", good: true, tip: null },
          { text: "Someone who lives in this building.", good: false, tip: "Add your unit number." },
          { text: "I hope this email finds you well.", good: false, tip: "Skip filler. Say who you are." },
        ],
        assemble: (c) => c,
      },
      {
        type: "choice",
        title: "Bite 2 · Why I write",
        hint: "Name the problem and how long it has lasted.",
        promptLine: "Why write?",
        choices: [
          {
            text: "I am writing because the neighbour above me has played loud music after 11 p.m. for two weeks.",
            good: true,
            tip: null,
          },
          {
            text: "Things are loud sometimes.",
            good: false,
            tip: "Be specific: who, what, when, and how long.",
          },
          {
            text: "Tell them to shut up or I will call the police.",
            good: false,
            tip: "No threats. Stay firm and polite.",
          },
        ],
        assemble: (c) => c,
      },
      {
        type: "fill",
        title: "Bite 3 · How it hurts me",
        hint: "Show the personal impact.",
        template: "As a result, I {impact}, which affects my {feeling} the next day.",
        fields: [
          {
            key: "impact",
            kind: "select",
            options: [
              { value: "cannot sleep properly", good: true },
              { value: "sometimes notice noise", good: false, tip: "Stronger: state a clear impact like lost sleep." },
              { value: "want revenge", good: false, tip: "Keep the tone calm and professional." },
            ],
          },
          {
            key: "feeling",
            kind: "select",
            options: [
              { value: "work and concentration", good: true },
              { value: "plan to complain on social media", good: false, tip: "Avoid threats. Focus on sleep or work." },
              { value: "hobby of collecting stamps", good: false, tip: "Link impact to sleep, health, or work." },
            ],
          },
        ],
        assemble: (vals) =>
          `As a result, I ${vals.impact}, which affects my ${vals.feeling} the next day.`,
      },
      {
        type: "fill",
        title: "Bite 4 · What I want",
        hint: "Clear ask + polite timeline.",
        template: "I would appreciate it if you could {ask} {timeline}.",
        fields: [
          {
            key: "ask",
            kind: "select",
            options: [
              { value: "remind the neighbour about quiet hours and follow up", good: true },
              { value: "maybe look into it", good: false, tip: "Make the ask concrete." },
              { value: "evict them tomorrow or I will sue", good: false, tip: "Threats lower your score. Ask politely." },
            ],
          },
          {
            key: "timeline",
            kind: "select",
            options: [
              { value: "this week", good: true },
              { value: "someday", good: false, tip: "Give a polite, realistic timeline." },
              { value: "in the next five minutes", good: false, tip: "Unrealistic. Try this week." },
            ],
          },
        ],
        assemble: (vals) =>
          `I would appreciate it if you could ${vals.ask} ${vals.timeline}.`,
      },
      {
        type: "fill",
        title: "Bite 5 · Thank you + name",
        hint: "Polite close + your name.",
        template: "{thanks}\n\n{name}",
        fields: [
          {
            key: "thanks",
            kind: "select",
            options: [
              { value: "Thank you for your help with this.", good: true },
              { value: "Do it now.", good: false, tip: "Add a thank-you to stay polite." },
              { value: "I hope this email meets you well.", good: false, tip: "Avoid that phrase. Thank them instead." },
            ],
          },
          {
            key: "name",
            kind: "text",
            placeholder: "Your full name",
            className: "wide",
            validate: (v) => {
              const t = (v || "").trim();
              if (t.length < 2) return { ok: false, tip: "Add your name." };
              return { ok: true };
            },
          },
        ],
        assemble: (vals) => `${vals.thanks}\n\n${vals.name.trim()}`,
      },
    ],
    subjectOptions: [
      { text: "Noise after 11 p.m. · Unit 4A · request for quiet hours", good: true },
      { text: "Hey", good: false, tip: "Subject needs the issue and unit." },
      { text: "CALL THE POLICE ON 4B", good: false, tip: "No threats or shouting." },
    ],
  },

  {
    id: "parking-permit",
    title: "Missing parking permit",
    prompt:
      "You are a tenant in Apt 8. Your visitor parking permit never arrived after you requested it two weeks ago. Guests keep getting tickets. Write to the condo office.",
    context: {
      name: "Afolabi Adesina",
      role: "tenant in Apt 8",
      problem: "visitor parking permit not received",
      impact: "guests getting tickets",
      ask: "issue or re-send the permit",
      timeline: "by Friday",
    },
    bites: [
      {
        type: "choice",
        title: "Bite 1 · Who I am",
        hint: "State who you are and your apartment.",
        promptLine: "Opening:",
        choices: [
          { text: "I am a tenant in Apt 8.", good: true, tip: null },
          { text: "A person who parks here sometimes.", good: false, tip: "Give your apartment number." },
          { text: "Hope you're well!", good: false, tip: "Lead with who you are, not a fluff greeting." },
        ],
        assemble: (c) => c,
      },
      {
        type: "choice",
        title: "Bite 2 · Why I write",
        hint: "Explain the missing permit and the wait.",
        promptLine: "Reason:",
        choices: [
          {
            text: "I am writing because the visitor parking permit I requested two weeks ago has not arrived.",
            good: true,
            tip: null,
          },
          {
            text: "Parking is confusing.",
            good: false,
            tip: "Mention the permit request and the two-week wait.",
          },
          {
            text: "If I do not get a permit today I will hire a lawyer.",
            good: false,
            tip: "No threats. Stay firm and polite.",
          },
        ],
        assemble: (c) => c,
      },
      {
        type: "fill",
        title: "Bite 3 · How it hurts me",
        hint: "Show the consequence for you and guests.",
        template: "This matters because my guests {impact}, and I {feeling}.",
        fields: [
          {
            key: "impact",
            kind: "select",
            options: [
              { value: "keep receiving parking tickets", good: true },
              { value: "sometimes visit", good: false, tip: "State the real harm: tickets or denied parking." },
              { value: "will sue the office", good: false, tip: "Remove threat language." },
            ],
          },
          {
            key: "feeling",
            kind: "select",
            options: [
              { value: "feel responsible for costs they should not have", good: true },
              { value: "am only slightly curious", good: false, tip: "Show a real inconvenience." },
              { value: "want to threaten the staff", good: false, tip: "Stay polite." },
            ],
          },
        ],
        assemble: (vals) =>
          `This matters because my guests ${vals.impact}, and I ${vals.feeling}.`,
      },
      {
        type: "fill",
        title: "Bite 4 · What I want",
        hint: "Ask clearly with a polite deadline.",
        template: "Please {ask} {timeline}.",
        fields: [
          {
            key: "ask",
            kind: "select",
            options: [
              { value: "issue or re-send my visitor parking permit", good: true },
              { value: "fix parking in general", good: false, tip: "Ask for the specific permit." },
              { value: "refund every ticket ever or else", good: false, tip: "No threats. Focus on the permit." },
            ],
          },
          {
            key: "timeline",
            kind: "select",
            options: [
              { value: "by this Friday", good: true },
              { value: "eventually", good: false, tip: "Add a clear, polite timeline." },
              { value: "before I destroy your reputation", good: false, tip: "Threats hurt CLB scores." },
            ],
          },
        ],
        assemble: (vals) => `Please ${vals.ask} ${vals.timeline}.`,
      },
      {
        type: "fill",
        title: "Bite 5 · Thank you + name",
        hint: "Close and sign.",
        template: "{thanks}\n\n{name}",
        fields: [
          {
            key: "thanks",
            kind: "select",
            options: [
              { value: "Thank you for resolving this promptly.", good: true },
              { value: "K.", good: false, tip: "Write a short thank-you." },
              { value: "I hope this email meets you well.", good: false, tip: "Skip that phrase." },
            ],
          },
          {
            key: "name",
            kind: "text",
            placeholder: "Your full name",
            className: "wide",
            validate: (v) => {
              const t = (v || "").trim();
              if (t.length < 2) return { ok: false, tip: "Add your name." };
              return { ok: true };
            },
          },
        ],
        assemble: (vals) => `${vals.thanks}\n\n${vals.name.trim()}`,
      },
    ],
    subjectOptions: [
      { text: "Visitor parking permit · Apt 8 · follow-up request", good: true },
      { text: "Parking", good: false, tip: "Add apartment number and that it is a permit follow-up." },
      { text: "YOU OWE ME MONEY", good: false, tip: "Stay calm and specific." },
    ],
  },

  {
    id: "gym-hours",
    title: "Gym closed early",
    prompt:
      "You are a member of FitLife Gym. The evening class schedule was cut without notice, and you can no longer train after work. Write to the gym manager.",
    context: {
      name: "Afolabi Adesina",
      role: "FitLife Gym member",
      problem: "evening classes cut without notice",
      impact: "cannot train after work",
      ask: "restore evening hours or offer an alternative",
      timeline: "within two weeks",
    },
    bites: [
      {
        type: "choice",
        title: "Bite 1 · Who I am",
        hint: "Say you are a member.",
        promptLine: "Opening:",
        choices: [
          { text: "I am a member of FitLife Gym.", good: true, tip: null },
          { text: "A person who likes exercise.", good: false, tip: "Name the gym and your membership." },
          { text: "I hope this email meets you well.", good: false, tip: "Avoid that opener. Identify yourself." },
        ],
        assemble: (c) => c,
      },
      {
        type: "choice",
        title: "Bite 2 · Why I write",
        hint: "State the schedule change clearly.",
        promptLine: "Reason:",
        choices: [
          {
            text: "I am writing because the evening class schedule was cut without notice.",
            good: true,
            tip: null,
          },
          {
            text: "The gym feels different lately.",
            good: false,
            tip: "Name the evening schedule change.",
          },
          {
            text: "Cancel my membership threats incoming.",
            good: false,
            tip: "No threats. Explain the problem politely.",
          },
        ],
        assemble: (c) => c,
      },
      {
        type: "fill",
        title: "Bite 3 · How it hurts me",
        hint: "Connect the change to your routine.",
        template: "This affects me because I {impact}, and I {feeling}.",
        fields: [
          {
            key: "impact",
            kind: "select",
            options: [
              { value: "can only train after work in the evening", good: true },
              { value: "sometimes go to the gym", good: false, tip: "Be specific about the evening need." },
              { value: "will smear the gym online", good: false, tip: "No threats." },
            ],
          },
          {
            key: "feeling",
            kind: "select",
            options: [
              { value: "have had to skip workouts for two weeks", good: true },
              { value: "am mildly entertained", good: false, tip: "Show a real inconvenience." },
              { value: "demand a lawsuit", good: false, tip: "Stay polite." },
            ],
          },
        ],
        assemble: (vals) =>
          `This affects me because I ${vals.impact}, and I ${vals.feeling}.`,
      },
      {
        type: "fill",
        title: "Bite 4 · What I want",
        hint: "Clear ask + timeline.",
        template: "Could you please {ask} {timeline}?",
        fields: [
          {
            key: "ask",
            kind: "select",
            options: [
              { value: "restore at least two evening classes or suggest an alternative schedule", good: true },
              { value: "make the gym better", good: false, tip: "Ask for a concrete schedule fix." },
              { value: "refund everything forever or I will destroy your reviews", good: false, tip: "Remove threats." },
            ],
          },
          {
            key: "timeline",
            kind: "select",
            options: [
              { value: "within the next two weeks", good: true },
              { value: "never mind the timing", good: false, tip: "Add a polite timeline." },
              { value: "tonight at midnight", good: false, tip: "Unrealistic. Try two weeks." },
            ],
          },
        ],
        assemble: (vals) => `Could you please ${vals.ask} ${vals.timeline}?`,
      },
      {
        type: "fill",
        title: "Bite 5 · Thank you + name",
        hint: "Polite close.",
        template: "{thanks}\n\n{name}",
        fields: [
          {
            key: "thanks",
            kind: "select",
            options: [
              { value: "Thank you for considering my request.", good: true },
              { value: "Whatever happens.", good: false, tip: "Add a clear thank-you." },
              { value: "Hope this email finds you well. Thanks maybe.", good: false, tip: "Skip the filler phrase." },
            ],
          },
          {
            key: "name",
            kind: "text",
            placeholder: "Your full name",
            className: "wide",
            validate: (v) => {
              const t = (v || "").trim();
              if (t.length < 2) return { ok: false, tip: "Add your name." };
              return { ok: true };
            },
          },
        ],
        assemble: (vals) => `${vals.thanks}\n\n${vals.name.trim()}`,
      },
    ],
    subjectOptions: [
      { text: "Evening class schedule · member request for options", good: true },
      { text: "Gym", good: false, tip: "Name the evening schedule issue." },
      { text: "BAD GYM ALERT", good: false, tip: "Stay professional." },
    ],
  },

  {
    id: "delivery-delay",
    title: "Late package delivery",
    prompt:
      "You ordered a laptop stand from ShopEase two weeks ago. Tracking still says in transit, and you need it for work. Write to customer service.",
    context: {
      name: "Afolabi Adesina",
      role: "ShopEase customer",
      problem: "order still in transit after two weeks",
      impact: "need it for work",
      ask: "update on delivery or replacement / refund option",
      timeline: "within 5 business days",
    },
    bites: [
      {
        type: "choice",
        title: "Bite 1 · Who I am",
        hint: "Identify yourself as a customer.",
        promptLine: "Opening:",
        choices: [
          { text: "I am a ShopEase customer who placed an order two weeks ago.", good: true, tip: null },
          { text: "Someone waiting for a box.", good: false, tip: "Name the store and that you are a customer." },
          { text: "I hope this email meets you well.", good: false, tip: "Skip filler. Say who you are." },
        ],
        assemble: (c) => c,
      },
      {
        type: "choice",
        title: "Bite 2 · Why I write",
        hint: "State the delay clearly.",
        promptLine: "Reason:",
        choices: [
          {
            text: "I am writing because my laptop stand order is still marked in transit after two weeks.",
            good: true,
            tip: null,
          },
          {
            text: "Shipping is weird.",
            good: false,
            tip: "Mention the product, status, and two-week wait.",
          },
          {
            text: "Send my item now or I will sue ShopEase.",
            good: false,
            tip: "No threats.",
          },
        ],
        assemble: (c) => c,
      },
      {
        type: "fill",
        title: "Bite 3 · How it hurts me",
        hint: "Explain why the delay matters.",
        template: "This is inconvenient because I {impact}, so I {feeling}.",
        fields: [
          {
            key: "impact",
            kind: "select",
            options: [
              { value: "need the stand for daily remote work", good: true },
              { value: "like packages", good: false, tip: "Link the delay to work or a real need." },
              { value: "will report you to every forum", good: false, tip: "No threats." },
            ],
          },
          {
            key: "feeling",
            kind: "select",
            options: [
              { value: "have been working without proper setup", good: true },
              { value: "am only browsing casually", good: false, tip: "Show a real impact." },
              { value: "plan to threaten staff", good: false, tip: "Stay polite." },
            ],
          },
        ],
        assemble: (vals) =>
          `This is inconvenient because I ${vals.impact}, so I ${vals.feeling}.`,
      },
      {
        type: "fill",
        title: "Bite 4 · What I want",
        hint: "Ask for an update or remedy + timeline.",
        template: "Please {ask} {timeline}.",
        fields: [
          {
            key: "ask",
            kind: "select",
            options: [
              { value: "provide a delivery update or offer a replacement or refund", good: true },
              { value: "do better shipping", good: false, tip: "Ask for update, replacement, or refund." },
              { value: "pay me damages immediately or face court", good: false, tip: "No threats." },
            ],
          },
          {
            key: "timeline",
            kind: "select",
            options: [
              { value: "within five business days", good: true },
              { value: "whenever", good: false, tip: "Give a polite timeline." },
              { value: "in one hour or else", good: false, tip: "Drop the threat and soften the deadline." },
            ],
          },
        ],
        assemble: (vals) => `Please ${vals.ask} ${vals.timeline}.`,
      },
      {
        type: "fill",
        title: "Bite 5 · Thank you + name",
        hint: "Close politely.",
        template: "{thanks}\n\n{name}",
        fields: [
          {
            key: "thanks",
            kind: "select",
            options: [
              { value: "Thank you for your assistance.", good: true },
              { value: "Hurry up.", good: false, tip: "Thank them instead." },
              { value: "I hope this email meets you well.", good: false, tip: "Avoid that phrase." },
            ],
          },
          {
            key: "name",
            kind: "text",
            placeholder: "Your full name",
            className: "wide",
            validate: (v) => {
              const t = (v || "").trim();
              if (t.length < 2) return { ok: false, tip: "Add your name." };
              return { ok: true };
            },
          },
        ],
        assemble: (vals) => `${vals.thanks}\n\n${vals.name.trim()}`,
      },
    ],
    subjectOptions: [
      { text: "Order delay · laptop stand · delivery update request", good: true },
      { text: "Help", good: false, tip: "Name the order issue in the subject." },
      { text: "LAWSUIT COMING", good: false, tip: "No threats." },
    ],
  },
];

/* ---------- State ---------- */
function defaultState() {
  return {
    streak: 0,
    lastPracticeDate: null,
    lesson1Completions: 0,
    lesson2Completions: 0,
    lesson3Completions: 0,
    lastScore: null,
    lastBand: null,
    lastLesson: null,
    scenarioIndex: 0,
    l3ScenarioIndex: 0,
    completedScenarioIds: [],
    lessonsTouched: { 1: false, 2: false, 3: false },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      lessonsTouched: { ...base.lessonsTouched, ...(parsed.lessonsTouched || {}) },
    };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let session = null;
let l2Session = null;
let l3Session = null;
let l3TimerId = null;
let resultAgainHandler = null;

/* ---------- Lesson 2 drills ---------- */
const L2_DRILLS = [
  {
    id: "your-1",
    tag: "Grammar · you / your",
    title: "Pick the correct word",
    hint: "your = belonging to you · you're = you are",
    bad: null,
    prompt: "I am writing about _____ building's broken elevator.",
    choices: [
      { text: "your", good: true, tip: null },
      { text: "you're", good: false, tip: "Use your (possession), not you're (you are)." },
      { text: "you", good: false, tip: "Need a possessive: your building." },
    ],
  },
  {
    id: "your-2",
    tag: "Grammar · you / your",
    title: "Fix the sentence",
    hint: "Choose the polite, correct line.",
    bad: "I hope you're office can help me soon.",
    prompt: "Which rewrite is correct?",
    choices: [
      { text: "I hope your office can help me soon.", good: true, tip: null },
      { text: "I hope you're office can help me soon.", good: false, tip: "you're = you are. Use your office." },
      { text: "I hope you office can help me soon.", good: false, tip: "Missing the possessive your." },
    ],
  },
  {
    id: "opener-1",
    tag: "Tone · weak opener",
    title: "Cut the filler",
    hint: 'Drop "I hope this email meets you well." Start with who you are.',
    bad: "I hope this email meets you well. I am a tenant in Flat 3.",
    prompt: "Best rewrite?",
    choices: [
      { text: "I am a tenant in Flat 3.", good: true, tip: null },
      { text: "I hope this email meets you well. I am a tenant in Flat 3.", good: false, tip: "Cut the filler greeting for a higher band." },
      { text: "Hope you're doing well!!! I live somewhere here.", good: false, tip: "Still fluff · and too vague about where you live." },
    ],
  },
  {
    id: "opener-2",
    tag: "Tone · weak opener",
    title: "Open with purpose",
    hint: "Examiners prefer clear identity + reason over empty greetings.",
    bad: "I hope this email finds you well.",
    prompt: "What should you write instead?",
    choices: [
      { text: "I am writing as a member of FitLife Gym about the evening schedule.", good: true, tip: null },
      { text: "I hope this email finds you well and that you are having a great day.", good: false, tip: "Still filler. Say who you are and why you write." },
      { text: "Hey hope all good.", good: false, tip: "Too casual for CELPIP Task 1." },
    ],
  },
  {
    id: "threat-1",
    tag: "Tone · no threats",
    title: "Rewrite the threat",
    hint: "Firm + polite beats angry. Ask clearly with a timeline.",
    bad: "Fix the light or I will call a lawyer.",
    prompt: "Polite rewrite?",
    choices: [
      { text: "Could you please arrange for the light to be repaired within three days?", good: true, tip: null },
      { text: "Fix the light or I will call a lawyer.", good: false, tip: "Threats lower your score. Ask politely." },
      { text: "If you ignore me I will sue and post online.", good: false, tip: "Still a threat. Stay calm and specific." },
    ],
  },
  {
    id: "threat-2",
    tag: "Tone · no threats",
    title: "Calm the ask",
    hint: "Replace demands with a clear request.",
    bad: "Send my package today or else you will regret it.",
    prompt: "Best rewrite?",
    choices: [
      { text: "Please provide a delivery update or a refund option within five business days.", good: true, tip: null },
      { text: "Send my package today or else you will regret it.", good: false, tip: "Remove the threat and add a polite timeline." },
      { text: "I demand you ship it immediately or I call the police.", good: false, tip: "Demand + threat · rewrite as a polite request." },
    ],
  },
  {
    id: "tone-1",
    tag: "Tone · firm but polite",
    title: "Choose the CLB 10 tone",
    hint: "Clear problem · personal impact · polite ask.",
    bad: null,
    prompt: "Which line sounds firm but polite?",
    choices: [
      { text: "The noise after 11 p.m. has made it hard to sleep. I would appreciate a follow-up this week.", good: true, tip: null },
      { text: "You people never care about tenants.", good: false, tip: "Blamey tone hurts. Focus on the issue and your ask." },
      { text: "Whatever. Just deal with it.", good: false, tip: "Too rude and vague for Task 1." },
    ],
  },
  {
    id: "grammar-close",
    tag: "Grammar · closing",
    title: "Close cleanly",
    hint: "Thank you + full name. No threats. No filler openers at the end.",
    bad: "I hope this email meets you well. Do it now. Name.",
    prompt: "Best closing?",
    choices: [
      { text: "Thank you for your prompt attention.\n\nAfolabi Adesina", good: true, tip: null },
      { text: "I hope this email meets you well. Do it now.", good: false, tip: "Cut the filler and the demand. Thank them and sign." },
      { text: "Fix it or lawyer. Bye.", good: false, tip: "Threat + abrupt close. Stay polite." },
    ],
  },
];

/* ---------- Lesson 3 timed prompts ---------- */
const L3_PROMPTS = [
  {
    id: "l3-heater",
    prompt:
      "You live in Unit 9C at Riverside Towers. The heater in your unit has not worked for five days. It is cold and you cannot work from home comfortably. Write an email to the building manager. Explain who you are, the problem, how it affects you, and what you want them to do (with a polite timeline).",
    keywords: ["unit 9c", "heater", "riverside", "cold", "repair", "fix"],
  },
  {
    id: "l3-refund",
    prompt:
      "You bought a noise-cancelling headset from AudioMart online. It arrived damaged. You want a replacement or a refund. Write to customer service. Be firm but polite. Include a clear subject and a clear ask with a timeline.",
    keywords: ["headset", "damaged", "audiomart", "replacement", "refund"],
  },
  {
    id: "l3-library",
    prompt:
      "You are a library member. Evening study rooms were closed without notice during exam week. Write to the library manager. Explain the impact on your studies and request restored hours or an alternative within one week.",
    keywords: ["library", "study", "evening", "exam", "hours"],
  },
  {
    id: "l3-parking",
    prompt:
      "Assigned parking spot B14 at your condo has been blocked by construction cones for ten days with no notice. Write to the condo board. Ask for temporary parking and a clear end date for the blockage.",
    keywords: ["parking", "b14", "cones", "condo", "temporary"],
  },
];

/* ---------- Streak ---------- */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function bumpStreak() {
  const today = todayKey();
  if (state.lastPracticeDate === today) return;
  if (state.lastPracticeDate === yesterdayKey()) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
  state.lastPracticeDate = today;
  saveState(state);
}

function refreshStreakDisplay() {
  const today = todayKey();
  let shown = state.streak;
  if (state.lastPracticeDate && state.lastPracticeDate !== today && state.lastPracticeDate !== yesterdayKey()) {
    shown = 0;
  }
  document.getElementById("streak-count").textContent = String(shown);
}

function lessonsDoneCount() {
  let n = 0;
  if (state.lesson1Completions > 0) n += 1;
  if (state.lesson2Completions > 0) n += 1;
  if (state.lesson3Completions > 0) n += 1;
  return n;
}

function refreshHomeMeta() {
  const l1 = document.getElementById("l1-meta");
  const l2 = document.getElementById("l2-meta");
  const l3 = document.getElementById("l3-meta");
  const l1cta = document.getElementById("l1-cta");
  const l2cta = document.getElementById("l2-cta");
  const l3cta = document.getElementById("l3-cta");

  if (state.lesson1Completions > 0) {
    l1.textContent = `Completed ${state.lesson1Completions}×`;
    l1cta.textContent = "Again";
  } else {
    l1.textContent = "Not started";
    l1cta.textContent = "Start";
  }
  if (state.lesson2Completions > 0) {
    l2.textContent = `Completed ${state.lesson2Completions}×`;
    l2cta.textContent = "Again";
  } else {
    l2.textContent = "Not started";
    l2cta.textContent = "Start";
  }
  if (state.lesson3Completions > 0) {
    l3.textContent = `Completed ${state.lesson3Completions}×`;
    l3cta.textContent = "Again";
  } else {
    l3.textContent = "Not started";
    l3cta.textContent = "Start";
  }

  const lastEl = document.getElementById("stat-last");
  if (state.lastBand) {
    lastEl.textContent = state.lastBand;
  } else {
    lastEl.textContent = "-";
  }

  const done = lessonsDoneCount();
  document.getElementById("stat-lessons").textContent = `${done}/3`;
  const pct = Math.round((done / 3) * 100);
  document.getElementById("path-pct").textContent = `${pct}%`;
  document.getElementById("path-fill").style.width = `${pct}%`;

  refreshStreakDisplay();
}

/* ---------- Screens ---------- */
function showScreen(id) {
  stopL3Timer();
  document.querySelectorAll(".screen").forEach((el) => {
    const on = el.id === id;
    el.classList.toggle("active", on);
    if (on) el.removeAttribute("hidden");
    else el.setAttribute("hidden", "");
  });
  window.scrollTo(0, 0);
}

function goHome() {
  showScreen("screen-home");
  refreshHomeMeta();
}

/* ---------- Lesson 1 session ---------- */
function startLesson(advanceScenario) {
  if (advanceScenario) {
    state.scenarioIndex = (state.scenarioIndex + 1) % SCENARIOS.length;
    saveState(state);
  }
  const scenario = SCENARIOS[state.scenarioIndex % SCENARIOS.length];
  session = {
    lesson: 1,
    scenario,
    biteIndex: 0,
    answers: [],
    biteScores: [],
    subjectChoice: null,
    phase: "bites",
  };
  document.getElementById("btn-check").onclick = () => checkCurrentBite();
  document.getElementById("btn-next").onclick = () => goNext();
  showScreen("screen-lesson");
  renderBite();
}

function setProgress(step, total) {
  const pct = Math.round((step / total) * 100);
  document.getElementById("progress-fill").style.width = `${pct}%`;
  document.getElementById("progress-bar").setAttribute("aria-valuenow", String(step));
  document.getElementById("bite-label").textContent =
    session.phase === "subject"
      ? "Subject line"
      : `Bite ${session.biteIndex + 1} of 5 · ${BITE_NAMES[session.biteIndex]}`;
}

function renderBite() {
  const { scenario, biteIndex } = session;
  const bite = scenario.bites[biteIndex];
  document.getElementById("scenario-text").textContent = scenario.prompt;
  document.getElementById("bite-title").textContent = bite.title;
  document.getElementById("bite-hint").textContent = bite.hint;

  const gap = document.getElementById("gap-block");
  gap.innerHTML = "";
  hideFeedback();
  const checkBtn = document.getElementById("btn-check");
  const nextBtn = document.getElementById("btn-next");
  checkBtn.hidden = false;
  checkBtn.disabled = false;
  checkBtn.textContent = "Check";
  nextBtn.hidden = true;

  setProgress(biteIndex + 1, 6);

  if (bite.type === "choice") {
    const label = document.createElement("p");
    label.className = "bite-hint";
    label.style.marginBottom = "12px";
    label.textContent = bite.promptLine;
    gap.appendChild(label);

    const grid = document.createElement("div");
    grid.className = "choice-grid";
    grid.dataset.mode = "choice";
    bite.choices.forEach((ch, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = ch.text;
      btn.dataset.index = String(i);
      btn.addEventListener("click", () => {
        grid.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
      grid.appendChild(btn);
    });
    gap.appendChild(grid);
  } else if (bite.type === "fill") {
    renderFillTemplate(gap, bite);
  }
}

function renderFillTemplate(container, bite) {
  const wrap = document.createElement("div");
  wrap.className = "gap-sentence";
  wrap.dataset.mode = "fill";

  const parts = bite.template.split(/(\{[^}]+\})/g);
  parts.forEach((part) => {
    const m = part.match(/^\{([^}]+)\}$/);
    if (!m) {
      wrap.appendChild(document.createTextNode(part));
      return;
    }
    const key = m[1];
    const field = bite.fields.find((f) => f.key === key);
    if (!field) return;
    if (field.kind === "select") {
      const sel = document.createElement("select");
      sel.className = "gap-select";
      sel.dataset.key = key;
      const ph = document.createElement("option");
      ph.value = "";
      ph.textContent = "Choose...";
      ph.disabled = true;
      ph.selected = true;
      sel.appendChild(ph);
      field.options.forEach((opt, i) => {
        const o = document.createElement("option");
        o.value = String(i);
        o.textContent = opt.value;
        sel.appendChild(o);
      });
      wrap.appendChild(sel);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.className = `gap-input ${field.className || "mid"}`;
      input.dataset.key = key;
      input.placeholder = field.placeholder || "";
      input.autocomplete = "name";
      wrap.appendChild(input);
    }
  });
  container.appendChild(wrap);
}

function hideFeedback() {
  const fb = document.getElementById("feedback");
  fb.hidden = true;
  fb.className = "feedback";
  fb.textContent = "";
}

function showFeedback(kind, message) {
  const fb = document.getElementById("feedback");
  fb.hidden = false;
  fb.className = `feedback ${kind}`;
  fb.textContent = message;
}

function containsThreat(text) {
  const lower = text.toLowerCase();
  return THREAT_WORDS.some((w) => lower.includes(w));
}

function containsWeakOpener(text) {
  const lower = text.toLowerCase();
  return WEAK_OPENERS.some((w) => lower.includes(w));
}

function checkCurrentBite() {
  const bite = session.scenario.bites[session.biteIndex];
  if (bite.type === "choice") {
    const selected = document.querySelector("#gap-block .choice-grid .choice-btn.selected");
    if (!selected) {
      showFeedback("tip", "Tap one option first.");
      return;
    }
    const idx = Number(selected.dataset.index);
    const choice = bite.choices[idx];
    document.querySelectorAll("#gap-block .choice-grid .choice-btn").forEach((b, i) => {
      b.disabled = true;
      if (bite.choices[i].good) b.classList.add("correct");
      if (i === idx && !choice.good) b.classList.add("wrong");
    });
    if (choice.good) {
      showFeedback("good", "Strong · clear and polite.");
      session.answers[session.biteIndex] = bite.assemble(choice.text);
      session.biteScores[session.biteIndex] = 1;
    } else {
      showFeedback("tip", choice.tip || "Try the clearer option.");
      session.answers[session.biteIndex] = bite.assemble(choice.text);
      session.biteScores[session.biteIndex] = 0.35;
    }
    afterCheck();
    return;
  }

  const values = {};
  let allGood = true;
  let tip = null;
  let assembledPreview = "";

  for (const field of bite.fields) {
    const el = document.querySelector(`#gap-block [data-key="${field.key}"]`);
    if (!el) continue;
    if (field.kind === "select") {
      if (el.value === "") {
        showFeedback("tip", "Fill every blank before checking.");
        return;
      }
      const opt = field.options[Number(el.value)];
      values[field.key] = opt.value;
      if (!opt.good) {
        allGood = false;
        tip = opt.tip || tip;
      }
    } else {
      const v = el.value;
      values[field.key] = v;
      if (field.validate) {
        const res = field.validate(v);
        if (!res.ok) {
          showFeedback("tip", res.tip);
          return;
        }
      }
      if (containsThreat(v)) {
        allGood = false;
        tip = "Remove threat language. Stay firm but polite.";
      }
      if (containsWeakOpener(v)) {
        allGood = false;
        tip = tip || 'Skip "I hope this email meets you well."';
      }
    }
  }

  assembledPreview = bite.assemble(values);
  if (containsThreat(assembledPreview)) {
    allGood = false;
    tip = tip || "Remove threat words for a higher band.";
  }

  session.answers[session.biteIndex] = assembledPreview;
  if (allGood) {
    showFeedback("good", "Nice · this bite is clear and CLB-ready.");
    session.biteScores[session.biteIndex] = 1;
  } else {
    showFeedback("tip", tip || "Almost · tighten clarity or tone.");
    session.biteScores[session.biteIndex] = 0.45;
  }
  afterCheck();
}

function afterCheck() {
  document.getElementById("btn-check").hidden = true;
  const next = document.getElementById("btn-next");
  next.hidden = false;
  if (session.biteIndex >= 4) {
    next.textContent = "Choose subject →";
  } else {
    next.textContent = "Next bite →";
  }
}

function goNext() {
  if (session.phase === "subject") return;
  if (session.biteIndex < 4) {
    session.biteIndex += 1;
    renderBite();
    return;
  }
  renderSubjectStep();
}

function renderSubjectStep() {
  session.phase = "subject";
  setProgress(6, 6);
  document.getElementById("bite-label").textContent = "Subject line";
  document.getElementById("bite-title").textContent = "Subject · clear and specific";
  document.getElementById("bite-hint").textContent =
    "A good subject names the issue and who you are (flat, unit, or order).";

  const gap = document.getElementById("gap-block");
  gap.innerHTML = "";
  hideFeedback();

  const grid = document.createElement("div");
  grid.className = "choice-grid";
  grid.dataset.mode = "subject";
  session.scenario.subjectOptions.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = opt.text;
    btn.dataset.index = String(i);
    btn.addEventListener("click", () => {
      grid.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    grid.appendChild(btn);
  });
  gap.appendChild(grid);

  const checkBtn = document.getElementById("btn-check");
  const nextBtn = document.getElementById("btn-next");
  checkBtn.hidden = false;
  checkBtn.disabled = false;
  checkBtn.textContent = "Check subject";
  nextBtn.hidden = true;

  checkBtn.onclick = () => {
    const selected = grid.querySelector(".choice-btn.selected");
    if (!selected) {
      showFeedback("tip", "Pick a subject line.");
      return;
    }
    const idx = Number(selected.dataset.index);
    const opt = session.scenario.subjectOptions[idx];
    grid.querySelectorAll(".choice-btn").forEach((b, i) => {
      b.disabled = true;
      if (session.scenario.subjectOptions[i].good) b.classList.add("correct");
      if (i === idx && !opt.good) b.classList.add("wrong");
    });
    session.subjectChoice = opt;
    session.subjectScore = opt.good ? 1 : 0.3;
    if (opt.good) showFeedback("good", "Clear subject · examiners like this.");
    else showFeedback("tip", opt.tip || "Make the subject specific.");
    checkBtn.hidden = true;
    nextBtn.hidden = false;
    nextBtn.textContent = "See full email →";
    nextBtn.onclick = () => finishLesson1();
  };
}

function showResult({ band, scorePct, strength, fix, subject, body, againLabel, againFn, title }) {
  document.getElementById("result-title").textContent = title || "Your email";
  document.getElementById("score-num").textContent = band;
  document.getElementById("score-label").textContent = `Practice score ${scorePct}% · estimate only`;
  document.getElementById("note-strength").innerHTML =
    `<strong>Strength</strong>${escapeHtml(strength)}`;
  document.getElementById("note-fix").innerHTML =
    `<strong>One fix</strong>${escapeHtml(fix)}`;
  document.getElementById("email-subject").textContent = subject || "(no subject)";
  document.getElementById("email-body").textContent = body || "";
  const again = document.getElementById("btn-again");
  again.textContent = againLabel || "Practice again";
  resultAgainHandler = againFn;
  showScreen("screen-result");
}

function finishLesson1() {
  const answers = session.answers;
  const bodyParts = [
    "Dear Manager,",
    "",
    answers[0],
    answers[1],
    answers[2],
    answers[3],
    "",
    answers[4],
  ];
  const body = bodyParts.join("\n");
  const subject = session.subjectChoice ? session.subjectChoice.text : "Follow-up request";

  const biteAvg =
    session.biteScores.reduce((a, b) => a + b, 0) / session.biteScores.length;
  const total = biteAvg * 0.85 + (session.subjectScore || 0) * 0.15;
  const scorePct = Math.round(total * 100);

  let band;
  if (total >= 0.92) band = "CLB 10+";
  else if (total >= 0.8) band = "CLB 9-10";
  else if (total >= 0.65) band = "CLB 8";
  else if (total >= 0.5) band = "CLB 7";
  else band = "CLB 5-6";

  const strengths = [];
  const fixes = [];
  if (session.biteScores[0] >= 1) strengths.push("You identified yourself clearly (who + where).");
  if (session.biteScores[3] >= 1) strengths.push("Your ask and timeline were clear and polite.");
  if (session.subjectScore >= 1) strengths.push("Your subject line was specific and useful.");
  if (session.biteScores[2] >= 1) strengths.push("You explained the impact on you without drama.");
  if (!strengths.length) strengths.push("You completed the full email sandwich · keep practising.");

  if (session.biteScores[0] < 1) fixes.push("Open with who you are and your flat or unit number.");
  else if (session.biteScores[1] < 1) fixes.push("State the problem in one specific sentence.");
  else if (session.biteScores[2] < 1) fixes.push("Spell out how the problem affects you (sleep, safety, work).");
  else if (session.biteScores[3] < 1) fixes.push("Make one clear ask with a polite timeline · no threats.");
  else if (session.biteScores[4] < 1) fixes.push("Close with a thank-you and your full name.");
  else if (session.subjectScore < 1) fixes.push("Tighten the subject: issue + location or order ID.");
  else fixes.push("Next round: write the same bites a little shorter and sharper.");

  bumpStreak();
  state.lesson1Completions += 1;
  state.lastScore = scorePct;
  state.lastBand = band;
  state.lastLesson = 1;
  state.lessonsTouched[1] = true;
  if (!state.completedScenarioIds.includes(session.scenario.id)) {
    state.completedScenarioIds.push(session.scenario.id);
  }
  saveState(state);
  refreshHomeMeta();

  showResult({
    band,
    scorePct,
    strength: strengths[0],
    fix: fixes[0],
    subject,
    body,
    title: "Lesson 1 · your email",
    againLabel: "Practice another scenario",
    againFn: () => startLesson(true),
  });
}

/* ---------- Lesson 2 ---------- */
function startLesson2() {
  l2Session = { index: 0, scores: [] };
  showScreen("screen-lesson2");
  renderL2Drill();
}

function renderL2Drill() {
  const drill = L2_DRILLS[l2Session.index];
  const total = L2_DRILLS.length;
  const step = l2Session.index + 1;
  document.getElementById("l2-label").textContent = `Drill ${step} of ${total}`;
  document.getElementById("l2-progress-fill").style.width = `${Math.round((step / total) * 100)}%`;
  document.getElementById("l2-progress-bar").setAttribute("aria-valuenow", String(step));
  document.getElementById("l2-progress-bar").setAttribute("aria-valuemax", String(total));
  document.getElementById("l2-tag").textContent = drill.tag;
  document.getElementById("l2-prompt").textContent = drill.prompt;
  document.getElementById("l2-title").textContent = drill.title;
  document.getElementById("l2-hint").textContent = drill.hint;

  const gap = document.getElementById("l2-gap");
  gap.innerHTML = "";
  const fb = document.getElementById("l2-feedback");
  fb.hidden = true;
  fb.textContent = "";
  fb.className = "feedback";

  if (drill.bad) {
    const bad = document.createElement("div");
    bad.className = "drill-bad";
    bad.innerHTML = `<span class="label">Needs a fix</span>${escapeHtml(drill.bad)}`;
    gap.appendChild(bad);
  }

  const grid = document.createElement("div");
  grid.className = "choice-grid";
  drill.choices.forEach((ch, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = ch.text;
    btn.dataset.index = String(i);
    btn.addEventListener("click", () => {
      grid.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    grid.appendChild(btn);
  });
  gap.appendChild(grid);

  const checkBtn = document.getElementById("btn-l2-check");
  const nextBtn = document.getElementById("btn-l2-next");
  checkBtn.hidden = false;
  nextBtn.hidden = true;
}

function checkL2() {
  const drill = L2_DRILLS[l2Session.index];
  const selected = document.querySelector("#l2-gap .choice-btn.selected");
  const fb = document.getElementById("l2-feedback");
  if (!selected) {
    fb.hidden = false;
    fb.className = "feedback tip";
    fb.textContent = "Tap one option first.";
    return;
  }
  const idx = Number(selected.dataset.index);
  const choice = drill.choices[idx];
  document.querySelectorAll("#l2-gap .choice-btn").forEach((b, i) => {
    b.disabled = true;
    if (drill.choices[i].good) b.classList.add("correct");
    if (i === idx && !choice.good) b.classList.add("wrong");
  });
  fb.hidden = false;
  if (choice.good) {
    fb.className = "feedback good";
    fb.textContent = "Nice · that is firm, polite, and clear.";
    l2Session.scores[l2Session.index] = 1;
  } else {
    fb.className = "feedback tip";
    fb.textContent = choice.tip || "Almost · try the clearer rewrite.";
    l2Session.scores[l2Session.index] = 0.3;
  }
  document.getElementById("btn-l2-check").hidden = true;
  const next = document.getElementById("btn-l2-next");
  next.hidden = false;
  next.textContent =
    l2Session.index >= L2_DRILLS.length - 1 ? "See results →" : "Next drill →";
}

function nextL2() {
  if (l2Session.index < L2_DRILLS.length - 1) {
    l2Session.index += 1;
    renderL2Drill();
    return;
  }
  finishLesson2();
}

function finishLesson2() {
  const avg =
    l2Session.scores.reduce((a, b) => a + b, 0) / l2Session.scores.length;
  const scorePct = Math.round(avg * 100);
  let band;
  if (avg >= 0.92) band = "CLB 10+";
  else if (avg >= 0.8) band = "CLB 9-10";
  else if (avg >= 0.65) band = "CLB 8";
  else if (avg >= 0.5) band = "CLB 7";
  else band = "CLB 5-6";

  const misses = l2Session.scores
    .map((s, i) => ({ s, i }))
    .filter((x) => x.s < 1)
    .map((x) => L2_DRILLS[x.i].tag);

  let strength =
    avg >= 0.8
      ? "You are spotting weak tone and grammar quickly · that protects CLB 10."
      : "You finished the tone drills · keep choosing the calm rewrite.";
  let fix =
    misses.length > 0
      ? `Focus next on: ${misses[0]}. Calm asks beat threats every time.`
      : "Keep cutting filler openers and double-checking your / you're.";

  const summary = L2_DRILLS.map((d, i) => {
    const mark = l2Session.scores[i] >= 1 ? "✓" : "·";
    return `${mark} ${d.title}`;
  }).join("\n");

  bumpStreak();
  state.lesson2Completions += 1;
  state.lastScore = scorePct;
  state.lastBand = band;
  state.lastLesson = 2;
  state.lessonsTouched[2] = true;
  saveState(state);
  refreshHomeMeta();

  showResult({
    band,
    scorePct,
    strength,
    fix,
    subject: "Lesson 2 · tone and grammar drills",
    body: summary,
    title: "Lesson 2 · results",
    againLabel: "Retry tone drills",
    againFn: () => startLesson2(),
  });
}

/* ---------- Lesson 3 timed ---------- */
function startLesson3(advance) {
  if (advance) {
    state.l3ScenarioIndex = (state.l3ScenarioIndex + 1) % L3_PROMPTS.length;
    saveState(state);
  }
  const prompt = L3_PROMPTS[state.l3ScenarioIndex % L3_PROMPTS.length];
  l3Session = {
    prompt,
    secondsLeft: 27 * 60,
    submitted: false,
  };
  document.getElementById("l3-prompt").textContent = prompt.prompt;
  document.getElementById("l3-subject").value = "";
  document.getElementById("l3-body").value = "";
  document.getElementById("l3-words").textContent = "0 words";
  updateL3TimerDisplay();
  showScreen("screen-lesson3");
  startL3Timer();
}

function wordCount(text) {
  const t = (text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function updateL3TimerDisplay() {
  const s = Math.max(0, l3Session ? l3Session.secondsLeft : 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  const el = document.getElementById("l3-timer");
  el.textContent = `${m}:${String(r).padStart(2, "0")}`;
  el.classList.remove("warn", "danger");
  if (s <= 60) el.classList.add("danger");
  else if (s <= 5 * 60) el.classList.add("warn");
}

function startL3Timer() {
  stopL3Timer();
  l3TimerId = setInterval(() => {
    if (!l3Session || l3Session.submitted) return;
    l3Session.secondsLeft -= 1;
    updateL3TimerDisplay();
    if (l3Session.secondsLeft <= 0) {
      stopL3Timer();
      finishLesson3(true);
    }
  }, 1000);
}

function stopL3Timer() {
  if (l3TimerId) {
    clearInterval(l3TimerId);
    l3TimerId = null;
  }
}

function scoreTimedEmail(subject, body, prompt) {
  const sub = (subject || "").trim();
  const text = (body || "").trim();
  const lower = text.toLowerCase();
  const subLower = sub.toLowerCase();
  const words = wordCount(text);
  let score = 0.35;
  const notes = { strength: [], fix: [] };

  // Subject
  if (sub.length >= 8) {
    score += 0.08;
    const hit = (prompt.keywords || []).some((k) => subLower.includes(k));
    if (hit) {
      score += 0.07;
      notes.strength.push("Subject names the real issue.");
    } else {
      notes.fix.push("Make the subject more specific (issue + place or order).");
    }
  } else {
    notes.fix.push("Add a clear subject line before the body.");
  }

  // Threats / weak opener
  if (containsThreat(text) || containsThreat(sub)) {
    score -= 0.25;
    notes.fix.push("Remove threat language. Ask politely with a timeline.");
  } else {
    score += 0.1;
    notes.strength.push("Tone stays firm without threats.");
  }
  if (containsWeakOpener(text)) {
    score -= 0.12;
    notes.fix.push('Cut "I hope this email meets you well" and open with who you are.');
  } else {
    score += 0.06;
  }

  // Sandwich signals
  const whoSignals = /(i am|i'm|my name|tenant|resident|member|customer|unit|flat|apt)/i;
  const whySignals = /(i am writing|i'm writing|because|regarding|about the)/i;
  const hurtSignals = /(because|affect|cannot|can't|unable|difficult|problem for me|makes it hard)/i;
  const askSignals = /(please|could you|would you|i would appreciate|request|within|by |by this)/i;
  const thanksSignals = /(thank you|thanks|regards|sincerely)/i;

  let bites = 0;
  if (whoSignals.test(text)) { bites++; score += 0.06; }
  if (whySignals.test(text)) { bites++; score += 0.06; }
  if (hurtSignals.test(text)) { bites++; score += 0.06; }
  if (askSignals.test(text)) { bites++; score += 0.08; }
  if (thanksSignals.test(text)) { bites++; score += 0.05; }

  if (bites >= 4) notes.strength.push("Your email covers most of the sandwich bites.");
  else notes.fix.push("Use all 5 bites: Who · Why · Hurt · Ask (+ timeline) · Thanks.");

  // Keyword coverage from prompt
  const kwHits = (prompt.keywords || []).filter((k) => lower.includes(k) || subLower.includes(k)).length;
  if (kwHits >= 2) {
    score += 0.08;
    notes.strength.push("You stayed on the prompt details.");
  } else {
    notes.fix.push("Weave in key prompt details (place, problem, what you want).");
  }

  // Length
  if (words >= 120 && words <= 220) {
    score += 0.1;
    notes.strength.push("Length looks exam-ready.");
  } else if (words >= 80 && words < 120) {
    score += 0.04;
    notes.fix.push("Add a bit more detail on impact and your polite ask.");
  } else if (words > 220 && words <= 280) {
    score += 0.04;
    notes.fix.push("A little long · trim filler but keep the 5 bites.");
  } else if (words < 80) {
    score -= 0.08;
    notes.fix.push("Write more: aim around 150-200 words with all 5 bites.");
  } else {
    notes.fix.push("Tighten length toward about 150-200 words.");
  }

  // Name-ish close
  if (/\n\s*[A-Z][a-z]+(\s+[A-Z][a-z]+)+\s*$/.test(text) || /afolabi/i.test(text)) {
    score += 0.04;
  }

  score = Math.max(0.15, Math.min(0.98, score));
  const scorePct = Math.round(score * 100);
  let band;
  if (score >= 0.9) band = "CLB 10+";
  else if (score >= 0.8) band = "CLB 9-10";
  else if (score >= 0.68) band = "CLB 8";
  else if (score >= 0.55) band = "CLB 7";
  else band = "CLB 5-6";

  const strength = notes.strength[0] || "You submitted a full timed email · that builds exam stamina.";
  const fix = notes.fix[0] || "Next time: one clear ask with a polite timeline.";
  return { band, scorePct, strength, fix, words };
}

function finishLesson3(fromTimer) {
  if (!l3Session || l3Session.submitted) return;
  l3Session.submitted = true;
  stopL3Timer();

  const subject = document.getElementById("l3-subject").value;
  const body = document.getElementById("l3-body").value;
  if (!subject.trim() && !body.trim()) {
    if (!fromTimer) {
      l3Session.submitted = false;
      const tip = document.getElementById("l3-hint-count");
      tip.textContent = "Add a subject and body, then submit.";
      tip.style.color = "var(--warn)";
      startL3Timer();
      return;
    }
    // timer ended with empty draft · still score gently
  }

  const result = scoreTimedEmail(subject, body, l3Session.prompt);
  const timeNote = fromTimer
    ? "\n\n(Time ended · scored automatically.)"
    : `\n\n(Time left: ${document.getElementById("l3-timer").textContent})`;

  bumpStreak();
  state.lesson3Completions += 1;
  state.lastScore = result.scorePct;
  state.lastBand = result.band;
  state.lastLesson = 3;
  state.lessonsTouched[3] = true;
  saveState(state);
  refreshHomeMeta();

  showResult({
    band: result.band,
    scorePct: result.scorePct,
    strength: result.strength,
    fix: result.fix,
    subject: subject.trim() || "(no subject)",
    body: (body.trim() || "(empty body)") + timeNote + `\n\nWord count: ${result.words}`,
    title: "Lesson 3 · timed draft",
    againLabel: "Another timed prompt",
    againFn: () => startLesson3(true),
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- Wire UI ---------- */
function wire() {
  document.getElementById("btn-start-l1").addEventListener("click", () => startLesson(false));
  document.getElementById("btn-start-l2").addEventListener("click", () => startLesson2());
  document.getElementById("btn-start-l3").addEventListener("click", () => startLesson3(false));

  document.getElementById("btn-back-home").addEventListener("click", goHome);
  document.getElementById("btn-l2-back").addEventListener("click", goHome);
  document.getElementById("btn-l3-back").addEventListener("click", () => {
    if (l3Session && !l3Session.submitted) {
      const ok = confirm("Leave timed practice? Your draft will not be saved.");
      if (!ok) return;
    }
    goHome();
  });
  document.getElementById("btn-result-home").addEventListener("click", goHome);
  document.getElementById("btn-done").addEventListener("click", goHome);
  document.getElementById("btn-again").addEventListener("click", () => {
    if (typeof resultAgainHandler === "function") resultAgainHandler();
    else startLesson(true);
  });

  document.getElementById("btn-l2-check").addEventListener("click", checkL2);
  document.getElementById("btn-l2-next").addEventListener("click", nextL2);

  document.getElementById("btn-l3-submit").addEventListener("click", () => finishLesson3(false));
  document.getElementById("btn-l3-finish-early").addEventListener("click", () => finishLesson3(false));
  document.getElementById("l3-body").addEventListener("input", () => {
    document.getElementById("l3-words").textContent =
      `${wordCount(document.getElementById("l3-body").value)} words`;
  });

  refreshHomeMeta();
}

/* ---------- PWA ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
  });
}

wire();
