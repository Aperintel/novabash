'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { bundles, projectTypes, experienceLevels } from '@/lib/bundles';

type ProjectType = (typeof projectTypes)[number]['id'];
type Experience = (typeof experienceLevels)[number]['id'];

type Step = 1 | 2 | 3 | 4;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [bundle, setBundle] = useState<string | null>(null);

  const next = () => setStep((s) => (Math.min(4, s + 1) as Step));
  const back = () => setStep((s) => (Math.max(1, s - 1) as Step));

  const finish = () => {
    if (!bundle) return;
    router.push(`/connect?bundle=${bundle}`);
  };

  return (
    <div className="grid gap-12 sm:grid-cols-[260px_1fr]">
      <Sidebar step={step} />
      <div>
        {step === 1 && (
          <StepProjectType
            value={projectType}
            onChange={(v) => setProjectType(v)}
            onNext={() => projectType && next()}
          />
        )}
        {step === 2 && (
          <StepExperience
            value={experience}
            onChange={(v) => setExperience(v)}
            onBack={back}
            onNext={() => experience && next()}
          />
        )}
        {step === 3 && (
          <StepBundle
            value={bundle}
            onChange={(v) => setBundle(v)}
            onBack={back}
            onNext={() => bundle && next()}
          />
        )}
        {step === 4 && (
          <StepReview
            projectType={projectType}
            experience={experience}
            bundle={bundle}
            onBack={back}
            onFinish={finish}
          />
        )}
      </div>
    </div>
  );
}

function Sidebar({ step }: { step: Step }) {
  const items: Array<{ n: number; label: string }> = [
    { n: 1, label: 'project' },
    { n: 2, label: 'experience' },
    { n: 3, label: 'bundle' },
    { n: 4, label: 'review' },
  ];
  return (
    <aside className="border-l border-hairline pl-5">
      <h2 className="mb-6 text-[28px] font-extrabold leading-[1] tracking-heading">
        Make a <span className="text-gold">workspace</span>.
      </h2>
      <p className="mb-9 text-[14px] leading-[1.55] text-fg-mid">
        Three short answers, then we generate the workspace, encrypt the vault, and start the
        connect flow for the bundle you pick.
      </p>
      <ol className="flex flex-col gap-3">
        {items.map((item) => {
          const state =
            item.n === step ? 'current' : item.n < step ? 'done' : 'next';
          return (
            <li
              key={item.n}
              className={`flex items-center gap-3 font-mono text-[12px] ${
                state === 'current'
                  ? 'text-gold'
                  : state === 'done'
                    ? 'text-mint'
                    : 'text-fg-dim'
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center border ${
                  state === 'current'
                    ? 'border-gold'
                    : state === 'done'
                      ? 'border-mint'
                      : 'border-hairline-bright'
                }`}
              >
                {state === 'done' ? <Icon name="validate" size={12} /> : item.n}
              </span>
              {item.label}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function StepProjectType({
  value,
  onChange,
  onNext,
}: {
  value: ProjectType | null;
  onChange: (v: ProjectType) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[24px] font-bold tracking-heading">What are you building?</h3>
      <p className="mb-8 text-[14px] text-fg-mid">
        We use this to suggest the bundle most likely to match.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {projectTypes.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`group flex flex-col items-start gap-1.5 border bg-bg-elev p-5 text-left transition-colors duration-150 ease-nb ${
              value === p.id
                ? 'border-gold bg-gold-fade'
                : 'border-hairline-bright hover:border-gold hover:bg-gold-fade'
            }`}
          >
            <span className="text-[16px] font-semibold tracking-heading">{p.label}</span>
            <span className="text-[13px] text-fg-mid">{p.body}</span>
          </button>
        ))}
      </div>
      <Footer onNext={onNext} disabled={!value} />
    </div>
  );
}

function StepExperience({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: Experience | null;
  onChange: (v: Experience) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[24px] font-bold tracking-heading">
        How much hand-holding do you want?
      </h3>
      <p className="mb-8 text-[14px] text-fg-mid">
        Honest answer is best. We will adjust the depth of the connect flow.
      </p>
      <div className="grid gap-2.5">
        {experienceLevels.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => onChange(e.id)}
            className={`flex items-start gap-4 border bg-bg-elev p-5 text-left transition-colors duration-150 ease-nb ${
              value === e.id
                ? 'border-gold bg-gold-fade'
                : 'border-hairline-bright hover:border-gold hover:bg-gold-fade'
            }`}
          >
            <span className="text-[16px] font-semibold tracking-heading">{e.label}</span>
            <span className="text-[13px] text-fg-mid">{e.body}</span>
          </button>
        ))}
      </div>
      <Footer onBack={onBack} onNext={onNext} disabled={!value} />
    </div>
  );
}

