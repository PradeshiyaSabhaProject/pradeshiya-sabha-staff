import React, { useState } from 'react'
import { useOverviewStats } from './hooks/useOverviewStats'
import OverviewChart from './components/OverviewChart'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'

export const OverviewPage: React.FC = () => {
  const { stats, loading } = useOverviewStats()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Council Executive Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time governance metrics and municipal administration tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => alert('Exporting report...')}>
            📥 Export Report
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + New Action Item
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/50 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
            >
              <span className="text-sm font-medium text-slate-400">{stat.label}</span>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-bold text-slate-100">{stat.value}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    stat.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Quick Shortcuts</h3>
            <p className="text-xs text-slate-400 mb-4">Frequently used municipal operations</p>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-sm font-medium text-slate-300 transition-colors flex items-center justify-between">
                <span>📋 Review Permit Applications</span>
                <span>→</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-sm font-medium text-slate-300 transition-colors flex items-center justify-between">
                <span>📢 Issue Public Notice</span>
                <span>→</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-sm font-medium text-slate-300 transition-colors flex items-center justify-between">
                <span>🚛 Garbage Disposal Schedule</span>
                <span>→</span>
              </button>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>System Status: <strong className="text-emerald-400">Online</strong></span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Modal Demo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Action Item">
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); alert('Action Item Created!') }} className="space-y-4">
          <Input label="Action Title" placeholder="e.g., Road repair on Ward 4" required />
          <Input label="Assigned Officer" placeholder="e.g., Mr. Perera" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Action
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default OverviewPage
