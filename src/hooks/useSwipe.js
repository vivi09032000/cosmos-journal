import { useRef, useCallback, useEffect } from "react";

const SWIPE_THRESHOLD = 40;
const SWIPE_MAX_TIME = 500;

/**
 * Returns a ref callback + touch handlers for swipe detection.
 *
 * Usage:
 *   const swipe = useSwipe({ onSwipeLeft, onSwipeRight });
 *   <div ref={swipe.ref} {...swipe.handlers}>
 *
 * OR spread all props:
 *   <div {...swipe.props}>
 *
 * touch-action: pan-y prevents the browser from claiming horizontal
 * swipes as native scroll/pan gestures.
 *
 * The onTouchMove listener is added with { passive: false } directly
 * on the DOM node so preventDefault() can actually block native panning.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }) {
  const startRef = useRef(null);
  const nodeRef = useRef(null);

  // Stable callbacks
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  useEffect(() => { onSwipeLeftRef.current = onSwipeLeft; }, [onSwipeLeft]);
  useEffect(() => { onSwipeRightRef.current = onSwipeRight; }, [onSwipeRight]);

  // Register non-passive touchmove so we can preventDefault
  const setRef = useCallback((node) => {
    if (nodeRef.current) {
      nodeRef.current.removeEventListener("touchmove", handleTouchMove);
    }
    nodeRef.current = node;
    if (node) {
      node.addEventListener("touchmove", handleTouchMove, { passive: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTouchMove(e) {
    if (!startRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - startRef.current.x);
    const dy = Math.abs(touch.clientY - startRef.current.y);
    // Clearly horizontal → stop browser from panning the whole view
    if (dx > dy && dx > 6) {
      e.preventDefault();
    }
  }

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!startRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    const dt = Date.now() - startRef.current.t;
    startRef.current = null;

    if (dt > SWIPE_MAX_TIME || Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) {
      return;
    }

    if (dx < 0 && onSwipeLeftRef.current) {
      onSwipeLeftRef.current();
    } else if (dx > 0 && onSwipeRightRef.current) {
      onSwipeRightRef.current();
    }
  }, []);

  // props to spread onto the swipeable element
  const props = {
    ref: setRef,
    onTouchStart,
    onTouchEnd,
    style: { touchAction: "pan-y" },
  };

  return props;
}
