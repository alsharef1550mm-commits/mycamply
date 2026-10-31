import type { Lesson } from "./additional-chapters";

export const halloweenChapter: Lesson = {
  id: 49,
  title: "Halloween & Imagination",
  subtitle:
    "Explore costumes, decorations, stories, and different attitudes to celebrations",
  entries: [
    [
      "costume",
      "noun",
      "clothes worn to look like a particular person, character, or creature",
      "Her Halloween costume was inspired by a character from a book.",
      "What costume would you choose for a themed event, and why?",
    ],
    [
      "spooky",
      "adjective",
      "slightly frightening in a mysterious or playful way",
      "The dim lights gave the hallway a spooky atmosphere.",
      "What makes a story spooky without making it too frightening?",
    ],
    [
      "carve",
      "verb",
      "to cut a material into a shape or cut a design into its surface",
      "They plan to carve a smiling face into the pumpkin.",
      "What design would you like to carve into a pumpkin or a piece of wood?",
    ],
    [
      "lantern",
      "noun",
      "a light inside a protective container, often designed to be carried or hung",
      "A paper lantern glowed beside the doorway.",
      "How could a lantern change the atmosphere of an outdoor gathering?",
    ],
    [
      "disguise",
      "noun",
      "something worn or done to hide a person's identity",
      "The actor's disguise included a wig and a false mustache.",
      "What would make a disguise convincing in a film or play?",
    ],
    [
      "treat",
      "noun",
      "something enjoyable given or done as a special pleasure, often a sweet snack",
      "Each visitor received a small chocolate treat.",
      "What would you consider a special treat after a busy week?",
    ],
    [
      "superstition",
      "noun",
      "a belief that an object or action brings good or bad luck without a scientific basis",
      "The story refers to a superstition about walking under ladders.",
      "Have you heard of a superstition that people follow even when they do not fully believe it?",
    ],
  ],
};

export const halloweenSpeakingRow: [
  number,
  string[],
  string,
  string[],
  string,
  string[],
  string,
] = [
  49,
  [
    "Do people mark Halloween in the area where you live?",
    "Did you enjoy dressing up as different characters when you were a child?",
    "Do you prefer making decorations yourself or buying them?",
  ],
  "Describe an unusual costume you have seen.",
  [
    "where you saw it, for example at an event or in a film",
    "what it looked like",
    "who was wearing it",
  ],
  "explain what made the costume memorable",
  [
    "Why do some people enjoy pretending to be a different character?",
    "How can films and advertising influence the way seasonal celebrations are observed?",
    "How can organizers make themed events enjoyable for people with different beliefs and preferences?",
  ],
  "Describe appearance with precise details, then explain its effect; distinguish personal preferences from assumptions about an entire culture. You can discuss something you have seen without having celebrated Halloween yourself.",
];

export const halloweenQuizSentences = [
  "The stage designer created a {costume} with a crown and a velvet cape for the actor playing the king.",
  "The empty house felt {spooky} when a door creaked in the darkness.",
  "The sculptor will {carve} a bird from a solid block of wood.",
  "When the campsite became dark, we hung a {lantern} inside the tent for light.",
  "A false accent served as a {disguise}, preventing callers from recognizing the detective's voice.",
  "We normally eat at home, but dinner at our favorite restaurant was a birthday {treat}.",
  "The idea that a certain number automatically brings bad luck is a {superstition}, rather than an evidence-based explanation.",
];
