import { OnboardingFlow } from './OnboardingFlow';

export const metadata = { title: 'Onboarding' };

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-7 py-16">
      <div className="mb-10 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">setup</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <OnboardingFlow />
    </div>
  );
}
