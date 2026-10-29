import { extendedSpeakingRows } from "./extended-ielts.ts";
// Independently authored IELTS-style practice. Never described as official test questions.
// Each row: chapter, Part 1 (three questions), cue, three cue points, explanation,
// Part 3 (three linked questions), and a specific language-development target.
type SpeakingRow = [
  number,
  string[],
  string,
  string[],
  string,
  string[],
  string,
];
const rows: SpeakingRow[] = [
  [
    1,
    [
      "What do you like most about the area where you live?",
      "Is there anything you would change about your home?",
      "Did you spend much time outdoors in your neighborhood as a child?",
    ],
    "Describe a place near your home where you enjoy spending time.",
    ["where it is", "what you do there", "who you usually go with"],
    "explain why this place matters to you",
    [
      "What makes a neighborhood a good place for families?",
      "How can public spaces affect relationships between neighbors?",
      "Why might people's housing preferences change as they get older?",
    ],
    "Use location phrases such as within walking distance; contrast your area now with how it used to be.",
  ],
  [
    2,
    [
      "What kind of work do you do, or would you like to do?",
      "Which part of a working day do you think you would enjoy most?",
      "Do you prefer a fixed routine or varied tasks?",
    ],
    "Describe a person whose work you admire.",
    [
      "who the person is",
      "what work they do",
      "how you learned about their work",
    ],
    "explain what you admire about their approach",
    [
      "Why do some jobs receive more respect than others?",
      "How has technology changed what employers expect from workers?",
      "Should job satisfaction matter more than job security?",
    ],
    "Support an evaluation with an example; use although to acknowledge a disadvantage.",
  ],
  [
    3,
    [
      "How do you usually spend a free evening?",
      "Have your hobbies changed since you were younger?",
      "Is there a hobby you would like to try?",
    ],
    "Describe an activity you learned to do in your spare time.",
    [
      "what the activity was",
      "how you learned it",
      "what was difficult at first",
    ],
    "explain why you continued with it",
    [
      "Why do adults sometimes give up their hobbies?",
      "Should schools give creative hobbies the same attention as sport?",
      "How can having a hobby influence a person's working life?",
    ],
    "Use past simple for the learning experience and present perfect for progress since then.",
  ],
  [
    4,
    [
      "Do you usually meet friends at home or somewhere else?",
      "What do you enjoy doing with your closest friends?",
      "Is it easy for you to keep in touch with old friends?",
    ],
    "Describe a friend who helped you at an important time.",
    ["who the friend is", "what situation you were in", "what your friend did"],
    "explain how this affected your friendship",
    [
      "How do friendships in adulthood differ from those in childhood?",
      "Can online friendships be as strong as friendships formed in person?",
      "Why is trust sometimes difficult to rebuild between friends?",
    ],
    "Describe personal qualities through actions; link cause and result with as a result.",
  ],
  [
    5,
    [
      "What kind of food do you enjoy cooking?",
      "Who usually prepared meals when you were a child?",
      "Do you like trying unfamiliar dishes?",
    ],
    "Describe a meal that you particularly enjoyed.",
    ["what you ate", "where and when you had it", "who was with you"],
    "explain what made the meal memorable",
    [
      "Why do traditional dishes remain important to many communities?",
      "How have busy lifestyles changed the way people eat?",
      "Should schools teach children how to prepare food?",
    ],
    "Use sensory adjectives precisely; organize the meal story chronologically.",
  ],
  [
    6,
    [
      "What do you normally do on Saturday mornings?",
      "Do you prefer planning your weekends in advance?",
      "Which daily activity would you like to spend less time on?",
    ],
    "Describe a day off that was different from your usual routine.",
    [
      "when it was",
      "what you did",
      "how the day differed from your expectations",
    ],
    "explain how you felt at the end of the day",
    [
      "Why do some people find it difficult to relax on their days off?",
      "How does working at weekends affect family life?",
      "Would a shorter working week benefit everyone equally?",
    ],
    "Contrast expectations with events using had planned to and ended up.",
  ],
  [
    7,
    [
      "Do you enjoy browsing in shops?",
      "What do you usually consider before buying clothes?",
      "Has the way you shop changed in recent years?",
    ],
    "Describe something you bought that turned out to be very useful.",
    ["what it was", "where you bought it", "how you use it"],
    "explain why it was a good choice",
    [
      "Why do people sometimes buy things they do not need?",
      "What effects can online shopping have on town centers?",
      "Who should take responsibility for reducing unnecessary packaging?",
    ],
    "Compare price with quality; use worth buying and good value in appropriate contexts.",
  ],
  [
    8,
    [
      "What kind of weather do you enjoy most?",
      "Does the weather often affect your daily plans?",
      "Which season did you look forward to as a child?",
    ],
    "Describe a time when the weather changed your plans.",
    [
      "what you had planned",
      "what the weather was like",
      "what you did instead",
    ],
    "explain how you felt about the change",
    [
      "How does climate influence the way homes are designed?",
      "Why do some outdoor businesses depend heavily on weather forecasts?",
      "How could cities make extreme weather less disruptive?",
    ],
    "Use past perfect to establish the original plan, then past simple for the change.",
  ],
  [
    9,
    [
      "Do you prefer short trips or longer holidays?",
      "What do you usually prepare before traveling?",
      "Is there a place you would like to visit again?",
    ],
    "Describe a journey that you remember clearly.",
    ["where you went", "how you traveled", "what happened during the journey"],
    "explain why you still remember it",
    [
      "How can tourism change the character of a place?",
      "Why might some travelers choose less well-known destinations?",
      "Should governments limit visitor numbers in very popular places?",
    ],
    "Sequence events without overusing then; use during the journey and on arrival.",
  ],
  [
    10,
    [
      "When do you usually listen to music?",
      "Did you enjoy music lessons at school?",
      "Do you prefer listening alone or with other people?",
    ],
    "Describe a song or piece of music that is important to you.",
    ["what it is", "when you first heard it", "when you listen to it now"],
    "explain why it has a special meaning for you",
    [
      "Why can music bring back strong memories?",
      "How has streaming changed the way people discover musicians?",
      "Should public money support music education?",
    ],
    "Connect memories to present feelings; paraphrase emotional descriptions instead of repeating nice.",
  ],
  [
    11,
    [
      "Where do you find it easiest to study?",
      "Which subject interested you most at school?",
      "Do you find it helpful to study with other people?",
    ],
    "Describe something difficult that you successfully learned.",
    [
      "what you learned",
      "why you wanted to learn it",
      "how you dealt with difficulties",
    ],
    "explain how the experience changed your attitude to learning",
    [
      "What encourages people to keep learning after leaving school?",
      "How should teachers balance independence with guidance?",
      "Are examinations always a fair way to judge learning?",
    ],
    "Explain a process using initially, gradually, and eventually; give evidence of improvement.",
  ],
  [
    12,
    [
      "What do you do to stay active?",
      "Do you find it easy to get enough sleep?",
      "Has your daily routine become healthier over time?",
    ],
    "Describe a change you made to improve your daily well-being.",
    [
      "what you changed",
      "why you made the change",
      "how easy it was to maintain",
    ],
    "explain what difference it made to your life",
    [
      "Why can healthy habits be difficult to maintain?",
      "How much responsibility should employers take for workers' well-being?",
      "Should cities give more space to physical activity?",
    ],
    "Describe gradual change with become and get; distinguish personal experience from general claims.",
  ],
  [
    13,
    [
      "Which piece of technology do you use most often?",
      "Do you enjoy learning how to use new apps?",
      "When do you prefer to communicate face to face?",
    ],
    "Describe a digital tool that made a task easier for you.",
    ["what the tool is", "how you discovered it", "what you use it for"],
    "explain why it is useful despite any limitations",
    [
      "Why do some people find digital services difficult to use?",
      "How has instant communication changed people's expectations?",
      "Should essential services always offer an offline option?",
    ],
    "Explain functionality with allows me to and makes it easier to; qualify broad statements.",
  ],
  [
    14,
    [
      "Are there many green spaces where you live?",
      "Do you try to avoid wasting electricity?",
      "Did you learn about protecting nature at school?",
    ],
    "Describe an environmental improvement you have noticed in a place you know.",
    ["where it happened", "what changed", "who was involved"],
    "explain how the change affected the area",
    [
      "What motivates people to change environmentally harmful habits?",
      "Should businesses or individuals carry more responsibility for reducing waste?",
      "How can governments judge whether an environmental policy is working?",
    ],
    "Explain causes and consequences; use may and tends to when the evidence is uncertain.",
  ],
  [
    15,
    [
      "How do you usually travel around your town?",
      "Do you like walking for short journeys?",
      "What public service do you use most often?",
    ],
    "Describe a public service that you found helpful.",
    ["what the service was", "when you used it", "how it helped you"],
    "explain what made the service effective",
    [
      "Why are reliable public services important for a city?",
      "How should a city decide which transport projects to fund?",
      "What difficulties might older people face when services move online?",
    ],
    "Compare accessibility and reliability; develop a point with a concrete example.",
  ],
  [
    16,
    [
      "Do you like making plans far in advance?",
      "Who do you usually ask for advice about decisions?",
      "Have you changed any important plans recently?",
    ],
    "Describe an important decision that took you some time to make.",
    [
      "what the decision was",
      "which options you considered",
      "what helped you decide",
    ],
    "explain how you feel about your decision now",
    [
      "Why do some people find major decisions more difficult than others?",
      "How can too much information affect decision-making?",
      "Should young people be encouraged to make their own educational choices?",
    ],
    "Explain alternatives with either...or; use would have to reflect on an option you rejected.",
  ],
  [
    17,
    [
      "Do you enjoy solving practical problems?",
      "What do you usually do when something stops working?",
      "Are you comfortable asking other people for help?",
    ],
    "Describe a problem you solved with help from another person.",
    ["what the problem was", "who helped you", "what you did together"],
    "explain what you learned from the experience",
    [
      "Why do people sometimes delay dealing with small problems?",
      "What makes advice useful rather than confusing?",
      "Should schools spend more time teaching practical problem-solving?",
    ],
    "Separate the cause, action, and outcome; use because of with a noun phrase.",
  ],
  [
    18,
    [
      "Do you often discuss your opinions with friends?",
      "Have you ever changed your mind after a conversation?",
      "Do you prefer reading reviews or asking someone you know?",
    ],
    "Describe a time when you changed your opinion about something.",
    [
      "what you originally thought",
      "what new information you received",
      "how your view changed",
    ],
    "explain why the new information persuaded you",
    [
      "Why do some people resist evidence that challenges their views?",
      "What role should schools play in teaching critical thinking?",
      "Can public disagreement lead to better decisions?",
    ],
    "Distinguish an observation from an interpretation; acknowledge a counterargument before responding.",
  ],
  [
    19,
    [
      "Do you usually plan your spending?",
      "Did you save money for anything when you were a child?",
      "What kinds of things do you prefer to spend money on?",
    ],
    "Describe something you saved money to buy.",
    ["what it was", "why you wanted it", "how you managed to save for it"],
    "explain how you felt when you finally bought it",
    [
      "Why is it difficult for some people to save regularly?",
      "Should financial education be taught at school?",
      "How can advertising influence people's ideas about what they need?",
    ],
    "Describe a goal and sacrifice; use set money aside and cut back on naturally.",
  ],
  [
    20,
    [
      "What kind of job interested you when you were younger?",
      "Do you enjoy meeting new people in formal situations?",
      "Which skill would you most like to develop for your future career?",
    ],
    "Describe a skill you developed that could be useful in a job.",
    ["what the skill is", "how you developed it", "when you have used it"],
    "explain why employers might value this skill",
    [
      "How useful are interviews for judging a person's ability to do a job?",
      "Why are career changes becoming more common in some societies?",
      "Should employers value experience more than qualifications?",
    ],
    "Support strengths with actions and outcomes; avoid unsupported claims about being the best.",
  ],
  [
    21,
    [
      "Do you enjoy taking part in local celebrations?",
      "What do you normally do when visitors come to your home?",
      "Is there a tradition you enjoyed more as a child?",
    ],
    "Describe a cultural celebration you enjoyed attending.",
    [
      "what the celebration was",
      "where it took place",
      "what people did there",
    ],
    "explain what you found meaningful about it",
    [
      "Why do some traditions survive while others disappear?",
      "How can communities introduce their customs to visitors respectfully?",
      "Can a celebration remain meaningful if it becomes very commercial?",
    ],
    "Explain a custom without assuming everyone follows it; use often, in some families, and traditionally.",
  ],
  [
    22,
    [
      "How do you usually find out what is happening in the world?",
      "Do you prefer reading news or watching it?",
      "What kinds of news stories interest you most?",
    ],
    "Describe a news story that made you think differently about an issue.",
    [
      "what the story was about",
      "where you encountered it",
      "what you learned",
    ],
    "explain why it affected your thinking",
    [
      "Why can misleading stories spread quickly?",
      "What responsibilities do journalists have when reporting uncertain information?",
      "How can people become more careful consumers of news?",
    ],
    "Attribute information with according to and the report suggested; distinguish certainty from possibility.",
  ],
  [
    23,
    [
      "Did you enjoy science lessons at school?",
      "Do you like finding out how everyday objects work?",
      "Have you watched any interesting science programs?",
    ],
    "Describe a scientific idea or discovery that you found interesting.",
    ["what it was", "how you learned about it", "what you understood about it"],
    "explain why it caught your attention",
    [
      "Why is it important to explain scientific research clearly to the public?",
      "Should research funding focus only on practical applications?",
      "How can uncertainty in scientific findings be communicated without losing public trust?",
    ],
    "Explain an unfamiliar idea in plain language; use an analogy and identify its limits.",
  ],
  [
    24,
    [
      "Do you prefer working with others or on your own?",
      "What role do you usually take in a group?",
      "Did you enjoy group activities at school?",
    ],
    "Describe a time when you worked with other people to achieve something.",
    [
      "what you were trying to achieve",
      "what your role was",
      "how the group worked together",
    ],
    "explain what made the experience successful or difficult",
    [
      "What qualities make someone an effective team leader?",
      "How can groups benefit from members who disagree?",
      "Should rewards for group work be shared equally?",
    ],
    "Distinguish your contribution from the group's achievement; explain concessions using even though.",
  ],
  [
    25,
    [
      "Do you prefer busy days or quieter days?",
      "How do you remember things you need to do?",
      "Is there a habit you would like to change?",
    ],
    "Describe a goal that required regular effort over a period of time.",
    [
      "what the goal was",
      "how you organized your time",
      "what setbacks you faced",
    ],
    "explain how the experience affected your confidence",
    [
      "Why do people abandon goals even when they still value them?",
      "Is self-discipline more important than motivation?",
      "How can workplaces help people use their time more effectively?",
    ],
    "Describe persistence with kept doing and managed to; explain a setback without losing the main thread.",
  ],
  [
    26,
    [
      "Do you know many people who live near you?",
      "Have you ever helped with a local activity?",
      "What shared facilities would you like near your home?",
    ],
    "Describe an improvement you would like to make to your local community.",
    [
      "what the improvement would be",
      "who would benefit",
      "how it could be carried out",
    ],
    "explain why you think it should be a priority",
    [
      "How should communities choose between competing local needs?",
      "What encourages residents to take part in neighborhood projects?",
      "Should local services rely on volunteers?",
    ],
    "Use conditional forms to discuss a proposal; consider a benefit and a practical limitation.",
  ],
  [
    27,
    [
      "What kinds of books do you enjoy reading?",
      "Do you prefer reading on paper or on a screen?",
      "Did anyone read stories to you when you were young?",
    ],
    "Describe a book or story that stayed in your mind.",
    [
      "what it was about",
      "when you read or heard it",
      "which part you remember best",
    ],
    "explain why it made a lasting impression",
    [
      "Why do stories from long ago still appeal to modern readers?",
      "How might reading fiction help people understand others?",
      "Should children be free to choose everything they read?",
    ],
    "Summarize without retelling every event; use a relative clause to describe a character.",
  ],
  [
    28,
    [
      "Do you enjoy visiting museums or galleries?",
      "What kinds of creative activities have you tried?",
      "Is there a piece of art you see regularly?",
    ],
    "Describe a work of art that you found memorable.",
    ["what it was", "where you saw it", "what you noticed about it"],
    "explain the effect it had on you",
    [
      "What makes art valuable to a community?",
      "Should public art be chosen by experts or by local residents?",
      "How might digital tools change the skills artists need?",
    ],
    "Describe visual details precisely; separate what you saw from how you interpreted it.",
  ],
  [
    29,
    [
      "Do you prefer taking part in sport or watching it?",
      "What games did you enjoy as a child?",
      "Have you ever tried a sport that was new to you?",
    ],
    "Describe a competition you took part in or watched.",
    ["what the competition was", "who took part", "what happened"],
    "explain why it was exciting or meaningful for you",
    [
      "What can children learn from losing a competition?",
      "Can too much competition reduce enjoyment of an activity?",
      "Should professional athletes be expected to act as role models?",
    ],
    "Build a clear sequence and vary verbs for success and difficulty; avoid exaggerating every event.",
  ],
  [
    30,
    [
      "Do you enjoy looking at old photographs?",
      "What do you remember about your first school?",
      "Do you keep objects that remind you of the past?",
    ],
    "Describe an object that reminds you of a special time in your life.",
    ["what the object is", "how you got it", "what memories it brings back"],
    "explain why you have kept it",
    [
      "Why do ordinary objects sometimes have great personal value?",
      "How has digital photography changed the way people preserve memories?",
      "Is it important for younger generations to learn about family history?",
    ],
    "Use used to for past habits and past continuous for background; return to the object's significance.",
  ],
  [
    31,
    [
      "Do you prefer spending time in cities or in the countryside?",
      "What do you notice first when you visit a new city?",
      "Is your nearest town changing quickly?",
    ],
    "Describe a city or town you would like to spend more time in.",
    [
      "where it is",
      "what you know about it",
      "what you would like to do there",
    ],
    "explain why it appeals to you",
    [
      "Why do large cities attract people despite their high costs?",
      "How can cities grow without losing their local identity?",
      "Should governments encourage people to settle outside major cities?",
    ],
    "Compare places using whereas; separate what you know from what you imagine.",
  ],
  [
    32,
    [
      "Do you enjoy thinking about the future?",
      "What everyday invention do you find especially useful?",
      "Would you like to learn a completely new skill in the next few years?",
    ],
    "Describe an invention you would like to see developed.",
    ["what it would do", "who would use it", "how it might work"],
    "explain why it could improve people's lives",
    [
      "Why do some useful inventions take a long time to become popular?",
      "How should societies respond when new technology replaces familiar jobs?",
      "Can technological progress create as many problems as it solves?",
    ],
    "Speculate with might, could, and would; explain a possible unintended consequence.",
  ],
  ...extendedSpeakingRows,
];

