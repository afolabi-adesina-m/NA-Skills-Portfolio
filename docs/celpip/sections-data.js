/* CELPIP Coach v6 · section data: lessons, tips, practice prompts and mini drills.
   All lesson text and practice items are original. Tips marked with a source are paraphrased ideas from
   free videos by HZad Education - Coaching Central (YouTube). No transcript text is copied. */
"use strict";

const TIP_SOURCES = {
  speakTemplates: { id: "LGfXP7I8lpI", title: "CELPIP 2026 Speaking Templates: Parts 1 to 8. All Words and Phrases!" },
  speakAll: { id: "km2Q3Bs2qYs", title: "CELPIP Speaking Tasks 1-8: Complete Templates, Tips, Do's and Don'ts!" },
  writeAll: { id: "5sH3fGh1mw4", title: "The BEST CELPIP Writing Explanation! Task 1 & 2. All Strategies!" },
  writeDemo: { id: "5E6b-iSIIiM", title: "CELPIP 9-10 Writing in Under 15 Minutes! Practical Demonstration! 9+ Checklist Included!" },
  writeWords: { id: "3lKRF2f9GXY", title: "These 10 CELPIP Words Will Give You a 10+ in Writing!" },
  readAll: { id: "6WW_Msk5geA", title: "CELPIP Reading: All Strategies A to Z in 1 hour! Detailed Tips and Tricks - Parts 1 - 4" },
  listenTips: { id: "kZbFrH5nafo", title: "TOP 10 CELPIP LISTENING TIPS AND TRICKS!" },
  listenNotes: { id: "3ZfN7s9haMc", title: "CELPIP Listening Parts 5 and 6 EXPLAINED - The Ultimate Note-Taking Strategy!" },
  listenFormat: { id: "s0ssTBsRkuY", title: "CELPIP Listening Format and Tips" },
};
const CHANNEL = {
  name: "HZad Education - Coaching Central",
  url: "https://www.youtube.com/@hzadeducation-coachingcent986",
};
/* Popular videos from the channel, for the credits panel (view counts as seen on Nov 1, 2026) */
const CHANNEL_POPULAR = [
  { id: "km2Q3Bs2qYs", title: "CELPIP Speaking Tasks 1-8: Complete Templates, Tips, Do's and Don'ts!", views: "486K" },
  { id: "5E6b-iSIIiM", title: "CELPIP 9-10 Writing in Under 15 Minutes! Practical Demonstration!", views: "343K" },
  { id: "6WW_Msk5geA", title: "CELPIP Reading: All Strategies A to Z in 1 hour (Parts 1 to 4)", views: "312K" },
  { id: "18rJc1mEXUk", title: "12 Pts CELPIP Speaking Samples! Follow This Format!", views: "246K" },
  { id: "5sH3fGh1mw4", title: "The BEST CELPIP Writing Explanation! Task 1 & 2", views: "157K" },
  { id: "lnYUy4lJtXU", title: "Complete CELPIP Writing Task 1 & 2 Structure With Breakdown", views: "144K" },
  { id: "3lKRF2f9GXY", title: "These 10 CELPIP Words Will Give You a 10+ in Writing!", views: "116K" },
  { id: "kZbFrH5nafo", title: "TOP 10 CELPIP LISTENING TIPS AND TRICKS!", views: "116K" },
  { id: "s0ssTBsRkuY", title: "CELPIP Listening Format and Tips", views: "110K" },
  { id: "LGfXP7I8lpI", title: "CELPIP 2026 Speaking Templates: Parts 1 to 8", views: "74K" },
];

