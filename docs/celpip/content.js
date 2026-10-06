/* CELPIP Coach v4 · content
   Personal practice content for Afolabi (Oakville, ON). Plain warm language, no em dashes.
   Model answers are written to CLB 10 level and kept between 150 and 200 words (body, without the subject line). */
"use strict";

const LEARNER = {
  name: "Afolabi",
  fullName: "Afolabi Adesina",
  city: "Oakville, Ontario",
  target: 10,
  challengeStart: "2026-10-05",
  challengeEnd: "2026-11-03",
};

/* ---------- Task 1 · email prompts (27 minutes, 150 to 200 words) ---------- */
const T1_PROMPTS = [];

T1_PROMPTS.push({
  id: "t1-heat",
  title: "Heating and dishwasher",
  tag: "Home",
  icon: "🏠",
  to: "the building manager",
  situation:
    "You rent a one-bedroom apartment in a building in Oakville. For the past week, the heating vents in your living room and bedroom have been blowing cold air, and your dishwasher has stopped draining. You reported both problems to the front desk five days ago, but nobody has come to fix them.",
  bullets: [
    "Describe the problems with your apartment",
    "Explain how these problems are affecting you",
    "Say what you would like the building manager to do",
  ],
  keywords: ["heat", "vent", "dishwasher", "drain", "unit", "technician", "repair"],
  model: {
    subject: "Heating and dishwasher repairs needed in Unit 1408",
    body: `Dear Ms. Patel,

My name is Afolabi Adesina, and I rent Unit 1408 at 2150 Trafalgar Road. I am writing to follow up on two maintenance issues that I reported to the front desk on Thursday, October 1.

First, the heating vents in my living room and bedroom have been blowing only cold air for about a week. Second, my dishwasher no longer drains, so dirty water stays at the bottom after every cycle.

These problems are making daily life difficult. Since the nights in Oakville are getting colder, I have had trouble sleeping, and I have been studying at home in a jacket. I have also been washing every dish by hand, which takes time I need for my college assignments and job applications.

Could you please arrange for a technician to inspect both the heating and the dishwasher by Friday, October 9? I am available any weekday after 3 p.m., and I am happy to let maintenance in with a key if that is easier.

Thank you for your help. I look forward to hearing from you.

Best regards,
Afolabi Adesina`,
  },
  highlights: [
    { p: "My name is Afolabi Adesina, and I rent Unit 1408", why: "Who I am in one clean line. No 'meets you well' filler. The reader knows who you are in 3 seconds." },
    { p: "I am writing to follow up on", why: "A calm, professional way to say 'I already told you once'. No blame, but it is firm." },
    { p: "First,", why: "Signposts like First and Second make the email easy to follow. Examiners call this coherence." },
    { p: "Since the nights in Oakville are getting colder", why: "Real detail about how it hurts you. Specific details push you from CLB 8 to CLB 10." },
    { p: "Could you please arrange for a technician", why: "A polite, clear ask. This replaces your Day 1 threat about public works." },
    { p: "by Friday, October 9", why: "A polite timeline with a real date. Firm, never rude." },
  ],
  why: [
    "All three bullets are answered, each in its own paragraph.",
    "The tone is firm but friendly. There is no threat anywhere.",
    "Sentences are short and clear. None is longer than 35 words.",
    "The sign-off name matches the name in the first line.",
  ],
});

T1_PROMPTS.push({
  id: "t1-coop",
  title: "Co-op deadline extension",
  tag: "Sheridan",
  icon: "🎓",
  to: "your co-op advisor",
  situation:
    "You are a student at Sheridan College in Oakville. Your co-op work term application, which includes an updated resume and a reference letter, is due this Friday. However, the person writing your reference letter is travelling and cannot send it until next week.",
  bullets: [
    "Explain your situation",
    "Ask for an extension and suggest a new date",
    "Describe what you have already completed",
  ],
  keywords: ["co-op", "deadline", "extension", "reference", "resume", "letter"],
  model: {
    subject: "Request for a short extension on my co-op application",
    body: `Dear Ms. Thompson,

I am Afolabi Adesina, a student in your co-op preparation group at Sheridan College. I am writing to ask for a short extension on my work term application, which is due this Friday, October 9.

Unfortunately, one part of my application is delayed. My reference letter is coming from my former supervisor at the Centre for Applied AI, but she is attending a conference overseas and can only send it on Tuesday, October 13.

The rest of my package is ready. I have updated my resume to highlight my SAP master data and procurement experience, finished my cover letter, and completed the online skills profile. I would not want one missing letter to delay my chances with employers this term.

Would it be possible to extend my deadline to Wednesday, October 14? If that does not work, I could submit everything else now and forward the letter as soon as it arrives.

Thank you for considering my request. I truly appreciate your support.

Kind regards,
Afolabi Adesina`,
  },
  highlights: [
    { p: "I am writing to ask for a short extension", why: "Why I write, said early and clearly. The word 'short' makes the request feel reasonable." },
    { p: "Unfortunately,", why: "A soft word that shows you are sorry about the problem without over-apologizing." },
    { p: "The rest of my package is ready.", why: "A short sentence after longer ones. Mixing lengths makes writing easy to read." },
    { p: "Would it be possible to extend my deadline to Wednesday, October 14?", why: "A polite question with an exact new date. This is the CLB 10 way to ask for time." },
    { p: "If that does not work, I could submit everything else now", why: "Offering a backup plan shows maturity and problem solving." },
  ],
  why: [
    "Each bullet has its own paragraph, so the examiner can tick them off fast.",
    "Specific details (Centre for Applied AI, SAP, dates) make it believable.",
    "Polite modal verbs: would, could. These soften the request.",
  ],
});

T1_PROMPTS.push({
  id: "t1-recruiter",
  title: "Recruiter thank-you and next steps",
  tag: "Job hunt",
  icon: "💼",
  to: "the recruiter",
  situation:
    "Last Tuesday, you had an in-person interview for a Junior Data Analyst position at a logistics company in Mississauga. The recruiter who arranged the interview was very helpful. You have not heard anything since the interview, and you have also received another job offer that needs an answer soon.",
  bullets: [
    "Thank the recruiter for their help",
    "Mention something you enjoyed about the interview",
    "Ask about the next steps and explain why you need to know soon",
  ],
  keywords: ["interview", "analyst", "thank", "next steps", "offer", "timeline"],
  model: {
    subject: "Thank you and next steps for the Junior Data Analyst role",
    body: `Dear Mr. Chen,

Thank you again for arranging my interview for the Junior Data Analyst position at NorthPath Logistics last Tuesday. Your clear instructions about the location and the panel made me feel well prepared.

I especially enjoyed speaking with the supply chain team about how they track late shipments. It was exciting to hear that they are moving their reports into Power BI, because I built similar dashboards when I worked in procurement at IHS Towers. The conversation made me even more interested in joining the company.

I am writing to ask whether there is an update on the hiring timeline. I have recently received another offer, and that employer has asked for my answer by Friday, October 16. NorthPath remains my first choice, so I would be grateful to know the next steps before I make a decision.

If the team needs any more information, such as references or work samples, I can send them right away.

Thank you for your time and support.

Best regards,
Afolabi Adesina`,
  },
  highlights: [
    { p: "Your clear instructions about the location and the panel made me feel well prepared.", why: "A specific thank-you. Saying exactly what helped sounds sincere, not robotic." },
    { p: "I especially enjoyed", why: "A warm, natural phrase that answers bullet 2 directly." },
    { p: "because I built similar dashboards when I worked in procurement at IHS Towers", why: "Connects the interview to your real experience. Detail plus relevance equals a high content score." },
    { p: "NorthPath remains my first choice", why: "Explains urgency without pressure. It is honest and polite." },
    { p: "I would be grateful to know the next steps", why: "A soft, formal ask. Much better than 'Did I get the job?'" },
  ],
  why: [
    "The tone is grateful and confident at the same time.",
    "The urgency (another offer) is explained politely with a date.",
    "It ends with a helpful offer, which leaves a good final impression.",
  ],
});