export const speakingSets = rows.map(
  ([chapterId, part1, cue, points, explanation, part3, languageFocus]) => ({
    chapterId,
    part1,
    cue,
    points,
    explanation,
    part3,
    languageFocus,
  }),
);
export function speakingQuestions(chapterId: number) {
  const set = speakingSets.find((s) => s.chapterId === chapterId);
  if (!set) throw new Error(`Missing speaking set: ${chapterId}`);
  return [
    ...set.part1.map((prompt, i) => ({
      id: `${chapterId}-ielts-p1-${i + 1}`,
      section: "IELTS-style Part 1 · familiar topics",
      kind: "discussion",
      prompt,
      expectedAnswer: null,
      origin: "supplemental",
      guidance:
        "Give a direct personal answer, then add a relevant reason or detail. Do not memorize a script.",
    })),
    {
      id: `${chapterId}-ielts-p2`,
      section: "IELTS-style Part 2 · long turn",
      kind: "discussion",
      prompt: `${set.cue}\nYou should say:\n${set.points.map((p) => `• ${p}`).join("\n")}\nand ${set.explanation}.`,
      expectedAnswer: null,
      origin: "supplemental",
      guidance:
        "Prepare for 1 minute. Make brief notes, then speak for 1–2 minutes. Develop a connected account rather than giving four short answers.",
    },
    ...set.part3.map((prompt, i) => ({
      id: `${chapterId}-ielts-p3-${i + 1}`,
      section: "IELTS-style Part 3 · deeper discussion",
      kind: "discussion",
      prompt,
      expectedAnswer: null,
      origin: "supplemental",
      guidance:
        "Discuss society or people in general. Explain your reasoning, give an example, and consider a different view when useful.",
    })),
  ];
}
