import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  onResize: (delta: number) => void
  onResizeEnd?: () => void
  side: 'left' | 'right'
}

export function ResizeHandle({ onResize, onResizeEnd, side }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setIsDragging(true)
      startXRef.current = e.clientX
      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)
    },
    []
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const delta = e.clientX - startXRef.current
      startXRef.current = e.clientX
      // For right-side handle, invert delta (dragging left = wider panel)
      onResize(side === 'right' ? -delta : delta)
    },
    [isDragging, onResize, side]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      setIsDragging(false)
      const target = e.currentTarget as HTMLElement
      target.releasePointerCapture(e.pointerId)
      onResizeEnd?.()
    },
    [isDragging, onResizeEnd]
  )

  return (
    <div
      className={cn(
        'relative flex-shrink-0 select-none',
        'w-px bg-border',
        'cursor-col-resize',
        'group',
        'transition-colors duration-150',
        isDragging && 'bg-primary'
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Wider invisible hit target */}
      <div className="absolute inset-y-0 -left-[7px] -right-[7px] z-10" />

      {/* Visual grip indicator */}
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'flex flex-col items-center gap-[3px]',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'pointer-events-none',
          isDragging && 'opacity-100'
        )}
      >
        {/* 6 grip dots (3 rows x 2 columns) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-[3px]">
            <div
              className={cn(
                'w-[3px] h-[3px] rounded-full',
                isDragging ? 'bg-primary' : 'bg-muted-foreground/50'
              )}
            />
            <div
              className={cn(
                'w-[3px] h-[3px] rounded-full',
                isDragging ? 'bg-primary' : 'bg-muted-foreground/50'
              )}
            />
          </div>
        ))}
      </div>

      {/* Hover highlight bar */}
      <div
        className={cn(
          'absolute inset-y-0 left-1/2 -translate-x-1/2',
          'w-[3px] rounded-full',
          'bg-primary/0 group-hover:bg-primary/30 transition-colors duration-150',
          isDragging && 'bg-primary/50 w-[3px]'
        )}
      />
    </div>
  )
}
