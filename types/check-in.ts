export type Mood = 'good' | 'okay' | 'struggling' | 'need-talk';

export type MoodEntry = {
  date: string;
  mood: Mood;
  note?: string;
};