T1_PROMPTS.push({
  id: "t1-reference",
  title: "Reference request to former manager",
  tag: "Job hunt",
  icon: "🤝",
  to: "your former manager",
  situation:
    "You are applying for an SAP Master Data Analyst position with a large company in Toronto. The employer has asked for two professional references. You would like to ask your former manager from your previous job in Nigeria, but you have not spoken to this person in over a year.",
  bullets: [
    "Remind your former manager who you are and what you worked on together",
    "Explain the job you are applying for",
    "Ask them to be a reference and explain what they may need to do",
  ],
  keywords: ["reference", "sap", "master data", "manager", "position", "contact"],
  model: {
    subject: "Reference request for an SAP Master Data Analyst role",
    body: `Dear Mr. Okafor,

I hope you and the team at Lafarge Africa are doing well. It has been over a year since we last spoke, so I wanted to reach out to you personally.

As you may remember, I worked under your supervision on the supply chain team, where I cleaned and maintained vendor and material master data in SAP. I still use the lesson you taught me about checking every record before a system update.

I am now living in Oakville, Ontario, and I am applying for an SAP Master Data Analyst position with a manufacturing company in Toronto. The role focuses on data quality and supporting procurement, which closely matches the work we did together.

Would you be willing to act as one of my professional references? If you agree, the hiring team may contact you by email or phone within the next two weeks to ask about my skills and work habits. I would be happy to send you my updated resume and the job description.

Thank you very much for considering this.

Warm regards,
Afolabi Adesina`,
  },
  highlights: [
    { p: "I hope you and the team at Lafarge Africa are doing well.", why: "A real, personal greeting for someone you know. It is different from the empty 'meets you well' line because it names real people." },
    { p: "As you may remember,", why: "A gentle way to remind someone of the past without sounding pushy." },
    { p: "which closely matches the work we did together", why: "Links the new job to your shared history. It gives the manager a reason to say yes." },
    { p: "Would you be willing to act as one of my professional references?", why: "The key ask, as a polite question." },
    { p: "within the next two weeks", why: "Tells them what to expect and when. Clear and considerate." },
  ],
  why: [
    "It answers all three bullets in order.",
    "It respects the manager's time by explaining exactly what they need to do.",
    "Words like 'supervision', 'maintained', and 'closely matches' sound professional.",
  ],
});

T1_PROMPTS.push({
  id: "t1-go",
  title: "GO Train delay made you late",
  tag: "Transit",
  icon: "🚆",
  to: "GO Transit customer service",
  situation:
    "Yesterday, you took a GO Transit train from Oakville to Union Station for an important job interview in downtown Toronto. The train was stopped for over an hour because of a signal problem, and you arrived 40 minutes late. Staff on the train gave very little information.",
  bullets: [
    "Describe what happened",
    "Explain how the delay affected you",
    "Say what you would like GO Transit to do",
  ],
  keywords: ["train", "delay", "go transit", "interview", "late", "refund"],
  model: {
    subject: "Lakeshore West delay on October 5 and refund request",
    body: `Dear GO Transit Customer Service,

I am a regular Lakeshore West rider from Oakville, and I am writing about a serious delay on Monday, October 5. I boarded the 8:13 a.m. train to Union Station, but it stopped near Long Branch for more than an hour because of a signal problem.

During that time, the staff made only two short announcements, and neither one gave an expected arrival time. As a result, I could not tell the employer how late I would be.

This delay had a real cost for me. I was travelling to a final interview for an analyst position in downtown Toronto, and I arrived 40 minutes late. Although the manager kindly agreed to meet me, the interview was shortened, and I felt rushed and unprepared.

I would appreciate a full refund of my fare for that trip. I would also ask you to consider giving passengers clearer updates during long delays, so that people can make other plans.

Thank you for looking into this matter.

Sincerely,
Afolabi Adesina`,
  },
  highlights: [
    { p: "I boarded the 8:13 a.m. train to Union Station", why: "Exact facts (time, station) make a complaint believable and easy to check." },
    { p: "As a result,", why: "A cause and effect connector. It shows how one idea leads to the next." },
    { p: "This delay had a real cost for me.", why: "A short topic sentence that opens the 'how it hurts me' paragraph." },
    { p: "Although the manager kindly agreed to meet me", why: "Starting with Although shows complex grammar, a CLB 10 signal." },
    { p: "I would appreciate a full refund", why: "Firm and polite. No threat, no demand, but very clear." },
  ],
  why: [
    "A complaint that stays calm scores higher than an angry one.",
    "It asks for a fix (refund) and a better process (clearer updates).",
    "Strong time and place details answer 'Describe what happened'.",
  ],
});

T1_PROMPTS.push({
  id: "t1-rent",
  title: "Rent increase notice",
  tag: "Home",
  icon: "🧾",
  to: "your landlord",
  situation:
    "You rent an apartment in Oakville. Yesterday, you received a letter from your landlord saying your rent will increase by 8 percent starting next month. You believe the notice is too short and the increase is higher than you expected. You want to keep living in the apartment.",
  bullets: [
    "Explain why you are writing",
    "Explain your concerns about the increase",
    "Suggest a solution",
  ],
  keywords: ["rent", "increase", "notice", "percent", "landlord", "solution"],
  model: {
    subject: "Question about the rent increase notice for Unit 1408",
    body: `Dear Mr. Russo,

I am Afolabi Adesina, the tenant in Unit 1408, and I have rented this apartment for almost two years. I am writing about the letter I received on October 5, which says that my rent will rise by 8 percent starting November 1.

I have some concerns about this notice. First, I understand that landlords in Ontario usually need to give tenants 90 days of written notice before a rent increase, and this letter gives me less than one month. Second, an 8 percent increase is much higher than I expected, especially since I am a full-time student on a fixed budget.

I really enjoy living here, and I have always paid my rent on time, so I would like to find a fair solution. Would you consider delaying the increase until February 1, 2027, and reviewing the amount? I would be happy to meet in person or talk by phone next week.

Thank you for your understanding. I look forward to your reply.

Best regards,
Afolabi Adesina`,
  },
  highlights: [
    { p: "I understand that landlords in Ontario usually need to give tenants 90 days of written notice", why: "Mentions the rule calmly as a fact, not as a threat. Compare: 'This is illegal and I will report you.'" },
    { p: "especially since I am a full-time student on a fixed budget", why: "Personal impact in a few words. It builds sympathy." },
    { p: "I have always paid my rent on time", why: "Shows you are a good tenant. This makes your request stronger." },
    { p: "Would you consider delaying the increase", why: "Suggests a solution as a question, which keeps the relationship friendly." },
  ],
  why: [
    "It disagrees politely, which is a hard CLB 10 skill.",
    "First and Second organize the concerns clearly.",
    "It offers a meeting, which shows goodwill.",
  ],
});

