import { colors } from '../../theme/colors';
import {
  scoreLabel,
  toneBucket,
  toneFill,
  toParString,
} from '../scoring';

describe('scoreLabel (spec §6.1)', () => {
  it('returns ACE for 1 stroke regardless of par', () => {
    expect(scoreLabel(1, 3)).toBe('ACE');
    expect(scoreLabel(1, 5)).toBe('ACE');
  });

  it('returns EAGLE for 2+ under par (and not an ace)', () => {
    expect(scoreLabel(3, 5)).toBe('EAGLE');
    expect(scoreLabel(2, 4)).toBe('EAGLE'); // not ACE because s != 1
  });

  it('returns BIRDIE for one under', () => {
    expect(scoreLabel(2, 3)).toBe('BIRDIE');
  });

  it('returns PAR for even', () => {
    expect(scoreLabel(3, 3)).toBe('PAR');
  });

  it('returns BOGEY, DOUBLE, TRIPLE for +1/+2/+3', () => {
    expect(scoreLabel(4, 3)).toBe('BOGEY');
    expect(scoreLabel(5, 3)).toBe('DOUBLE');
    expect(scoreLabel(6, 3)).toBe('TRIPLE');
  });

  it('returns +n string for +4 and worse', () => {
    expect(scoreLabel(7, 3)).toBe('+4');
    expect(scoreLabel(10, 3)).toBe('+7');
  });
});

describe('toneFill (spec §6.2, §11 boundary cases)', () => {
  it('ace → toneBlue', () => {
    expect(toneFill(1, 3).bg).toBe(colors.toneBlue);
  });
  it('eagle → toneBlue', () => {
    expect(toneFill(3, 5).bg).toBe(colors.toneBlue);
  });
  it('par-1 → toneGreen', () => {
    expect(toneFill(2, 3).bg).toBe(colors.toneGreen);
  });
  it('par → toneAmber', () => {
    expect(toneFill(3, 3).bg).toBe(colors.toneAmber);
  });
  it('par+1 → toneOrange', () => {
    expect(toneFill(4, 3).bg).toBe(colors.toneOrange);
  });
  it('par+2 → toneRed', () => {
    expect(toneFill(5, 3).bg).toBe(colors.toneRed);
  });
  it('par+5 → toneRed', () => {
    expect(toneFill(8, 3).bg).toBe(colors.toneRed);
  });

  it('uses white ink on toneRed and black ink elsewhere', () => {
    expect(toneFill(5, 3).fg).toBe(colors.inkOnRed);
    expect(toneFill(3, 3).fg).toBe(colors.inkOnFill);
    expect(toneFill(1, 3).fg).toBe(colors.inkOnFill);
  });
});

describe('toneBucket', () => {
  it('groups ACE and EAGLE into great', () => {
    expect(toneBucket(1, 3)).toBe('great');
    expect(toneBucket(3, 5)).toBe('great');
  });
  it('groups DOUBLE+ into worse', () => {
    expect(toneBucket(5, 3)).toBe('worse');
    expect(toneBucket(6, 3)).toBe('worse');
    expect(toneBucket(20, 3)).toBe('worse');
  });
});

describe('toParString (spec §6.3)', () => {
  it('formats 0 as E', () => {
    expect(toParString(0)).toBe('E');
  });
  it('prefixes positive deltas with +', () => {
    expect(toParString(5)).toBe('+5');
  });
  it('leaves negative deltas as-is', () => {
    expect(toParString(-3)).toBe('-3');
  });
});
