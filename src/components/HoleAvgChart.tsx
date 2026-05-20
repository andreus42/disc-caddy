import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { toneFill } from '../lib/scoring';
import { colors, fonts } from '../theme';
import type { Course } from '../types';

type Props = {
  course: Course;
  /** Per-hole avg strokes (null when no rounds covered that hole). */
  averages: Array<{ avg: number | null; count: number }>;
};

const CHART_HEIGHT = 180;
const BAR_WIDTH = 22;
const BAR_GAP = 6;

/**
 * Hole-average chart (spec §5.6). Bar per hole, height proportional to
 * avg strokes, tinted by toneFill(round(avg), par). A semi-transparent
 * amber line crosses each bar at the par y-position. Above each bar:
 * the numeric average to one decimal place.
 */
export function HoleAvgChart({ course, averages }: Props) {
  const maxStrokes = useMemo(() => {
    let max = 0;
    for (let i = 0; i < course.holes.length; i++) {
      const a = averages[i]?.avg ?? 0;
      const par = course.holes[i].par;
      max = Math.max(max, a, par);
    }
    // Headroom so the tallest bar doesn't touch the ceiling
    return Math.max(7, Math.ceil(max + 1));
  }, [course, averages]);

  const yTicks = Array.from({ length: maxStrokes + 1 }, (_, i) => i);

  return (
    <View style={styles.wrap}>
      {/* Y-axis ticks */}
      <View style={styles.yAxis}>
        {yTicks
          .slice()
          .reverse()
          .map((t) => (
            <Text key={t} style={styles.yLabel}>
              {t}
            </Text>
          ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Bars row */}
          <View style={styles.barsRow}>
            {course.holes.map((h, i) => {
              const avg = averages[i]?.avg ?? null;
              const barH = avg != null ? (avg / maxStrokes) * CHART_HEIGHT : 0;
              const parY = (h.par / maxStrokes) * CHART_HEIGHT;
              const fill =
                avg != null ? toneFill(Math.round(avg), h.par) : null;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.avgLabel}>
                    {avg != null ? avg.toFixed(1) : '—'}
                  </Text>
                  <View style={styles.barTrack}>
                    {avg != null ? (
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barH,
                            backgroundColor: fill!.bg,
                          },
                        ]}
                      />
                    ) : null}
                    {/* Par line — amber, semi-transparent, across the column */}
                    <View
                      style={[
                        styles.parLine,
                        { bottom: parY },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* X-axis hole labels */}
          <View style={styles.xAxis}>
            {course.holes.map((h, i) => (
              <View key={i} style={styles.xCell}>
                <Text style={styles.xLabel}>{h.hole}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 6,
  },
  yAxis: {
    width: 18,
    height: CHART_HEIGHT + 20, // 20 = approx room for the avg labels above bars
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 0,
    paddingTop: 16,
  },
  yLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.amberDim,
    lineHeight: 10,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: BAR_GAP,
    paddingHorizontal: 4,
  },
  barCol: {
    width: BAR_WIDTH,
    alignItems: 'center',
  },
  avgLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.amberDim,
    marginBottom: 2,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.cyanFaint,
  },
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  parLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,160,0,0.55)',
  },
  xAxis: {
    flexDirection: 'row',
    gap: BAR_GAP,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  xCell: {
    width: BAR_WIDTH,
    alignItems: 'center',
  },
  xLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.amberDim,
  },
});