T1_PROMPTS.push({
  id: "t1-noise",
  title: "Noisy upstairs neighbour",
  tag: "Home",
  icon: "🔊",
  to: "your neighbour",
  situation:
    "You live in an apartment building in Oakville. For the past two weeks, the neighbour who lives above you has been moving furniture and playing loud music late at night, often after midnight. You have never met this neighbour. You have early classes and a part-time job.",
  bullets: [
    "Introduce yourself",
    "Describe the problem and how it affects you",
    "Suggest a solution",
  ],
  keywords: ["noise", "music", "neighbour", "night", "sleep", "furniture"],
  model: {
    subject: "A friendly note from your downstairs neighbour",
    body: `Dear Neighbour,

My name is Afolabi, and I live in Unit 1308, directly below your apartment. We have not met yet, so I wanted to introduce myself and reach out in a friendly way.

For the past two weeks, I have heard loud music and furniture moving late at night, often after midnight. You may not realize how easily sound travels between our floors, since the building is quite old.

Unfortunately, the noise has been keeping me awake. I have early classes at Sheridan College three days a week, and on weekends I work morning shifts. When I lose sleep, it is hard for me to focus in class and at work.

Would it be possible to keep the music lower and avoid moving furniture after 11 p.m. on weeknights? A rug under the furniture might also help. If it is easier to talk in person, please feel free to knock on my door any evening.

Thank you for understanding. I am glad to have you as a neighbour.

Best wishes,
Afolabi`,
  },
  highlights: [
    { p: "reach out in a friendly way", why: "Sets a kind tone from the start. Neighbours respond better to kindness." },
    { p: "You may not realize how easily sound travels", why: "Gives the neighbour an easy excuse, so they do not feel attacked. Very diplomatic." },
    { p: "When I lose sleep, it is hard for me to focus in class and at work.", why: "Clear impact without drama." },
    { p: "Would it be possible to keep the music lower", why: "A soft request with a clear time limit (after 11 p.m.)." },
    { p: "please feel free to knock on my door", why: "An open, friendly invitation. Great for a semi-formal email." },
  ],
  why: [
    "Semi-formal tone: friendly, but still polished.",
    "It offers two practical solutions (a time limit and a rug).",
    "No blame words like 'rude' or 'selfish'.",
  ],
});

T1_PROMPTS.push({
  id: "t1-reschedule",
  title: "Reschedule an interview",
  tag: "Job hunt",
  icon: "📅",
  to: "the hiring manager",
  situation:
    "You have an interview scheduled for next Thursday at 10 a.m. for a Business Analyst co-op position at a bank in Toronto. Yesterday, your professor told you that a required midterm exam has been moved to the same morning.",
  bullets: [
    "Explain why you cannot attend at the scheduled time",
    "Show that you are still interested in the position",
    "Suggest other times when you are available",
  ],
  keywords: ["interview", "reschedule", "exam", "available", "position", "thursday"],
  model: {
    subject: "Request to reschedule my interview on Thursday, October 15",
    body: `Dear Ms. Lewis,

Thank you again for inviting me to interview for the Business Analyst co-op position. Unfortunately, I am writing to ask whether my interview on Thursday, October 15 at 10 a.m. could be moved.

Yesterday, my professor at Sheridan College announced that our required midterm exam has been rescheduled to that same morning. Since the exam counts for 30 percent of my final grade, I am not able to miss it.

I want to assure you that I am still very interested in this role. I was excited to read that your team is improving its reporting processes, and I believe my background in data analysis and SAP would allow me to contribute quickly.

I am available at any of the following times: Wednesday, October 14 after 1 p.m., Thursday, October 15 after 2 p.m., or anytime on Friday, October 16. I am also happy to meet by video call if that is more convenient.

I apologize for any inconvenience, and I appreciate your flexibility.

Kind regards,
Afolabi Adesina`,
  },
  highlights: [
    { p: "Since the exam counts for 30 percent of my final grade", why: "A specific, sensible reason. The manager will understand right away." },
    { p: "I want to assure you that I am still very interested in this role.", why: "Answers bullet 2 directly. 'Assure' is a strong, formal verb." },
    { p: "I am available at any of the following times:", why: "Giving several exact options makes it easy to say yes." },
    { p: "I apologize for any inconvenience, and I appreciate your flexibility.", why: "A professional close that shows respect for their time." },
  ],
  why: [
    "Clear reason, clear interest, clear options. All three bullets done.",
    "A colon list of times is easy to read.",
    "Polite and confident at the same time.",
  ],
});

T1_PROMPTS.push({
  id: "t1-gym",
  title: "Cancel a gym membership",
  tag: "Oakville",
  icon: "🏋️",
  to: "the gym manager",
  situation:
    "Six months ago, you signed up for a 12-month membership at a gym in Oakville. You now have a co-op placement in Toronto with long commuting hours, and you can no longer use the gym. When you called to cancel, the staff said you must pay a large cancellation fee.",
  bullets: [
    "Explain your situation",
    "Explain why you think the fee is unfair",
    "Say what you would like the manager to do",
  ],
  keywords: ["membership", "cancel", "fee", "gym", "commute", "waive"],
  model: {
    subject: "Membership cancellation request, member ID 40721",
    body: `Dear Gym Manager,

I have been a member of your Oakville location since April, and my member ID is 40721. I am writing to ask for your help with cancelling my membership.

This month, I started a co-op placement in downtown Toronto. Because of my long commute on the GO train, I leave home at 6:30 a.m. and return after 7 p.m. As a result, I have not been able to visit the gym at all in the past three weeks.

When I called on Monday to cancel, a staff member told me I would need to pay a $250 cancellation fee. I find this fee unfair, because I have made every monthly payment on time, and my situation changed for work reasons that I could not control.

Would you consider waiving the fee or reducing it to one month's payment? Alternatively, I would be happy to freeze my membership until my placement ends in April, if that option is available.

Thank you for taking the time to review my request. I hope we can find a fair solution.

Sincerely,
Afolabi Adesina`,
  },
  highlights: [
    { p: "my member ID is 40721", why: "A helpful detail. It shows you are organized and makes the request easy to process." },
    { p: "I leave home at 6:30 a.m. and return after 7 p.m.", why: "Numbers paint a clear picture of the problem." },
    { p: "I find this fee unfair, because", why: "States disagreement politely, then gives a reason." },
    { p: "Alternatively,", why: "A high-level connector that offers a second option." },
    { p: "I hope we can find a fair solution.", why: "Ends on teamwork, not conflict." },
  ],
  why: [
    "Disagreement with evidence, not emotion.",
    "Two solutions make it easy for the manager to help.",
    "Short paragraphs that match the three bullets.",
  ],
});

