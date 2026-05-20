/** Route param list for the root native-stack (spec §5). */
export type RootStackParamList = {
  home: undefined;
  hole: undefined;
  players: undefined;
  courses: undefined;
  /** courseId of an existing course (new courses are created in the list first). */
  courseEdit: { courseId: string };
  stats: undefined;
  scorecards: undefined;
  viewCard: { historyId: string };
  finish: undefined;
};
