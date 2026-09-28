import type { NewReportInput, ReportType } from "./types";

const TEACHERS = [
  "Mrs. Adeyemi",
  "Mr. Okafor",
  "Miss Bello",
  "Mr. Nwachukwu",
  "Mrs. Yusuf",
  "Mr. Eze",
];

const CLASSES = ["JSS 1A", "JSS 1B", "JSS 2A", "JSS 2B", "JSS 3A", "SS 1A", "SS 2B"];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe(chance: number): boolean {
  return Math.random() < chance;
}

interface SubjectTopic {
  subject: string;
  topic: string;
  strengthAspect: string;
  challengeAspect: string;
}

const SUBJECT_TOPICS: SubjectTopic[] = [
  {
    subject: "Mathematics",
    topic: "fractions",
    strengthAspect: "adding fractions with the same denominator",
    challengeAspect: "fractions with different denominators",
  },
  {
    subject: "Mathematics",
    topic: "simple algebra",
    strengthAspect: "solving one-step equations",
    challengeAspect: "equations with variables on both sides",
  },
  {
    subject: "Mathematics",
    topic: "geometry — angles",
    strengthAspect: "identifying acute and obtuse angles",
    challengeAspect: "calculating angles in a triangle",
  },
  {
    subject: "English Language",
    topic: "comprehension passages",
    strengthAspect: "picking out the main idea of the passage",
    challengeAspect: "inferring meaning that wasn't directly stated",
  },
  {
    subject: "English Language",
    topic: "past and present tense",
    strengthAspect: "using the present tense correctly",
    challengeAspect: "irregular past tense verbs",
  },
  {
    subject: "Basic Science",
    topic: "states of matter",
    strengthAspect: "describing solids, liquids, and gases",
    challengeAspect: "explaining the process of evaporation",
  },
  {
    subject: "Basic Science",
    topic: "photosynthesis",
    strengthAspect: "naming what plants need to grow",
    challengeAspect: "explaining the role of chlorophyll",
  },
  {
    subject: "Social Studies",
    topic: "local government structure",
    strengthAspect: "naming the arms of local government",
    challengeAspect: "explaining how each arm functions",
  },
  {
    subject: "Agricultural Science",
    topic: "soil types",
    strengthAspect: "identifying sandy and clay soil",
    challengeAspect: "explaining which crops suit which soil",
  },
];

function generateLessonReport(): NewReportInput {
  const { subject, topic, strengthAspect, challengeAspect } = pick(SUBJECT_TOPICS);
  const teacher = pick(TEACHERS);
  const className = pick(CLASSES);
  const day = pick(DAYS);
  const hasChallenge = maybe(0.7);
  const isIncomplete = hasChallenge && maybe(0.55);
  const studentCount = hasChallenge ? 3 + Math.floor(Math.random() * 15) : 0;

  const sentences: string[] = [
    `${teacher} here. ${day}'s ${subject} class with ${className} — we ${pick(["continued", "covered", "introduced", "reviewed"])} ${topic}.`,
    `Most students understood ${strengthAspect}${
      hasChallenge
        ? `, but ${pick(["several", "a few", "some", "about a third of the class"])} students struggled with ${challengeAspect}.`
        : "."
    }`,
  ];

  if (hasChallenge && studentCount > 0) {
    sentences.push(`I noticed that about ${studentCount} students need additional explanation.`);
  }

  sentences.push(
    isIncomplete
      ? pick([
          "We also didn't finish the exercise because we spent extra time helping students understand the concept.",
          "We ran out of time before covering the last section of the lesson.",
          "We couldn't complete the planned classwork due to the extra revision time.",
        ])
      : pick([
          "We completed the exercise and most students finished on time.",
          "The lesson went as planned and we finished the classwork.",
          "Overall the class stayed on schedule and finished the exercise.",
        ])
  );

  return {
    reportType: "Lesson Report",
    reportText: sentences.join(" "),
  };
}