T1_PROMPTS.push({
  id: "t1-professor",
  title: "Research assistant opportunity",
  tag: "Sheridan",
  icon: "🔬",
  to: "the professor",
  situation:
    "You recently saw a notice that a professor at your college is looking for a part-time research assistant for a project about using artificial intelligence to improve supply chains. You have some related experience and would like to apply, but the notice did not give many details.",
  bullets: [
    "Introduce yourself and describe your experience",
    "Explain why you are interested in the project",
    "Ask for more information about the position",
  ],
  keywords: ["research", "assistant", "project", "experience", "supply chain", "information"],
  noAsk: true,
  model: {
    subject: "Interest in the AI supply chain research assistant position",
    body: `Dear Professor Singh,

My name is Afolabi Adesina, and I am a student at Sheridan College. I recently saw your notice about a part-time research assistant role on using artificial intelligence to improve supply chains, and I am very interested in applying.

I believe my background is a strong match. Until recently, I worked as a Student Research Assistant at Sheridan's Centre for Applied AI, where I cleaned datasets and prepared summaries for the research team. Before moving to Canada, I spent several years in procurement and SAP master data at Lafarge Africa and IHS Towers.

This project interests me because I have seen how poor data causes late deliveries and extra costs. I would love to help find practical ways to solve those problems.

Could you please share a few more details about the role? In particular, I would like to know how many hours per week are expected, when the project would begin, and whether you would prefer a resume and cover letter or an online application.

Thank you for your time. I look forward to hearing from you.

Best regards,
Afolabi Adesina`,
  },
  highlights: [
    { p: "I believe my background is a strong match.", why: "A confident topic sentence. The next lines prove it." },
    { p: "where I cleaned datasets and prepared summaries", why: "Action verbs (cleaned, prepared) show real skills." },
    { p: "because I have seen how poor data causes late deliveries and extra costs", why: "A personal, specific reason for interest. Much stronger than 'it sounds fun'." },
    { p: "In particular,", why: "Introduces a list of exact questions. Very organized." },
  ],
  why: [
    "It sells your experience without bragging.",
    "The questions are specific and easy to answer.",
    "Formal greeting with the professor's title.",
  ],
});

T1_PROMPTS.push({
  id: "t1-niagara",
  title: "Recommend a Niagara weekend",
  tag: "Friends",
  icon: "🍁",
  to: "your friend",
  situation:
    "A friend who recently moved to Canada wants to plan a weekend trip and has asked for your advice. Last month, you spent a weekend in Niagara Falls and Niagara-on-the-Lake and enjoyed it very much.",
  bullets: [
    "Recommend the trip and explain why",
    "Suggest activities and places to visit",
    "Give advice about travel or budget",
  ],
  keywords: ["niagara", "weekend", "trip", "falls", "recommend", "train"],
  noAsk: true,
  model: {
    subject: "My tips for a Niagara weekend",
    body: `Hi Tunde,

It was great to hear from you! Since you asked for weekend ideas, I strongly recommend a trip to Niagara. I went last month, and it was one of my favourite weekends since I moved to Ontario.

The best part is that you get two very different experiences in one trip. Niagara Falls is exciting and busy, while Niagara-on-the-Lake is calm, with old buildings, small shops, and beautiful views of the lake.

On your first day, I suggest taking the boat tour that goes close to the falls. Bring a light jacket, because you will definitely get wet! In the evening, walk along the river to see the falls lit up in different colours. The next morning, rent a bike in Niagara-on-the-Lake and ride past the orchards and wineries.

To save money, take the GO train on a weekend instead of driving, since parking near the falls is expensive. Also, book your hotel early, because prices rise quickly on Saturdays.

Let me know if you want help planning. Enjoy your trip!

Cheers,
Afolabi`,
  },
  highlights: [
    { p: "I strongly recommend a trip to Niagara", why: "Answers bullet 1 in the first paragraph. Clear and enthusiastic." },
    { p: "while Niagara-on-the-Lake is calm", why: "'While' compares two things in one smooth sentence." },
    { p: "On your first day,", why: "Time order (first day, evening, next morning) makes the plan easy to follow." },
    { p: "To save money,", why: "Opens the budget paragraph so the reader knows the topic right away." },
    { p: "Cheers,", why: "An informal sign-off is fine for a friend. Match the tone to the reader." },
  ],
  why: [
    "Informal, but still well organized and correct.",
    "Lots of specific, vivid details.",
    "Practical advice with reasons (because, since).",
  ],
});

T1_PROMPTS.push({
  id: "t1-serviceontario",
  title: "ServiceOntario card delay",
  tag: "Oakville",
  icon: "🪪",
  to: "ServiceOntario",
  situation:
    "Eight weeks ago, you applied in person at a ServiceOntario centre for your new Ontario driver's licence card. You were told the card would arrive by mail within six weeks, but it has not arrived. Your temporary paper licence will expire soon, and a new employer needs to see government photo ID.",
  bullets: [
    "Explain what you applied for and when",
    "Describe the problems this delay is causing",
    "Ask for specific help",
  ],
  keywords: ["licence", "serviceontario", "card", "temporary", "delay", "replacement"],
  model: {
    subject: "Delayed driver's licence card, application from August 10",
    body: `Dear ServiceOntario,

I am writing about my Ontario driver's licence card, which I applied for in person at the Oakville ServiceOntario centre on August 10. At that time, I was told that the card would arrive by mail within six weeks. It has now been eight weeks, and I have not received it.

This delay is creating several problems for me. My temporary paper licence expires on October 20, and after that date I will not have valid photo identification other than my passport. I have also just accepted a contract position, and the employer needs to see government photo ID before my first day.

I have already confirmed that my mailing address on file is correct, and my building manager has checked that no mail was returned.

Could you please check the status of my application and let me know when my card will be mailed? If it has been lost, I would appreciate it if you could issue a replacement at no cost, along with a new temporary licence.

Thank you for your assistance.

Sincerely,
Afolabi Adesina`,
  },
  highlights: [
    { p: "which I applied for in person at the Oakville ServiceOntario centre on August 10", why: "What, where, and when in one sentence. Officials love clear facts." },
    { p: "This delay is creating several problems for me.", why: "A topic sentence that previews the impact paragraph." },
    { p: "I have already confirmed that my mailing address on file is correct", why: "Shows you did your part, so the reader cannot blame you." },
    { p: "I would appreciate it if you could issue a replacement at no cost", why: "A polite conditional request. Firm, never rude." },
  ],
  why: [
    "Calm, factual, and complete.",
    "Two clear asks: check the status, then replace the card if it is lost.",
    "A good mix of short and long sentences.",
  ],
});

/* ---------- Task 2 · survey prompts (26 minutes, 150 to 200 words) ---------- */
const T2_PROMPTS = [];

T2_PROMPTS.push({
  id: "t2-transit",
  title: "Oakville: transit or parking?",
  icon: "🚌",
  situation: "The Town of Oakville has money for one new project near the downtown GO station. The town is asking residents which project they prefer.",
  optionA: "Build a large new parking garage for commuters who drive to the station.",
  optionB: "Add more frequent Oakville Transit bus routes to the station.",
  choice: "B",
  model: `I believe Option B, adding more frequent bus routes to the Oakville GO station, is the better use of the town's money.

First, better transit would help more people. A parking garage only serves commuters who own a car, but a bus network also helps students, seniors, and newcomers who cannot afford to drive. For example, many of my classmates at Sheridan College take the bus, and they often wait 30 minutes for a connection in the evening.

Second, more buses would reduce traffic and pollution. Every bus can take dozens of cars off the road during rush hour. On weekday mornings, the roads near the station are already crowded, so a large garage would likely attract even more traffic to the same area.

Some people may argue that a garage is more convenient for families who live far from bus stops. That is a fair point, but the town could add express routes to those areas instead of spending millions on concrete.

For these reasons, I strongly support Option B. It is a fairer and greener choice for Oakville.`,
  highlights: [
    { p: "I believe Option B", why: "Opinion in the very first sentence. The examiner knows your choice immediately." },
    { p: "First, better transit would help more people.", why: "Reason 1 as a short, clear topic sentence." },
    { p: "For example,", why: "Every reason needs an example. This one is from your real life at Sheridan." },
    { p: "Some people may argue that", why: "Talking about the other side shows mature thinking. A big CLB 10 signal." },
    { p: "That is a fair point, but", why: "Respect the other view, then explain why your choice is still better." },
  ],
  why: [
    "Follows the planner: opinion, reason 1 + example, reason 2 + example, other side, close.",
    "Each paragraph has one job.",
    "Strong vocabulary: afford, attract, convenient, express routes.",
  ],
});

