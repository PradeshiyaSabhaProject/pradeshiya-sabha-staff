import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AddStaffMemberPage: React.FC = () => {
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    nic: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    empId: '',
    jobTitle: '',
    department: 'Revenue & Finance Department',
    joinDate: '',
    empType: 'Permanent',
    supervisor: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate network request (mock logic)
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)

      setTimeout(() => {
        navigate('/users/manage')
      }, 2000)
    }, 1500)
  }

  let buttonContent;
  if (isSubmitting) {
    buttonContent = (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Submitting Request...
      </>
    )
  } else if (showSuccess) {
    buttonContent = 'Request Submitted'
  } else {
    buttonContent = 'Submit for Approval'
  }

  const inputClass = "w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none transition-all placeholder:text-gray-400"
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Onboard New Staff Member
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Register a new employee with HR profiles, department assignment, and emergency contacts.
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded p-4 flex items-start gap-3 shadow-xs animate-in slide-in-from-top-4 fade-in duration-300">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold text-sm">Approval Request Submitted!</h3>
            <p className="text-xs mt-0.5 opacity-90">The new staff registration has been forwarded to HR for final approval. Redirecting you back...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Details */}
        <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <span className="w-6 h-6 rounded bg-[#A31736]/10 text-[#A31736] text-xs font-extrabold flex items-center justify-center">1</span>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-tight">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <input id="firstName" required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass} placeholder="e.g. Kasun" />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <input id="lastName" required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass} placeholder="e.g. Perera" />
            </div>
            <div>
              <label htmlFor="dob" className={labelClass}>Date of Birth</label>
              <input id="dob" required type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="nic" className={labelClass}>NIC Number</label>
              <input id="nic" required type="text" name="nic" value={formData.nic} onChange={handleInputChange} className={inputClass} placeholder="e.g. 199012345678" />
            </div>
            <div>
              <label htmlFor="gender" className={labelClass}>Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Contact Number</label>
              <input id="phone" required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="e.g. 077 123 4567" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input id="email" required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="e.g. kasun.p@pradeshiyasabha.gov.lk" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className={labelClass}>Residential Address</label>
              <textarea id="address" required name="address" value={formData.address} onChange={handleInputChange} rows={3} className={inputClass} placeholder="Enter full residential address..." />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <span className="w-6 h-6 rounded bg-[#A31736]/10 text-[#A31736] text-xs font-extrabold flex items-center justify-center">2</span>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-tight">Employment Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="empId" className={labelClass}>Employee ID</label>
              <input id="empId" required type="text" name="empId" value={formData.empId} onChange={handleInputChange} className={inputClass} placeholder="e.g. PS-EMP-0050" />
            </div>
            <div>
              <label htmlFor="jobTitle" className={labelClass}>Job Title / Designation</label>
              <input id="jobTitle" required type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className={inputClass} placeholder="e.g. Development Officer" />
            </div>
            <div>
              <label htmlFor="department" className={labelClass}>Department</label>
              <select id="department" name="department" value={formData.department} onChange={handleInputChange} className={inputClass}>
                <option value="Administration">Administration</option>
                <option value="Revenue & Finance Department">Revenue & Finance Department</option>
                <option value="Engineering Division">Engineering Division</option>
                <option value="Health & Sanitation">Health & Sanitation</option>
                <option value="Library Services">Library Services</option>
              </select>
            </div>
            <div>
              <label htmlFor="joinDate" className={labelClass}>Date of Joining</label>
              <input id="joinDate" required type="date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="empType" className={labelClass}>Employment Type</label>
              <select id="empType" name="empType" value={formData.empType} onChange={handleInputChange} className={inputClass}>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Probation">Probation</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label htmlFor="supervisor" className={labelClass}>Immediate Supervisor</label>
              <select id="supervisor" name="supervisor" value={formData.supervisor} onChange={handleInputChange} className={inputClass}>
                <option value="">Select Supervisor (Optional)</option>
                <option value="PS-EMP-0001">Chairman - Hon. Council</option>
                <option value="PS-EMP-0002">Secretary - Administration</option>
                <option value="PS-EMP-0012">Kasun Perera - Senior Revenue Inspector</option>
                <option value="PS-EMP-0034">Eng. Samantha Bandara - Technical Officer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded border border-gray-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <span className="w-6 h-6 rounded bg-[#A31736]/10 text-[#A31736] text-xs font-extrabold flex items-center justify-center">3</span>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-tight">Emergency Contact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="emergencyName" className={labelClass}>Contact Name</label>
              <input id="emergencyName" required type="text" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} className={inputClass} placeholder="e.g. Nimal Perera" />
            </div>
            <div>
              <label htmlFor="emergencyRelation" className={labelClass}>Relationship</label>
              <input id="emergencyRelation" required type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleInputChange} className={inputClass} placeholder="e.g. Father / Spouse" />
            </div>
            <div>
              <label htmlFor="emergencyPhone" className={labelClass}>Emergency Phone</label>
              <input id="emergencyPhone" required type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} className={inputClass} placeholder="e.g. 071 987 6543" />
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-end gap-3 bg-white p-4 rounded border border-gray-300 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/users/manage')}
            className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || showSuccess}
            className="px-5 py-2 rounded text-xs font-bold uppercase tracking-wider text-white bg-[#A31736] hover:bg-[#801028] shadow-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
          >
            {buttonContent}
          </button>
        </div>
      </form>
    </div>
  )
}
