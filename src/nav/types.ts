/** Route param list for the root native-stack (spec §5). */
export type RootStackParamList = {
  home: undefined;
  hole: undefined;
  players: undefined;
  courses: undefined;
  /** courseId of an existing course, or `null` to start a fresh 18-hole par-3. */
  courseEdit: { courseId: string | null };
  stats: undefined;
  scorecards: undefined;
  viewCard: { historyId: string };
  finish: { historyId: string };
};
