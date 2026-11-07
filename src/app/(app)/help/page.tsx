import {
  Mic,
  CheckCircle2,
  Users,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Layers,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    title: "1. Prospect & Add Speaker",
    description:
      "Add potential speakers with their origin, bio, talk idea, links, and priority tier. Whoever adds a speaker is automatically assigned as their initial tracker.",
    icon: Mic,
  },
  {
    title: "2. Tailor Outreach Message",
    description:
      "Draft a personalized outreach message directly inside the speaker's dossier right under their LinkedIn/Instagram/email links, then copy it in one click.",
    icon: Sparkles,
  },
  {
    title: "3. Track Status & Coordinate",
    description:
      "Update statuses in Table or Board view as replies come in, assign fellow coordinators, and log every call or email update in the speaker's timeline.",
    icon: MessageSquare,
  },
  {
    title: "4. Confirm & Onboard",
    description:
      "Move confirmed speakers to Accepted, keep General Rules & Warnings respected across the team, and align everyone toward event day.",
    icon: CheckCircle2,
  },
];

const TIER_GUIDE = [
  {
    tier: "S",
    color: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    label: "Headliner / Marquee",
    desc: "High-impact national or international voices with exceptional draw and stage presence.",
  },
  {
    tier: "A",
    color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    label: "Priority Speaker",
    desc: "Strong subject-matter originality, clear TEDx-worthy idea, and proven communication skill.",
  },
  {
    tier: "B",
    color: "border-sky-500/40 bg-sky-500/15 text-sky-300",
    label: "Solid Contender",
    desc: "Promising topic and profile; requires deeper scoping or pitch refinement.",
  },
  {
    tier: "C",
    color: "border-violet-500/40 bg-violet-500/15 text-violet-300",
    label: "Exploratory / Backup",
    desc: "Early-stage lead or secondary option depending on lineup balance.",
  },
  {
    tier: "F",
    color: "border-zinc-500/40 bg-zinc-500/15 text-zinc-300",
    label: "Low Fit / Hold",
    desc: "Currently misaligned with theme or format, kept on record to avoid duplicate outreach.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#332323] bg-gradient-to-br from-[#1C1112] via-[#130D0D] to-[#0D0909] p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(227,27,43,0.18) 0%, transparent 70%)" }}
        />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/15 text-[#FF3B4E]">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-3xl">
              Platform <span className="text-[#E31B2B]">Guide & Playbook</span>
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-[#A6A0A0]">
              How the TEDxTBS Curation & Speaker Relations team prospects, coordinates outreach, and manages the speaker pipeline from first pitch to the red dot.
            </p>
          </div>
        </div>
      </div>

      {/* Coordination Workflow */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-[#F5F5F5]">
          Coordination Workflow
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.title}
              className="tedx-surface rounded-xl p-5 transition-colors hover:border-[#E31B2B]/40"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E31B2B]/30 bg-[#E31B2B]/12 text-[#E31B2B]">
                <step.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F5F5F5]">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#A6A0A0]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Two-Column Reference: Tiers + Rules */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="tedx-surface rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-[#E31B2B]" />
            <h2 className="text-base font-semibold text-[#F5F5F5]">Speaker Tier Scale</h2>
          </div>
          <div className="space-y-3">
            {TIER_GUIDE.map((item) => (
              <div
                key={item.tier}
                className="flex items-start gap-3.5 rounded-xl border border-[#261919] bg-[#110C0C]/80 p-3"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${item.color}`}
                >
                  {item.tier}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#F5F5F5]">{item.label}</p>
                  <p className="mt-0.5 text-xs text-[#A6A0A0]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="tedx-surface rounded-2xl p-6">
            <div className="mb-3 flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-[#E31B2B]" />
              <h2 className="text-base font-semibold text-[#F5F5F5]">
                Outreach Etiquette & Best Practices
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs leading-relaxed text-[#A6A0A0]">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E31B2B]" />
                <span>
                  <strong className="text-[#F5F5F5]">Always check Trackers before reaching out:</strong>{" "}
                  Never contact a speaker who already has an active coordinator without aligning in their comment timeline first.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E31B2B]" />
                <span>
                  <strong className="text-[#F5F5F5]">Custom statuses & Kanban board:</strong>{" "}
                  Switch between <em>Table</em> and <em>Board</em> views on the Speakers dashboard, or add custom pipeline stages via the <em>+ Status</em> button.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E31B2B]" />
                <span>
                  <strong className="text-[#F5F5F5]">Soft delete protection:</strong>{" "}
                  Moving a speaker to Trash preserves all notes and links; admins can restore or permanently purge records from the Trash tab.
                </span>
              </li>
            </ul>
          </div>

          <div className="tedx-surface rounded-2xl p-6">
            <div className="mb-2 flex items-center gap-2.5">
              <Users className="h-4 w-4 text-[#E31B2B]" />
              <h2 className="text-base font-semibold text-[#F5F5F5]">
                Team & Permissions
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-[#A6A0A0]">
              All team members can create speakers, update statuses, manage tags, customize outreach scripts, and post timeline notes. Admins additionally manage team invitations, event countdown settings, Trash recovery, and the full Audit Log.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
