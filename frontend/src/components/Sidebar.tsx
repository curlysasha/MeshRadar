import { useState } from 'react'
import { Hash, User, Battery, Signal, ArrowUpDown, Search, X, Globe, Check, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConnectionPanel } from './ConnectionPanel'
import { ThemeToggle } from './ThemeToggle'
import { useMeshStore } from '@/store'
import { useNodes, useChannels, useCheckUpdate } from '@/hooks/useApi'
import { cn, getNodeName } from '@/lib/utils'

type SortType = 'name' | 'lastHeard'

export function Sidebar() {
  const { currentChat, setActiveTab, setSelectedNode, selectedNode, getUnreadForChat, setIsNetworkMapOpen } = useMeshStore()
  const { data: nodes } = useNodes()
  const { data: channels } = useChannels()
  const { data: updateInfo } = useCheckUpdate()
  const { t, i18n } = useTranslation()
  const [sortBy, setSortBy] = useState<SortType>('name')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const formatLastHeard = (timestamp?: number) => {
    if (!timestamp) return ''
    const now = Date.now()
    const diff = Math.floor((now - timestamp * 1000) / 1000)

    if (diff < 60) return t('nodeInfo.duration.seconds', { count: diff })
    if (diff < 3600) return t('nodeInfo.duration.minutes', { count: Math.floor(diff / 60) })
    if (diff < 86400) return t('nodeInfo.duration.hours', { count: Math.floor(diff / 3600) })
    return t('nodeInfo.duration.days', { count: Math.floor(diff / 86400) })
  }

  // Filter and Sort nodes
  const processedNodes = nodes ? [...nodes]
    .filter(n => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const name = getNodeName(n).toLowerCase()
      const shortName = n.user?.shortName?.toLowerCase() || ''
      const id = n.id?.toLowerCase() || ''
      return name.includes(query) || shortName.includes(query) || id.includes(query)
    })
    .sort((a, b) => {
      // First sort by favorite status (favorites always on top)
      if (a.isFavorite !== b.isFavorite) {
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      }

      // Then sort by name or lastHeard
      if (sortBy === 'name') {
        const nameA = getNodeName(a).toLowerCase()
        const nameB = getNodeName(b).toLowerCase()
        return nameA.localeCompare(nameB)
      } else {
        // Sort by lastHeard (newest first)
        const timeA = a.lastHeard || 0
        const timeB = b.lastHeard || 0
        return timeB - timeA
      }
    }) : []

  const getUnread = (nodeId: string) => getUnreadForChat(`dm:${nodeId}`)

  // Split into unread and regular, respecting the filter
  const unreadNodes = processedNodes.filter((node) => getUnread(node.id) > 0)
  const regularNodes = processedNodes.filter((node) => getUnread(node.id) === 0)

  const renderNodeButton = (node: (typeof processedNodes)[number], unreadCount: number) => (
    <button
      key={node.id || node.num}
      onClick={() => {
        setSelectedNode(node)
        setIsNetworkMapOpen(false)
      }}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors',
        ((currentChat?.type === 'dm' && currentChat.nodeId === node.id) || selectedNode?.id === node.id) &&
        'bg-accent'
      )}
    >
      {node.isFavorite ? (
        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
      ) : (
        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate">
            {getNodeName(node)}
            {node.user?.shortName && <span className="ml-1 text-muted-foreground text-xs font-normal">({node.user.shortName})</span>}
          </span>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate mr-2 font-mono opacity-70">
            {node.user?.id || node.num}
          </span>
          <span>{formatLastHeard(node.lastHeard)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground flex-shrink-0">
        {node.deviceMetrics?.batteryLevel !== undefined && (
          <span className="flex items-center">
            <Battery className="w-3 h-3 mr-0.5" />
            {node.deviceMetrics.batteryLevel}%
          </span>
        )}
        {node.snr !== undefined && node.snr !== null && (
          <span className="flex items-center">
            <Signal className="w-3 h-3 mr-0.5" />
            {node.snr.toFixed(1)}
          </span>
        )}
      </div>
    </button>
  )

  return (
    <div className="bg-card border-r border-border flex flex-col h-full w-full">
      {/* Header */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="font-semibold text-lg flex items-center gap-2 hover:text-primary cursor-pointer transition-colors"
            onClick={() => setIsNetworkMapOpen(true)}
          >
            <Hash className="w-5 h-5" />
            MeshRadar
          </div>
          <a
            href={updateInfo?.update_available ? updateInfo.update_url : "https://github.com/curlysasha/MeshRadar"}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group/gh relative inline-flex items-center gap-1.5 rounded-full transition-all duration-200 hover:scale-105",
              updateInfo?.update_available
                ? "bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "h-7 w-7 justify-center hover:bg-foreground/10 text-muted-foreground/60 hover:text-foreground mt-0.5"
            )}
            title={updateInfo?.update_available ? `Update available: ${updateInfo.latest_version}` : "GitHub"}
          >
            <svg className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover/gh:rotate-[360deg]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {updateInfo?.update_available && (
              <>
                <span className="text-[11px] font-semibold leading-none">{t('sidebar.updateAvailable')}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </>
            )}
          </a>
        </div>

        {/* Theme Toggle and Language Switcher */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => i18n.changeLanguage('en')}
                className="cursor-pointer flex items-center justify-between"
              >
                <span>English</span>
                {i18n.language.startsWith('en') && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => i18n.changeLanguage('ru')}
                className="cursor-pointer flex items-center justify-between"
              >
                <span>Русский</span>
                {i18n.language.startsWith('ru') && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ConnectionPanel />

      {channels && channels.length > 0 ? (
        <ScrollArea className="flex-1">
          {/* Channels */}
          <div className="p-2">
            <div
              className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1 mb-1 hover:text-foreground cursor-pointer transition-colors"
              onClick={() => setIsNetworkMapOpen(true)}
            >
              {t('sidebar.channels')}
            </div>
            {channels.map((channel) => (
              <button
                key={channel.index}
                onClick={() => {
                  setActiveTab({
                    type: 'channel',
                    index: channel.index,
                    name: channel.name,
                  })
                  setIsNetworkMapOpen(true)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors',
                  currentChat?.type === 'channel' &&
                  currentChat.index === channel.index &&
                  'bg-accent'
                )}
              >
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="truncate font-medium">
                  {channel.name || t('chat.channel') + ` ${channel.index}`}
                </span>
              </button>
            ))}
          </div>

          <div className="h-px bg-border mx-2 my-1" />

          {/* Nodes */}
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <div
                className="text-xs font-semibold text-muted-foreground uppercase hover:text-foreground cursor-pointer transition-colors"
                onClick={() => setIsNetworkMapOpen(true)}
              >
                {t('sidebar.nodes')} ({nodes?.length || 0})
              </div>
              <div className="flex items-center gap-1">
                {isSearchOpen ? (
                  <div className="flex items-center bg-muted rounded-md px-2 h-7 animate-in fade-in zoom-in duration-200">
                    <Search className="w-3 h-3 text-muted-foreground mr-1.5" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('sidebar.search')}
                      className="bg-transparent border-none text-xs focus:outline-none w-24 placeholder:text-muted-foreground/50"
                    />
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                      className="ml-1 hover:text-foreground text-muted-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title={t('sidebar.searchTitle')}
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title={t('sidebar.sortTitle')}
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      <span className={cn(sortBy === 'name' && 'font-semibold')}>
                        {t('sidebar.sortByName')}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('lastHeard')}>
                      <span className={cn(sortBy === 'lastHeard' && 'font-semibold')}>
                        {t('sidebar.sortByActivity')}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {unreadNodes.length > 0 && (
              <div className="mb-2">
                <div className="text-[11px] font-semibold text-primary uppercase px-2 py-1">
                  {t('sidebar.unread')}
                </div>
                {unreadNodes.map((node) => renderNodeButton(node, getUnread(node.id)))}
              </div>
            )}

            {regularNodes.map((node) => renderNodeButton(node, getUnread(node.id)))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          {t('common.noConnection')}
        </div>
      )}
    </div>
  )
}
