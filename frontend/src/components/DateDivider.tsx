import { format } from 'date-fns'
import { parseTimestamp } from '@/lib/utils'

interface Props {
    date: string | number | Date
}

export function DateDivider({ date }: Props) {
    const dateObj = date instanceof Date ? date : parseTimestamp(date)

    // Logical helpers
    const isToday = (d: Date) => d.toDateString() === new Date().toDateString()
    const isYesterday = (d: Date) => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return d.toDateString() === yesterday.toDateString()
    }

    let displayDate = format(dateObj, 'LLLL d, yyyy')
    if (isToday(dateObj)) displayDate = 'Today'
    else if (isYesterday(dateObj)) displayDate = 'Yesterday'

    return (
        <div className="flex justify-center my-6 sticky top-2 z-20">
            <span className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-muted-foreground shadow-sm border border-border/40 uppercase tracking-widest">
                {displayDate}
            </span>
        </div>
    )
}
