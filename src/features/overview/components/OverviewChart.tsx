import React from 'react'

export const OverviewChart: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const values = [35, 55, 45, 70, 65, 85]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-200">Revenue Growth Trend</h3>
          <p className="text-xs text-slate-400">Monthly tax & service revenue collection</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
          +18.4% YoY
        </span>
      </div>

      <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2">
        {months.map((month, idx) => {
          const height = values[idx]
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div
                style={{ height: `${height}%` }}
                className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all duration-300 relative"
              >
                <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700 transition-opacity">
                  {height}%
                </span>
              </div>
              <span className="text-xs font-medium text-slate-400">{month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default OverviewChart
