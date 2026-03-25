import { getDepartmentHeatmap } from '@/lib/mock-data';
import { useMemo } from 'react';

export function DepartmentHeatmap() {
  const { departments, aspectCategories, data } = useMemo(() => getDepartmentHeatmap(), []);

  const allValues = departments.flatMap(d => aspectCategories.map(a => data[d][a]));
  const maxAbs = Math.max(...allValues.map(Math.abs), 1);

  const getColor = (val: number) => {
    const norm = val / maxAbs;
    if (norm > 0.3) return { bg: 'hsl(142, 71%, 45%)', text: 'white', label: `+${val}` };
    if (norm < -0.3) return { bg: 'hsl(0, 84%, 60%)', text: 'white', label: `${val}` };
    if (norm > 0) return { bg: 'hsl(142, 71%, 85%)', text: 'hsl(142, 71%, 25%)', label: `+${val}` };
    if (norm < 0) return { bg: 'hsl(0, 84%, 90%)', text: 'hsl(0, 84%, 35%)', label: `${val}` };
    return { bg: 'hsl(var(--muted))', text: 'hsl(var(--muted-foreground))', label: '0' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Department</th>
            {aspectCategories.map(a => (
              <th key={a} className="text-center py-2 px-1.5 font-semibold text-muted-foreground whitespace-nowrap">
                {a.replace(' Quality', '').replace('Course ', '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map(dept => (
            <tr key={dept} className="border-t border-border">
              <td className="py-2 px-2 font-medium text-foreground whitespace-nowrap">{dept}</td>
              {aspectCategories.map(aspect => {
                const val = data[dept][aspect];
                const { bg, text, label } = getColor(val);
                return (
                  <td key={aspect} className="py-1.5 px-1.5 text-center">
                    <div
                      className="rounded-md py-1.5 px-2 font-mono font-semibold transition-all hover:scale-105"
                      style={{ backgroundColor: bg, color: text }}
                    >
                      {label}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded" style={{ background: 'hsl(0, 84%, 60%)' }} /> Negative</div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded" style={{ background: 'hsl(var(--muted))' }} /> Neutral</div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded" style={{ background: 'hsl(142, 71%, 45%)' }} /> Positive</div>
      </div>
    </div>
  );
}
