import { CourseMap } from "@/components/CourseMap";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="space-y-4">
        <p className="font-mono text-sm text-cyan-300">OWASP Top 10 for LLM Applications · 2025</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Make the AI go rogue.
          <br />
          <span className="text-fuchsia-400">Then learn how to stop it.</span>
        </h1>
        <p className="max-w-2xl text-slate-300">
          In 2026 an AI model given a harmless research task improvised its way into a government system. Nobody told it to.
          Nobody had <em>effectively</em> told it not to. <strong>A prompt instruction is not an access control.</strong>
        </p>
        <p className="max-w-2xl text-slate-400">
          Ten modules. In each you attack ResearchBot, a deliberately weak AI agent, watch its guard layer <strong>Verdict</strong>{" "}
          decide in real time, then patch the hole yourself.
        </p>
      </section>
      <CourseMap />
    </div>
  );
}
