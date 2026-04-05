'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, FileText, FolderOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export interface CalEvent {
  id:    string;
  date:  string; // YYYY-MM-DD
  title: string;
  sub?:  string;
  type:  'quote' | 'document';
  href:  string;
  status?: string;
}

interface Props {
  events: CalEvent[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalendarView({ events }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(toYMD(today));

  // Group events by date
  const byDate = events.reduce<Record<string, CalEvent[]>>((acc, ev) => {
    const d = ev.date.slice(0, 10);
    (acc[d] ??= []).push(ev);
    return acc;
  }, {});

  // Build calendar grid
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }

  const selectedEvents = byDate[selected] ?? [];
  const todayYMD = toYMD(today);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-navy active:bg-gray-50"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-navy">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-navy active:bg-gray-50"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="aspect-square border-t border-gray-50 bg-gray-50/50" />;
            const ymd = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = byDate[ymd] ?? [];
            const isToday    = ymd === todayYMD;
            const isSelected = ymd === selected;
            const hasQuote   = dayEvents.some(e => e.type === 'quote');
            const hasDoc     = dayEvents.some(e => e.type === 'document');

            return (
              <button
                key={idx}
                onClick={() => setSelected(ymd)}
                className={[
                  'aspect-square border-t border-gray-100 flex flex-col items-center justify-start pt-1.5 gap-0.5 transition-colors',
                  isSelected ? 'bg-navy'        : '',
                  isToday && !isSelected ? 'bg-amber/10' : '',
                  !isSelected && !isToday ? 'active:bg-gray-50' : '',
                ].join(' ')}
              >
                <span className={[
                  'text-xs font-semibold leading-none',
                  isSelected ? 'text-white' : isToday ? 'text-amber' : 'text-navy',
                ].join(' ')}>
                  {day}
                </span>
                {/* Event dots */}
                <div className="flex gap-0.5 mt-0.5">
                  {hasQuote && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-amber'}`} />}
                  {hasDoc   && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/50' : 'bg-info'}`} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber inline-block" />
          <span className="text-sm text-muted">Quote / Invoice</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-info inline-block" />
          <span className="text-sm text-muted">Document</span>
        </div>
      </div>

      {/* Selected day panel */}
      <div>
        <h3 className="text-base font-semibold text-navy uppercase tracking-wide mb-3">
          {new Date(selected + 'T12:00:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>

        {selectedEvents.length === 0 ? (
          <Card>
            <p className="text-muted text-base text-center py-3">No events on this day</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map(ev => (
              <Link key={ev.id} href={ev.href}>
                <Card className="flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ev.type === 'quote' ? 'bg-amber/15' : 'bg-info/15'}`}>
                    {ev.type === 'quote'
                      ? <FileText  size={18} className="text-amber" />
                      : <FolderOpen size={18} className="text-info" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy text-base truncate">{ev.title}</p>
                    {ev.sub && <p className="text-muted text-sm mt-0.5 truncate">{ev.sub}</p>}
                  </div>
                  {ev.status && ev.type === 'quote' && (
                    <Badge variant={ev.status as 'draft' | 'sent' | 'paid'} />
                  )}
                  {ev.type === 'document' && (
                    <Badge variant="other" label="Doc" />
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
