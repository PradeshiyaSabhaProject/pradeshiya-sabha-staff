import React, { useState } from 'react'
import type { NotificationPreference } from '../types'
import Button from '../../../components/Button'

interface NotificationSettingsTabProps {
  initialNotifications: NotificationPreference[]
  onSavePreferences: (updated: NotificationPreference[]) => void
}

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#801028]">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

export const NotificationSettingsTab: React.FC<NotificationSettingsTabProps> = ({
  initialNotifications,
  onSavePreferences,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(initialNotifications)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleToggle = (id: string, channel: 'emailEnabled' | 'smsEnabled' | 'whatsappEnabled') => {
    setPreferences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [channel]: !item[channel] } : item))
    )
  }

  const handleToggleAllCategory = (category: string, enable: boolean) => {
    setPreferences((prev) =>
      prev.map((item) =>
        item.category === category
          ? { ...item, emailEnabled: enable, smsEnabled: enable, whatsappEnabled: enable }
          : item
      )
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSavePreferences(preferences)
    setSaveMessage('✔ Notification preferences updated and synchronized with council messaging server.')
    setTimeout(() => setSaveMessage(null), 4000)
  }

  const categories = Array.from(new Set(preferences.map((item) => item.category)))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner matching standard card box */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#801028]/10 border border-[#801028]/20 shrink-0">
            <BellIcon />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Communication & Alert Channels</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize where and when you receive real-time workflow notifications from Homagama Pradeshiya Sabha
            </p>
          </div>
        </div>

        {saveMessage && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold animate-fade-in">
            {saveMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {categories.map((cat) => {
          const items = preferences.filter((p) => p.category === cat)
          return (
            <div key={cat} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#801028]"></span>
                  <span>{cat}</span>
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleAllCategory(cat, true)}
                    className="text-[#801028] hover:underline font-semibold cursor-pointer"
                  >
                    Enable All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAllCategory(cat, false)}
                    className="text-gray-500 hover:underline font-semibold cursor-pointer"
                  >
                    Mute All
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 first:pt-2 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="max-w-xl">
                      <h5 className="font-bold text-xs text-gray-900">{item.label}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-200/70">
                      {/* Email Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.emailEnabled}
                          onChange={() => handleToggle(item.id, 'emailEnabled')}
                          className="w-4 h-4 text-[#801028] rounded border-gray-300 focus:ring-[#801028]"
                        />
                        <span className="text-xs font-semibold text-gray-700">Email</span>
                      </label>

                      {/* SMS Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.smsEnabled}
                          onChange={() => handleToggle(item.id, 'smsEnabled')}
                          className="w-4 h-4 text-[#801028] rounded border-gray-300 focus:ring-[#801028]"
                        />
                        <span className="text-xs font-semibold text-gray-700">SMS</span>
                      </label>

                      {/* WhatsApp Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.whatsappEnabled}
                          onChange={() => handleToggle(item.id, 'whatsappEnabled')}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-semibold text-emerald-800">WhatsApp</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="flex justify-end gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Button type="submit" variant="primary" className="px-8 shadow-sm uppercase tracking-wider">
            Save All Notification Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
export default NotificationSettingsTab