T2_PROMPTS.push({
  id: "t2-remote",
  title: "Work from home or office?",
  icon: "🏢",
  situation: "Your employer is choosing a new work policy for all staff and has sent a survey to employees.",
  optionA: "Employees work from home full time.",
  optionB: "Employees work in the office at least three days a week.",
  choice: "B",
  model: `In my opinion, Option B, working in the office at least three days a week, is the better policy for our company.

The main reason is that working together in person builds stronger teams. When colleagues sit near each other, they can solve small problems in minutes instead of waiting for emails. For instance, during my time as a research assistant, I learned more from quick conversations at a shared table than from any online meeting.

Another reason is that office days help newer employees learn and grow. New staff can watch how experienced colleagues handle clients and difficult tasks, and managers can notice their efforts more easily. This kind of support is very difficult to get through a screen.

Of course, working from home saves commuting time and money, which matters a lot in the GTA. However, Option B still allows two remote days each week, so employees would keep some of that flexibility.

Overall, I believe Option B offers the best balance between teamwork and flexibility, so I would choose it without hesitation.`,
  highlights: [
    { p: "In my opinion,", why: "A clear opinion opener." },
    { p: "The main reason is that", why: "Signals your strongest reason first." },
    { p: "For instance,", why: "Another way to say 'for example'. Variety helps your vocabulary score." },
    { p: "Of course, working from home saves commuting time and money", why: "Admits the other side's best point honestly." },
    { p: "without hesitation", why: "A confident, natural phrase to finish strongly." },
  ],
  why: [
    "Clear structure with varied connectors.",
    "Uses a personal example from the Centre for Applied AI.",
    "Answers the other side by showing Option B keeps some flexibility.",
  ],
});

T2_PROMPTS.push({
  id: "t2-coop",
  title: "Should Sheridan require co-op?",
  icon: "🎓",
  situation: "Your college is considering a new rule for diploma programs and wants to hear from students.",
  optionA: "All diploma students must complete at least one paid co-op term before graduating.",
  optionB: "Co-op stays optional, so students can graduate sooner if they wish.",
  choice: "A",
  model: `I strongly believe that Option A, requiring every diploma student to complete one paid co-op term, is the better choice for our college.

First, co-op gives students real Canadian work experience before they graduate. Many employers in the GTA ask for local experience, even for entry-level jobs. A friend of mine applied to more than fifty positions after graduation and only started getting interviews after he completed a short placement.

Second, a paid placement helps students choose the right career and build a network. Students can test whether they enjoy a field, such as data analysis or supply chain, and they often leave with references and contacts. Some even receive full-time offers from the same employer.

On the other hand, some students may worry that co-op will delay graduation or that placements are hard to find. These concerns are understandable, but the college could solve them by offering stronger job search support and flexible term dates.

In conclusion, a required co-op term would prepare students for the job market far better than classes alone, so I fully support Option A.`,
  highlights: [
    { p: "I strongly believe that Option A", why: "Opinion plus 'strongly' shows confidence." },
    { p: "A friend of mine applied to more than fifty positions", why: "A specific story with a number makes the reason feel real." },
    { p: "such as data analysis or supply chain", why: "'Such as' gives examples inside a sentence." },
    { p: "These concerns are understandable, but", why: "A polite way to answer the other side." },
    { p: "In conclusion,", why: "A clear signal that you are closing." },
  ],
  why: [
    "Every reason has a concrete example.",
    "The other side is answered with a practical solution.",
    "The closing restates the choice in new words.",
  ],
});

T2_PROMPTS.push({
  id: "t2-centre",
  title: "Community centre funding",
  icon: "🏛️",
  situation: "Your neighbourhood community centre has received extra funding and is asking local residents how it should be spent.",
  optionA: "Offer free English conversation and job search workshops for newcomers.",
  optionB: "Build a new fitness room with modern exercise equipment.",
  choice: "A",
  model: `I would choose Option A, offering free English conversation and job search workshops for newcomers.

My main reason is that these workshops can change people's lives. Many newcomers arrive in Canada with strong education and experience, but they struggle to find work because they are not confident speaking English in interviews. A weekly conversation group would give them a safe place to practise. When I first arrived in Ontario, a free resume clinic at my local library helped me get my first interview within a month.

In addition, these programs benefit the whole community. When newcomers find jobs that match their skills, they pay more taxes, spend money at local businesses, and often volunteer. In this way, the investment returns to the neighbourhood many times over.

Admittedly, a fitness room would also be popular, and exercise is important for health. However, most people can already walk outside or join a private gym, while affordable language and career support is much harder to find.

For these reasons, I believe Option A is the more valuable choice for our community centre.`,
  highlights: [
    { p: "can change people's lives", why: "A strong, simple claim that grabs attention." },
    { p: "When I first arrived in Ontario", why: "Personal experience is powerful evidence in Task 2." },
    { p: "In addition,", why: "Adds reason 2 smoothly." },
    { p: "Admittedly,", why: "An advanced word to admit the other side has a point." },
    { p: "while affordable language and career support is much harder to find", why: "Compares the two options directly in one sentence." },
  ],
  why: [
    "A strong personal example plus community-level reasoning.",
    "Advanced connectors: In addition, Admittedly, However.",
    "A clear, short conclusion.",
  ],
});

T2_PROMPTS.push({
  id: "t2-room",
  title: "Building party room makeover",
  icon: "🛋️",
  situation: "The management of your apartment building plans to renovate the unused party room and has asked tenants to vote.",
  optionA: "Turn the party room into a quiet study and co-working space.",
  optionB: "Turn the party room into a playroom for children.",
  choice: "A",
  model: `In my view, Option A, turning the unused party room into a quiet study and co-working space, would be the better choice for our building.

The first reason is that many residents now study or work from home. In small apartments like ours, it can be hard to focus with traffic noise, deliveries, or family members watching TV. For example, I often prepare for job interviews at my small kitchen table, which is not an ideal place for a video call.

The second reason is that a shared work room would be used every day of the week, not only on weekends. Students, remote workers, and job seekers could use it in the morning, afternoon, and evening, so the building would get the most value from the renovation.

Some parents may prefer a playroom, especially during the long Ontario winter. That is a reasonable need, but families can still use nearby parks, schools, and the public library, which offer free programs for children.

Therefore, I believe Option A would benefit the largest number of residents, and I hope management chooses it.`,
  highlights: [
    { p: "In my view,", why: "Another way to give an opinion. Change your openers between practice tasks." },
    { p: "The first reason is that", why: "A clear signpost for reason 1." },
    { p: "which is not an ideal place for a video call", why: "A relative clause adds detail without starting a new sentence." },
    { p: "That is a reasonable need, but", why: "A respectful answer to the other side." },
    { p: "Therefore,", why: "A formal connector that shows a conclusion." },
  ],
  why: [
    "Balanced and respectful toward parents.",
    "The reasons focus on how many people benefit.",
    "Smooth flow between paragraphs.",
  ],
});

