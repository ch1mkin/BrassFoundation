/** Cross-tab / same-browser signal when membership count may have changed. */
export const MEMBER_COUNT_BUMP_KEY = "bf-member-count-bump";
export const MEMBER_COUNT_CHANNEL = "bf-member-count";

export function bumpLiveMemberCount() {
  if (typeof window === "undefined") return;
  const stamp = String(Date.now());
  try {
    window.localStorage.setItem(MEMBER_COUNT_BUMP_KEY, stamp);
  } catch {
    // ignore
  }
  try {
    const channel = new BroadcastChannel(MEMBER_COUNT_CHANNEL);
    channel.postMessage({ type: "bump", at: stamp });
    channel.close();
  } catch {
    // ignore
  }
}
