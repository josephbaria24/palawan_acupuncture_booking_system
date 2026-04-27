export type ArticleBlock = { type: "h2" | "p"; text: string };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  blocks: ArticleBlock[];
};

export const articles: Article[] = [
  {
    slug: "first-acupuncture-visit-what-to-expect",
    title: "Your First Acupuncture Visit: What to Expect",
    excerpt:
      "A calm overview of consultation, treatment, and sensations—so you can arrive prepared and relaxed.",
    publishedAt: "2026-01-15",
    readingMinutes: 6,
    tags: ["Getting started", "Clinic"],
    blocks: [
      {
        type: "p",
        text: "If you have never tried acupuncture, it is normal to wonder what the session will feel like. At our clinic in Puerto Princesa, we focus on clear communication, comfort, and a pace that respects your needs.",
      },
      {
        type: "h2",
        text: "Before needles: consultation and goals",
      },
      {
        type: "p",
        text: "Your practitioner will ask about your health history, current symptoms, sleep, stress, and lifestyle. This is not about judgment—it helps tailor point selection and treatment style. Mention medications, recent injuries, and whether you are pregnant or have a bleeding disorder so care stays appropriate and safe.",
      },
      {
        type: "h2",
        text: "During treatment",
      },
      {
        type: "p",
        text: "Fine, sterile single-use needles are placed at specific points. Many people feel little more than a brief tap or tingling. A dull ache or gentle spreading warmth near a point can occur and often eases within moments. You may rest quietly for a period while the needles remain in place—this is a good time to breathe slowly and unwind.",
      },
      {
        type: "h2",
        text: "After your session",
      },
      {
        type: "p",
        text: "Some patients feel relaxed or lightly tired; others feel energized. Mild soreness at a point can happen and usually fades within a day. We will suggest simple aftercare (hydration, avoiding extreme exertion right away) and when to book a follow-up based on your goals.",
      },
    ],
  },
  {
    slug: "acupuncture-and-pain-stress-relief",
    title: "Acupuncture, Pain, and Everyday Stress",
    excerpt:
      "How traditional acupuncture is often used alongside conventional care for tension, discomfort, and nervous system balance.",
    publishedAt: "2026-02-03",
    readingMinutes: 7,
    tags: ["Pain", "Stress", "Wellness"],
    blocks: [
      {
        type: "p",
        text: "Acupuncture has been used for centuries to support people dealing with muscle tension, headaches, back or neck discomfort, and the wear and tear of busy schedules. Modern research continues to explore how needling and related techniques may influence pain signaling and the stress response.",
      },
      {
        type: "h2",
        text: "A whole-person view",
      },
      {
        type: "p",
        text: "Rather than treating only the painful spot, traditional acupuncture often looks at patterns: sleep quality, digestion, mood, and posture. That broader picture can guide point selection and lifestyle suggestions that complement your medical care.",
      },
      {
        type: "h2",
        text: "Stress and the nervous system",
      },
      {
        type: "p",
        text: "Many patients report feeling calmer after sessions. Relaxation during treatment—slow breathing, unclenching the jaw, softer shoulders—can be part of the benefit. Acupuncture is not a replacement for mental health treatment when you need it, but it can be a supportive part of self-care.",
      },
      {
        type: "h2",
        text: "Working with your doctor",
      },
      {
        type: "p",
        text: "Always share serious or worsening symptoms with a qualified physician. Acupuncture works best as part of a coordinated plan, especially for chronic pain or complex conditions.",
      },
    ],
  },
  {
    slug: "acupuncture-digestion-and-nausea",
    title: "Acupuncture, Digestion, and Nausea Support",
    excerpt:
      "Educational notes on how acupuncture is commonly approached for digestive comfort and treatment-related nausea—with realistic expectations.",
    publishedAt: "2026-02-20",
    readingMinutes: 6,
    tags: ["Digestion", "Nausea", "Recovery"],
    blocks: [
      {
        type: "p",
        text: "Digestive discomfort and nausea affect quality of life whether they come from stress, travel, medication, or medical treatments. Acupuncture is often sought as a gentle adjunct to support appetite, ease bloating, or reduce queasiness.",
      },
      {
        type: "h2",
        text: "Traditional patterns",
      },
      {
        type: "p",
        text: "In East Asian medicine, digestion is linked to overall vitality. Practitioners may consider energy, warmth, and tension in the abdomen when choosing points—not only the stomach in isolation. Sessions are individualized rather than one-size-fits-all.",
      },
      {
        type: "h2",
        text: "Evidence and expectations",
      },
      {
        type: "p",
        text: "Some clinical studies suggest benefit for chemotherapy-related nausea and functional digestive complaints, but results vary by person. Acupuncture is not a cure-all; it may take several visits to notice change, and some people respond more strongly than others.",
      },
      {
        type: "h2",
        text: "When to seek urgent care",
      },
      {
        type: "p",
        text: "Severe abdominal pain, vomiting blood, black stools, or signs of dehydration need prompt medical attention—not a wait for the next acupuncture slot.",
      },
    ],
  },
  {
    slug: "aftercare-tips-after-acupuncture",
    title: "Simple Aftercare After Acupuncture",
    excerpt:
      "Hydration, rest, and what to skip for the rest of the day so you get the most from your treatment.",
    publishedAt: "2026-03-08",
    readingMinutes: 4,
    tags: ["Aftercare", "Tips"],
    blocks: [
      {
        type: "p",
        text: "Small habits after your appointment can support how you feel and help your body integrate the session.",
      },
      {
        type: "h2",
        text: "Hydrate and eat lightly",
      },
      {
        type: "p",
        text: "Water or herbal tea helps. If you are hungry, choose something easy to digest rather than a heavy or very spicy meal immediately afterward.",
      },
      {
        type: "h2",
        text: "Movement and rest",
      },
      {
        type: "p",
        text: "A short walk is fine for many people; skip intense gym sessions, saunas, or heavy alcohol the same day if your practitioner advises a gentler recovery window.",
      },
      {
        type: "h2",
        text: "Notice changes",
      },
      {
        type: "p",
        text: "Sleep, mood, or pain levels may shift subtly over 24–48 hours. A quick note in your phone can help you and your practitioner adjust the next visit.",
      },
    ],
  },
];

export function getAllArticles(): Article[] {
  return [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
