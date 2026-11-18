import { useState } from 'react';
import {
  DESTINATIONS,
  Destination,
  MONTHS_SHORT,
  MONTHLY_FESTIVALS,
  formatMoney,
} from '../data/destinations';

interface SeasonalMatrixProps {
  onSelectDestination: (dest: Destination) => void;
}

export function SeasonalMatrix({ onSelectDestination }: SeasonalMatrixProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Default November (prime season)

  const monthMeta = MONTHLY_FESTIVALS[selectedMonth];

  const sortedDestinations = [...DESTINATIONS].sort((a, b) => {
    const score = (c: string) => (c === 'Peak' ? 0 : c === 'Pleasant' ? 1 : 2);
    return score(a.monthConditions[selectedMonth]) - score(b.monthConditions[selectedMonth]);
  });

  return (
    <section
      id="seasonal-guide"
      className="max-w-7xl mx-auto px-6 py-16 border-b border-[#D5C7AE]"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#9A3412] tracking-[0.04em]">
            <span className="chapter-num text-sm mr-1.5">03.</span> Climate & Monsoon Calendar
          </p>
          <h2 className="editorial-display text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-2 text-balance">
            Choose the right region for every month
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] mt-3 leading-[1.68]">
            India’s microclimates shift dramatically—when Rajasthan swelters in June, Leh–Ladakh
            opens its highest passes. Select a month to inspect live regional suitability.
          </p>
        </div>

        {/* 12-Month Segmented Selector */}
        <div
          className="grid grid-cols-6 sm:grid-cols-12 gap-1 p-1 bg-[#E6DAC4] rounded-lg border border-[#D5C7AE]"
          role="tablist"
          aria-label="Select travel month"
        >
          {MONTHS_SHORT.map((month, idx) => (
            <button
              key={month}
              type="button"
              role="tab"
              aria-selected={selectedMonth === idx}
              onClick={() => setSelectedMonth(idx)}
              className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedMonth === idx
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Month Overview Ribbon */}
      <div className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#1E3A8A]">
            {MONTHS_SHORT[selectedMonth]} Travel Outlook
          </p>
          <p className="text-sm text-[#1C1917] mt-1">{monthMeta.seasonNote}</p>
        </div>
        <div className="md:text-right shrink-0">
          <p className="text-xs text-[#78716C]">Notable Cultural Festivals</p>
          <p className="text-xs font-medium text-[#44403C] mt-1">{monthMeta.events}</p>
        </div>
      </div>

      {/* Grid of Destinations for Chosen Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDestinations.map((dest) => {
          const cond = dest.monthConditions[selectedMonth];
          const condLabel =
            cond === 'Peak'
              ? 'Peak Clarity'
              : cond === 'Pleasant'
                ? 'Pleasant Shoulder'
                : 'Monsoon / Heat Caution';

          const statusStyles =
            cond === 'Peak'
              ? 'text-[#1E3A8A] bg-[#1E3A8A]/8 border-[#1E3A8A]/25'
              : cond === 'Pleasant'
                ? 'text-[#44403C] bg-[#F4EFE6] border-[#D6CEBE]'
                : 'text-[#9A3412] bg-[#9A3412]/8 border-[#9A3412]/25';

          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => onSelectDestination(dest)}
              className="text-left bg-[#FAF6EE] border border-[#D5C7AE] hover:border-[#1E3A8A]/50 rounded-xl p-5 transition-colors flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#78716C]">
                      {dest.state} · {dest.region}
                    </p>
                    <h3 className="editorial-display text-xl font-semibold text-[#1C1917] group-hover:text-[#1E3A8A] transition-colors mt-0.5">
                      {dest.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-1 rounded border whitespace-nowrap ${statusStyles}`}
                  >
                    {condLabel}
                  </span>
                </div>
                <p className="text-xs text-[#57534E] mt-2 line-clamp-2">{dest.tagline}</p>
              </div>

              <div className="pt-3 border-t border-[#E6DAC4] flex items-center justify-between text-xs">
                <span className="text-[#78716C]">
                  Comfort avg:{' '}
                  <strong className="digit-tabular font-semibold text-[#1C1917]">
                    {formatMoney(dest.budgets.comfort.total)}/d
                  </strong>
                </span>
                <span className="font-medium text-[#1E3A8A] group-hover:underline">
                  Inspect Dossier
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
