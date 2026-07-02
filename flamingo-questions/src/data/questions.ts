export type Category = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
  mature?: boolean;
};

export type Question = {
  id: string;
  categoryId: string;
  text: string;
};

export const categories: Category[] = [
  {
    id: "warmup",
    label: "Warm Up",
    emoji: "☀️",
    description: "Light, easy questions to break the ice.",
    color: "#fbbf24",
  },
  {
    id: "know",
    label: "Getting to Know You",
    emoji: "🌱",
    description: "The basics that build a fuller picture of each other.",
    color: "#34d399",
  },
  {
    id: "deep",
    label: "Deep Connection",
    emoji: "💭",
    description: "Values, fears, and what really matters.",
    color: "#818cf8",
  },
  {
    id: "playful",
    label: "Fun & Playful",
    emoji: "🎉",
    description: "Silly, lighthearted questions to make you both laugh.",
    color: "#fb923c",
  },
  {
    id: "romance",
    label: "Date Night",
    emoji: "🌹",
    description: "Romance, attraction, and what makes you feel loved.",
    color: "#f13a78",
  },
  {
    id: "future",
    label: "Future Together",
    emoji: "🔮",
    description: "Dreams, goals, and where you're headed.",
    color: "#22d3ee",
  },
  {
    id: "trust",
    label: "Trust & Vulnerability",
    emoji: "🤍",
    description: "Closeness, honesty, and being truly seen.",
    color: "#a78bfa",
  },
  {
    id: "spicy",
    label: "Spicy & Hot",
    emoji: "🔥",
    description: "Turn up the heat — desire, fantasies, and what turns you on. 18+",
    color: "#dc2626",
    mature: true,
  },
  {
    id: "conflict",
    label: "Communication",
    emoji: "🗝️",
    description: "How you handle friction and support each other.",
    color: "#60a5fa",
  },
];

