// Overview-specific API calls
export interface OverviewStatItem {
  id: string
  label: string
  value: string | number
  change: string
  isPositive: boolean
}

export const fetchOverviewStats = async (): Promise<OverviewStatItem[]> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', label: 'Total Revenue Collected', value: 'Rs. 4,520,000', change: '+12.5%', isPositive: true },
        { id: '2', label: 'Active Citizen Requests', value: 142, change: '-4.2%', isPositive: true },
        { id: '3', label: 'Completed Infrastructure Projects', value: 28, change: '+8.0%', isPositive: true },
        { id: '4', label: 'Pending Approvals', value: 15, change: '+2.1%', isPositive: false },
      ])
    }, 600)
  })
}
