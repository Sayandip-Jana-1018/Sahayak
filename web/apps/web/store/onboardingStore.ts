import { create } from 'zustand';

export type UserType = 'family' | 'self' | 'organization';

export type LanguageCode = 'hi' | 'ta' | 'bn' | 'mr' | 'te' | 'kn' | 'gu' | 'pa' | 'ml' | 'ur' | 'en';

export interface OnboardingFormData {
  userType: UserType;
  elderlyName: string;
  ageYears: number;
  state: string;
  district: string;
  primaryLanguage: LanguageCode;
  emergencyContactName: string;
  emergencyContactPhone: string;
  voiceProfileComplete: boolean;
  voiceSampleIds: string[];
  appInstalled: boolean;
}

interface OnboardingStore {
  currentStep: number;
  formData: OnboardingFormData;
  isSubmitting: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setSubmitting: (val: boolean) => void;
  reset: () => void;
}

const initialFormData: OnboardingFormData = {
  userType: 'family',
  elderlyName: '',
  ageYears: 70,
  state: '',
  district: '',
  primaryLanguage: 'hi',
  emergencyContactName: '',
  emergencyContactPhone: '',
  voiceProfileComplete: false,
  voiceSampleIds: [],
  appInstalled: false,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  formData: { ...initialFormData },
  isSubmitting: false,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 5),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setSubmitting: (val) => set({ isSubmitting: val }),

  reset: () =>
    set({
      currentStep: 1,
      formData: { ...initialFormData },
      isSubmitting: false,
    }),
}));
