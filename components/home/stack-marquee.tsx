const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "C++",
  "PostgreSQL",
  "Gemini API",
  "Accessible UI",
];

export function StackMarquee() {
  return (
    <div
      role="group"
      aria-label="Tools and technologies"
      className="marquee border-line overflow-hidden border-y py-5"
      tabIndex={0}
    >
      <div className="marquee-track gap-8 pr-8 motion-reduce:transform-none">
        {[...skills, ...skills].map((skill, index) => (
          <span
            aria-hidden={index >= skills.length}
            data-duplicate={index >= skills.length || undefined}
            key={`${skill}-${index}`}
            className="marquee-skill text-muted text-sm whitespace-nowrap"
          >
            {skill}
            <span aria-hidden="true" className="text-accent ml-8">
              /
            </span>
          </span>
        ))}
      </div>
      <span className="sr-only">{skills.join(", ")}</span>
    </div>
  );
}
