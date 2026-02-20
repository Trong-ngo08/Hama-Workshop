'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface AnimateInProps {
  children: React.ReactNode
  className?: string
  /** ms delay before the transition starts (for staggering siblings) */
  delay?: number
  from?: 'bottom' | 'left' | 'right' | 'scale'
  /** 0–1 threshold of element visibility to trigger */
  threshold?: number
  as?: React.ElementType
}

const HIDDEN: Record<NonNullable<AnimateInProps['from']>, string> = {
  bottom: 'opacity-0 translate-y-10',
  left:   'opacity-0 -translate-x-10',
  right:  'opacity-0 translate-x-10',
  scale:  'opacity-0 scale-95',
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  from = 'bottom',
  threshold = 0.12,
  as: Tag = 'div',
}: AnimateInProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out',
        !visible && HIDDEN[from],
        className
      )}
    >
      {children}
    </Tag>
  )
}