function generateHolidayReport(): NewReportInput {
  const teacher = pick(TEACHERS);
  const className = pick(CLASSES);
  const day = pick(DAYS);
  const activity = pick([
    "a revision camp",
    "an inter-house sports clinic",
    "a reading challenge",
    "an excursion to the science museum",
    "a community service project",
  ]);
  const issue = maybe(0.5)
    ? pick([
        "A few students missed the first two days due to transport issues.",
        "Turnout was lower than expected on the final day because of rain.",
        "Some students didn't bring the required materials on day one.",
      ])
    : null;
  const incomplete = issue && maybe(0.5);

  const sentences = [
    `${teacher} here, holiday activity update for ${className}, ${day}.`,
    `During the mid-term break we ran ${activity} for interested students.`,
    `Overall engagement was good and most students who attended participated actively.`,
  ];
  if (issue) sentences.push(issue);
  sentences.push(
    incomplete
      ? "We weren't able to cover the full planned schedule because of this."
      : "We were able to complete the full planned schedule."
  );

  return {
    reportType: "Holiday Report",
    reportText: sentences.join(" "),
  };
}

function generateTeacherReport(): NewReportInput {
  const teacher = pick(TEACHERS);
  const className = pick(CLASSES);
  const day = pick(DAYS);
  const focus = pick([
    "lesson planning and scheme of work coverage",
    "attendance and punctuality for the term",
    "professional development and training needs",
    "classroom resource and material needs",
  ]);
  const challenge = maybe(0.6)
    ? pick([
        "I'm finding it difficult to keep to the scheme of work given the number of public holidays this term.",
        "A few students in my class need extra support that I don't currently have time to give during normal periods.",
        "I need access to more teaching materials to cover the practical sections properly.",
      ])
    : null;

  const sentences = [
    `${teacher} here, ${day} general update for ${className}.`,
    `This report covers ${focus} for the term so far.`,
    `Overall things are progressing steadily and I've been able to keep most classes on track.`,
  ];
  if (challenge) sentences.push(challenge);
  sentences.push(
    challenge
      ? "I'd appreciate support or guidance on this before the next term."
      : "No major issues to flag at this time."
  );

  return {
    reportType: "Teacher Report",
    reportText: sentences.join(" "),
  };
}

function generateGeneralReport(): NewReportInput {
  const teacher = pick(TEACHERS);
  const className = pick(CLASSES);
  const day = pick(DAYS);
  const topic = pick([
    "the end-of-term assembly",
    "the new seating arrangement trial",
    "the library reading hour",
    "the class's group project",
  ]);
  const issue = maybe(0.5)
    ? "There was some difficulty getting all students to participate equally."
    : null;

  const sentences = [
    `${teacher} here, quick ${day} update on ${className}.`,
    `A quick update on ${topic}.`,
    "Most students responded well and engagement was generally positive.",
  ];
  if (issue) sentences.push(issue);
  sentences.push(
    issue ? "We'll adjust the approach next time." : "No follow-up action needed at this time."
  );

  return {
    reportType: "General Report",
    reportText: sentences.join(" "),
  };
}

const GENERATORS: Record<ReportType, () => NewReportInput> = {
  "Lesson Report": generateLessonReport,
  "Holiday Report": generateHolidayReport,
  "Teacher Report": generateTeacherReport,
  "General Report": generateGeneralReport,
};

// Weighted so most generated demo data still looks like everyday lesson
// reports, with the other report types mixed in for variety.
const TYPE_WEIGHTS: [ReportType, number][] = [
  ["Lesson Report", 0.55],
  ["Holiday Report", 0.15],
  ["Teacher Report", 0.15],
  ["General Report", 0.15],
];

function pickReportType(): ReportType {
  const roll = Math.random();
  let cumulative = 0;
  for (const [type, weight] of TYPE_WEIGHTS) {
    cumulative += weight;
    if (roll <= cumulative) return type;
  }
  return "Lesson Report";
}

export function generateRandomReport(): NewReportInput {
  return GENERATORS[pickReportType()]();
}

export function generateRandomReports(count: number): NewReportInput[] {
  return Array.from({ length: count }, () => generateRandomReport());
}
