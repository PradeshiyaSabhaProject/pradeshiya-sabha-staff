import React, { useState } from 'react'
import type { PropertyAssessment } from '../../data/financeMockData'

interface PropertyAssessmentRegisterProps {
  properties: PropertyAssessment[]
}

const PropertyAssessmentRegister: React.FC<PropertyAssessmentRegisterProps> = ({ properties }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWard, setFilterWard] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState<'assessment' | 'owner' | 'value'>('assessment')

  const filteredProperties = properties
    .filter((p) => {
      const matchesSearch =
        p.assessmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.propertyOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesWard = !filterWard || p.ward === filterWard
      const matchesStatus = !filterStatus || p.status === filterStatus
      return matchesSearch && matchesWard && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'owner':
          return a.propertyOwner.localeCompare(b.propertyOwner)
        case 'value':
          return b.annualValue - a.annualValue
        default:
          return a.assessmentNo.localeCompare(b.assessmentNo)
      }
    })

  const wards = Array.from(new Set(properties.map((p) => p.ward)))
  const statuses = Array.from(new Set(properties.map((p) => p.status)))

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { bg: string; text: string; icon: string }
    > = {
      Active: { bg: 'bg-emerald-100', text: 'text-emerald-800 border-emerald-300', icon: '✅' },
      Exempted: { bg: 'bg-gray-100', text: 'text-gray-700 border-gray-300', icon: '📋' },
      'Under Assessment': { bg: 'bg-blue-100', text: 'text-blue-800 border-blue-300', icon: '🔍' },
      Disputed: { bg: 'bg-orange-100', text: 'text-orange-800 border-orange-300', icon: '⚠️' },
    }
    const badge = badges[status] || badges.Active
    return badge
  }

  const getPropertyTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; icon: string }> = {
      Residential: { bg: 'bg-blue-50', icon: '🏠' },
      Commercial: { bg: 'bg-purple-50', icon: '🏪' },
      Industrial: { bg: 'bg-amber-50', icon: '🏭' },
      Agricultural: { bg: 'bg-green-50', icon: '🌾' },
    }
    return badges[type] || badges.Residential
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by assessment no, owner name, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Ward Filter */}
            <select
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Wards</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="assessment">Sort: Assessment No</option>
              <option value="owner">Sort: Owner Name</option>
              <option value="value">Sort: Annual Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <strong>{filteredProperties.length}</strong> of <strong>{properties.length}</strong> properties
        </p>
      </div>

      {/* Property Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Assessment No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Property Owner</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Ward</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Annual Value</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Rate %</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => {
                const statusBadge = getStatusBadge(property.status)
                const typeBadge = getPropertyTypeBadge(property.propertyType)

                return (
                  <tr key={property.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{property.assessmentNo}</div>
                      <div className="text-xs text-gray-500 mt-1">{property.propertyAddress}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{property.propertyOwner}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{property.ward}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeBadge.bg} text-gray-700`}
                      >
                        {typeBadge.icon} {property.propertyType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                      ₨ {(property.annualValue / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-semibold">{property.percentageRate}%</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        {statusBadge.icon} {property.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No properties found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics Footer */}
      {filteredProperties.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Total Annual Value</p>
            <p className="text-lg font-bold text-gray-900">
              ₨ {(filteredProperties.reduce((sum, p) => sum + p.annualValue, 0) / 1000000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Avg Rate %</p>
            <p className="text-lg font-bold text-gray-900">
              {(filteredProperties.reduce((sum, p) => sum + p.percentageRate, 0) / filteredProperties.length).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Total Rateable Value</p>
            <p className="text-lg font-bold text-gray-900">
              ₨ {(filteredProperties.reduce((sum, p) => sum + p.rateableValue, 0) / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyAssessmentRegister
