import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BackButton, HoleParRow, MetaPill } from '../components';
import { makeId } from '../lib/id';
import { useAppState } from '../state/AppContext';
import {
  border,
  colors,
  fonts,
  radius,
  sizing,
  spacing,
} from '../theme';
import type { Course, Hole, ID } from '../types';
import type { RootStackParamList } from '../nav/types';
import { Screen } from './layout/Screen';

const MIN_HOLES = 1;
const MAX_HOLES = 27;
const MIN_PAR = 2;
const MAX_PAR = 7;

export type CourseEditScreenProps = {
  /** null = creating a fresh course; otherwise the course to edit. */
  initial: Course | null;
  /** Whether a Delete action should be visible (i.e. >= 2 courses). */
  canDelete: boolean;
  onCancel: () => void;
  onSave: (course: Course) => void;
  onDelete: () => void;
};

/** New-course defaults from spec §5.4 / §9.7: 18 holes, all par 3, dist 0. */
function blankCourse(): Course {
  return {
    id: makeId('course'),
    name: '',
    tees: '',
    holes: Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      par: 3,
      dist: 0,
    })),
  };
}

export function CourseEditScreen({
  initial,
  canDelete,
  onCancel,
  onSave,
  onDelete,
}: CourseEditScreenProps) {
  const [draft, setDraft] = useState<Course>(() => initial ?? blankCourse());

  const totalPar = useMemo(
    () => draft.holes.reduce((s, h) => s + h.par, 0),
    [draft.holes],
  );

  function setName(name: string) {
    setDraft((d) => ({ ...d, name }));
  }

  function setTees(tees: string) {
    setDraft((d) => ({ ...d, tees }));
  }

  function setPar(idx: number, par: number) {
    setDraft((d) => ({
      ...d,
      holes: d.holes.map((h, i) =>
        i === idx ? { ...h, par: clamp(par, MIN_PAR, MAX_PAR) } : h,
      ),
    }));
  }

  function addHole() {
    setDraft((d) => {
      if (d.holes.length >= MAX_HOLES) return d;
      return {
        ...d,
        holes: [
          ...d.holes,
          { hole: d.holes.length + 1, par: 3, dist: 0 },
        ],
      };
    });
  }

  function removeHole() {
    setDraft((d) => {
      if (d.holes.length <= MIN_HOLES) return d;
      return { ...d, holes: d.holes.slice(0, -1) };
    });
  }

  function save() {
    const trimmedName = draft.name.trim();
    if (trimmedName.length === 0) return;
    // Rebuild holes with fresh sequential hole numbers (spec §9.7).
    const holes: Hole[] = draft.holes.map((h, i) => ({
      hole: i + 1,
      par: clamp(h.par, MIN_PAR, MAX_PAR),
      dist: h.dist,
    }));
    onSave({
      ...draft,
      name: trimmedName.slice(0, 28),
      tees: draft.tees.trim().slice(0, 12),
      holes,
    });
  }

  function confirmDelete() {
    Alert.alert('Delete course?', `"${draft.name || 'this course'}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  }

  const saveDisabled = draft.name.trim().length === 0;

  return (
    <Screen
      topBar={
        <>
          <BackButton label="Courses" onPress={onCancel} />
          <Text style={styles.topTitle}>Course</Text>
          {canDelete ? (
            <Pressable
              onPress={confirmDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete course"
              hitSlop={8}
            >
              <Text style={styles.deleteAction}>Delete</Text>
            </Pressable>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </>
      }
      bottomBar={
        <>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={({ pressed }) => [
              btnStyles.cancel,
              pressed && btnStyles.cancelPressed,
            ]}
          >
            <Text style={btnStyles.cancelLabel}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={save}
            disabled={saveDisabled}
            accessibilityRole="button"
            accessibilityLabel="Save course"
            accessibilityState={{ disabled: saveDisabled }}
            style={({ pressed }) => [
              btnStyles.save,
              saveDisabled && btnStyles.saveDisabled,
              pressed && !saveDisabled && btnStyles.savePressed,
            ]}
          >
            <Text
              style={[
                btnStyles.saveLabel,
                saveDisabled && btnStyles.saveLabelDisabled,
              ]}
            >
              Save Course
            </Text>
          </Pressable>
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.nameWrap}>
          <TextInput
            value={draft.name}
            onChangeText={setName}
            placeholder="Course name"
            placeholderTextColor={colors.amberFaint}
            style={styles.nameInput}
            maxLength={28}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <View style={styles.nameUnderline} />
        </View>

        <View style={styles.metaRow}>
          <MetaPill label="HOLES" value={String(draft.holes.length)} />
          <MetaPill label="PAR" value={String(totalPar)} />
          <View style={styles.teesPill}>
            <Text style={styles.teesLabel}>TEES</Text>
            <TextInput
              value={draft.tees}
              onChangeText={setTees}
              placeholder="—"
              placeholderTextColor={colors.amberFaint}
              style={styles.teesInput}
              maxLength={12}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.holes}>
          {draft.holes.map((h, idx) => (
            <View key={idx}>
              <HoleParRow
                holeNumber={idx + 1}
                par={h.par}
                onChange={(p) => setPar(idx, p)}
              />
              {idx < draft.holes.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.addRemoveRow}>
          <Pressable
            onPress={removeHole}
            disabled={draft.holes.length <= MIN_HOLES}
            accessibilityRole="button"
            accessibilityLabel="Remove last hole"
            style={({ pressed }) => [
              styles.addRemovePill,
              draft.holes.length <= MIN_HOLES && styles.pillDisabled,
              pressed && styles.pillPressed,
            ]}
          >
            <Text
              style={[
                styles.addRemoveLabel,
                draft.holes.length <= MIN_HOLES && styles.labelDisabled,
              ]}
            >
              − Remove
            </Text>
          </Pressable>
          <Pressable
            onPress={addHole}
            disabled={draft.holes.length >= MAX_HOLES}
            accessibilityRole="button"
            accessibilityLabel="Add hole"
            style={({ pressed }) => [
              styles.addRemovePill,
              draft.holes.length >= MAX_HOLES && styles.pillDisabled,
              pressed && styles.pillPressed,
            ]}
          >
            <Text
              style={[
                styles.addRemoveLabel,
                draft.holes.length >= MAX_HOLES && styles.labelDisabled,
              ]}
            >
              + Add Hole
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Route wrapper. */
export function CourseEditRoute() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'courseEdit'>>();
  const app = useAppState();

  const initial =
    route.params.courseId == null
      ? null
      : app.courses.find((c) => c.id === route.params.courseId) ?? null;

  const canDelete = initial != null && app.courses.length >= 2;

  return (
    <CourseEditScreen
      initial={initial}
      canDelete={canDelete}
      onCancel={() => navigation.goBack()}
      onSave={(course) => {
        const exists = app.courses.some((c) => c.id === course.id);
        const next = exists
          ? app.courses.map((c) => (c.id === course.id ? course : c))
          : [...app.courses, course];
        app.setCourses(next);
        // If there was no active course (rare), make this one active.
        if (!app.activeCourseId) app.setActiveCourseId(course.id);
        navigation.goBack();
      }}
      onDelete={() => {
        if (initial == null) return;
        const remaining = app.courses.filter((c) => c.id !== initial.id);
        app.setCourses(remaining);
        // Spec §9.7: deleting active picks next-remaining as active.
        if (app.activeCourseId === initial.id) {
          app.setActiveCourseId(remaining[0]?.id ?? null);
        }
        navigation.goBack();
      }}
    />
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

// ------------------------------------------------------------------------

const styles = StyleSheet.create({
  topTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amber,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  deleteAction: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.toneRed,
    letterSpacing: 0.5,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  nameWrap: {
    alignItems: 'center',
    gap: 6,
  },
  nameInput: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.amber,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 6,
  },
  nameUnderline: {
    height: 1.5,
    width: '70%',
    backgroundColor: colors.cyan,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  teesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.round,
    borderWidth: border.stepper,
    borderColor: colors.cyan,
    minWidth: 110,
  },
  teesLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  teesInput: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amber,
    minWidth: 30,
  },
  holes: {
    gap: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cyanFaint,
  },
  addRemoveRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  addRemovePill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.round,
    borderWidth: border.stepper,
    borderColor: colors.cyanFaint,
    borderStyle: 'dashed',
  },
  pillDisabled: {
    opacity: 0.4,
  },
  pillPressed: {
    backgroundColor: 'rgba(31,200,224,0.08)',
  },
  addRemoveLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.amber,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelDisabled: {
    color: colors.amberFaint,
  },
});

const btnStyles = StyleSheet.create({
  cancel: {
    flex: 1,
    height: sizing.pill,
    borderRadius: radius.pill,
    borderWidth: border.pill,
    borderColor: colors.cyanFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPressed: {
    backgroundColor: 'rgba(31,200,224,0.08)',
  },
  cancelLabel: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.amberDim,
    letterSpacing: 0.5,
  },
  save: {
    flex: 1,
    height: sizing.pill,
    borderRadius: radius.pill,
    borderWidth: border.pill,
    borderColor: colors.amber,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    backgroundColor: 'transparent',
    borderColor: colors.amberFaint,
  },
  savePressed: {
    opacity: 0.85,
  },
  saveLabel: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.inkOnFill,
    letterSpacing: 0.5,
  },
  saveLabelDisabled: {
    color: colors.amberDim,
  },
});

/** Re-export the route param type for navigation callers. */
export type { ID };
