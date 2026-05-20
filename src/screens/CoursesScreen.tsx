import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BackButton } from '../components';
import { useAppState } from '../state/AppContext';
import {
  border,
  colors,
  fonts,
  radius,
  spacing,
  textGlow,
} from '../theme';
import type { Course, ID } from '../types';
import type { RootStackParamList } from '../nav/types';
import { Screen } from './layout/Screen';

export type CoursesScreenProps = {
  courses: Course[];
  activeCourseId: ID | null;
  onBack: () => void;
  onSelectActive: (id: ID) => void;
  onEdit: (id: ID) => void;
  onNew: () => void;
};

/** Courses list (spec §5.4). */
export function CoursesScreen({
  courses,
  activeCourseId,
  onBack,
  onSelectActive,
  onEdit,
  onNew,
}: CoursesScreenProps) {
  return (
    <Screen
      topBar={
        <>
          <BackButton label="Menu" onPress={onBack} />
          <Text style={styles.topTitle}>Courses</Text>
          <View style={{ width: 80 }} />
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.count, textGlow()]}>{courses.length}</Text>
          <Text style={styles.caption}>saved courses</Text>
        </View>

        <View style={styles.list}>
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              active={c.id === activeCourseId}
              onSelect={() => onSelectActive(c.id)}
              onEdit={() => onEdit(c.id)}
            />
          ))}
        </View>

        <Pressable
          onPress={onNew}
          accessibilityRole="button"
          accessibilityLabel="New course"
          style={({ pressed }) => [
            styles.newPill,
            pressed && styles.newPillPressed,
          ]}
        >
          <Text style={styles.newPillLabel}>+ New Course</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function CourseCard({
  course,
  active,
  onSelect,
  onEdit,
}: {
  course: Course;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  const totalPar = useMemo(
    () => course.holes.reduce((s, h) => s + h.par, 0),
    [course.holes],
  );

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Set ${course.name} as active course`}
      style={({ pressed }) => [
        cardStyles.card,
        active && cardStyles.cardActive,
        pressed && cardStyles.cardPressed,
      ]}
    >
      <View style={cardStyles.titleRow}>
        <Text style={cardStyles.title} numberOfLines={1}>
          {course.name}
        </Text>
        {active ? (
          <View style={cardStyles.activePill}>
            <Text style={cardStyles.activePillLabel}>ACTIVE</Text>
          </View>
        ) : null}
      </View>
      <Text style={cardStyles.meta}>
        {course.holes.length} HOLES · PAR {totalPar}
        {course.tees ? ` · ${course.tees.toUpperCase()}` : ''}
      </Text>
      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${course.name}`}
        hitSlop={10}
        style={({ pressed }) => [
          cardStyles.editBtn,
          pressed && cardStyles.editBtnPressed,
        ]}
      >
        <Text style={cardStyles.editGlyph}>{'✎'}</Text>
      </Pressable>
    </Pressable>
  );
}

/** Route wrapper. */
export function CoursesRoute() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const app = useAppState();

  return (
    <CoursesScreen
      courses={app.courses}
      activeCourseId={app.activeCourseId}
      onBack={() => navigation.goBack()}
      onSelectActive={(id) => app.setActiveCourseId(id)}
      onEdit={(id) => navigation.navigate('courseEdit', { courseId: id })}
      onNew={() => navigation.navigate('courseEdit', { courseId: null })}
    />
  );
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
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  count: {
    fontFamily: fonts.bold,
    fontSize: 60,
    color: colors.amber,
    letterSpacing: -2,
  },
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  list: {
    gap: spacing.md,
  },
  newPill: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: radius.round,
    borderWidth: border.stepper,
    borderColor: colors.cyanFaint,
    borderStyle: 'dashed',
  },
  newPillPressed: {
    backgroundColor: 'rgba(31,200,224,0.08)',
  },
  newPillLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.amberDim,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

const cardStyles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    borderWidth: border.card,
    borderColor: colors.cyanFaint,
    gap: 4,
    position: 'relative',
  },
  cardActive: {
    borderColor: colors.cyan,
  },
  cardPressed: {
    backgroundColor: 'rgba(31,200,224,0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: 36, // leave room for the pencil
  },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amber,
  },
  activePill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.amber,
    backgroundColor: 'rgba(255,160,0,0.08)',
  },
  activePillLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.amber,
    letterSpacing: 1.2,
  },
  meta: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  editBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnPressed: {
    opacity: 0.5,
  },
  editGlyph: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.cyan,
  },
});
