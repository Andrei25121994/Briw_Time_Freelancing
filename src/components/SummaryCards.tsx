import { Clock, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency, formatHours } from '../utils/calculations';
import type { MonthlySummary } from '../types/timesheet';

interface SummaryCardsProps {
  summary: MonthlySummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Ore Lună',
      value: formatHours(summary.totalHours),
      icon: Clock,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Venit Estimat',
      value: formatCurrency(summary.totalAmount),
      icon: DollarSign,
      bgColor: 'bg-green-500',
    },
    {
      title: 'Număr Zile Lucrate',
      value: summary.daysWorked.toString(),
      icon: Calendar,
      bgColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-4 rounded-full`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
