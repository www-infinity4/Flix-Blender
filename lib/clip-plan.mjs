function shuffledOrder(count, round) {
  const order = Array.from({ length: count }, (_, i) => i);
  if (round === 0 || count < 2) return order;
  let seed = (0x9e3779b9 ^ Math.imul(round + 1, 0x85ebca6b) ^ Math.imul(count, 0xc2b2ae35)) >>> 0;
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
  for (let i = order.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.every((value, i) => value === i)) order.push(order.shift());
  return order;
}

export function clipOrder(count, round) {
  if (!Number.isInteger(count) || count < 1) throw new Error("No films");
  if (!Number.isInteger(round) || round < 0) throw new Error("Invalid round");
  return shuffledOrder(count, round);
}

export function clipPlan(step, count, length, duration) {
  if (!Number.isInteger(count) || count < 1) throw new Error("No films");
  if (![5, 10, 15].includes(length)) throw new Error("Invalid clip length");
  if (!Number.isInteger(step) || step < 0) throw new Error("Invalid step");
  const round = Math.floor(step / count);
  const slot = step % count;
  const order = shuffledOrder(count, round);
  const index = order[slot];
  const rawStart = round === 0
    ? 30 + index * 53
    : 30 + ((Math.imul(round + 11, 977) + Math.imul(index + 7, 173) + slot * 61) % 3600);
  const known = Number.isFinite(duration) && duration > 0;
  if (!known) return { index, start: rawStart, end: rawStart + length, round, slot, ordered: round === 0 };
  if (duration <= length) return { index, start: 0, end: duration, round, slot, ordered: round === 0 };
  const maxStart = Math.max(0, duration - length - 0.25);
  const start = Math.max(0, Math.min(rawStart % Math.max(1, maxStart), maxStart));
  return { index, start, end: Math.min(start + length, duration), round, slot, ordered: round === 0 };
}

export function shouldAdvance(time, end, seeking, playing) {
  return playing && !seeking && Number.isFinite(time) && time >= end;
}
