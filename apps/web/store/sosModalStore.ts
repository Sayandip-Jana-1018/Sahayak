import { create } from 'zustand';

export interface SOSAlertData {
  sosEventId: string;
  elderlyProfileId: string;
  elderlyName: string;
  triggerType: string;
  severity: string;
  location?: { lat: number; lng: number };
  contactNames?: string[];
}

interface SOSModalStore {
  visible: boolean;
  data: SOSAlertData | null;
  showSOS: (data: SOSAlertData) => void;
  dismissSOS: () => void;
}

export const useSOSModalStore = create<SOSModalStore>((set) => ({
  visible: false,
  data: null,
  showSOS: (data) => set({ visible: true, data }),
  dismissSOS: () => set({ visible: false, data: null }),
}));