function StepBundle({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: string | null;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[24px] font-bold tracking-heading">Pick a starting bundle.</h3>
      <p className="mb-8 text-[14px] text-fg-mid">
        Six curated stacks at launch. You can always fork a community bundle later.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {bundles.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            className={`group flex flex-col items-start gap-3 border bg-bg-elev p-5 text-left transition-colors duration-150 ease-nb ${
              value === b.id
                ? 'border-gold bg-gold-fade'
                : 'border-hairline-bright hover:border-gold hover:bg-gold-fade'
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-gold">
                  <Icon name={b.icon} size={18} />
                </span>
                <span className="text-[17px] font-bold tracking-heading">{b.name}</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
                {b.keyCount} keys
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
              {b.tagline}
            </span>
            <span className="text-[13px] leading-[1.55] text-fg-mid">{b.description}</span>
            <span className="font-mono text-[11px] text-fg-dim">
              {b.services.map((s) => s.name).join(' · ')}
            </span>
          </button>
        ))}
      </div>
      <Footer onBack={onBack} onNext={onNext} disabled={!value} />
    </div>
  );
}

function StepReview({
  projectType,
  experience,
  bundle,
  onBack,
  onFinish,
}: {
  projectType: string | null;
  experience: string | null;
  bundle: string | null;
  onBack: () => void;
  onFinish: () => void;
}) {
  const b = bundles.find((x) => x.id === bundle);
  return (
    <div>
      <h3 className="mb-2 text-[24px] font-bold tracking-heading">Ready to provision the keys.</h3>
      <p className="mb-8 text-[14px] text-fg-mid">
        Confirm and we kick off the connect flow. You can change anything later.
      </p>
      <dl className="border-t border-hairline">
        <Row label="project" value={projectType ?? '-'} />
        <Row label="experience" value={experience ?? '-'} />
        <Row label="bundle" value={b?.name ?? '-'} />
        <Row label="services" value={b ? b.services.map((s) => s.name).join(' · ') : '-'} />
        <Row label="keys" value={b ? `${b.keyCount} to obtain` : '-'} />
      </dl>
      <Footer onBack={onBack} onNext={onFinish} disabled={!bundle} ctaLabel="Start the connect flow" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center border-b border-hairline py-3 font-mono text-[12.5px]">
      <dt className="text-fg-dim">{label}</dt>
      <dd className="text-fg">{value}</dd>
    </div>
  );
}

function Footer({
  onBack,
  onNext,
  disabled,
  ctaLabel = 'Continue',
}: {
  onBack?: () => void;
  onNext: () => void;
  disabled?: boolean;
  ctaLabel?: string;
}) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[12px] text-fg-dim transition-colors hover:text-fg"
        >
          ← back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="flex items-center gap-2 bg-gold px-5 py-3 text-[13.5px] font-semibold text-bg transition-colors duration-150 ease-nb hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ctaLabel}
        <span className="font-mono text-xs">→</span>
      </button>
    </div>
  );
}
