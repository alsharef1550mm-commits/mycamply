// Supplementary teaching notes and practice authored for the syllabus.
// Objective grammar keys are not model responses to speaking questions.
export const istoriaWorkshops: Record<
  number,
  {
    note: string;
    drills: { prompt: string; answer: string; reason: string }[];
    speaking: string;
  }
> = {
  1: {
    note: "Use may + subject + base verb for a formal request for permission. May I…? asks permission for your own action. Could you…? requests another person's help. Choose language that fits the relationship.",
    drills: [
      {
        prompt:
          "Choose the correct form: May I ___ your charger? (borrow / borrowing)",
        answer: "borrow",
        reason: "A modal verb is followed by the base form.",
      },
      {
        prompt:
          "Put these words in order to ask permission: leave / I / early / may / ?",
        answer: "May I leave early?",
        reason: "In a question, may comes before the subject.",
      },
    ],
    speaking:
      "How would you politely ask a tutor to change the lesson time, and how could you respond if they could not?",
  },
  2: {
    note: "Might + base verb expresses possibility, not certainty. Might not means something is possibly not true or will possibly not happen. Separate a verified fact from a possibility when discussing news.",
    drills: [
      {
        prompt:
          "Choose the correct form: The image might ___ edited. (be / is)",
        answer: "be",
        reason: "Might takes a base verb, including be.",
      },
      {
        prompt:
          "Make this statement less certain using might: The report contains an error.",
        answer: "The report might contain an error.",
        reason: "Use might contain, not might contains.",
      },
    ],
    speaking:
      "What would you check before sharing a surprising online story, and what might happen if it were inaccurate?",
  },
  3: {
    note: "Ought to gives advice or expresses what is desirable. Must and have to can express obligation. Must not expresses prohibition; do not have to means there is no obligation. Advice language here is grammar practice, not medical guidance.",
    drills: [
      {
        prompt:
          "Choose the form that means attendance is optional: You ___ attend. (must not / do not have to)",
        answer: "do not have to",
        reason: "No obligation is different from prohibition.",
      },
      {
        prompt:
          "Complete the advice with the missing word: You ought ___ take a break.",
        answer: "to",
        reason: "Ought is followed by to + base verb.",
      },
    ],
    speaking:
      "How could you suggest a more manageable study routine without sounding as if you were giving an order?",
  },
  4: {
    note: "Be allowed to describes permission; be able to describes ability. Change be for tense and subject. Someone may be able to do something but not be allowed to do it.",
    drills: [
      {
        prompt:
          "Visitors have permission to enter: They are ___ to enter. (allowed / allowing)",
        answer: "allowed",
        reason: "Use be allowed to for permission.",
      },
      {
        prompt:
          "Complete the ability expression: She was able ___ solve the problem.",
        answer: "to",
        reason: "Be able to is followed by the base verb.",
      },
    ],
    speaking:
      "What is something people are able to do with technology but should not always be allowed to do?",
  },
  5: {
    note: "For a realistic future possibility, use if + present simple, then will + base verb. For an imagined situation, often use if + past simple, then would + base verb. The past form in the second pattern signals distance from reality, not necessarily past time.",
    drills: [
      {
        prompt:
          "Choose the standard first-conditional form: If it ___, we will stay inside. (rains / will rain)",
        answer: "rains",
        reason: "Use present simple in this if-clause.",
      },
      {
        prompt:
          "Complete the hypothetical result: If I had more time, I ___ learn another language. (would / will)",
        answer: "would",
        reason:
          "Would matches the imagined situation introduced by if + past simple.",
      },
    ],
    speaking:
      "How would your decision about a job change if the salary were higher but the journey were twice as long?",
  },
  6: {
    note: "For emphasis in an affirmative statement, use stressed do, does, or did + base verb. Does carries the third-person ending; did carries past tense. The syllabus calls this do + infinitive; the verb here is a bare infinitive, without to.",
    drills: [
      {
        prompt:
          "Choose the emphatic form: She does ___ the evidence. (check / checks)",
        answer: "check",
        reason:
          "Does carries the grammatical ending, so the main verb stays in its base form.",
      },
      {
        prompt: "Emphasize the past statement using did: They tested the idea.",
        answer: "They did test the idea.",
        reason: "Did is followed by test, not tested.",
      },
    ],
    speaking:
      "How could you explain that a failed experiment still provided useful evidence, while emphasizing what the researchers actually did?",
  },
  7: {
    note: "Shall I…? can offer to do something; Shall we…? can propose a shared action. These uses are especially associated with British English. They are different from using should to ask for advice.",
    drills: [
      {
        prompt:
          "Put these words in order to suggest an activity: we / shall / outside / meet / ?",
        answer: "Shall we meet outside?",
        reason: "Shall we + base verb can make a suggestion.",
      },
      {
        prompt:
          "Choose the correct form for an offer: Shall I ___ the tickets? (book / booked)",
        answer: "book",
        reason: "Use the base verb after shall.",
      },
    ],
    speaking:
      "What plans could you suggest for a group whose members have different budgets and interests?",
  },
  8: {
    note: "Used to + base verb describes a past habit or state that is no longer true. Be supposed to expresses an expectation or arrangement. Be used to + noun or -ing means being accustomed to something, which is a different structure.",
    drills: [
      {
        prompt:
          "Choose the past-habit form: We used to ___ our cousins every Friday. (visit / visiting)",
        answer: "visit",
        reason: "Used to for past habits takes the base verb.",
      },
      {
        prompt:
          "Complete the expectation: Guests are supposed ___ arrive before seven.",
        answer: "to",
        reason: "Be supposed to is followed by a base verb.",
      },
    ],
    speaking:
      "Which social expectation has changed since your childhood, and how do you feel about that change?",
  },
  9: {
    note: "Sequence events clearly and keep past tenses consistent. How + adjective or adverb can form an exclamation; what + a/an + adjective + singular countable noun can form another. Exclamations add emphasis but should not replace the story.",
    drills: [
      {
        prompt:
          "Choose the exclamation word: ___ an unexpected ending! (What / How)",
        answer: "What",
        reason: "What works with an adjective and a noun phrase.",
      },
      {
        prompt: "Choose the exclamation word: ___ strange! (How / What)",
        answer: "How",
        reason: "How can introduce an adjective without a following noun.",
      },
    ],
    speaking:
      "What small mistake could start a story in which several ordinary things go wrong? Tell the events in a clear order.",
  },
  10: {
    note: "Because introduces a reason. So often connects a cause to its result. So + adjective/adverb + that introduces a result clause. Although introduces a contrast, not a cause. The source groups reason and result together; these structures work differently.",
    drills: [
      {
        prompt:
          "Choose the reason connector: The event was cancelled ___ the hall was flooded. (because / although)",
        answer: "because",
        reason: "The flooding explains the cancellation.",
      },
      {
        prompt:
          "Complete the result pattern: The response was so positive ___ we arranged a second event.",
        answer: "that",
        reason: "Use so + adjective + that + result clause.",
      },
    ],
    speaking:
      "What change would you campaign for locally, why is it needed, and what result would you hope to see?",
  },
  11: {
    note: "FANBOYS stands for for, and, nor, but, or, yet, so. These coordinating conjunctions connect equal grammatical units. Choose a conjunction for the relationship: addition, alternative, contrast, or result. A comma commonly separates two full clauses joined this way.",
    drills: [
      {
        prompt:
          "Choose the contrast connector: I was tired, ___ I enjoyed the walk. (but / so)",
        answer: "but",
        reason:
          "The second clause contrasts with the expectation created by the first.",
      },
      {
        prompt:
          "Choose the alternative connector: We can paint ___ make pottery. (or / yet)",
        answer: "or",
        reason: "Or presents a choice between alternatives.",
      },
    ],
    speaking:
      "When do you feel in your element, and how would you explain both the enjoyment and the challenge of that activity?",
  },
  12: {
    note: "As + adjective/adverb + as compares equality. Not as…as expresses a difference. So + adjective/adverb + that expresses degree and result; despite the source heading, it is not itself an equality comparison. Compare products using the same criteria.",
    drills: [
      {
        prompt:
          "Complete the equality comparison: This screen is as bright ___ the other one.",
        answer: "as",
        reason: "The equality pattern uses as on both sides of the adjective.",
      },
      {
        prompt:
          "Choose the result connector: The speaker was so quiet ___ we could barely hear it. (that / as)",
        answer: "that",
        reason: "So…that introduces the consequence of the low volume.",
      },
    ],
    speaking:
      "Which two everyday products could you compare fairly, and which criteria would matter most to the buyer?",
  },
  13: {
    note: "Reported speech conveys what someone said without repeating their exact words. After a past reporting verb, backshift is common, though not always necessary if something remains true. Change pronouns and time references when the context requires it. Say something; tell someone something.",
    drills: [
      {
        prompt:
          "Use standard backshift to report Lina's words, I am busy: Lina said that she ___ busy.",
        answer: "was",
        reason: "Am normally shifts to was in this past-reporting exercise.",
      },
      {
        prompt:
          "Choose the reporting verb: The manager ___ us that the meeting was online. (said / told)",
        answer: "told",
        reason:
          "Tell takes a person as its object; say does not take us directly.",
      },
    ],
    speaking:
      "How would you pass on a colleague's request accurately while making clear which words are theirs and which ideas are yours?",
  },
  14: {
    note: "Discourse markers help listeners follow the relationship between ideas: for example introduces an illustration, however signals contrast, and therefore signals a result. Use them where the relationship requires them rather than adding one to every sentence.",
    drills: [
      {
        prompt:
          "Choose the marker for an illustration: Some skills are useful in many jobs. ___, clear writing helps in teaching and business. (For example / Nevertheless)",
        answer: "For example",
        reason: "The next sentence gives a specific illustration.",
      },
      {
        prompt:
          "Choose the result marker: The venue was unavailable. ___, we moved the event online. (Therefore / Similarly)",
        answer: "Therefore",
        reason: "The second sentence states a consequence of the first.",
      },
    ],
    speaking:
      "Which improvement to education would you defend in a short debate, and how would you acknowledge a reasonable opposing view?",
  },
  15: {
    note: "Review by combining structures in your own account rather than inserting them randomly. A what-cleft can emphasize a point: What + clause + be + focused information. Check time references, verb forms, and logical connections after speaking or writing.",
    drills: [
      {
        prompt:
          "Correct the verb after the modal: I might needed more practice.",
        answer: "I might need more practice.",
        reason: "Might takes the base form need.",
      },
      {
        prompt:
          "Choose the word completing the cleft: What helped me most ___ regular feedback. (was / did)",
        answer: "was",
        reason: "The what-clause is linked to its focus with be.",
      },
    ],
    speaking:
      "Looking back at your study, which change helped most, what evidence shows improvement, and what will you try next?",
  },
};