/* Order matters: this is the order of the menu. */
const SECTIONS = [
  /* ---------------- LISTENING ---------------- */
  {
    id: "listening", skill: "Listening", name: "Listening", short: "Listening", icon: "headphones",
    meta: "Parts 1 to 6 · audio plays once",
    summary: "Six parts, from everyday chats to opinions. You hear each audio one time, then answer.",
    lesson: {
      intro: "Listening has six parts. The first parts are easy, relaxed chats. The last parts are news, discussions and people sharing opinions, and they are harder and faster.",
      points: [
        "Part 1 Problem solving, Part 2 Daily life conversation, Part 3 Listening for information.",
        "Part 4 News item, Part 5 Discussion (with video), Part 6 Viewpoints.",
        "The audio plays once. You cannot replay it, so notes and memory both matter.",
        "Three kinds of questions show up: big picture, small facts, and what someone probably feels or means.",
      ],
      steps: [
        "Before the audio: relax and get your pen ready. Listen from the very first second.",
        "While it plays: write short keywords and quick symbols, never full sentences.",
        "Questions come after: use your notes, then cross out answers that cannot be right.",
        "If two answers both look right, pick the one that covers more of what you heard.",
      ],
      example: "Heard: \"I have thought about moving for months, and it keeps me up at night.\" Good note: \"moves? stress\". Weak note: \"I was thinking for a long time\".",
    },
    tips: [
      { t: "Listen hard in the first few seconds. First reactions (\"Oh no\", \"Wow, great!\") are often asked about later.", src: "listenTips" },
      { t: "Write the main idea, not the noise. \"Needs to move\" matters more than \"was thinking about it\".", src: "listenTips" },
      { t: "Draw tiny pictures and arrows. An angry face takes one second. A sentence takes ten.", src: "listenTips" },
      { t: "Start a new column in your notes whenever a speaker changes sides after words like \"however\" or \"nevertheless\".", src: "listenTips" },
      { t: "Practise paraphrasing: pause a video, say the last sentence in your own words, and change more than half of the words.", src: "listenTips" },
      { t: "Watch for options that are all partly true. The best answer often covers everything the others only touch.", src: "listenTips" },
      { t: "Listen for tone and feeling. CELPIP asks how a person felt or reacted, not only what they said.", src: "listenTips" },
      { t: "Discussion with video (Part 5): make one column per speaker, add arrows to show who answered whom, and keep notes in order from top to bottom.", src: "listenNotes" },
      { t: "Viewpoints (Part 6): one column per side (for, against, in the middle). Use only half the page so you never run out of room.", src: "listenNotes" },
      { t: "Do not write what people look like. You will remember the red shirt. Spend your pen on what was said.", src: "listenNotes" },
      { t: "Part 5 has a video, so keep your eyes open. Faces and tone give answers that words do not.", src: "listenFormat" },
      { t: "Train on podcasts, news and talks with the eyes closed. Ask yourself afterwards: what was the main point, and who agreed with whom?" },
    ],
    practiceNote: "The app reads a short script out loud one time using your device voice. Take notes first, then answer.",
    drills: [
      {
        id: "L1", title: "Part 1 style: Sorting out a problem", notesCols: 1,
        script: "Hi Rosa, did you get my message about the team lunch on Friday? Yes, I did, Marcus. But the restaurant you picked is closed for repairs until next week. Oh no. I booked it two weeks ago and nobody called me. I know, it is annoying. Maybe we can move it to the cafe across from the office. It has a big back room, and I hear the soup there is great. That sounds good, but we are twelve people, and the cafe only seats ten in the back room. Then let me call them and ask if they can join two tables. If they say no, we can still have the lunch on Monday at the original place. Great plan. Please call this afternoon, and I will tell the team about the change once you know.",
        questions: [
          { q: "What is the main problem?", opts: ["The lunch was cancelled by the team", "The booked restaurant is closed", "Rosa forgot to book a table", "Marcus cannot come on Friday"], a: 1, why: "The restaurant is closed for repairs until next week." },
          { q: "Why might the cafe not work at first?", opts: ["The soup is bad", "It is too far from the office", "The back room seats ten and there are twelve people", "It is closed on Fridays"], a: 2, why: "Twelve people, but the back room seats only ten." },
          { q: "What will Rosa most likely do next?", opts: ["Call the cafe about joining two tables", "Cancel the team lunch", "Book a new restaurant online", "Ask the team to vote"], a: 0, why: "She says she will call them and ask. This is an inference from her plan." },
        ],
      },
      {
        id: "L2", title: "Part 6 style: Different viewpoints", notesCols: 3,
        script: "Our city is deciding whether to close the main downtown street to cars on weekends. Shop owner Lena is against it. She says that weekend customers drive in from other towns, and if they cannot park nearby, they will shop at the mall instead. Her sales could drop by a third. However, cyclist Omar supports the idea. He says closed streets make the area safer, and he points to a nearby city where more people walked and sat in cafes after a similar change. Nevertheless, he admits that deliveries would need special hours. The city planner, Priya, is somewhere in the middle. She suggests a trial of three months, with free shuttle buses from the parking lots, and she wants to count shoppers before and after before the council makes a final decision.",
        questions: [
          { q: "Why is Lena against the plan?", opts: ["She dislikes cyclists", "She fears customers who drive will shop elsewhere", "She wants the street open at night only", "She wants higher parking fees"], a: 1, why: "Customers who cannot park nearby may go to the mall." },
          { q: "What does Omar admit?", opts: ["Deliveries would need special hours", "Shops would lose a third of sales", "Cafes would close", "The street is already safe"], a: 0, why: "He says deliveries would need special hours, a point against his own side." },
          { q: "Which statement best describes Priya?", opts: ["She strongly supports a full closure", "She strongly opposes the idea", "She wants a short trial and facts before deciding", "She does not care what happens"], a: 2, why: "A three month trial with counting before and after is the middle path." },
        ],
      },
    ],
  },
  /* ---------------- READING ---------------- */
  {
    id: "reading", skill: "Reading", name: "Reading", short: "Reading", icon: "book",
    meta: "Parts 1 to 4 · letters, pictures, articles, debates",
    summary: "Four parts. Each one asks you to understand and interpret, not just match keywords.",
    lesson: {
      intro: "Reading has four parts: a letter or email (Part 1), a picture or diagram with text (Part 2), an article with paragraphs to match (Part 3), and a debate with several views (Part 4). Difficulty goes up as you move down.",
      points: [
        "Part 1 Correspondence, Part 2 Apply a diagram, Part 3 Information, Part 4 Viewpoints.",
        "You need to understand meaning. Many answers are reworded, so the same keyword often will not appear.",
        "Time is tight, so decide quickly and move on. Leave hard \"overall\" questions for the end.",
      ],
      steps: [
        "Give the passage five seconds to learn its tone and topic. Do not skim the whole thing.",
        "Read a question, find the spot in the text, then come back and pick your answer.",
        "Cross out options that are clearly wrong and say the rest in your own simple words.",
        "Questions about the main reason or the writer's attitude: answer them last, after you have read more.",
      ],
      example: "Question: \"Why did the pastor write?\" Do not hunt for the word \"why\". Finish the other questions first, then use your overall feel for the letter.",
    },
    tips: [
      { t: "Spend about five seconds on the passage first: who is writing, what is the tone, what is it about. Then go to the questions.", src: "readAll" },
      { t: "Do not skim the whole text. Skimming costs about a tenth of your time and you forget most of it.", src: "readAll" },
      { t: "Sort questions into two kinds: ones with a clear key phrase you can find, and \"main reason\" or \"writer's attitude\" questions. Do the easy kind first.", src: "readAll" },
      { t: "Answers often do not appear in order. Do not expect question 3 to live in paragraph 3.", src: "readAll" },
      { t: "Part 1 reply questions: put yourself in the reader's shoes and think how you would answer. The text will not say it word for word.", src: "readAll" },
      { t: "Cross out wrong options and say what each one means in your own words. This is how you dodge traps.", src: "readAll" },
      { t: "When two options both look possible, pick the one with a specific clue in the text. General words lose to specific ones.", src: "readAll" },
      { t: "Part 2: the picture comes first. Give it one or two minutes, then answer. Watch for words like \"except\" and \"not\".", src: "readAll" },
      { t: "Part 3 (matching): read each paragraph and sum it up in your head in two or three points, then match statements. Do not hunt for headings, and do not trust only the first and last sentence.", src: "readAll" },
      { t: "Part 3: if a statement matches nothing, mark it E. You do not need to find proof for E.", src: "readAll" },
      { t: "Part 4: work out who thinks what. If one writer is for and one against, the visitor comment will pick a side, and that unlocks many answers.", src: "readAll" },
      { t: "Same keyword in the option and the passage does not make an option right. Check who said it and what they meant.", src: "readAll" },
      { t: "Read something real every day (news, a long article) and write down five new words. Part 4 uses hard vocabulary." },
    ],
    practiceNote: "Short practice passages written for this app. Read the question first, find the spot, then answer.",
    drills: [
      {
        id: "R1", title: "Part 1 style: A letter from a neighbour",
        passage: "Dear Mr. Okafor,\n\nI hope you and your family enjoyed the long weekend. I am writing because the building committee met on Tuesday and talked about the noise on the third floor. Several neighbours say there is loud music after 10 p.m. on weeknights. I do not want to blame anyone, and I know you work late some evenings. Still, the rules ask us to keep noise low after 10 p.m. Could you please turn the music down at that hour? The committee would rather settle this kindly than send a formal notice. If there is anything we can do to help, such as getting better rugs for your floor, please tell me.\n\nKind regards,\nHelen Brooks\nBuilding Committee Chair",
        questions: [
          { q: "When did the committee meet?", opts: ["Monday", "Tuesday", "On the long weekend", "On Friday"], a: 1, why: "Easy to find: \"met on Tuesday\". The key phrase leads you to the spot." },
          { q: "What does Helen want Mr. Okafor to do?", opts: ["Move to another floor", "Stop working late", "Turn the music down after 10 p.m.", "Pay a fine"], a: 2, why: "\"Could you please turn the music down at that hour?\" says it directly." },
          { q: "How would you describe the tone of the letter?", opts: ["Angry and threatening", "Polite and understanding", "Cold and formal", "Joking and silly"], a: 1, why: "A \"main tone\" question. Save it for the end. Words like \"do not want to blame\" and \"kindly\" show a polite, understanding tone." },
        ],
      },
      {
        id: "R2", title: "Part 4 style: Two views on a shorter work week",
        passage: "Daniel Reyes: A four day work week is a fantasy for people who have never run a business. Customers expect service five days a week, and shorter weeks mean that someone, somewhere, has to cover the gaps. I have seen what happens when staff stretch themselves thin: mistakes rise and tempers rise with them.\n\nSara Whitfield: I disagree. When my company moved to four days, our output did not fall at all, because people stopped wasting hours in pointless meetings. Rested staff stay longer in their jobs and make fewer errors. Daniel worries about coverage, but a clear schedule solves that.\n\nVisitor comment (Anil): I side with Sara on rested staff, but Daniel has a fair point about customer service. A mix, such as shorter days in quiet months, might suit most firms.",
        questions: [
          { q: "What is Daniel's main worry?", opts: ["Staff will be too rested", "Gaps in service and more mistakes", "Meetings are too long", "Customers dislike change"], a: 1, why: "He talks about covering gaps and mistakes rising." },
          { q: "Why does Sara say output did not fall?", opts: ["Staff worked longer hours", "Her company hired more people", "People stopped wasting time in meetings", "Customers bought less"], a: 2, why: "\"people stopped wasting hours in pointless meetings\"." },
          { q: "Which best describes Anil's view?", opts: ["He fully supports Daniel", "He fully supports Sara", "He agrees with parts of both and suggests a mix", "He has no opinion"], a: 2, why: "He sides with Sara on rest, agrees with Daniel on service, then suggests a mix. Finding who is on which side gives you several answers at once." },
        ],
      },
    ],
  },
  /* ---------------- WRITING ---------------- */
  {
    id: "writing1", skill: "Writing", name: "Writing Task 1: Email", short: "Writing 1", icon: "mail", wtype: "t1",
    meta: "27 minutes · 150 to 200 words",
    summary: "Write an email that answers three bullet points. Formal or informal depends on who you write to.",
    lesson: {
      intro: "You get a short situation and three bullets. Write a clear email in about 150 to 200 words. Who you write to decides the tone: friends and family are informal, everyone else is formal.",
      points: [
        "One paragraph for each bullet, about two sentences each.",
        "A short opening line that says who you are or why you write.",
        "A friendly, firm, polite close. No threats.",
      ],
      steps: [
        "Read the three bullets. They are your map.",
        "Write one clear opening line with the reason you are writing.",
        "Answer bullet 1, bullet 2 and bullet 3 in order, two sentences each.",
        "Close politely, sign off, then check the word count and read it once.",
      ],
      example: "Opening: \"My name is Afolabi Adesina, and I live in Unit 1408.\" Close: \"Thank you for your help. I will be happy to talk any time.\"",
    },
    tips: [
      { t: "Informal (friends or family): \"Dear\" plus first name only, and end with best regards or best wishes, then just your first name.", src: "writeAll" },
      { t: "Formal: \"Dear Mr. Alexander\" or a job title such as \"Dear Hiring Manager\". Do not use \"To whom it may concern\". End with Sincerely or Yours truly, then your full name.", src: "writeAll" },
      { t: "Put commas after the name at the top and after the sign off. Leave no punctuation after your name on the last line.", src: "writeAll" },
      { t: "One bullet equals one body paragraph. Two sentences each keeps you right around the word limit.", src: "writeAll" },
      { t: "Aim for at least two complex sentences in the email: two ideas in one sentence, joined by words like although, even though, even if, before or after.", src: "writeAll" },
      { t: "Formal opening: use one sentence that names the purpose, like \"The aim of this message is to ...\".", src: "writeAll" },
      { t: "If the task does not name a person, make one up (for example Mr. Alexander). A name feels personal.", src: "writeDemo" },
      { t: "Imagine the real place and people. A picture in your head gives you real points to write.", src: "writeDemo" },
      { t: "Write the plain version of each sentence first, then upgrade. Do not repeat the same word, and do not start every sentence with \"I\".", src: "writeDemo" },
      { t: "Look back at the bullets once or twice while writing to make sure each one is fully answered.", src: "writeDemo" },
      { t: "Keep a word count as you go. Staying around 180 to 200 is safer than going over.", src: "writeDemo" },
      { t: "Link words that help: furthermore, although, based on, nevertheless, interestingly. Use a few, not all of them.", src: "writeWords" },
    ],
    note: "The app already has a draft checker that warns about cliche openers like \"I hope this email meets you well\". Keep following that rule.",
  },
  {
    id: "writing2", skill: "Writing", name: "Writing Task 2: Survey", short: "Writing 2", icon: "survey", wtype: "t2",
    meta: "26 minutes · 150 to 200 words",
    summary: "Pick Option A or B and explain your choice with reasons and examples.",
    lesson: {
      intro: "You read a short situation with two options. Pick one and write about 150 to 200 words explaining why. There is no wrong choice. Pick the side where you have easy examples.",
      points: [
        "Intro: say what the topic is, then say clearly which option you choose.",
        "Body 1: two good things about your choice. Body 2: a weak side of the other option.",
        "Conclusion: say your choice again in new words.",
      ],
      steps: [
        "Choose A or B quickly. Do not say both are fine.",
        "Intro: one general sentence, then one sentence with your choice and the reasons in short.",
        "Body 1: two benefits of your choice, with a small example. Body 2: two problems with the other option.",
        "Conclusion: the same two sentences as the intro, said in different words.",
      ],
      example: "Opinion line: \"I strongly believe the cafeteria is the better choice because it saves time and brings people together.\"",
    },
    tips: [
      { t: "Intro has two sentences: a general sentence about the topic, then a clear opinion sentence that names your option and why.", src: "writeAll" },
      { t: "Conclusion repeats the intro in new words. Same two parts, different phrasing.", src: "writeAll" },
      { t: "Use two body paragraphs, not three. Body 1: two benefits of the option you chose.", src: "writeAll" },
      { t: "Body 2: two weaknesses of the option you did not choose. This channel says to be firm about it. Keep it polite and stick to facts.", src: "writeAll" },
      { t: "For a small, local topic (like an office), say something local in the opening line instead of \"in today's world\".", src: "writeAll" },
      { t: "Pick one side only. Do not write that both are good.", src: "writeAll" },
      { t: "Strong replacement words: \"nevertheless\" instead of \"but\", \"therefore\" for a closing sentence, \"primarily\" when you give your main point.", src: "writeWords" },
      { t: "\"Before all else\" is a strong way to start the first point. Use it only if it feels natural.", src: "writeWords" },
      { t: "Use at least two complex sentences with words like although, even though or even if.", src: "writeAll" },
    ],
    note: "The Baby Steps guide in this app also suggests acknowledging the other side with \"Some people may argue ...\". Both styles work. Pick the one that feels like you.",
  },
  /* ---------------- SPEAKING ---------------- */
  {
    id: "speaking1", skill: "Speaking", name: "Speaking Task 1: Giving Advice", short: "Speaking 1", icon: "mic", prep: 30, speak: 90,
    meta: "30 sec prep · 90 sec speaking",
    summary: "Give a friend or family member two or three pieces of advice, with reasons.",
    lesson: {
      intro: "You talk to a friend, neighbour or family member who has a problem. Be warm and give advice with reasons.",
      points: ["Informal tone, because you know the person.", "Two or three pieces of advice, each with a reason.", "A friendly closing line."],
      steps: ["Greet them by name and name the problem.", "Give advice one: say it, give a reason, add a small example.", "Give advice two (and three if you can) the same way.", "Wrap up with a warm line like \"Hope this helps. Let me know how it goes.\""],
      example: "\"Hey Sam, how is it going? I heard about your late nights, and I have a few ideas. Let's start with turning off your phone an hour before bed ...\"",
    },
    tips: [
      { t: "Start with \"Hey\" and a name, then ask \"how's it going?\". Skip \"how are you?\" and skip very fancy lines like \"I hope you are well\". The person is a friend.", src: "speakTemplates" },
      { t: "Say what you heard: \"I heard about your problem and I have a few suggestions.\" It leads smoothly into your first idea.", src: "speakTemplates" },
      { t: "Instead of firstly, secondly, thirdly, try \"let's start with\", \"on top of that\" and \"accordingly\". Mixing connector styles shows range.", src: "speakTemplates" },
      { t: "Plan about 60 seconds for the three suggestions and about 30 seconds for the opening and closing.", src: "speakTemplates" },
      { t: "Finish informally: \"I hope these steps work out for you. Let me know what you think. Cheers.\"", src: "speakTemplates" },
    ],
    prompts: [
      "Your cousin Dev has started a new job and feels tired all the time because he stays up late on his phone. Give him advice.",
      "Your neighbour Marta wants to learn to drive but feels nervous. Give her advice on how to start.",
      "Your friend Tom must choose between a noisy apartment close to work and a quiet one an hour away. Advise him.",
    ],
    checks: ["I greeted the person by name", "I gave at least two pieces of advice", "Each piece had a reason", "I used a friendly tone", "I ended warmly before time ran out"],
  },
  {
    id: "speaking2", skill: "Speaking", name: "Speaking Task 2: Personal Experience", short: "Speaking 2", icon: "mic", prep: 30, speak: 60,
    meta: "30 sec prep · 60 sec speaking",
    summary: "Tell a short story about something that happened to you.",
    lesson: {
      intro: "You talk about a past event, a place or something you own. The examiner wants a clear little story with a feeling.",
      points: ["Set the scene: when, where, who.", "Two or three moments in order.", "How it ended and what it meant to you."],
      steps: ["Start with a full sentence that sets the scene.", "Tell the main moments, using words like first, then, in the end.", "Add one feeling or detail that makes it real.", "Finish with one line about what it meant to you."],
      example: "\"Considering the trips I have taken, Vancouver was my favourite. Mainly because of the food ...\"",
    },
    tips: [
      { t: "Open with a sentence that has two parts, like \"Considering my recent trips, I would pick Vancouver as my favourite.\" It shows range right away.", src: "speakTemplates" },
      { t: "Start your first point with \"mainly\" or a similar word. Add a second point naturally with \"on top of that\" and do not force a connector every time.", src: "speakTemplates" },
      { t: "The question usually asks why it mattered. Include one emotional point, like \"since I went with my family, it became a memorable trip\".", src: "speakTemplates" },
      { t: "Close with a strong, simple word like \"certainly\" rather than the usual \"in conclusion\".", src: "speakTemplates" },
      { t: "Stay in the past tense from start to finish." },
    ],
    prompts: [
      "Talk about a time you learned something new from a friend or coworker.",
      "Talk about a time you were late for something important.",
      "Talk about a meal you will never forget.",
    ],
    checks: ["I set the scene (when, where, who)", "I told it in order", "I stayed in the past tense", "I added a feeling or detail", "I ended with a short reflection"],
  },
  {
    id: "speaking3", skill: "Speaking", name: "Speaking Task 3: Describing a Scene", short: "Speaking 3", icon: "mic", prep: 30, speak: 60,
    meta: "30 sec prep · 60 sec speaking",
    summary: "Describe a picture clearly. Practice here uses scenes written in words.",
    lesson: {
      intro: "You see a photo and describe it. The same photo comes back in Task 4. Speak in a clear order so a listener can picture it.",
      points: ["Start with the big picture.", "Move around the scene: left, right, center, foreground, background.", "One summary sentence at the end."],
      steps: ["Open with what the scene is: \"This picture shows a busy market on a sunny day.\"", "Go around the picture in a clear order.", "Use connectors when you move from one area to the next.", "Finish with one overall sentence."],
      example: "\"In the foreground, a vendor is arranging apples, while in the background, people line up at a coffee stand.\"",
    },
    tips: [
      { t: "Open by saying what the picture shows, using a stronger word than \"see\" (for example \"portrays\").", src: "speakTemplates" },
      { t: "Link each area with connectors like furthermore, moreover, likewise or what's more.", src: "speakTemplates" },
      { t: "Say \"foreground\" and \"background\" when you describe where things are, for example \"in the foreground one can notice ... while in the background we can see ...\".", src: "speakTemplates" },
      { t: "Mix your sentences: \"I can see\", \"I can tell\" and \"one can notice\".", src: "speakTemplates" },
      { t: "Finish with a single \"overall\" sentence that sums up the picture.", src: "speakTemplates" },
    ],
    prompts: [
      "Picture this: A small farmers market on a sunny Saturday. In the front, a seller hands a bag of tomatoes to a child. On the left, a band plays guitar. In the back, a long line waits at a coffee truck. Describe the scene.",
      "Picture this: A rainy bus stop at rush hour. In front, a woman shares her umbrella with an older man. On the right, a teenager checks his phone. In the background, a bus is pulling in. Describe the scene.",
      "Picture this: A school gym set up for a science fair. In the center, two students show a model volcano. On the left, a judge writes notes. At the back, parents take photos. Describe the scene.",
    ],
    checks: ["I opened with the big picture", "I used left, right or center words", "I used foreground and background", "I used connectors between areas", "I ended with an overall sentence"],
  },
  {
    id: "speaking4", skill: "Speaking", name: "Speaking Task 4: Making Predictions", short: "Speaking 4", icon: "mic", prep: 30, speak: 60,
    meta: "30 sec prep · 60 sec speaking",
    summary: "Use the same scene as Task 3 and say what will probably happen next.",
    lesson: {
      intro: "It is the same picture as Task 3. Now you say what is likely to happen next, using careful, \"maybe\" language.",
      points: ["Predict, do not state facts.", "One big overall prediction, then smaller ones.", "Close with a short wrap up."],
      steps: ["Say your main prediction first.", "Add two or three smaller likely events, with reasons.", "Use words like will likely, may, perhaps, is very possible.", "End with \"these are the most likely outcomes\"."],
      example: "\"What is most likely to happen next is that the line at the coffee truck will grow, and the band may attract a small crowd.\"",
    },
    tips: [
      { t: "Open with \"What is most likely to happen next is ...\" and then one overall prediction for the scene.", src: "speakTemplates" },
      { t: "Avoid certain words like \"will happen\". Use \"will likely\", \"it is very possible\", \"may\", \"perhaps\".", src: "speakTemplates" },
      { t: "Finish with \"In my opinion, these are the most plausible outcomes\" or something like it, not a generic \"to conclude\".", src: "speakTemplates" },
    ],
    prompts: [
      "Use the farmers market scene from Task 3. What do you think will happen next?",
      "Use the rainy bus stop scene from Task 3. What do you think will happen next?",
      "Use the school science fair scene from Task 3. What do you think will happen next?",
    ],
    checks: ["I opened with one overall prediction", "I used soft words like likely and may", "I gave two or three smaller predictions", "I gave reasons", "I ended with a short wrap up"],
  },
  {
    id: "speaking5", skill: "Speaking", name: "Speaking Task 5: Comparing and Persuading", short: "Speaking 5", icon: "mic", prep: 60, speak: 60,
    meta: "60 sec prep · 60 sec speaking",
    summary: "Compare two options and gently convince the other person to pick yours.",
    lesson: {
      intro: "You see two options and a friend who prefers one. You pick the other and explain why it is better.",
      points: ["Say hello and go straight to the options.", "Cover the points shown for each option.", "Be polite and open to their view."],
      steps: ["Greet them and jump into the options.", "Sentence two compares: \"While you like A for ..., I think B is better because ...\".", "Move through the other points with likewise and nevertheless.", "Close warmly and invite their view."],
      example: "\"While you prefer the bike for the environment, I believe a car is more suitable because of the convenience.\"",
    },
    tips: [
      { t: "Say \"Hey\" if informal, \"Hello\" if neutral, \"Hi there\" if formal. Then say \"Let's jump right into the options\".", src: "speakTemplates" },
      { t: "Make your second sentence a compare sentence: \"While you prefer ... for ..., I believe ... is better because ...\". It covers two clauses and several points at once.", src: "speakTemplates" },
      { t: "Link points with \"likewise\". When you need \"but\", try \"nevertheless\" or \"nonetheless\".", src: "speakTemplates" },
      { t: "Close with \"I hope you can relate to my thoughts, but I am open to your feedback. Let me know what you think.\"", src: "speakTemplates" },
    ],
    prompts: [
      "Your friend wants to rent a quiet apartment far from downtown. You prefer a smaller place near downtown with shorter commutes. Persuade your friend. Use these points: price, commute, noise, space.",
      "Your sister prefers to buy a cheap laptop for school. You think a slightly better one is worth the money. Persuade her. Use these points: price, battery, speed, warranty.",
    ],
    checks: ["I greeted and moved straight to the options", "I compared with a \"while ... I believe\" sentence", "I covered every point listed", "I stayed polite", "I invited their view at the end"],
  },
  {
    id: "speaking6", skill: "Speaking", name: "Speaking Task 6: Difficult Situation", short: "Speaking 6", icon: "mic", prep: 60, speak: 60,
    meta: "60 sec prep · 60 sec speaking",
    summary: "Explain bad news kindly and offer a fix.",
    lesson: {
      intro: "You must tell someone something they will not like, such as a cancelled plan or a refused refund. Show you care, be clear, and offer a solution.",
      points: ["Greet, then name the situation with care.", "Say the hard thing clearly.", "Offer a fix and ask for their view."],
      steps: ["Open politely.", "Show you understand how they feel.", "Say the bad news: \"Unfortunately, ...\".", "Offer a solution and ask what they think."],
      example: "\"I understand how disappointing this is. Unfortunately, I cannot issue a refund, but I can offer you a $20 store credit.\"",
    },
    tips: [
      { t: "Pick the greeting that fits: \"Hey\" for informal, \"Hello\" for formal.", src: "speakTemplates" },
      { t: "Show feeling: \"I understand this is the situation\" or \"I wish we could have done something for you\". The task checks how well you handle emotions.", src: "speakTemplates" },
      { t: "Say the bad news clearly and kindly with \"Unfortunately\".", src: "speakTemplates" },
      { t: "\"It is clear that ...\" is a good way to state the outcome with some range.", src: "speakTemplates" },
      { t: "Always give a resolution, like a store credit or a new date. Then finish with \"Let me know how you feel about this\".", src: "speakTemplates" },
    ],
    prompts: [
      "You are a gym manager. A member wants a refund for a yearly pass, but the policy does not allow refunds. Explain this to the member.",
      "You must tell your friend that you cannot go to her wedding because of a work trip. Explain the situation to her.",
      "A neighbour's package was delivered to your door two weeks ago and was accidentally thrown out. Tell your neighbour what happened.",
    ],
    checks: ["I opened politely", "I showed I understand their feelings", "I said the bad news clearly", "I offered a fix", "I asked for their view"],
  },
  {
    id: "speaking7", skill: "Speaking", name: "Speaking Task 7: Expressing Opinions", short: "Speaking 7", icon: "mic", prep: 30, speak: 90,
    meta: "30 sec prep · 90 sec speaking",
    summary: "Give your opinion on a topic with three reasons.",
    lesson: {
      intro: "You get a yes or no style question. State your view in the first sentence and support it with three clear points.",
      points: ["State your opinion at the start.", "Three points, each with a reason.", "A strong closing line that repeats your view."],
      steps: ["Open with the other view, then your own: \"While many think ..., I believe ...\".", "Make three points in a clear order.", "Support each with a quick reason or example.", "Close by restating your opinion."],
      example: "\"While many assume remote work hurts teamwork, I believe it can help. First and foremost, ...\"",
    },
    tips: [
      { t: "Open with a two part sentence: \"While many assume ..., I am of the belief that ...\". Your opinion is in the very first sentence.", src: "speakTemplates" },
      { t: "Make three points. Link them with \"first and foremost\", \"in much the same way\" and \"another clear fact staring us in the face is ...\".", src: "speakTemplates" },
      { t: "A debate question welcomes firm language. Say it with confidence.", src: "speakTemplates" },
      { t: "Close with \"In conclusion, one can say without doubt that ...\" and say your opinion again in new words.", src: "speakTemplates" },
      { t: "Like Task 1, this is a 90 second task. Plan roughly 20 seconds per point.", src: "speakTemplates" },
    ],
    prompts: [
      "Some people think cities should add more bike lanes even if it means fewer parking spots. What is your opinion?",
      "Should schools start later in the morning? Give your opinion and explain.",
      "Do you think people spend too much time on their phones? Give your opinion and reasons.",
    ],
    checks: ["My opinion was in my first sentence", "I made three points", "Each point had a reason", "I sounded confident", "I closed by repeating my view"],
  },
  {
    id: "speaking8", skill: "Speaking", name: "Speaking Task 8: Unusual Situation", short: "Speaking 8", icon: "mic", prep: 30, speak: 60,
    meta: "30 sec prep · 60 sec speaking",
    summary: "Describe an odd picture or situation so well that the listener understands it.",
    lesson: {
      intro: "You see something unusual and talk about it to a person, such as a friend or a company. The situations vary a lot, so follow the question and stay natural.",
      points: ["Greet the right way for the person.", "Describe the situation with feeling.", "End the way the situation asks (help, idea, more information)."],
      steps: ["Greet and say you have something to share.", "Describe what you see in a clear order.", "Add how you feel about it: surprisingly, interestingly, clearly.", "Finish to match the task."],
      example: "\"Hi, I have something odd to tell you. Surprisingly, there is a cow standing in the middle of the parking lot ...\"",
    },
    tips: [
      { t: "If you speak to a company, start \"Hi there, my name is ...\". If it is a friend, \"Hey, how's it going?\". Then say \"I've got something to share\" (an idea, a picture, a scenario).", src: "speakTemplates" },
      { t: "Use feeling words as connectors: \"surprisingly\", \"interestingly\", \"clearly\". They push you toward a natural, chatty style.", src: "speakTemplates" },
      { t: "There is no fixed ending. Read the question: do you ask for help, share an idea, or ask for more information? End that way.", src: "speakTemplates" },
    ],
    prompts: [
      "Picture this: You walk into your office and see a small tent set up beside your desk, with a sleeping bag inside. Describe the situation to your manager.",
      "Picture this: At a bakery, you see a cake shaped like a giant sneaker on the front table. Describe it to your friend who loves baking.",
    ],
    checks: ["I greeted in the right way", "I described the scene in a clear order", "I added how I feel about it", "I ended in the way the task asked", "I finished before time ran out"],
  },
];
