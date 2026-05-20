import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Subscribe to the OS "reduce motion" accessibility flag.
 * Animations across the app should be gated on this returning `false`
 * (spec §10).
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!cancelled) setReduce(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (next) => setReduce(next),
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return reduce;
}
