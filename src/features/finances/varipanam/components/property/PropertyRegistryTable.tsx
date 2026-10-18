import React, { useState, useMemo } from 'react'
import type { Property, Road } from '../../types/varipanam'
import { formatLKR } from '../../utils/formatters'
import StatusBadge from '../shared/StatusBadge'

interface PropertyRegistryTableProps {
  properties: Property[]
  roads: Road[]
  selectedProperty: Property | null
  onSelectProperty: (property: Property) => void
  onOpenProperty: (propertyId: string) => void
}

type SortField = 'assessmentNumber' | 'owner' | 'assessedValue' | 'amountDue' | 'status'
type SortOrder = 'asc' | 'desc'

export const PropertyRegistryTable: React.FC<PropertyRegistryTableProps> = ({
  properties,
  roads,
  selectedProperty,
  onSelectProperty,
  onOpenProperty,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortField, setSortField] = useState<SortField>('assessmentNumber')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const roadMap = useMemo(() => {
    return new Map(roads.map((r) => [r.id, r.name]))
  }, [roads])

  // Sorting
  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      if (sortField === 'assessmentNumber') {
        valA = a.assessmentNumber
        valB = b.assessmentNumber
      } else if (sortField === 'owner') {
        valA = a.currentOwner.name
        valB = b.currentOwner.name
      } else if (sortField === 'assessedValue') {
        valA = a.annualAssessedValue
        valB = b.annualAssessedValue
      } else if (sortField === 'amountDue') {
        valA = a.dues.reduce((s, d) => s + (d.amount - d.paidAmount), 0)
        valB = b.dues.reduce((s, d) => s + (d.amount - d.paidAmount), 0)
      } else if (sortField === 'status') {
        valA = a.status
        valB = b.status
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [properties, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedProperties.length / pageSize) || 1
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedProperties.slice(start, start + pageSize)
  }, [sortedProperties, currentPage, pageSize])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Assessment Number',
      'Property Number',
      'Type',
      'Owner Name',
      'NIC',
      'Mobile',
      'Road',
      'Assessed Value (LKR)',
      'Status',
      'Amount Due (LKR)',
    ]

    const rows = sortedProperties.map((p) => {
      const roadName = roadMap.get(p.roadId) || 'Unknown Road'
      const amountDue = p.dues.reduce((s, d) => s + (d.amount - d.paidAmount), 0)
      return [
        `"${p.assessmentNumber}"`,
        `"${p.propertyNumber}"`,
        `"${p.propertyType}"`,
        `"${p.currentOwner.name}"`,
        `"${p.currentOwner.nic}"`,
        `"${p.currentOwner.mobile}"`,
        `"${roadName}"`,
        p.annualAssessedValue,
        `"${p.status}"`,
        amountDue,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Varipanam_Property_Registry_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Property Assessment Registry</h3>
          <p className="text-xs text-gray-500">
            Total {properties.length} units listed | Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-500">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>

          {/* Page size selector */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
            <tr>
              <th
                onClick={() => handleSort('assessmentNumber')}
                className="px-4 py-3 cursor-pointer hover:text-gray-900 select-none"
              >
                Assessment # {sortField === 'assessmentNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('owner')}
                className="px-4 py-3 cursor-pointer hover:text-gray-900 select-none"
              >
                Owner & Property Details {sortField === 'owner' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3">Road Location</th>
              <th className="px-4 py-3">Type</th>
              <th
                onClick={() => handleSort('assessedValue')}
                className="px-4 py-3 text-right cursor-pointer hover:text-gray-900 select-none"
              >
                Assessed Value {sortField === 'assessedValue' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('amountDue')}
                className="px-4 py-3 text-right cursor-pointer hover:text-gray-900 select-none"
              >
                Amount Due {sortField === 'amountDue' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 text-center cursor-pointer hover:text-gray-900 select-none"
              >
                Tax Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedProperties.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No property units match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedProperties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id
                const amountDue = prop.dues.reduce((s, d) => s + (d.amount - d.paidAmount), 0)
                const roadName = roadMap.get(prop.roadId) || 'Homagama PS limits'

                return (
                  <tr
                    key={prop.id}
                    onClick={() => onSelectProperty(prop)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/70 border-l-4 border-l-[#A31736]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Assessment # */}
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {prop.assessmentNumber}
                    </td>

                    {/* Owner & Property */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{prop.currentOwner.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {prop.propertyNumber} • {prop.description}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        NIC: {prop.currentOwner.nic} • Tel: {prop.currentOwner.mobile}
                      </p>
                    </td>

                    {/* Road */}
                    <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                      {roadName}
                    </td>

                    {/* Property Type */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {prop.propertyType}
                      </span>
                    </td>

                    {/* Assessed Value */}
                    <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatLKR(prop.annualAssessedValue)}
                    </td>

                    {/* Amount Due */}
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      <span className={amountDue > 0 ? 'text-rose-600 font-mono' : 'text-emerald-600 font-mono'}>
                        {formatLKR(amountDue)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <StatusBadge status={prop.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenProperty(prop.id)
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-[#A31736] hover:bg-[#A31736]/10 rounded-lg transition-colors"
                      >
                        Property 360 →
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs bg-gray-50/50">
          <p className="text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedProperties.length)} of {sortedProperties.length} records
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyRegistryTable
