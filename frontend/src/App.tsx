import { useState, useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/Sidebar'
import { ChatArea } from '@/components/ChatArea'
import { NodeInfoPanel } from '@/components/NodeInfoPanel'
import { ResizeHandle } from '@/components/ResizeHandle'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useMeshStore } from '@/store'
import { useTitleNotifications } from '@/hooks/useTitleNotifications'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const STORAGE_KEY = 'meshtastic-panel-widths'
const DEFAULT_WIDTH = 360
const MIN_WIDTH = 280
const MAX_WIDTH = 500

function loadWidths(): { left: number; right: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        left: clamp(parsed.left ?? DEFAULT_WIDTH),
        right: clamp(parsed.right ?? DEFAULT_WIDTH),
      }
    }
  } catch {}
  return { left: DEFAULT_WIDTH, right: DEFAULT_WIDTH }
}

function clamp(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value))
}

function AppContent() {
  useWebSocket()
  useTitleNotifications()
  const selectedNode = useMeshStore((s) => s.selectedNode)
  const isNetworkMapOpen = useMeshStore((s) => s.isNetworkMapOpen)

  const [leftWidth, setLeftWidth] = useState(() => loadWidths().left)
  const [rightWidth, setRightWidth] = useState(() => loadWidths().right)

  const saveWidths = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ left: leftWidth, right: rightWidth })
    )
  }, [leftWidth, rightWidth])

  const handleLeftResize = useCallback(
    (delta: number) => setLeftWidth((w) => clamp(w + delta)),
    []
  )

  const handleRightResize = useCallback(
    (delta: number) => setRightWidth((w) => clamp(w + delta)),
    []
  )

  const showRightPanel = selectedNode || isNetworkMapOpen

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <div className="flex-shrink-0 h-full" style={{ width: leftWidth }}>
        <Sidebar />
      </div>
      <ResizeHandle side="left" onResize={handleLeftResize} onResizeEnd={saveWidths} />
      <div className="flex-1 min-w-0 h-full">
        <ChatArea />
      </div>
      {showRightPanel && (
        <>
          <ResizeHandle side="right" onResize={handleRightResize} onResizeEnd={saveWidths} />
          <div className="flex-shrink-0 h-full" style={{ width: rightWidth }}>
            <NodeInfoPanel />
          </div>
        </>
      )}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