export const questions: Question[] = [
  // Warm Up
  { id: "w1", categoryId: "warmup", text: "What's the best part of your day, so far?" },
  { id: "w2", categoryId: "warmup", text: "What song instantly puts you in a good mood?" },
  { id: "w3", categoryId: "warmup", text: "Coffee, tea, or neither — and how do you take it?" },
  { id: "w4", categoryId: "warmup", text: "What's a small thing that made you smile this week?" },
  { id: "w5", categoryId: "warmup", text: "If we canceled all plans tonight, what would you want to do instead?" },
  { id: "w6", categoryId: "warmup", text: "What's your go-to comfort food?" },
  { id: "w7", categoryId: "warmup", text: "Morning person or night owl — and has that ever caused a conflict for us?" },
  { id: "w8", categoryId: "warmup", text: "What's something you're looking forward to this month?" },
  { id: "w9", categoryId: "warmup", text: "What's a movie or show you could rewatch endlessly?" },
  { id: "w10", categoryId: "warmup", text: "If you had a free hour right now with no obligations, what would you do?" },

  // Getting to Know You
  { id: "k1", categoryId: "know", text: "What's a memory from childhood that still shapes who you are?" },
  { id: "k2", categoryId: "know", text: "Who has influenced you the most, and how?" },
  { id: "k3", categoryId: "know", text: "What's something about you that surprises people once they know you well?" },
  { id: "k4", categoryId: "know", text: "What does a perfect ordinary day look like for you?" },
  { id: "k5", categoryId: "know", text: "What's a skill or hobby you wish you'd kept up with?" },
  { id: "k6", categoryId: "know", text: "What's your love language, and has it changed over time?" },
  { id: "k7", categoryId: "know", text: "What's a belief you held strongly when you were younger that you don't hold now?" },
  { id: "k8", categoryId: "know", text: "What kind of environment helps you feel most like yourself?" },
  { id: "k9", categoryId: "know", text: "What's something you're proud of that not many people know about?" },
  { id: "k10", categoryId: "know", text: "How do you recharge after a hard week?" },
  { id: "k11", categoryId: "know", text: "What's a tradition from your family you'd want to keep or start with me?" },
  { id: "k12", categoryId: "know", text: "What's something you used to be afraid of that you've overcome?" },

  // Deep Connection
  { id: "d1", categoryId: "deep", text: "What does 'home' mean to you?" },
  { id: "d2", categoryId: "deep", text: "What's a value you'll never compromise on?" },
  { id: "d3", categoryId: "deep", text: "When do you feel most understood by someone?" },
  { id: "d4", categoryId: "deep", text: "What's something you needed to hear during a hard time, and did you get it?" },
  { id: "d5", categoryId: "deep", text: "What does success actually mean to you, outside of money or status?" },
  { id: "d6", categoryId: "deep", text: "What's a fear you rarely say out loud?" },
  { id: "d7", categoryId: "deep", text: "How has heartbreak or loss changed the way you love?" },
  { id: "d8", categoryId: "deep", text: "What do you think people misunderstand about you?" },
  { id: "d9", categoryId: "deep", text: "What's something you're still working on forgiving — yourself or someone else?" },
  { id: "d10", categoryId: "deep", text: "What makes you feel most alive?" },
  { id: "d11", categoryId: "deep", text: "What's a question you wish I would ask you more often?" },
  { id: "d12", categoryId: "deep", text: "What does unconditional love look like to you, practically?" },

  // Fun & Playful
  { id: "p1", categoryId: "playful", text: "If we had to survive a zombie apocalypse together, what's our division of labor?" },
  { id: "p2", categoryId: "playful", text: "What's the most 'us' inside joke we have?" },
  { id: "p3", categoryId: "playful", text: "If you could instantly master one random skill, what would it be?" },
  { id: "p4", categoryId: "playful", text: "What's a food combination you love that most people think is weird?" },
  { id: "p5", categoryId: "playful", text: "If our relationship were a movie genre, what would it be and why?" },
  { id: "p6", categoryId: "playful", text: "What's your most-used emoji when texting me?" },
  { id: "p7", categoryId: "playful", text: "If we swapped bodies for a day, what's the first thing you'd do?" },
  { id: "p8", categoryId: "playful", text: "What's a fictional world you'd want us to live in together?" },
  { id: "p9", categoryId: "playful", text: "What's the most ridiculous thing you've ever done to make me laugh — or would do?" },
  { id: "p10", categoryId: "playful", text: "Cats, dogs, both, or neither — and how many is too many?" },
  { id: "p11", categoryId: "playful", text: "What's a talent show act we could actually pull off as a team?" },
  { id: "p12", categoryId: "playful", text: "If we got matching tattoos on a whim, what would they be?" },

  // Date Night / Romance
  { id: "r1", categoryId: "romance", text: "What was your first impression of me, honestly?" },
  { id: "r2", categoryId: "romance", text: "What's a small gesture that makes you feel most loved?" },
  { id: "r3", categoryId: "romance", text: "What's your favorite memory of us so far?" },
  { id: "r4", categoryId: "romance", text: "When did you know you had feelings for me?" },
  { id: "r5", categoryId: "romance", text: "What's a quality of mine that you didn't expect to fall for?" },
  { id: "r6", categoryId: "romance", text: "What does the ideal date night look like for you right now?" },
  { id: "r7", categoryId: "romance", text: "What's something I do that makes you feel desired?" },
  { id: "r8", categoryId: "romance", text: "What's a place you'd love for us to go together someday?" },
  { id: "r9", categoryId: "romance", text: "How do you like to be comforted when you're upset?" },
  { id: "r10", categoryId: "romance", text: "What's a compliment you don't hear often but would love to?" },
  { id: "r11", categoryId: "romance", text: "What's one thing that's gotten better about 'us' since we started?" },
  { id: "r12", categoryId: "romance", text: "What song reminds you of me, or of us?" },

  // Future Together
  { id: "f1", categoryId: "future", text: "What does a meaningful life look like to you ten years from now?" },
  { id: "f2", categoryId: "future", text: "What's a goal you have that you'd love my support on?" },
  { id: "f3", categoryId: "future", text: "How do you picture the two of us growing old?" },
  { id: "f4", categoryId: "future", text: "What role does family — however we define it — play in your future?" },
  { id: "f5", categoryId: "future", text: "What's something you want to learn or try together this year?" },
  { id: "f6", categoryId: "future", text: "What does 'settling down' mean to you, if anything?" },
  { id: "f7", categoryId: "future", text: "If money weren't a factor, what would our life look like?" },
  { id: "f8", categoryId: "future", text: "What traditions do you want us to build together?" },
  { id: "f9", categoryId: "future", text: "What's a version of yourself you're hoping to grow into?" },
  { id: "f10", categoryId: "future", text: "How do you want us to handle big decisions as a team?" },

  // Trust & Vulnerability
  { id: "t1", categoryId: "trust", text: "What helps you feel safe enough to be fully honest with someone?" },
  { id: "t2", categoryId: "trust", text: "Is there something you've been meaning to tell me but haven't found the moment?" },
  { id: "t3", categoryId: "trust", text: "What's a moment you felt truly seen by me?" },
  { id: "t4", categoryId: "trust", text: "What does trust look like to you, day to day?" },
  { id: "t5", categoryId: "trust", text: "What's something you're insecure about that I could help ease?" },
  { id: "t6", categoryId: "trust", text: "When was the last time you cried, and would you tell me why?" },
  { id: "t7", categoryId: "trust", text: "What's a part of yourself you're still learning to accept?" },
  { id: "t8", categoryId: "trust", text: "How can I best support you when you're struggling but don't want to talk?" },
  { id: "t9", categoryId: "trust", text: "What's something you appreciate about me that you don't say enough?" },
  { id: "t10", categoryId: "trust", text: "What would make you feel even closer to me than you already do?" },

  // Spicy & Hot (18+)
  { id: "sp1", categoryId: "spicy", text: "What's a fantasy you've never told me about?" },
  { id: "sp2", categoryId: "spicy", text: "What's one thing you'd love for me to do more of when we're intimate?" },
  { id: "sp3", categoryId: "spicy", text: "What's your favorite way for me to initiate something intimate?" },
  { id: "sp4", categoryId: "spicy", text: "What's an outfit, or moment, that instantly gets your attention?" },
  { id: "sp5", categoryId: "spicy", text: "Is there a role-play scenario or fantasy you'd want to try together sometime?" },
  { id: "sp6", categoryId: "spicy", text: "What's the sexiest thing I've ever said or done, in your memory?" },
  { id: "sp7", categoryId: "spicy", text: "Slow and sensual, or playful and fast — what's your mood tonight?" },
  { id: "sp8", categoryId: "spicy", text: "What's something on your intimacy bucket list you haven't told me yet?" },
  { id: "sp9", categoryId: "spicy", text: "What's your favorite way to be teased or flirted with?" },
  { id: "sp10", categoryId: "spicy", text: "What makes you feel most desired by me?" },
  { id: "sp11", categoryId: "spicy", text: "If we had a whole weekend alone with zero interruptions, how would you want to spend it?" },
  { id: "sp12", categoryId: "spicy", text: "What's a compliment about your body or attractiveness you'd love to hear from me more often?" },
  { id: "sp13", categoryId: "spicy", text: "What's something new you'd be curious to explore together?" },
  { id: "sp14", categoryId: "spicy", text: "What helps you feel most comfortable and confident being intimate with me?" },
  { id: "sp15", categoryId: "spicy", text: "What's a small gesture that instantly builds anticipation for you?" },
  { id: "sp16", categoryId: "spicy", text: "Where's somewhere new (or bold) you'd love for us to be intimate together?" },
  { id: "sp17", categoryId: "spicy", text: "What does feeling truly wanted by me look like, physically?" },
  { id: "sp18", categoryId: "spicy", text: "What's one thing you wish I'd ask you more about our intimate life?" },

  // Communication / Conflict
  { id: "c1", categoryId: "conflict", text: "How do you like to resolve disagreements — talk right away, or take space first?" },
  { id: "c2", categoryId: "conflict", text: "What's something I do during an argument that helps, and something that doesn't?" },
  { id: "c3", categoryId: "conflict", text: "How did your family handle conflict growing up, and how does that show up in you now?" },
  { id: "c4", categoryId: "conflict", text: "What's a disagreement we've had that actually made us stronger?" },
  { id: "c5", categoryId: "conflict", text: "How do you prefer to receive feedback or criticism from me?" },
  { id: "c6", categoryId: "conflict", text: "What's something you need to hear after we've had a fight?" },
  { id: "c7", categoryId: "conflict", text: "Is there a recurring disagreement we should talk through outside of the heat of the moment?" },
  { id: "c8", categoryId: "conflict", text: "How do you know when I'm upset, even if I haven't said anything?" },
  { id: "c9", categoryId: "conflict", text: "What boundary do you have that you want me to understand better?" },
  { id: "c10", categoryId: "conflict", text: "What's one thing we could do to communicate even better as a team?" },
];
