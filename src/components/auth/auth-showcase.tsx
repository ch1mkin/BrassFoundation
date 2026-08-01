import { BrandLogo } from "@/components/brand/logo";
import { SITE } from "@/lib/constants";

const HIGHLIGHTS = [
  {
    title: "Verified membership",
    body: "Mobile OTP keeps accounts genuine and secure.",
  },
  {
    title: "Member portal",
    body: "Access resources, events, and your digital membership card.",
  },
  {
    title: "Community first",
    body: "Education to Prosperity — built for collective growth.",
  },
] as const;

export function AuthShowcase() {
  return (
    <aside className="relative hidden overflow-hidden rounded-3xl bg-secondary text-secondary-foreground lg:flex lg:min-h-[640px] lg:flex-col lg:justify-between lg:p-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 80% 10%, rgba(17,181,201,0.35) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(242,178,51,0.18) 0%, transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative z-10">
        <BrandLogo size="lg" href={null} className="drop-shadow-md" />
        <p className="font-quote mt-6 text-2xl leading-snug text-white/90 italic">
          {SITE.slogan}
        </p>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
          {SITE.description}
        </p>
      </div>

      <ul className="relative z-10 mt-12 space-y-5">
        {HIGHLIGHTS.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
          >
            <p className="font-heading text-base font-medium text-white">
              {item.title}
            </p>
            <p className="mt-1 text-sm text-white/65">{item.body}</p>
          </li>
        ))}
      </ul>

      <p className="relative z-10 mt-10 text-xs tracking-wide text-white/40 uppercase">
        Brass Foundation · Secure access
      </p>
    </aside>
  );
}
