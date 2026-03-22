'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/sections/HeroSection';
import { StoryScroll } from '@/components/sections/StoryScroll';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { FeaturesGrid } from '@/components/sections/FeaturesGrid';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { VoiceDemo } from '@/components/sections/VoiceDemo';
import { LanguageMap } from '@/components/sections/LanguageMap';
import { ImpactNumbers } from '@/components/sections/ImpactNumbers';
import { Testimonials } from '@/components/sections/Testimonials';
import { ForOrganizations } from '@/components/sections/ForOrganizations';
import { PricingSection } from '@/components/sections/PricingSection';
import { Footer } from '@/components/sections/Footer';

const PhoneScene = dynamic(
  () => import('@/components/hero/PhoneScene').then((m) => m.PhoneScene),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <PhoneScene />
      <HeroSection />
      <StoryScroll />
      <ProblemSection />
      <SolutionSection />
      <FeaturesGrid />
      <HowItWorks />
      <VoiceDemo />
      <LanguageMap />
      <ImpactNumbers />
      <Testimonials />
      <ForOrganizations />
      <PricingSection />
      <Footer />
    </>
  );
}
