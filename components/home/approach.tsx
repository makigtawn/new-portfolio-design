import { RevealHeading } from "@/components/layout/reveal-heading";

const steps = [
  {
    number: "01",
    title: "Listen for the real problem",
    copy: "Understand the people, constraints, and workarounds behind the request.",
  },
  {
    number: "02",
    title: "Make the path clear",
    copy: "Shape a small, testable plan around the outcome that matters most.",
  },
  {
    number: "03",
    title: "Build, learn, refine",
    copy: "Ship useful increments, check the details, and leave the system easier to extend.",
  },
];

export function Approach({ bio }: { bio: string }) {
  return (
    <section id="about" aria-labelledby="approach-heading" className="bg-wash">
      <div className="page-shell section-space">
        <div className="grid gap-7 md:grid-cols-[minmax(12rem,0.55fr)_1fr]">
          <p className="eyebrow">02 / Approach</p>
          <div>
            <RevealHeading id="approach-heading">
              Good software begins with a better question.
            </RevealHeading>
            <p className="text-muted mt-5 max-w-2xl">{bio}</p>
          </div>
        </div>
        <ol className="mt-14 grid gap-8 md:mt-20 md:grid-cols-[1fr_1fr_0.85fr] md:gap-12">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={`${index === 1 ? "md:mt-12" : ""} border-line border-t pt-4`}
            >
              <p className="eyebrow">{step.number}</p>
              <h3 className="mt-6 max-w-xs text-xl font-normal tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted mt-3 max-w-sm text-sm leading-relaxed">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
