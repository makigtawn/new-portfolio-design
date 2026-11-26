const categories = [
  {
    title: "Frontend",
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Accessible UI",
      "Tailwind CSS",
      "shadcn/ui",
    ],
  },
  {
    title: "Backend & fundamentals",
    skills: ["Node.js", "REST APIs", "Zod", "C++", "Data structures"],
  },
  {
    title: "Tooling & testing",
    skills: ["Git", "GitHub", "GitHub Actions", "Vitest", "Playwright"],
  },
  {
    title: "AI integration",
    skills: ["Gemini API", "Structured outputs", "AI integrations"],
  },
];

export function StackMarquee() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="border-line border-y"
    >
      <div className="mx-auto grid w-[min(calc(100%-2.5rem),75rem)] gap-8 py-12 md:w-[min(calc(100%-5rem),75rem)] md:grid-cols-[minmax(12rem,0.55fr)_1fr] md:py-16">
        <div>
          <p className="eyebrow">Tools &amp; practice</p>
          <h2 id="skills-heading" className="sr-only">
            Tools and practice
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-medium">{category.title}</h3>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                {category.skills.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
