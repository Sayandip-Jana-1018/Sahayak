'use client';

import dynamic from 'next/dynamic';
import { HeroSection }      from '@/components/sections/HeroSection';
import { MacBookStory }     from '@/components/sections/MacBookStory';
import { ProblemSection }   from '@/components/sections/ProblemSection';
import { SolutionSection }  from '@/components/sections/SolutionSection';
import { HowItWorks }       from '@/components/sections/HowItWorks';
import { VoiceDemo }        from '@/components/sections/VoiceDemo';
import { LanguageMap }      from '@/components/sections/LanguageMap';
import { ImpactNumbers }    from '@/components/sections/ImpactNumbers';
import { Testimonials }     from '@/components/sections/Testimonials';
import { ForOrganizations } from '@/components/sections/ForOrganizations';
import { PricingSection }   from '@/components/sections/PricingSection';
import { Footer }           from '@/components/sections/Footer';

/* Heavy 3-D scenes — client-only */
const MacBookScene = dynamic(
  () => import('@/components/sections/MacBookScene').then(m => ({ default: m.MacBookScene })),
  { ssr: false }
);
const FeatureShowcase = dynamic(
  () => import('@/components/sections/FeatureShowcase').then(m => ({ default: m.FeatureShowcase })),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      {/* Fixed MacBook canvas — shows during hero + story zones */}
      <MacBookScene />

      {/* Zone 1: Hero — text above + terminal in MacBook placeholder area */}
      <HeroSection />

      {/* Zone 2: MacBook scroll story — 500vh spacer + scroll-driven captions */}
      <MacBookStory />

      {/* Zone 3: iPhone feature showcase — 700vh pinned split layout */}
      <FeatureShowcase />

      {/* FIX 6: Dark overlay on sections below hero/story/iPhone to balance orange Grainient */}
      <div style={{
        position: 'relative',
        background: 'rgba(8, 8, 18, 0.35)',
      }}>
        {/* Zone 4: India problem section */}
        <ProblemSection />

        <SolutionSection />
        <HowItWorks />
        <VoiceDemo />
        <LanguageMap />
        <ImpactNumbers />
        <Testimonials />
        <ForOrganizations />
        <PricingSection />
      </div>
      <Footer />
    </>
  );
}
