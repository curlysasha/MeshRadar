import { Check, CheckCheck, X, Clock, CornerUpLeft, Signal, Radio, ArrowRightLeft } from 'lucide-react'
import type { Message } from '@/types'
import { cn, formatTime } from '@/lib/utils'
import { useMeshStore } from '@/store'

interface Props {
  message: Message
  onReply?: () => void
  isGroupStart?: boolean
  isGroupEnd?: boolean
}

export function MessageBubble({ message, onReply, isGroupStart = true, isGroupEnd = true }: Props) {
  const status = useMeshStore((s) => s.status)
  const nodes = useMeshStore((s) => s.nodes)
  const messages = useMeshStore((s) => s.messages)

  const isOutgoing = message.is_outgoing || message.sender === status.my_node_id
  const senderNode = nodes.find((n) => n.id === message.sender)

  // Find message being replied to
  const repliedMessage = message.reply_id
    ? messages.find(m => m.packet_id === message.reply_id || m.id === message.reply_id)
    : null

  const repliedSenderNode = repliedMessage
    ? nodes.find(n => n.id === repliedMessage.sender)
    : null

  const getSenderName = (node: any, id: string) => {
    if (id === status.my_node_id) return 'You'
    return node?.user?.longName || node?.user?.shortName || id
  }

  // Radio metadata
  const hops = typeof message.hop_start === 'number' && typeof message.hop_limit === 'number'
    ? message.hop_start - message.hop_limit
    : null
  const hasRadioMeta = !isOutgoing && (typeof message.snr === 'number' || typeof message.rssi === 'number' || hops !== null)

  const AckIcon = () => {
    switch (message.ack_status) {
      case 'pending':
        return <Clock className="w-2.5 h-2.5 opacity-60" />
      case 'ack':
        return <CheckCheck className="w-3 h-3 text-blue-400" />
      case 'implicit_ack':
        return <Check className="w-3 h-3 text-blue-400" />
      case 'nak':
      case 'failed':
        return <X className="w-3 h-3 text-red-400" />
      case 'received':
        return <Check className="w-3 h-3 opacity-60" />
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col max-w-[85%] group/bubble relative',
        isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start',
        isGroupEnd ? 'mb-2' : 'mb-0.5'
      )}
    >
      <div className="relative group/content flex items-center gap-2">
        {/* Reply button - for OUTGOING messages it appears on the LEFT (towards center) */}
        {isOutgoing && onReply && (
          <button
            onClick={onReply}
            className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 hover:bg-muted rounded-full shrink-0"
            title="Reply"
          >
            <CornerUpLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        <div
          className={cn(
            'px-3 py-1.5 break-words flex flex-col gap-0.5 shadow-sm transition-all',
            isOutgoing
              ? 'bg-primary text-primary-foreground border-primary/20'
              : 'bg-secondary text-secondary-foreground border-border/40',
            // Advanced border radius for grouping
            isOutgoing
              ? cn(
                "rounded-2xl rounded-br-sm",
                !isGroupStart && "rounded-tr-sm",
                !isGroupEnd && "rounded-br-sm"
              )
              : cn(
                "rounded-2xl rounded-bl-sm",
                !isGroupStart && "rounded-tl-sm",
                !isGroupEnd && "rounded-bl-sm"
              )
          )}
        >
          {/* Reply Context */}
          {repliedMessage && (
            <div className={cn(
              "mb-1 p-2 rounded-lg border-l-4 text-[11px] bg-black/5 flex flex-col gap-0.5 max-w-full overflow-hidden backdrop-blur-sm",
              isOutgoing ? "border-primary-foreground/30 text-primary-foreground/90" : "border-primary/50 text-muted-foreground"
            )}>
              <span className="font-bold opacity-80">
                {getSenderName(repliedSenderNode, repliedSenderNode?.id || repliedMessage.sender)}
              </span>
              <p className="truncate italic opacity-70 leading-tight">
                {repliedMessage.text}
              </p>
            </div>
          )}

          {/* Sender Header - only on Group Start */}
          {isGroupStart && !isOutgoing && (
            <div className="flex items-center gap-1.5 opacity-90 mb-0.5">
              {senderNode?.user?.shortName && (
                <span className={cn(
                  "px-1 py-0 rounded border text-[10px] font-bold tracking-tight leading-tight",
                  "border-foreground/20 bg-foreground/5"
                )}>
                  {senderNode.user.shortName}
                </span>
              )}
              <span className="font-semibold text-[11px] truncate leading-tight text-primary/90">
                {senderNode?.user?.longName || message.sender}
              </span>
            </div>
          )}

          <div className="flex flex-col min-w-[80px]">
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.text}</p>

            <div className="flex items-end justify-between gap-2 mt-0.5">
              {/* Reactions - Inside, Bottom Left */}
              {message.reactions && Object.keys(message.reactions).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(message.reactions).map(([emoji, senders]) => (
                    <div
                      key={emoji}
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[15px] flex items-center gap-1 shadow-sm border border-black/5 transition-transform hover:scale-110 cursor-default",
                        isOutgoing
                          ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                          : "bg-black/10 text-muted-foreground border-border/60"
                      )}
                      title={senders.join(', ')}
                    >
                      <span>{emoji}</span>
                      {senders.length > 1 && (
                        <span className="font-bold text-[10px] opacity-90">{senders.length}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Internal Timestamp, Radio Metadata & Ack - Bottom Right */}
              <div className="flex items-center gap-1 ml-auto shrink-0 pb-0.5">
                {hasRadioMeta && (
                  <div className="flex items-center gap-1.5 mr-1 opacity-40">
                    {hops !== null && (
                      <span className="flex items-center gap-0.5 text-[9px] font-medium" title={`${hops} hop${hops !== 1 ? 's' : ''}`}>
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                        {hops}
                      </span>
                    )}
                    {typeof message.snr === 'number' && (
                      <span className="flex items-center gap-0.5 text-[9px] font-medium" title={`SNR: ${message.snr.toFixed(1)} dB`}>
                        <Signal className="w-2.5 h-2.5" />
                        {message.snr.toFixed(1)}
                      </span>
                    )}
                    {typeof message.rssi === 'number' && (
                      <span className="flex items-center gap-0.5 text-[9px] font-medium" title={`RSSI: ${message.rssi} dBm`}>
                        <Radio className="w-2.5 h-2.5" />
                        {message.rssi}
                      </span>
                    )}
                  </div>
                )}
                <span className={cn(
                  "text-[9px] font-medium leading-none",
                  isOutgoing ? "opacity-70" : "opacity-50"
                )}>
                  {formatTime(message.timestamp)}
                </span>
                {isOutgoing && <AckIcon />}
              </div>
            </div>
          </div>
        </div>

        {/* Reply button - for INCOMING messages it appears on the RIGHT (towards center) */}
        {!isOutgoing && onReply && (
          <button
            onClick={onReply}
            className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 hover:bg-muted rounded-full shrink-0"
            title="Reply"
          >
            <CornerUpLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}
