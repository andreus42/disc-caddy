import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BackButton, HomeButton } from '../components';
import { makeId } from '../lib/id';
import { deriveInitials } from '../lib/initials';
import { useReduceMotion } from '../lib/useReduceMotion';
import { useAppState } from '../state/AppContext';
import {
  border,
  colors,
  fonts,
  radius,
  sizing,
  spacing,
  textGlow,
} from '../theme';
import type { Player } from '../types';
import { Screen } from './layout/Screen';

const MAX_PLAYERS = 6;

type EditableRow = {
  /** Stable react key (and player id when saved). */
  id: string;
  name: string;
};

export type PlayersScreenProps = {
  initialPlayers: Player[];
  onBack: () => void;
  onSave: (players: Player[]) => void;
};

/**
 * Players screen (spec §5.3). Roster editor for 1..6 players.
 */
export function PlayersScreen({
  initialPlayers,
  onBack,
  onSave,
}: PlayersScreenProps) {
  const [rows, setRows] = useState<EditableRow[]>(() =>
    initialPlayers.length > 0
      ? initialPlayers.map((p) => ({ id: p.id, name: p.name }))
      : [{ id: makeId('player'), name: '' }],
  );

  const reduceMotion = useReduceMotion();

  // Live count of non-empty trimmed names.
  const namedCount = useMemo(
    () => rows.filter((r) => r.name.trim().length > 0).length,
    [rows],
  );

  function updateName(id: string, name: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.id !== id),
    );
  }

  function addRow() {
    setRows((prev) =>
      prev.length >= MAX_PLAYERS
        ? prev
        : [...prev, { id: makeId('player'), name: '' }],
    );
  }

  function save() {
    const saved: Player[] = rows
      .map((r) => ({ id: r.id, name: r.name.trim() }))
      .filter((r) => r.name.length > 0)
      .map((r) => ({ id: r.id, name: r.name, initials: deriveInitials(r.name) }));
    // Ensure at least one row is preserved (default to a single empty one).
    if (saved.length === 0) {
      // Treat as no-op rather than blow away the roster.
      onBack();
      return;
    }
    onSave(saved);
  }

  return (
    <Screen
      topBar={
        <>
          <BackButton label="Menu" onPress={onBack} />
          <View style={{ width: 60 }} />
        </>
      }
      bottomBar={<HomeButton label="Save Roster" onPress={save} />}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.count, textGlow()]}>{namedCount}</Text>
          <Text style={styles.caption}>named players</Text>
        </View>

        <View style={styles.rows}>
          {rows.map((row) => (
            <PlayerEditRow
              key={row.id}
              name={row.name}
              onChange={(v) => updateName(row.id, v)}
              onRemove={() => removeRow(row.id)}
              disableRemove={rows.length <= 1}
              reduceMotion={reduceMotion}
            />
          ))}
        </View>

        {rows.length < MAX_PLAYERS ? (
          <Pressable
            onPress={addRow}
            accessibilityRole="button"
            accessibilityLabel="Add player"
            style={({ pressed }) => [
              styles.addPill,
              pressed && styles.addPillPressed,
            ]}
          >
            <Text style={styles.addPillLabel}>+ Add Player</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

/** Route wrapper. */
export function PlayersRoute() {
  const navigation = useNavigation();
  const app = useAppState();
  return (
    <PlayersScreen
      initialPlayers={app.players}
      onBack={() => navigation.goBack()}
      onSave={(players) => {
        app.setPlayers(players);
        navigation.goBack();
      }}
    />
  );
}

// ------------------------------------------------------------------------

function PlayerEditRow({
  name,
  onChange,
  onRemove,
  disableRemove,
  reduceMotion,
}: {
  name: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  disableRemove: boolean;
  reduceMotion: boolean;
}) {
  // The "cyan pulse" anim — fired once when the name transitions from empty
  // to non-empty. Gated on reduce-motion.
  const pulse = useRef(new Animated.Value(0)).current;
  const wasEmptyRef = useRef(name.trim().length === 0);

  useEffect(() => {
    const isEmpty = name.trim().length === 0;
    if (wasEmptyRef.current && !isEmpty && !reduceMotion) {
      pulse.setValue(1);
      Animated.timing(pulse, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
    wasEmptyRef.current = isEmpty;
  }, [name, pulse, reduceMotion]);

  const underlineColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.cyanFaint, colors.cyan],
  });

  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.inputWrap}>
        <TextInput
          value={name}
          onChangeText={onChange}
          placeholder="Player name"
          placeholderTextColor={colors.amberFaint}
          style={rowStyles.input}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={28}
        />
        <Animated.View
          style={[rowStyles.underline, { backgroundColor: underlineColor }]}
        />
      </View>
      <Pressable
        onPress={onRemove}
        disabled={disableRemove}
        accessibilityRole="button"
        accessibilityLabel="Remove player"
        accessibilityState={{ disabled: disableRemove }}
        hitSlop={8}
        style={({ pressed }) => [
          rowStyles.removeBtn,
          disableRemove && rowStyles.removeBtnDisabled,
          pressed && !disableRemove && rowStyles.removeBtnPressed,
        ]}
      >
        <Text
          style={[
            rowStyles.removeGlyph,
            disableRemove && rowStyles.removeGlyphDisabled,
          ]}
        >
          {'−'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  rows: {
    gap: spacing.md,
  },
  addPill: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: radius.round,
    borderWidth: border.stepper,
    borderColor: colors.cyanFaint,
    borderStyle: 'dashed',
  },
  addPillPressed: {
    backgroundColor: 'rgba(31,200,224,0.08)',
  },
  addPillLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.amberDim,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  inputWrap: {
    flex: 1,
  },
  input: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.amber,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  underline: {
    height: 1.5,
    width: '100%',
    backgroundColor: colors.cyanFaint,
  },
  removeBtn: {
    width: sizing.stepper,
    height: sizing.stepper,
    borderRadius: sizing.stepper / 2,
    borderWidth: border.stepper,
    borderColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnDisabled: {
    borderColor: colors.cyanFaint,
  },
  removeBtnPressed: {
    backgroundColor: 'rgba(31,200,224,0.12)',
  },
  removeGlyph: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.amber,
    lineHeight: 24,
  },
  removeGlyphDisabled: {
    color: colors.amberFaint,
  },
});
