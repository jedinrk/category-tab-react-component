import { create } from 'zustand';
import { TabId, WhereToState } from '@/types';

export const useWhereToStore = create<WhereToState>((set) => ({
  activeTab: 'dine',
  setActiveTab: (tab: TabId) => set({ activeTab: tab }),
}));
