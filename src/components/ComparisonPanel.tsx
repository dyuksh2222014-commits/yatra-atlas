import { X } from 'lucide-react';
import { Destination, formatMoney } from '../data/destinations';

interface ComparisonPanelProps {
  destinations: Destination[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenDossier: (dest: Destination) => void;
}

export function ComparisonPanel({
  destinations,
  onRemove,
  onClear,
  onOpenDossier,
}: ComparisonPanelProps) {
  if (destinations.length === 0) return null;

  return (
    <section
      aria-label="Destination budget comparison"
      className="max-w-7xl mx-auto px-6 py-8 border-b border-[#D5C7AE]"
    >
      <div className="bg-[#FAF6EE] border border-[#C9B99B] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E6DAC4]">
          <div>
            <h3 className="editorial-display text-2xl font-semibold text-[#1C1917]">
              Side-by-Side Destination Comparison (<span className="digit-tabular">{destinations.length}/3</span>)
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Compare daily budgets, climate windows, and transit hubs before locking your route.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-[#57534E] hover:text-[#1C1917] underline underline-offset-4"
          >
            Clear comparison
          </button>
        </div>

        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left border-collapse text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-[#EFEAE0] text-xs text-[#78716C]">
                <th className="py-2.5 pr-4 font-medium w-44">Metric</th>
                {destinations.map((dest) => (
                  <th key={dest.id} className="py-2.5 px-4 font-semibold text-[#1C1917]">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenDossier(dest)}
                        className="font-serif text-base hover:text-[#1E3A8A] transition-colors text-left"
                      >
                        {dest.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(dest.id)}
                        aria-label={`Remove ${dest.name} from comparison`}
                        className="p-1 text-[#78716C] hover:text-[#1C1917] rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEAE0]">
              <tr>
                <td className="py-3 pr-4 text-[#78716C]">State & Region</td>
                {destinations.map((dest) => (
                  <td key={dest.id} className="py-3 px-4 text-[#44403C]">
                    {dest.state} · {dest.region}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#78716C]">Backpacker / day</td>
                {destinations.map((dest) => (
                  <td key={dest.id} className="py-3 px-4 digit-tabular text-[#1C1917]">
                    {formatMoney(dest.budgets.backpacker.total)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#78716C]">Comfort / day</td>
                {destinations.map((dest) => (
                  <td key={dest.id} className="py-3 px-4 digit-display text-lg font-semibold text-[#1E3A8A]">
                    {formatMoney(dest.budgets.comfort.total)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#78716C]">Heritage Luxury / day</td>
                {destinations.map((dest) => (
                  <td key={dest.id} className="py-3 px-4 digit-tabular text-[#1C1917]">
                    {formatMoney(dest.budgets.luxury.total)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#78716C]">Best Weather</td>
                {destinations.map((dest) => (
                  <td key={dest.id} className="py-3 px-4 text-[#44403C]">
                    {dest.bestMonthsLabel} ({dest.avgTempPeak})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#78716C]">Ideal Duration</td>
                {destinations.map((dest) => (
                  <td key={dest.id} className="py-3 px-4 digit-tabular text-[#44403C]">
                    {dest.idealDays} days
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#78716C]">Primary Rail / Air</td>
                {destinations.map((dest) => (
                  <td key={dest.id} className="py-3 px-4 text-xs text-[#57534E]">
                    {dest.nearestAirport}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
