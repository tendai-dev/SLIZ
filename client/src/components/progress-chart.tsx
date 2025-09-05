import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ProgressChartProps {
  data: Array<{
    day: string;
    hours: number;
  }>;
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="w-full">
      {/* Custom Chart Implementation */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {data.map((item, index) => (
          <div key={item.day} className="text-center">
            <div className="text-xs text-muted-foreground mb-2">{item.day}</div>
            <div className="h-20 bg-primary/20 rounded-lg relative overflow-hidden">
              <div 
                className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-300 ${
                  index % 2 === 0 
                    ? 'bg-gradient-to-t from-primary to-primary/50' 
                    : 'bg-gradient-to-t from-accent to-accent/50'
                }`}
                style={{ 
                  height: `${Math.max((item.hours / 4) * 100, 10)}%` // Scale to max 4 hours
                }}
                data-testid={`chart-bar-${item.day.toLowerCase()}`}
              />
            </div>
            <div 
              className={`text-xs font-semibold mt-2 ${
                index % 2 === 0 ? 'text-primary' : 'text-accent'
              }`}
              data-testid={`chart-hours-${item.day.toLowerCase()}`}
            >
              {item.hours}h
            </div>
          </div>
        ))}
      </div>
      
      {/* Chart Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary/50 rounded"></div>
            <span>Weekdays</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-accent to-accent/50 rounded"></div>
            <span>Weekends</span>
          </div>
        </div>
        <div data-testid="chart-total-hours">
          Total: {data.reduce((acc, item) => acc + item.hours, 0).toFixed(1)}h
        </div>
      </div>
    </div>
  );
}
