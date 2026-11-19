import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Building2,
  Store,
  Factory,
  Home,
  Flame,
  DoorClosed,
  Trophy,
  Truck,
  Droplet,
  FileCheck,
  Film,
  Wrench,
  AlertTriangle,
  Tv,
  Flag,
  Trash2,
  Users,
  Bike,
  Car,
  Compass,
  Briefcase,
  ShoppingBag,
  FileSpreadsheet,
  ShieldCheck,
  Trees,
  Zap,
  BookOpen,
  Baby,
  FileText,
  Recycle,
  Boxes,
  TrendingUp,
  Gavel,
  Receipt,
  ArrowRight,
  Info,
  X,
  Sparkles,
} from 'lucide-react'
import { INCOME_CATEGORIES } from '../data/incomeCategories'
import type { IncomeCategory } from '../types/paymentPortal'

// Icon resolver helper
const renderCategoryIcon = (iconName: string, enabled: boolean) => {
  const iconProps = {
    className: `w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
      enabled ? 'text-[#A31736]' : 'text-gray-400'
    }`,
  }

  switch (iconName) {
    case 'Building2': return <Building2 {...iconProps} />
    case 'Store': return <Store {...iconProps} />
    case 'Factory': return <Factory {...iconProps} />
    case 'Home': return <Home {...iconProps} />
    case 'Flame': return <Flame {...iconProps} />
    case 'DoorClosed': return <DoorClosed {...iconProps} />
    case 'Trophy': return <Trophy {...iconProps} />
    case 'Truck': return <Truck {...iconProps} />
    case 'Droplet': return <Droplet {...iconProps} />
    case 'FileCheck': return <FileCheck {...iconProps} />
    case 'Film': return <Film {...iconProps} />
    case 'Wrench': return <Wrench {...iconProps} />
    case 'AlertTriangle': return <AlertTriangle {...iconProps} />
    case 'Tv': return <Tv {...iconProps} />
    case 'Flag': return <Flag {...iconProps} />
    case 'Trash2': return <Trash2 {...iconProps} />
    case 'Users': return <Users {...iconProps} />
    case 'Bike': return <Bike {...iconProps} />
    case 'Car': return <Car {...iconProps} />
    case 'Compass': return <Compass {...iconProps} />
    case 'Briefcase': return <Briefcase {...iconProps} />
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />
    case 'FileSpreadsheet': return <FileSpreadsheet {...iconProps} />
    case 'ShieldCheck': return <ShieldCheck {...iconProps} />
    case 'Trees': return <Trees {...iconProps} />
    case 'Zap': return <Zap {...iconProps} />
    case 'BookOpen': return <BookOpen {...iconProps} />
    case 'Baby': return <Baby {...iconProps} />
    case 'FileText': return <FileText {...iconProps} />
    case 'Recycle': return <Recycle {...iconProps} />
    case 'Boxes': return <Boxes {...iconProps} />
    case 'TrendingUp': return <TrendingUp {...iconProps} />
    case 'Gavel': return <Gavel {...iconProps} />
    case 'Receipt': return <Receipt {...iconProps} />
    default: return <Receipt {...iconProps} />
  }
}

export const PaymentCollectionPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return INCOME_CATEGORIES
    return INCOME_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        String(c.id).includes(q)
    )
  }, [searchQuery])

  const handleCardClick = (category: IncomeCategory) => {
    if (category.enabled && category.route) {
      navigate(category.route)
    } else {
      setToastMessage(
        `"${category.name}" service workflow is currently under administrative specification. Digital invoicing for this stream will be enabled once council by-laws are ratified.`
      )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-[#A31736] border border-rose-200">
                Municipal Revenue Collection
              </span>
              <span className="text-xs text-gray-400 font-medium">
                37 Statutory Income Streams
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">
              PAYMENT COLLECTION DIRECTORY
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Select an approved income category below to open counter assessment, calculate dues, and generate official payment invoices.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category by name or number..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none text-gray-800 font-medium placeholder-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast / Notification Message Banner ── */}
      {toastMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
              <Info className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Notice: Service Specification in Progress
              </p>
              <p className="text-xs text-amber-900 mt-0.5 font-medium leading-relaxed">
                {toastMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-amber-600 hover:text-amber-800 p-1 rounded transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Income Categories Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((category) => {
          const isEnabled = category.enabled

          return (
            <div
              key={category.id}
              onClick={() => handleCardClick(category)}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between group cursor-pointer ${
                isEnabled
                  ? 'bg-white border-[#A31736]/30 shadow-xs hover:shadow-md hover:border-[#A31736] hover:-translate-y-0.5'
                  : 'bg-gray-50/70 border-gray-200 hover:bg-white hover:border-gray-300 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isEnabled
                        ? 'bg-rose-50 border-rose-100 text-[#A31736]'
                        : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}
                  >
                    {renderCategoryIcon(category.icon, isEnabled)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-gray-400">
                      #{String(category.id).padStart(2, '0')}
                    </span>
                    {isEnabled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-200/70 text-gray-600 border border-gray-300">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3
                  className={`text-sm font-bold transition-colors ${
                    isEnabled
                      ? 'text-gray-900 group-hover:text-[#A31736]'
                      : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Bottom Action Hint */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                {isEnabled ? (
                  <>
                    <span className="text-[#A31736] uppercase tracking-wider text-[11px]">
                      Collect Tax
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A31736] group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 uppercase tracking-wider text-[11px]">
                      Setup Pending
                    </span>
                    <span className="text-gray-400 text-[10px] font-normal">Click for info</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-sm font-bold text-gray-700">No income category matching &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-xs text-gray-400 mt-1">Try searching by category name or statutory number.</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 px-3.5 py-1.5 text-xs font-bold text-[#A31736] hover:bg-rose-50 border border-[#A31736] rounded-xl transition-all cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  )
}

export default PaymentCollectionPage
