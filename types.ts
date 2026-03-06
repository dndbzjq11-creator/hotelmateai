
export interface Hotel {
  id: number;
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
}

export type Step = 'START' | 'HOTEL_SELECTED' | 'DETAIL_VIEW';

export interface MessageOption {
  label: string;
  value: string;
  icon?: string;
  link?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'hotel_list' | 'menu_tabs' | 'content_detail';
  options?: MessageOption[];
}

export enum MenuTab {
  INFO = '1',
  FOOD = '2',
  HEALING = '3'
}
