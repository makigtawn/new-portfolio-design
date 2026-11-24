const categories = [
  { title: "Frontend", skills: ["TypeScript", "React", "Next.js", "Accessible UI", "Tailwind CSS", "Shadcn UI"] },
  { title: "Backend", skills: ["Node.js", "Express.js", "REST APIs", "Data structures"] },
  { title: "Databases", skills: ["PostgreSQL"] },
  { title: "Infrastructure & tools", skills: ["Git", "GitHub", "Vercel", "AWS"] },
  { title: "AI engineering", skills: ["Gemini API", "Structured outputs", "Prompt engineering", "AI integrations", "Vercel SDK"] },
];

export function StackMarquee() {
  return (
    <section id="skills" aria-label="Technical skills" className="border-line border-y">
      <div className="mx-auto grid w-[min(calc(100%-2.5rem),75rem)] gap-8 py-12 md:w-[min(calc(100%-5rem),75rem)] md:grid-cols-[minmax(12rem,0.55fr)_1fr] md:py-16">
        <p className="eyebrow">Tools & practice</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category) => <div key={category.title}>
            <h2 className="text-sm font-medium">{category.title}</h2>
            <p className="text-muted mt-2 text-sm leading-relaxed">{category.skills.join(" · ")}</p>
          </div>)}
        </div>
      </div>
    </section>
  );
}