T2_PROMPTS.push({
  id: "t2-training",
  title: "Company training budget",
  icon: "📚",
  situation: "Your company has a training budget for next year and has asked employees for their opinion.",
  optionA: "Pay for a few employees to earn a professional certification, such as SAP or project management.",
  optionB: "Offer short online courses that all employees can take.",
  choice: "B",
  model: `I would choose Option B, offering short online courses to all employees.

First, this option is fairer. If the company pays for only a few people to earn certifications, most staff will feel left out, and morale may drop. When everyone has access to training, each person has a chance to grow. For example, when my previous employer offered free Excel courses to the whole department, even senior staff started sharing new shortcuts with the team.

Second, short courses can quickly solve real problems at work. Employees can choose lessons that match their daily tasks, such as data visualization, customer service, or time management, and use these skills the very next day. This creates small improvements across the entire company.

It is true that a certification, such as SAP or project management, gives deeper knowledge and looks impressive on a resume. However, the company would spend a large part of the budget on a small number of people, who might later leave for other jobs.

In short, Option B helps the most people at a lower cost, so it is the smarter investment.`,
  highlights: [
    { p: "First, this option is fairer.", why: "A five-word topic sentence. Short and powerful." },
    { p: "morale may drop", why: "'Morale' is a precise workplace word. Good vocabulary." },
    { p: "even senior staff started sharing new shortcuts", why: "A real example from your work background." },
    { p: "It is true that", why: "Admits the other side before answering it." },
    { p: "In short,", why: "A compact way to start the conclusion." },
  ],
  why: [
    "Even though you work with SAP, you can argue the other way. Examiners score reasons, not your real preference.",
    "A clear five-part structure.",
    "Precise vocabulary: morale, access, investment.",
  ],
});

/* Task 2 planner steps */
const T2_PLANNER = [
  { key: "opinion", label: "1. My choice", hint: "Say Option A or B in the first line. Example: I believe Option B is the better choice." },
  { key: "r1", label: "2. Reason 1 + example", hint: "First, ... For example, ..." },
  { key: "r2", label: "3. Reason 2 + example", hint: "Second, ... For instance, ..." },
  { key: "other", label: "4. The other side", hint: "Some people may argue that ... That is a fair point, but ..." },
  { key: "close", label: "5. Close", hint: "For these reasons, I strongly support Option ..." },
];

/* ---------- Watch list · Day 1 baseline mistakes ---------- */
const WATCH_LIST = [
  { id: "threat", icon: "🚫", title: "No threats", bad: "or I will contact public works", good: "Could you please arrange a repair by Friday, October 9?", kid: "Threats make the reader feel scared or angry. Ask nicely and give a date instead." },
  { id: "your", icon: "✏️", title: "you vs your", bad: "Thank you for you help.", good: "Thank you for your help.", kid: "'Your' means it belongs to you: your help, your time. 'You' is the person." },
  { id: "cliche", icon: "🙅", title: "Skip the cliche opener", bad: "I hope this email meets you well.", good: "My name is Afolabi Adesina, and I rent Unit 1408.", kid: "This line says nothing new. Start with who you are." },
  { id: "runon", icon: "✂️", title: "Short sentences", bad: "The heat is broken and the dishwasher is broken and I told the desk and nobody came so I am writing.", good: "The heat and the dishwasher are broken. I told the front desk, but nobody came.", kid: "If a sentence has more than 35 words, cut it in two. One idea, one sentence." },
  { id: "detail", icon: "🔍", title: "Add real detail", bad: "The heat is not working.", good: "The vents in my living room and bedroom have blown cold air for a week.", kid: "Where? How long? How does it hurt you? Details make the examiner believe you." },
  { id: "signoff", icon: "🖊️", title: "Sign with your name", bad: "Best regards, Tenant", good: "Best regards, Afolabi Adesina", kid: "The name at the bottom must match who you said you are. Always sign Afolabi." },
];

/* ---------- Baby-step guides ---------- */
const GUIDES = [
  {
    id: "g-t1",
    title: "Task 1 email in 5 baby steps",
    steps: [
      "Read the 3 bullets. Each bullet becomes one paragraph. That is your map.",
      "Write who you are in one line: your name and your unit or role. No 'meets you well'.",
      "Say why you write and how it hurts you. Add a real detail: a date, a room, a number.",
      "Ask nicely with a date. 'Could you please ... by Friday, October 9?' Never threaten.",
      "Say thank you, then sign Afolabi. Count your words: 150 to 200.",
    ],
  },
  {
    id: "g-t2",
    title: "Task 2 survey in 5 baby steps",
    steps: [
      "Pick A or B fast. There is no wrong choice. Pick the side with easier examples.",
      "Line 1: say your choice. 'I believe Option B is the better choice.'",
      "Reason 1 plus a small story. 'For example, my classmates wait 30 minutes for a bus.'",
      "Reason 2 plus another story. Then be kind to the other side: 'Some people may argue...'",
      "Close: 'For these reasons, I strongly support Option B.' Count: 150 to 200 words.",
    ],
  },
];

/* ---------- Phrase bank (front = basic, back = CLB 10) ---------- */
const PHRASE_GROUPS = ["Who I am", "Why I write", "How it hurts me", "What I want", "Thank you and name", "Task 2 opinion"];
const PHRASES = [
  { g: "Who I am", basic: "I hope this email meets you well.", clb: "My name is Afolabi Adesina, and I rent Unit 1408 at 2150 Trafalgar Road." },
  { g: "Who I am", basic: "I'm a student.", clb: "I am a student at Sheridan College in Oakville." },
  { g: "Who I am", basic: "I had an interview with you.", clb: "I interviewed for the Junior Data Analyst position last Tuesday." },
  { g: "Who I am", basic: "You know me from work.", clb: "As you may remember, I worked under your supervision on the supply chain team." },
  { g: "Who I am", basic: "I go to your gym.", clb: "I have been a member of your Oakville location since April." },
  { g: "Who I am", basic: "I take the train a lot.", clb: "I am a regular Lakeshore West rider from Oakville." },
  { g: "Why I write", basic: "I want to talk about the heat.", clb: "I am writing to follow up on a heating issue that I reported on October 1." },
  { g: "Why I write", basic: "I need more time.", clb: "I am writing to ask for a short extension on my application." },
  { g: "Why I write", basic: "What is happening with my job?", clb: "I am writing to ask whether there is an update on the hiring timeline." },
  { g: "Why I write", basic: "My card never came.", clb: "I am writing about my licence card, which has not arrived after eight weeks." },
  { g: "Why I write", basic: "Can you be my reference?", clb: "I am reaching out to ask whether you would be willing to act as a reference." },
  { g: "Why I write", basic: "I can't come.", clb: "Unfortunately, I need to ask whether my interview could be moved." },
  { g: "How it hurts me", basic: "It's cold.", clb: "Since the nights are getting colder, I have had trouble sleeping." },
  { g: "How it hurts me", basic: "I was late.", clb: "As a result, I arrived 40 minutes late to a final interview." },
  { g: "How it hurts me", basic: "It's annoying.", clb: "This has made it difficult for me to focus on my studies." },
  { g: "How it hurts me", basic: "I wasted time.", clb: "I have been washing every dish by hand, which takes time I need for job applications." },
  { g: "How it hurts me", basic: "I am stressed.", clb: "This delay is creating several problems for me." },
  { g: "How it hurts me", basic: "No sleep.", clb: "When I lose sleep, it is hard for me to focus in class and at work." },
  { g: "What I want", basic: "Fix it now or I will contact public works.", clb: "Could you please arrange for a technician to visit by Friday, October 9?" },
  { g: "What I want", basic: "Give me my money back.", clb: "I would appreciate a full refund for that trip." },
  { g: "What I want", basic: "Answer me.", clb: "I would be grateful to know the next steps before I make a decision." },
  { g: "What I want", basic: "Drop the fee.", clb: "Would you consider waiving the fee or reducing it to one month's payment?" },
  { g: "What I want", basic: "Pick another time.", clb: "I am available at any of the following times: Wednesday after 1 p.m. or Friday morning." },
  { g: "What I want", basic: "Do something.", clb: "If it is easier, I am happy to let maintenance in with a key." },
  { g: "Thank you and name", basic: "Thanks.", clb: "Thank you for your help. I look forward to hearing from you." },
  { g: "Thank you and name", basic: "Bye.", clb: "Thank you for considering my request. Kind regards, Afolabi Adesina" },
  { g: "Thank you and name", basic: "Sorry.", clb: "I apologize for any inconvenience, and I appreciate your flexibility." },
  { g: "Thank you and name", basic: "Thanks in advance.", clb: "Thank you for taking the time to review my request." },
  { g: "Thank you and name", basic: "Talk soon.", clb: "Please feel free to contact me if you need more information." },
  { g: "Thank you and name", basic: "Your welcome to call me.", clb: "You are welcome to call me any weekday after 3 p.m." },
  { g: "Task 2 opinion", basic: "I like A.", clb: "I strongly believe that Option A is the better choice." },
  { g: "Task 2 opinion", basic: "Because it's good.", clb: "The main reason is that better transit would help more people." },
  { g: "Task 2 opinion", basic: "Like my friend.", clb: "For example, many of my classmates wait 30 minutes for a bus." },
  { g: "Task 2 opinion", basic: "Other people disagree.", clb: "Some people may argue that a garage is more convenient. That is a fair point, but..." },
  { g: "Task 2 opinion", basic: "Also.", clb: "In addition, these programs benefit the whole community." },
  { g: "Task 2 opinion", basic: "So A.", clb: "For these reasons, I fully support Option A." },
];

