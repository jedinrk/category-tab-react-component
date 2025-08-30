export interface VenueItem {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

export interface CategoryData {
  id: string;
  label: string;
  items: VenueItem[];
}

export type TabId = 'dine' | 'see' | 'shop' | 'move';

export interface WhereToState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}
