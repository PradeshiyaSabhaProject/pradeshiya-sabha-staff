import React, { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_KPI_PROFILES, type EmployeeKpiProfile, type KpiMetric } from '../features/kpi/data/mockKpiData'

interface KpiContextType {
  kpiProfiles: EmployeeKpiProfile[]
  updateMetricValue: (employeeId: string, metricId: string, newActualValue: number) => void
  setTargetGoal: (employeeId: string, metricId: string, newTargetValue: number) => void
  getSubordinates: (managerId: string) => EmployeeKpiProfile[]
  getProfile: (employeeId: string) => EmployeeKpiProfile | undefined
  recalculateAllScores: () => void
}

const KpiContext = createContext<KpiContextType | undefined>(undefined)

const calculateGrade = (score: number): EmployeeKpiProfile['performanceGrade'] => {
  if (score >= 90) return 'Outstanding'
  if (score >= 85) return 'Exceeds Expectations'
  if (score >= 70) return 'Meets Expectations'
  return 'Needs Improvement'
}

export const KpiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kpiProfiles, setKpiProfiles] = useState<EmployeeKpiProfile[]>(INITIAL_KPI_PROFILES)

  const recalculateAllScores = () => {
    setKpiProfiles((prevProfiles) => {
      // 1. Recalculate individual non-manager employee scores first
      const updated = prevProfiles.map((prof) => {
        let sumScore = 0
        const updatedMetrics = prof.metrics.map((met) => {
          let metScore = 100
          if (met.unit.includes('Hours') || met.unit.includes('turnaround')) {
            // Lower turnaround is better
            metScore = met.actualValue === 0 ? 100 : Math.min(100, Math.round((met.targetValue / met.actualValue) * 100))
          } else {
            // Higher is better
            metScore = met.targetValue === 0 ? 100 : Math.min(100, Math.round((met.actualValue / met.targetValue) * 100))
          }
          sumScore += (metScore * met.weightage) / 100
          return { ...met, score: Math.round(metScore * 10) / 10 }
        })

        const overall = Math.round(sumScore * 10) / 10
        return {
          ...prof,
          metrics: updatedMetrics,
          overallScore: overall,
          performanceGrade: calculateGrade(overall),
          lastCalculatedAt: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
        }
      })

      // 2. Recalculate Manager scores with Subordinates Cascading Impact
      return updated.map((prof) => {
        if (!prof.isManager || !prof.subordinateIds || prof.subordinateIds.length === 0) {
          return prof
        }

        const subs = updated.filter((s) => prof.subordinateIds?.includes(s.employeeId))
        if (subs.length === 0) return prof

        const subsAvg = Math.round((subs.reduce((acc, curr) => acc + curr.overallScore, 0) / subs.length) * 100) / 100
        const teamWeight = prof.subordinateCascadingWeight || 35
        const cascadingImpactPoints = Math.round((subsAvg * (teamWeight / 100)) * 100) / 100

        // Update the Manager's "Team Performance" metric
        const updatedMetrics = prof.metrics.map((met) => {
          if (met.category === 'Team Performance') {
            return {
              ...met,
              actualValue: subsAvg,
              score: subsAvg
            }
          }
          return met
        })

        let managerSumScore = 0
        updatedMetrics.forEach((met) => {
          managerSumScore += (met.score * met.weightage) / 100
        })

        const managerOverall = Math.round(managerSumScore * 10) / 10

        return {
          ...prof,
          metrics: updatedMetrics,
          subordinatesAvgScore: subsAvg,
          cascadingImpactPoints,
          overallScore: managerOverall,
          performanceGrade: calculateGrade(managerOverall),
          lastCalculatedAt: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
        }
      })
    })
  }

  const updateMetricValue = (employeeId: string, metricId: string, newActualValue: number) => {
    setKpiProfiles((prev) =>
      prev.map((prof) => {
        if (prof.employeeId !== employeeId) return prof
        const updatedMetrics = prof.metrics.map((met) => {
          if (met.id !== metricId) return met
          return { ...met, actualValue: newActualValue }
        })
        return { ...prof, metrics: updatedMetrics }
      })
    )
  }

  const setTargetGoal = (employeeId: string, metricId: string, newTargetValue: number) => {
    setKpiProfiles((prev) =>
      prev.map((prof) => {
        if (prof.employeeId !== employeeId) return prof
        const updatedMetrics = prof.metrics.map((met) => {
          if (met.id !== metricId) return met
          return { ...met, targetValue: newTargetValue }
        })
        return { ...prof, metrics: updatedMetrics }
      })
    )
  }

  useEffect(() => {
    recalculateAllScores()
  }, [])

  const getSubordinates = (managerId: string) => {
    return kpiProfiles.filter((p) => p.managerId === managerId || (p.employeeId !== managerId && !p.isManager))
  }

  const getProfile = (employeeId: string) => {
    return kpiProfiles.find((p) => p.employeeId === employeeId)
  }

  return (
    <KpiContext.Provider
      value={{
        kpiProfiles,
        updateMetricValue,
        setTargetGoal,
        getSubordinates,
        getProfile,
        recalculateAllScores
      }}
    >
      {children}
    </KpiContext.Provider>
  )
}

export const useKpi = () => {
  const context = useContext(KpiContext)
  if (!context) {
    throw new Error('useKpi must be used within a KpiProvider')
  }
  return context
}