/* ---------- Brain game items ---------- */
const GAME_TONE = [
  { s: "Your heating is broken.", a: "Could you please arrange a repair by Friday, as the apartment is very cold at night?", b: ["Fix the heat or I will contact public works.", "The heat is broken. Do something."] },
  { s: "No reply to your email.", a: "I am following up on my email from Monday, as I have not yet received a reply.", b: ["Why haven't you answered my email?", "Answer me today."] },
  { s: "Your opening line.", a: "My name is Afolabi Adesina, and I rent Unit 1408.", b: ["I hope this email meets you well.", "Hey, it's me again."] },
  { s: "Asking for a refund.", a: "I would appreciate a full refund for the delayed trip.", b: ["Give me my money back now.", "You owe me money, so pay it."] },
  { s: "A loud neighbour.", a: "Would it be possible to keep the music lower after 11 p.m.?", b: ["Your music is ruining my life.", "Stop the noise or I will call the police."] },
  { s: "Waiting on a recruiter.", a: "Could you please let me know the next steps in the hiring process?", b: ["Did I get the job or not?", "Tell me the result fast."] },
  { s: "You need more time.", a: "Would it be possible to extend the deadline to Wednesday, October 14?", b: ["I need more time, okay?", "The deadline is unfair and I will not meet it."] },
  { s: "Unhelpful staff.", a: "The staff were unable to give us an expected arrival time.", b: ["Your staff were useless.", "Nobody on your team knows anything."] },
  { s: "An unfair fee.", a: "I find this fee unfair, as my situation changed for work reasons.", b: ["This fee is a scam.", "I refuse to pay your silly fee."] },
  { s: "Closing the email.", a: "Thank you for your help. I look forward to hearing from you.", b: ["Do it now. Bye.", "Thanks in advance, hurry up."] },
  { s: "You cannot attend Thursday.", a: "Unfortunately, I am unable to attend on Thursday. Could we find another time?", b: ["I can't come Thursday, pick another day.", "Thursday doesn't work for me, deal with it."] },
  { s: "Rent increase with short notice.", a: "I understand that Ontario rules usually require 90 days of written notice.", b: ["This increase is illegal and I will report you.", "No way am I paying more rent."] },
];

const SANDWICH_LABELS = ["Who I am", "Why I write", "How it hurts me", "What I want + polite timeline", "Thank you and name"];
const GAME_SANDWICH = [
  { t: "Heating", bites: ["My name is Afolabi Adesina, and I rent Unit 1408.", "I am writing about the heating vents, which have blown cold air for a week.", "Because of this, I have trouble sleeping and studying at home.", "Could you please send a technician by Friday, October 9?", "Thank you for your help. Best regards, Afolabi"] },
  { t: "Co-op deadline", bites: ["I am a student in your co-op preparation group at Sheridan.", "I am writing to ask for a short extension on my application.", "My reference letter is delayed, so my package is incomplete.", "Would it be possible to extend the deadline to October 14?", "Thank you for considering my request. Kind regards, Afolabi"] },
  { t: "Gym fee", bites: ["I have been a member of your Oakville location since April.", "I am writing to ask for help cancelling my membership.", "My long commute means I cannot use the gym, and the fee is a burden.", "Would you consider waiving the cancellation fee by the end of the month?", "Thank you for reviewing my request. Sincerely, Afolabi"] },
  { t: "Noisy neighbour", bites: ["My name is Afolabi, and I live in the unit below yours.", "I am writing about loud music late at night.", "The noise keeps me awake before my early classes.", "Could you keep the music lower after 11 p.m., starting this week?", "Thank you for understanding. Best wishes, Afolabi"] },
  { t: "GO Train", bites: ["I am a regular Lakeshore West rider from Oakville.", "I am writing about a long delay on Monday, October 5.", "As a result, I arrived 40 minutes late to a job interview.", "I would appreciate a full refund within the next two weeks.", "Thank you for looking into this. Sincerely, Afolabi"] },
  { t: "Licence card", bites: ["I applied for my Ontario driver's licence card on August 10.", "I am writing because the card has not arrived after eight weeks.", "My temporary licence expires soon, and my new employer needs photo ID.", "Could you please check the status and reply by October 16?", "Thank you for your assistance. Sincerely, Afolabi"] },
  { t: "Rent increase", bites: ["I am the tenant in Unit 1408, and I have lived here for two years.", "I am writing about the rent increase notice I received on October 5.", "The short notice is hard for me as a student on a fixed budget.", "Would you consider delaying the increase until February 1?", "Thank you for your understanding. Best regards, Afolabi"] },
  { t: "Interview reschedule", bites: ["I am scheduled to interview for the Business Analyst co-op role.", "I am writing to ask whether my Thursday interview could be moved.", "My required midterm exam was moved to the same morning.", "I am available Wednesday after 1 p.m. or anytime Friday.", "I appreciate your flexibility. Kind regards, Afolabi"] },
  { t: "Parking permit", bites: ["I am a tenant in Apt 8.", "I am writing because my visitor parking permit has not arrived.", "My guests keep receiving parking tickets.", "Could you please re-send the permit by this Friday?", "Thank you for resolving this. Sincerely, Afolabi"] },
  { t: "Late delivery", bites: ["I am a ShopEase customer who placed an order two weeks ago.", "I am writing because my laptop stand is still marked in transit.", "I need the stand for my daily remote work.", "Please send a delivery update or a refund within five business days.", "Thank you for your assistance. Best regards, Afolabi"] },
];

