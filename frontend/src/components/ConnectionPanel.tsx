import { useState, useEffect } from 'react'
import { Wifi, Usb, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useConnect, useDisconnect } from '@/hooks/useApi'
import { useMeshStore } from '@/store'
import { cn } from '@/lib/utils'

export function ConnectionPanel() {
  const [type, setType] = useState<'tcp' | 'serial'>(() => {
    return (localStorage.getItem('meshtastic_connection_type') as 'tcp' | 'serial') || 'tcp'
  })
  const [address, setAddress] = useState(() => {
    return localStorage.getItem('meshtastic_last_address') || '192.168.1.1'
  })
  const { t } = useTranslation()
  const status = useMeshStore((s) => s.status)

  const connect = useConnect()
  const disconnect = useDisconnect()

  // Save last used address and type to localStorage
  useEffect(() => {
    if (status.connected && status.address) {
      localStorage.setItem('meshtastic_last_address', status.address)
      if (status.connection_type) {
        localStorage.setItem('meshtastic_connection_type', status.connection_type)
      }
    }
  }, [status.connected, status.address, status.connection_type])

  const handleConnect = () => {
    connect.mutate({ type, address })
  }

  const handleDisconnect = () => {
    disconnect.mutate()
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            status.connected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-sm font-medium">
          {status.connected ? t('connection.connected') : t('connection.disconnected')}
        </span>
      </div>

      {!status.connected ? (
        <>
          <div className="flex gap-2 mb-3">
            <Button
              variant={type === 'tcp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('tcp')}
              className="flex-1"
            >
              <Wifi className="w-4 h-4 mr-1" />
              {t('connection.tcp')}
            </Button>
            <Button
              variant={type === 'serial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('serial')}
              className="flex-1"
            >
              <Usb className="w-4 h-4 mr-1" />
              {t('connection.serial')}
            </Button>
          </div>

          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={type === 'tcp' ? '192.168.1.1:4403' : '/dev/ttyUSB0'}
            className="mb-3"
          />

          <Button
            onClick={handleConnect}
            disabled={connect.isPending || !address}
            className="w-full"
          >
            {connect.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {t('connection.connect')}
          </Button>

          {connect.isError && (
            <p className="text-red-500 text-xs mt-2">{connect.error.message}</p>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="text-[11px] leading-relaxed">
            <div className="flex justify-between items-center text-muted-foreground/80 mb-1 border-b border-border/40 pb-1">
              <span>{t('connection.details')}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-muted-foreground uppercase text-[9px] tracking-wider whitespace-nowrap">{t('connection.type')}</span>
                <span className="font-medium uppercase truncate">{status.connection_type || t('common.unknown')}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-muted-foreground uppercase text-[9px] tracking-wider whitespace-nowrap">{t('connection.node')}</span>
                <span className="font-mono text-primary truncate">{status.my_node_id || t('common.waiting')}</span>
              </div>
              <div className="flex items-center gap-1 col-span-2 border-t border-border/20 pt-1 mt-0.5 min-w-0">
                <span className="text-muted-foreground uppercase text-[9px] tracking-wider whitespace-nowrap">{t('connection.address')}</span>
                <span className="font-medium truncate">{status.address || t('common.none')}</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleDisconnect}
            disabled={disconnect.isPending}
            className="w-full h-8 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
            size="sm"
          >
            {t('connection.disconnect')}
          </Button>
        </div>
      )}
    </div>
  )
}
