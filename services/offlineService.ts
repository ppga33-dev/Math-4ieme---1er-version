
import { OfflineContent } from '../types';

const OFFLINE_STORAGE_KEY = 'mathelite_offline_content';

export const saveOfflineContent = (content: OfflineContent) => {
  const existing = getAllOfflineContent();
  const updated = { ...existing, [content.topicId]: content };
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
};

export const getOfflineContent = (topicId: string): OfflineContent | null => {
  const all = getAllOfflineContent();
  return all[topicId] || null;
};

export const removeOfflineContent = (topicId: string) => {
  const all = getAllOfflineContent();
  delete all[topicId];
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(all));
};

export const getAllOfflineContent = (): Record<string, OfflineContent> => {
  const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse offline content", e);
    return {};
  }
};

export const isTopicDownloaded = (topicId: string): boolean => {
  const all = getAllOfflineContent();
  return !!all[topicId];
};