const GAME_WORDS = [
  { w: "fix", a: "resolve", b: ["worsen", "mess with", "dissolve"] },
  { w: "get", a: "receive", b: ["grab", "donate", "deliver"] },
  { w: "ask for", a: "request", b: ["beg for", "reject", "require of"] },
  { w: "help", a: "assistance", b: ["resistance", "a hand thing", "distance"] },
  { w: "tell", a: "inform", b: ["inflame", "chat", "ignore"] },
  { w: "soon", a: "promptly", b: ["someday", "lately", "proudly"] },
  { w: "big problem", a: "significant issue", b: ["huge mess", "minor detail", "big thing"] },
  { w: "want", a: "would like", b: ["gotta have", "would hate", "wanna"] },
  { w: "sorry", a: "I apologize", b: ["my bad", "I appreciate", "oops"] },
  { w: "think", a: "believe", b: ["guess maybe", "deny", "forget"] },
  { w: "show", a: "demonstrate", b: ["hide", "show off", "deny"] },
  { w: "check", a: "review", b: ["skip", "peek at", "remove"] },
  { w: "very important", a: "essential", b: ["super big", "optional", "kinda key"] },
  { w: "start", a: "begin", b: ["finish", "kick off big", "pause"] },
  { w: "enough", a: "sufficient", b: ["plenty-ish", "scarce", "efficient"] },
  { w: "but", a: "however", b: ["whatever", "therefore", "because"] },
  { w: "also", a: "in addition", b: ["in contrast", "and stuff", "instead"] },
  { w: "buy", a: "purchase", b: ["pursue", "grab", "sell"] },
  { w: "need", a: "require", b: ["retire", "kinda want", "refuse"] },
  { w: "bad", a: "unacceptable", b: ["not great", "acceptable", "yucky"] },
  { w: "keep up", a: "maintain", b: ["mention", "abandon", "hang on to"] },
  { w: "find out", a: "determine", b: ["figure-ish", "ignore", "terminate"] },
];

const GAME_ERRORS = [
  { c: ["Thank you for", "you", "help with this issue."], x: 1, fix: "your", why: "Your help = the help that belongs to you." },
  { c: ["I hope", "this email meets you well,", "and I am writing about the heating."], x: 1, fix: "Cut it. Start with who you are.", why: "This cliche was in your Day 1 email. It adds nothing." },
  { c: ["Please fix the vents by Friday,", "or I will contact public works."], x: 1, fix: "Thank you for your help with this.", why: "That is a threat. Firm and polite scores higher." },
  { c: ["Your", "welcome to call me any time after 3 p.m."], x: 0, fix: "You are", why: "'You are welcome' means you have permission. 'Your' is for things you own." },
  { c: ["I live in", "you", "building on Trafalgar Road."], x: 1, fix: "your", why: "The building belongs to the manager's company: your building." },
  { c: ["The vents blow cold air.", "The dishwasher does not drain and I tried to reset it and I called the desk and nobody came and I waited all week and I am cold", "so I am writing."], x: 1, fix: "Split it into two or three short sentences.", why: "This is a run-on sentence. Over 35 words in one sentence is too long." },
  { c: ["My name is Afolabi Adesina.", "Thank you for your time.", "Sincerely, Tenant"], x: 2, fix: "Sincerely, Afolabi Adesina", why: "The sign-off must match your name." },
  { c: ["Could", "your", "please send a technician this week?"], x: 1, fix: "you", why: "'You' is the person doing the action." },
  { c: ["I", "will be grateful", "if you could reply by Friday."], x: 1, fix: "would be grateful", why: "With 'if you could', use 'would'." },
  { c: ["The heating", "have", "been broken for a week."], x: 1, fix: "has", why: "One heating system = has." },
  { c: ["I am writing to inform you", "that i", "cannot attend on Thursday."], x: 1, fix: "that I", why: "The word I is always a capital letter." },
  { c: ["If nothing changes by Monday,", "I will take legal action", "against the building."], x: 1, fix: "I would appreciate an update by Monday.", why: "A threat again. Replace it with a polite timeline." },
  { c: ["I look forward", "to hear", "from you."], x: 1, fix: "to hearing", why: "'Look forward to' is followed by an -ing word." },
];

const GAME_MEMORY = [
  { f: "I am writing to follow up on", p: "Remind about an earlier message" },
  { f: "Could you please arrange", p: "Polite request" },
  { f: "As a result,", p: "Show the effect" },
  { f: "I would appreciate it if", p: "Soft ask" },
  { f: "I look forward to hearing from you", p: "Polite close" },
  { f: "I apologize for any inconvenience", p: "Say sorry" },
  { f: "I am available any weekday after 3 p.m.", p: "Offer times" },
  { f: "Would it be possible to extend", p: "Ask for more time" },
  { f: "I find this fee unfair, as", p: "Disagree politely" },
  { f: "Thank you for considering my request", p: "Say thank you" },
  { f: "My name is Afolabi, and I rent Unit 1408", p: "Who I am" },
  { f: "I strongly believe that Option A", p: "Give an opinion (Task 2)" },
];

const GAME_CONNECT = [
  { s: "The vents blow cold air. ___, I cannot sleep well.", a: "As a result", b: ["However", "Although", "Unless"] },
  { s: "___ I reported the problem, nobody came.", a: "Although", b: ["Because", "Therefore", "So"] },
  { s: "I enjoy my job. ___, the commute is long.", a: "However", b: ["Therefore", "Because", "For example"] },
  { s: "I am available Monday. ___, I can meet on Friday.", a: "Alternatively", b: ["Because", "As a result", "Although"] },
  { s: "Transit helps many people. ___, students rely on buses.", a: "For example", b: ["However", "Although", "Otherwise"] },
  { s: "I paid every month on time, ___ the fee seems unfair.", a: "so", b: ["but", "although", "unless"] },
  { s: "I cannot attend ___ my exam was moved.", a: "because", b: ["although", "however", "unless"] },
  { s: "___, a garage is convenient, but buses help more people.", a: "Admittedly", b: ["Therefore", "As a result", "Because"] },
  { s: "Please reply by Friday ___ I can plan my week.", a: "so that", b: ["although", "however", "unless"] },
  { s: "I updated my resume. ___, I finished my cover letter.", a: "In addition", b: ["However", "Instead", "Otherwise"] },
  { s: "___, I strongly support Option B.", a: "In conclusion", b: ["For instance", "Although", "Meanwhile"] },
  { s: "I will send the letter ___ it arrives.", a: "as soon as", b: ["although", "despite", "unless"] },
  { s: "___ the delay, I arrived 40 minutes late.", a: "Because of", b: ["Although", "However", "Despite"] },
  { s: "Working from home saves time. ___, office days build teams.", a: "On the other hand", b: ["Therefore", "For example", "Because"] },
  { s: "I would like to stay here. ___, I hope we can find a fair solution.", a: "Therefore", b: ["However", "Although", "Unless"] },
];

/* ---------- Coach lines ---------- */
const COACH_LINES = {
  hello: [
    "Small steps every day. You are building CLB 10 brick by brick.",
    "One email at a time, Afolabi. You have got this.",
    "Today's rule: no threats, no cliches, lots of warmth.",
    "Remember the sandwich: Who, Why, Hurt, Ask, Thanks.",
    "Your Day 1 was about CLB 8 to 9. CLB 10 is close.",
    "Short sentences. Real details. Polite asks.",
  ],
  correct: ["Yes! That is CLB 10 thinking.", "Nice one!", "Sharp eyes!", "Exactly right.", "You are on fire!", "Perfect pick."],
  wrong: ["Almost. Look again, you will see it.", "Good try. Every mistake teaches.", "Not quite. Keep going!", "Close! Read it slowly."],
  done: ["Round complete! Proud of you.", "That is how progress feels.", "Another brick in your CLB 10 wall.", "Great work. Take a breath and smile."],
};
