import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 40;
const SWIPE_MAX_TIME = 500;

/**
 * Returns touch event handlers { onTouchStart, onTouchEnd } for swipe detection.
 * @param {Object} callbacks
 * @param {() => void} [callbacks.onSwipeLeft]
 * @param {() => void} [callbacks.onSwipeRight]
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }) {
  const startRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      if (!startRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;
      const dt = Date.now() - startRef.current.t;
      startRef.current = null;

      // Only count horizontal swipes (ignore vertical scrolls)
      if (dt > SWIPE_MAX_TIME || Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) {
        return;
      }

      if (dx < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (dx > 0 && onSwipeRight) {
        onSwipeRight();
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchEnd };
}
