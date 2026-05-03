export type CompanionTone =
  | 'grounding'
  | 'celebrating'
  | 'normalizing'
  | 'rebuilding'
  | 'inviting'
  | 'crisis';

export type CompanionSeed = {
  id: string;
  tokens: string[];
  tone: CompanionTone;
  openers: string[];
  bodies: string[];
  closers: string[];
};

export const companionSeeds: CompanionSeed[] = [
  // ── GROUNDING ──────────────────────────────────────────────────────────────

  {
    id: 'feeling-overwhelmed',
    tokens: ['overwhelmed', 'much', 'drowning', 'unable', 'handle', 'everything', 'too'],
    tone: 'grounding',
    openers: [
      "I hear you.",
      "Yeah. That's a lot.",
      "It makes sense you'd feel that way.",
      "That's real.",
    ],
    bodies: [
      "When everything piles up at once, it's not a sign you're failing. It's a sign the load is heavy. Pick one thing to do today. Just one. The rest can wait.",
      "There's no rule that says you have to handle all of it right now. The plan can breathe. What's the one thing that would feel doable?",
      "You don't need to figure it all out tonight. The point isn't to be ahead of everything. It's to not quit. That's it.",
      "This kind of pressure builds on people whether they've been inside or not. You're not falling apart. You're carrying a lot.",
    ],
    closers: [
      "You can come back here whenever.",
      "Take whatever time you need.",
      "If you want, we can look at the plan together and trim it down.",
      "One step is enough for today.",
    ],
  },

  {
    id: 'feeling-tired',
    tokens: ['tired', 'exhausted', 'drained', 'beat', 'energy', 'worn', 'fatigue', 'wiped'],
    tone: 'grounding',
    openers: [
      "That tracks.",
      "Rest is part of this too.",
      "Tired makes sense given everything you're doing.",
    ],
    bodies: [
      "Being worn out isn't weakness. It's your body telling you it's been working hard. You don't have to grind through everything at once.",
      "Rebuilding takes more energy than people expect. The paperwork, the phone calls, showing up when you don't feel like it. That's real work. Give yourself credit.",
      "You've been pushing. A day where you don't get much done isn't a wasted day. It's a recovery day. Those count.",
    ],
    closers: [
      "Check in tomorrow if you get a chance.",
      "What's one thing you could take off your list today?",
      "Even a short rest is something.",
    ],
  },

  {
    id: 'feeling-lonely',
    tokens: ['lonely', 'alone', 'isolated', 'nobody', 'friends', 'connection', 'miss', 'distant'],
    tone: 'grounding',
    openers: [
      "That's one of the harder ones.",
      "Lonely is real. And it doesn't always get said.",
      "I'm glad you mentioned it.",
    ],
    bodies: [
      "Coming home can feel more isolating than being inside did. The world kept moving while you were gone. That gap is real, and it takes time to close.",
      "You're not meant to do this alone. Most people who make it long-term had someone in their corner. Even just one person. We can work on finding that.",
      "Connection doesn't always come back fast. That's frustrating. But it doesn't mean it won't come.",
    ],
    closers: [
      "I'm here whenever you want to talk through it.",
      "There's no rush. Just showing up here matters.",
      "If you want, we can look at what's on your plan that might get you around more people.",
    ],
  },

  {
    id: 'feeling-angry',
    tokens: ['angry', 'mad', 'pissed', 'frustrated', 'fed', 'rage', 'furious', 'upset', 'irritated'],
    tone: 'grounding',
    openers: [
      "That makes sense.",
      "Yeah. That's fair.",
      "Anger is usually about something real.",
    ],
    bodies: [
      "A lot of what people come home to, the system, the paperwork, the attitudes, it's legitimately infuriating. You don't have to pretend it isn't.",
      "The feeling is valid. What matters is what you do with it. And sometimes that just means sitting with it for a minute before you act.",
      "Frustration means you still care about how things turn out. That's worth something.",
    ],
    closers: [
      "If you want to talk through what happened, I'm here.",
      "What do you need right now?",
      "We don't have to do anything with it today.",
    ],
  },

  {
    id: 'feeling-sad',
    tokens: ['sad', 'down', 'depressed', 'low', 'blue', 'crying', 'grief', 'hurting', 'lost'],
    tone: 'grounding',
    openers: [
      "I hear that.",
      "It's okay to feel that.",
      "That's worth sitting with.",
    ],
    bodies: [
      "Sadness doesn't mean something's broken. Sometimes it's grief. For time lost, for what could have been different. That's a real thing to carry.",
      "You don't have to push through it or fix it right now. Feeling low doesn't mean you're heading backward.",
      "Most people going through what you're going through have days like this. It doesn't cancel out everything else you've done.",
    ],
    closers: [
      "You can take it slow today.",
      "I'm here if you want to say more.",
      "Tomorrow doesn't have to look like today.",
    ],
  },

  {
    id: 'feeling-scared',
    tokens: ['scared', 'afraid', 'anxious', 'nervous', 'worried', 'terrified', 'fear', 'dread', 'panic'],
    tone: 'grounding',
    openers: [
      "That's a hard one to say out loud.",
      "Fear makes sense here.",
      "You named it. That takes something.",
    ],
    bodies: [
      "A lot of what you're walking into is genuinely unknown. Fear of the unknown isn't irrational. It's human. You're not the only one who's felt this on the way out.",
      "Nervous usually means you care about getting it right. That's actually a good sign.",
      "You don't have to feel ready to take the next step. You just have to take it.",
    ],
    closers: [
      "What's the thing you're most worried about right now?",
      "We can look at whatever's coming up and figure out the pieces.",
      "You've already faced harder things than this.",
    ],
  },

  {
    id: 'feeling-ashamed',
    tokens: ['ashamed', 'embarrassed', 'guilty', 'regret', 'shame', 'mistake', 'wrong', 'deserve'],
    tone: 'grounding',
    openers: [
      "I'm glad you said that.",
      "That took honesty.",
      "Shame is heavy. I hear you.",
    ],
    bodies: [
      "Regret means you know the difference between what happened and what you wanted. That's not nothing. That's actually the starting point.",
      "You don't have to carry that forever. What you do from here is what gets written next. Not the other part.",
      "The people who make it through this aren't the ones who feel no guilt. They're the ones who don't let guilt be the last word.",
    ],
    closers: [
      "You're still here. That matters.",
      "If you want to talk through it, I'm not going anywhere.",
      "What would it look like to take one step toward something different?",
    ],
  },

  {
    id: 'feeling-hopeful',
    tokens: ['hopeful', 'optimistic', 'good', 'positive', 'better', 'excited', 'looking', 'forward', 'turning'],
    tone: 'celebrating',
    openers: [
      "Good. Hold onto that.",
      "That's real. Don't talk yourself out of it.",
      "That's worth something.",
    ],
    bodies: [
      "Hope isn't naive. It's what keeps people moving when things are hard. You've earned the right to feel it.",
      "A good day is data. It tells you what's possible. That's worth paying attention to.",
      "Something shifted. Notice that. The work you've been doing is showing up.",
    ],
    closers: [
      "What happened today that made it feel that way?",
      "Keep going.",
      "I'm glad you checked in.",
    ],
  },

  // ── CELEBRATING ────────────────────────────────────────────────────────────

  {
    id: 'got-job-interview',
    tokens: ['interview', 'called', 'callback', 'hiring', 'application', 'applied', 'resume', 'employer'],
    tone: 'celebrating',
    openers: [
      "That's a real step.",
      "Getting that call back. That's not small.",
      "That step took guts.",
    ],
    bodies: [
      "Most people don't make it this far in week one. You put in the work to get here: the application, showing up, following through.",
      "An interview means someone looked at your story and said yes to a conversation. That's how it starts.",
      "You got the call. Now let's make sure you're ready to walk in there confident.",
    ],
    closers: [
      "Want to talk through how to prep for it?",
      "We can add some prep to your plan if you want.",
      "That's momentum. Keep it going.",
    ],
  },

  {
    id: 'got-job',
    tokens: ['hired', 'job', 'work', 'employed', 'start', 'started', 'offer', 'accepted', 'paycheck'],
    tone: 'celebrating',
    openers: [
      "That's it. That's the one.",
      "You got it.",
      "I want you to sit with that for a second.",
    ],
    bodies: [
      "Getting hired after what you've been through. That's not a small thing. Someone looked at your record and said yes anyway. And you made that happen.",
      "First day of work is one of the hardest. And you walked through it. That counts for more than you know.",
      "This is a real change. Employment changes everything downstream. You did this.",
    ],
    closers: [
      "What's it feel like?",
      "Let's update the plan. You just cleared a major milestone.",
      "Seriously. Well done.",
    ],
  },

  {
    id: 'got-id',
    tokens: ['id', 'license', 'dmv', 'identification', 'card', 'document', 'birth', 'certificate', 'social'],
    tone: 'celebrating',
    openers: [
      "That one unlocks a lot.",
      "That's a real milestone.",
      "ID in hand. That changes things.",
    ],
    bodies: [
      "Getting your ID sorted sounds simple but it's one of the most annoying things to navigate. You pushed through the paperwork and made it happen.",
      "A lot of doors open when you have that ID. Housing, work, banking: the whole picture shifts.",
      "That's a foundation piece. Seriously. Well done.",
    ],
    closers: [
      "What's next on the list?",
      "Let's check off what this unlocks on your plan.",
      "You're building something real.",
    ],
  },

  {
    id: 'got-housing',
    tokens: ['housing', 'place', 'room', 'apartment', 'moved', 'lease', 'shelter', 'address', 'home'],
    tone: 'celebrating',
    openers: [
      "That's huge.",
      "A place of your own. That changes everything.",
      "That's one of the hardest things to lock down. You did it.",
    ],
    bodies: [
      "Having a stable place isn't just comfort. It's the foundation everything else builds on. Work, relationships, health: they all get easier when you have an address.",
      "A lot of people hit that wall and don't get through it as fast as you did. You found a way.",
      "You've got a home base now. That matters more than people who've always had one ever realize.",
    ],
    closers: [
      "How does it feel to have that settled?",
      "Let's look at what opens up from here.",
      "That's real stability. You built that.",
    ],
  },

  {
    id: 'reconnected-family',
    tokens: ['family', 'reunited', 'mom', 'dad', 'kids', 'brother', 'sister', 'called', 'reached', 'talked', 'children'],
    tone: 'celebrating',
    openers: [
      "That's not easy. I'm glad you did it.",
      "Making that call or showing up. That took something.",
      "That's a big moment.",
    ],
    bodies: [
      "Reconnecting with family after time inside is one of the hardest moves to make. You don't know how they'll react. You did it anyway.",
      "That relationship might take time to rebuild. But you cracked the door open. That's where it starts.",
      "Being there for the people you love again. That's part of why you're doing all of this.",
    ],
    closers: [
      "How did it go?",
      "That's worth holding onto.",
      "Keep showing up. That's what changes things.",
    ],
  },

  // ── NORMALIZING ────────────────────────────────────────────────────────────

  {
    id: 'plan-feels-slow',
    tokens: ['slow', 'forever', 'progress', 'stuck', 'nowhere', 'nothing', 'happening', 'moving', 'stalled'],
    tone: 'normalizing',
    openers: [
      "That feeling is real.",
      "This part is hard for almost everyone.",
      "Yeah. Progress can be invisible for a while.",
    ],
    bodies: [
      "The early weeks don't look like much from the inside. You're laying groundwork: ID, paperwork, figuring out the landscape. That's not stalling. That's building.",
      "Most of what you're doing right now won't feel significant until it suddenly is. You're not behind. You're exactly where most people are at this stage.",
      "Slow doesn't mean stopped. You're not behind. And you're not supposed to have it all figured out yet.",
    ],
    closers: [
      "What's one thing you can point to this week that moved, even a little?",
      "You're not behind.",
      "Keep going.",
    ],
  },

  {
    id: 'comparing-self',
    tokens: ['everyone', 'behind', 'falling', 'ahead', 'others', 'people', 'seem', 'better', 'faster', 'why'],
    tone: 'normalizing',
    openers: [
      "That comparison will eat at you if you let it.",
      "Nobody's running the same race.",
      "That's a trap. And most people fall into it.",
    ],
    bodies: [
      "You're not on someone else's timeline. You're on yours. The person you're comparing yourself to doesn't have your starting point.",
      "What looks like 'ahead' from the outside usually isn't the whole picture. You're measuring your inside against someone else's outside.",
      "Your situation is specific. Your pace is yours. That's not an excuse. It's just true.",
    ],
    closers: [
      "Where are you compared to where you were two weeks ago?",
      "That's the only comparison that counts.",
      "Stay in your lane.",
    ],
  },

  {
    id: 'first-week-hard',
    tokens: ['first', 'week', 'hard', 'harder', 'expected', 'thought', 'reality', 'tough', 'difficult'],
    tone: 'normalizing',
    openers: [
      "First week is always harder than people expect.",
      "Yeah. It doesn't ease you in.",
      "You're not the only one who's said that.",
    ],
    bodies: [
      "The gap between thinking about coming home and actually being home is real. Everything's louder, faster, and more demanding than it looked from inside. That doesn't mean you can't do it.",
      "Most people hit week one and think something's wrong with them. Nothing's wrong with you. The world is just a lot right now.",
      "This part is hard for almost everyone. You're not behind. You're right in the middle of what this actually feels like.",
    ],
    closers: [
      "Week two usually feels different. Not easy. Just different.",
      "What's been the hardest specific thing?",
      "You showed up. That's week one.",
    ],
  },

  // ── REBUILDING ─────────────────────────────────────────────────────────────

  {
    id: 'lost-job',
    tokens: ['lost', 'fired', 'let', 'laid', 'terminated', 'quit', 'work', 'job', 'unemployed', 'no'],
    tone: 'rebuilding',
    openers: [
      "That's a hard hit.",
      "I'm sorry. That's rough.",
      "Something changed. That's okay. Let's rebuild from where you are.",
    ],
    bodies: [
      "Losing a job doesn't erase the fact that you got one. You know how to do this part. The next one can go differently.",
      "Sometimes a job doesn't work out: the situation, the timing, things out of your control. That's not a verdict on you.",
      "Setbacks like this are part of the road for most people in this process. It doesn't mean you're back at zero.",
    ],
    closers: [
      "Want to look at what comes next?",
      "We can rebuild the plan around where you are right now.",
      "You're still moving. That's what matters.",
    ],
  },

  {
    id: 'lost-housing',
    tokens: ['evicted', 'kicked', 'shelter', 'street', 'nowhere', 'housing', 'lost', 'gone', 'place'],
    tone: 'rebuilding',
    openers: [
      "That's one of the harder things to face.",
      "I hear you. Let's figure out a way through this.",
      "That's serious, and I want to help you work through it.",
    ],
    bodies: [
      "Losing housing is one of the biggest setbacks someone can face in this process. It doesn't mean everything falls apart. But it does mean we need to reset and look at what's available.",
      "There are resources for exactly this situation. It's not ideal, but there's a path. Let's find it.",
      "You've already shown you can navigate hard things. This is another one. We figure it out from here.",
    ],
    closers: [
      "Let's look at what emergency housing options are near you.",
      "This is solvable. Let's work through it step by step.",
      "You don't have to figure it all out tonight.",
    ],
  },

  {
    id: 'relapsed',
    tokens: ['relapse', 'used', 'drank', 'slipped', 'fell', 'drinking', 'using', 'substances', 'high', 'drunk'],
    tone: 'rebuilding',
    openers: [
      "I'm really glad you told me.",
      "It took honesty to say that.",
      "Thank you for not holding that back.",
    ],
    bodies: [
      "A slip doesn't mean you've lost everything you've built. Recovery isn't a straight line for almost anyone. What you do next is what counts.",
      "You told me. That's actually one of the most important things you could do. A lot of people hide it and spiral. You didn't.",
      "One setback doesn't cancel what came before it. This is a hard moment, not a verdict.",
    ],
    closers: [
      "What do you need right now? Do you want to talk through it or just know I'm here?",
      "We can look at the plan and figure out what support makes sense.",
      "You came back to this. That matters more than you might think.",
    ],
  },

  {
    id: 'family-conflict',
    tokens: ['argued', 'fight', 'conflict', 'argument', 'tension', 'angry', 'talk', 'cut', 'distant', 'hurt', 'family'],
    tone: 'rebuilding',
    openers: [
      "That's a painful one.",
      "Family conflict is some of the hardest stuff to navigate.",
      "I hear you. That's heavy.",
    ],
    bodies: [
      "Relationships that broke during incarceration don't always fix themselves right away. Old patterns come up. People carry things they haven't said. That's not a failure. That's just where things are.",
      "Sometimes reconnecting means walking into old friction. It doesn't mean the relationship is broken past fixing. It means there's real work to do there.",
      "You can't control how they react. You can only control showing up with honesty and keeping the door open.",
    ],
    closers: [
      "What happened, if you want to talk through it?",
      "We can think about what the next move looks like.",
      "These relationships can come back. It just takes time and consistency.",
    ],
  },

  // ── INVITING ───────────────────────────────────────────────────────────────

  {
    id: 'wants-to-talk',
    tokens: ['talk', 'share', 'vent', 'listen', 'tell', 'need', 'say', 'something'],
    tone: 'inviting',
    openers: [
      "I'm here.",
      "Go ahead. I'm listening.",
      "Tell me what's going on.",
    ],
    bodies: [
      "You don't have to have it organized or make it make sense. Just say what's on your mind.",
      "Sometimes you just need to put it somewhere. This is a good place for that.",
      "No judgment here. What's going on?",
    ],
    closers: [
      "Take your time.",
      "I'm not going anywhere.",
      "Say as much or as little as you want.",
    ],
  },

  {
    id: 'just-checking-in',
    tokens: ['hi', 'hey', 'hello', 'checking', 'saying', 'nothing', 'just', 'here', 'around'],
    tone: 'inviting',
    openers: [
      "Hey.",
      "Good to see you check in.",
      "Hey. Glad you're here.",
    ],
    bodies: [
      "You don't need a reason to check in. Showing up consistently is the whole point.",
      "Not every check-in has to be heavy. Sometimes just touching base is enough.",
      "Even on quiet days, showing up matters. How's it going?",
    ],
    closers: [
      "Anything on your mind?",
      "How are things looking today?",
      "Just checking in counts.",
    ],
  },

  {
    id: 'unsure-what-to-say',
    tokens: ['know', 'sure', 'unsure', 'explain', 'words', 'hard', 'weird', 'strange', 'complicated', 'unclear'],
    tone: 'inviting',
    openers: [
      "That's okay.",
      "You don't have to have it figured out to say something.",
      "It doesn't need to make sense yet.",
    ],
    bodies: [
      "Some things are hard to put into words. That's fine. You can start anywhere. Even half a thought is something to work with.",
      "You don't have to have it all figured out. You just have to do the next thing. And right now the next thing is just saying something.",
      "Most of what matters doesn't come out neat the first time. Just start.",
    ],
    closers: [
      "What's the first word that comes to mind about how you're feeling?",
      "Start anywhere.",
      "I'll follow your lead.",
    ],
  },

  // ── CRISIS ─────────────────────────────────────────────────────────────────

  {
    id: 'crisis',
    tokens: [
      'hopeless', 'give', 'end', 'kill', 'suicide', 'suicidal', 'harm',
      'die', 'dying', 'point', 'worthless', 'nothing', 'anymore', 'goodbye',
    ],
    tone: 'crisis',
    openers: ["I'm really glad you told me."],
    bodies: [
      "What you're carrying is real, and it doesn't have to be carried alone. The 988 Lifeline is open right now. Free and confidential. They're trained for exactly this.",
    ],
    closers: ["Tap the call button when you're ready."],
  },
];
