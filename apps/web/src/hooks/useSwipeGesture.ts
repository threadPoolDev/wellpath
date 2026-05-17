import { useState, useRef, useCallback } from 'react'
import { SWIPE } from '@/constants'

interface SwipeGestureOptions {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  hasAnswer: boolean
}

interface SwipeState {
  cardStyle: React.CSSProperties
  isSwipingRight: boolean
  isSwipingLeft: boolean
  isShaking: boolean
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: () => void
  }
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  hasAnswer,
}: SwipeGestureOptions): SwipeState {
  const startXRef = useRef<number | null>(null)
  const [delta, setDelta] = useState(0)
  const [isReleased, setIsReleased] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const triggerShake = useCallback(() => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 400)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    setIsReleased(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    setDelta(dx)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsReleased(true)

    if (Math.abs(delta) >= SWIPE.THRESHOLD_PX) {
      if (delta > 0) {
        if (!hasAnswer) {
          triggerShake()
        } else {
          onSwipeRight()
        }
      } else {
        onSwipeLeft()
      }
    }

    setDelta(0)
    startXRef.current = null
  }, [delta, hasAnswer, onSwipeLeft, onSwipeRight, triggerShake])

  const rotation = Math.min(SWIPE.MAX_ROTATION_DEG, Math.abs(delta) / 20) * Math.sign(delta)
  const opacity = Math.max(0.7, 1 - Math.abs(delta) / 400)

  const cardStyle: React.CSSProperties =
    !isReleased && delta !== 0
      ? {
          transform: `translateX(${delta}px) rotate(${rotation}deg)`,
          opacity,
          transition: 'none',
        }
      : {
          transform: 'translateX(0) rotate(0deg)',
          opacity: 1,
          transition: `transform ${SWIPE.TRANSITION_MS}ms ease, opacity ${SWIPE.TRANSITION_MS}ms ease`,
        }

  return {
    cardStyle,
    isSwipingRight: delta > 20,
    isSwipingLeft: delta < -20,
    isShaking,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
