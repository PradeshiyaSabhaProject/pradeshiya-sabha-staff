import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send,
  Building,
  User,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  Trash2,
  FileText,
  Users,
  Sparkles,
  Save,
  Compass,
  AlertCircle,
  X,
  Search,
} from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import type { PropertyType, PropertySubmissionPurpose, SubmissionDocument } from '../types/varipanam'
import { validateNewProperty } from '../rules/varipanamRules'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

interface StatutoryDocConfig {
  key: string
  number: number
  title: string
  documentType: string
  assignedOfficer: string
  description: string
  sampleFileName: string
}

interface UploadedDocMeta {
  fileName: string
  fileSize: string
  uploadedAt: string
}

export const AddNewPropertyPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    zones,
    wards,
    roads,
    properties,
    settings,
    createRoad,
    submitNewProperty,
  } = useVaripanam()

  // ── Multi-Base Step State (1: Dossier, 2: Mandatory Docs, 3: ATD & Final Review) ──
  const [currentBase, setCurrentBase] = useState<1 | 2 | 3>(1)

  // ── Purpose Selection ──
  const [submissionType, setSubmissionType] = useState<PropertySubmissionPurpose>('NEW_PROPERTY')
  const [selectedExistingPropertyId, setSelectedExistingPropertyId] = useState<string>('')
  const [propertySearchQuery, setPropertySearchQuery] = useState<string>('')
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState<boolean>(false)

  // ── Phase 1 / Base 1 Form States ──
  const [zoneId, setZoneId] = useState<string>(zones[0]?.id || '')
  const [wardId, setWardId] = useState<string>(wards.find((w) => w.zoneId === (zones[0]?.id || ''))?.id || '')
  const [roadId, setRoadId] = useState<string>(roads[0]?.id || '')

  const [assessmentNumber, setAssessmentNumber] = useState<string>('')
  const [propertyNumber, setPropertyNumber] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [propertyType, setPropertyType] = useState<PropertyType>('Residential')
  const [annualAssessedValue, setAnnualAssessedValue] = useState<string>('240000')

  const [ownerName, setOwnerName] = useState<string>('')
  const [ownerNic, setOwnerNic] = useState<string>('')
  const [ownerMobile, setOwnerMobile] = useState<string>('')
  const [postalAddress, setPostalAddress] = useState<string>('')

  const [optionalAttachmentNotes, setOptionalAttachmentNotes] = useState<string>('')

  // Coordinates (No map, direct inputs)
  const [latitude, setLatitude] = useState<number>(settings.mapCentre[0])
  const [longitude, setLongitude] = useState<number>(settings.mapCentre[1])

  // Section 5: Add New Road
  const [newRoadName, setNewRoadName] = useState<string>('')
  const [newRoadCode, setNewRoadCode] = useState<string>('')

  // ── Base 2 & 3: Mandatory Statutory Documents State ──
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocMeta>>({})

  // Feedback states
  const [validationError, setValidationError] = useState<string | null>(null)
  const [proximityWarning, setProximityWarning] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [demoNotice, setDemoNotice] = useState<string | null>(null)

  // Cascade Wards and Roads when Zone changes
  const availableWards = wards.filter((w) => w.zoneId === zoneId)
  const availableRoads = roads.filter((r) => r.zoneId === zoneId && (!wardId || !r.wardId || r.wardId === wardId))

  const handleZoneChange = (newZone: string) => {
    setZoneId(newZone)
    const firstWard = wards.find((w) => w.zoneId === newZone)?.id || ''
    setWardId(firstWard)
    const firstRoad = roads.find((r) => r.zoneId === newZone && (!firstWard || r.wardId === firstWard))?.id || ''
    setRoadId(firstRoad)
  }

  const handleWardChange = (newWard: string) => {
    setWardId(newWard)
    const firstRoad = roads.find((r) => r.zoneId === zoneId && (!newWard || r.wardId === newWard))?.id || ''
    setRoadId(firstRoad)
  }

  // Handle Purpose Change
  const handlePurposeChange = (type: PropertySubmissionPurpose) => {
    setSubmissionType(type)
    setValidationError(null)
    setDemoNotice(null)
    setSelectedExistingPropertyId('')
    setPropertySearchQuery('')
    setIsPropertyDropdownOpen(false)
    if (type === 'NEW_PROPERTY') {
      setAssessmentNumber('')
      setPropertyNumber('')
      setDescription('')
      setOwnerName('')
      setOwnerNic('')
      setOwnerMobile('')
      setPostalAddress('')
    }
  }

  // Pre-populate when selecting existing property
  const handleSelectExistingProperty = (propId: string) => {
    setSelectedExistingPropertyId(propId)
    const prop = properties.find((p) => p.id === propId)
    if (!prop) return

    setZoneId(prop.zoneId)
    setWardId(prop.wardId)
    setRoadId(prop.roadId)

    setAssessmentNumber(prop.assessmentNumber)
    setPropertyNumber(prop.propertyNumber)
    setDescription(prop.description || '')
    setPropertyType(prop.propertyType)
    setAnnualAssessedValue(String(prop.annualAssessedValue))

    setLatitude(prop.latitude)
    setLongitude(prop.longitude)

    if (submissionType === 'DESCRIPTION_CHANGE') {
      setOwnerName(prop.currentOwner.name)
      setOwnerNic(prop.currentOwner.nic)
      setOwnerMobile(prop.currentOwner.mobile || '')
      setPostalAddress(prop.currentOwner.postalAddress || '')
    } else if (submissionType === 'OWNERSHIP_CHANGE') {
      setOwnerName('')
      setOwnerNic('')
      setOwnerMobile('')
      setPostalAddress(prop.currentOwner.postalAddress || '')
    }
  }

  // ── Quick Fill Demo / Mock Data Helper ──
  const handleFillMockData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const mockAssessmentNo = `ASM-2026-${randomSuffix}`

    if (submissionType === 'NEW_PROPERTY') {
      setAssessmentNumber(mockAssessmentNo)
      setPropertyNumber(`No. ${Math.floor(15 + Math.random() * 80)}/B`)
      setDescription('Modern single-storey residential dwelling with perimeter boundary wall and private driveway.')
      setPropertyType('Residential')
      setAnnualAssessedValue('320000')
      setOwnerName('Sunil Priyantha Jayasundara')
      setOwnerNic('198523400567')
      setOwnerMobile('+94 77 345 6789')
      setPostalAddress('No. 45/B, Temple Road, Homagama')
    } else if (submissionType === 'OWNERSHIP_CHANGE') {
      const existing = properties[0]
      if (existing) {
        setSelectedExistingPropertyId(existing.id)
        setPropertySearchQuery(`${existing.assessmentNumber} • ${existing.currentOwner.name} (${existing.propertyNumber})`)
        setAssessmentNumber(existing.assessmentNumber)
        setPropertyNumber(existing.propertyNumber)
        setDescription(`Statutory transfer of ownership from ${existing.currentOwner.name} to new purchaser.`)
        setPropertyType(existing.propertyType)
        setAnnualAssessedValue(String(existing.annualAssessedValue))
        setPostalAddress(existing.currentOwner.postalAddress)
      } else {
        setAssessmentNumber(mockAssessmentNo)
        setPropertyNumber('No. 22/1')
        setDescription('Statutory transfer of ownership to legal purchaser.')
        setPostalAddress('No. 22/1, Station Road, Homagama')
      }
      setOwnerName('Dhammika Manohari Wijesinghe')
      setOwnerNic('199071200341')
      setOwnerMobile('+94 71 888 4422')
    } else {
      // DESCRIPTION_CHANGE
      const existing = properties[1] || properties[0]
      if (existing) {
        setSelectedExistingPropertyId(existing.id)
        setPropertySearchQuery(`${existing.assessmentNumber} • ${existing.currentOwner.name} (${existing.propertyNumber})`)
        setAssessmentNumber(existing.assessmentNumber)
        setPropertyNumber(existing.propertyNumber)
        setDescription('Structural improvement: Added first floor commercial office suite and boundary expansion.')
        setPropertyType('Commercial')
        setAnnualAssessedValue('450000')
        setOwnerName(existing.currentOwner.name)
        setOwnerNic(existing.currentOwner.nic)
        setOwnerMobile(existing.currentOwner.mobile || '+94 77 123 4567')
        setPostalAddress(existing.currentOwner.postalAddress)
      } else {
        setAssessmentNumber(mockAssessmentNo)
        setPropertyNumber('No. 88')
        setDescription('Structural improvement: Converted to dual-unit commercial property.')
        setPropertyType('Commercial')
        setAnnualAssessedValue('420000')
        setOwnerName('Lanka Super Retailers (Pvt) Ltd')
        setOwnerNic('PV-89201944')
        setOwnerMobile('+94 11 289 9900')
        setPostalAddress('No. 88, High Level Road, Homagama')
      }
    }

    // Pre-attach all required Base 2 documents with mock certified files
    const mockDocsMap: Record<string, UploadedDocMeta> = {
      deedPlan: {
        fileName: 'Certified_Deed_Plan_Extract_Folio_7712.pdf',
        fileSize: '3.4 MB',
        uploadedAt: new Date().toISOString(),
      },
      surveyPlan: {
        fileName: 'Licensed_Cadastral_Survey_Plan_Lot402.pdf',
        fileSize: '2.8 MB',
        uploadedAt: new Date().toISOString(),
      },
      notaryReport: {
        fileName: 'Notarial_Title_Search_30Year_Certificate.pdf',
        fileSize: '1.9 MB',
        uploadedAt: new Date().toISOString(),
      },
    }

    if (submissionType === 'DESCRIPTION_CHANGE') {
      mockDocsMap['cocReport'] = {
        fileName: 'Certificate_of_Conformity_PS_CoC_2026.pdf',
        fileSize: '2.1 MB',
        uploadedAt: new Date().toISOString(),
      }
      mockDocsMap['buildingPlan'] = {
        fileName: 'Sanctioned_Architectural_Building_Plan_HMG.pdf',
        fileSize: '4.6 MB',
        uploadedAt: new Date().toISOString(),
      }
    }

    setUploadedDocs(mockDocsMap)
    setValidationError(null)
    setDemoNotice(
      `✨ Mock data pre-filled for "${submissionType.replace('_', ' ')}"! You can now click "Next" across all bases to submit.`
    )
    setTimeout(() => setDemoNotice(null), 6000)
  }

  // ── Document Definitions per Purpose ──
  const getRequiredDocsForPurpose = (purpose: PropertySubmissionPurpose): StatutoryDocConfig[] => {
    if (purpose === 'NEW_PROPERTY') {
      return [
        {
          key: 'deedPlan',
          number: 1,
          title: '1. Deed Plan',
          documentType: 'Deed of Transfer',
          assignedOfficer: 'M. D. Bandara (Legal & Title Officer)',
          description: 'Original title deed plan or registered deed extract certifying ownership',
          sampleFileName: 'Deed_Plan_Extract_Cadastre.pdf',
        },
        {
          key: 'surveyPlan',
          number: 2,
          title: '2. Survey Plan',
          documentType: 'Survey Plan',
          assignedOfficer: 'K. P. Jayawardena (Licensed Surveyor)',
          description: 'Certified survey plan prepared by a licensed surveyor depicting perimeter boundaries',
          sampleFileName: 'Survey_Plan_Cadastral_Boundaries.pdf',
        },
        {
          key: 'notaryReport',
          number: 3,
          title: '3. Notary Report',
          documentType: 'Notary Report',
          assignedOfficer: 'M. D. Bandara (Legal & Title Officer)',
          description: 'Notarial search report confirming encumbrance-free title & registry folios',
          sampleFileName: 'Notary_Title_Search_Report.pdf',
        },
      ]
    }

    if (purpose === 'OWNERSHIP_CHANGE') {
      return [
        {
          key: 'deedPlan',
          number: 1,
          title: '1. Deed Plan',
          documentType: 'Deed of Transfer',
          assignedOfficer: 'M. D. Bandara (Legal & Title Officer)',
          description: 'New deed of transfer or deed of gift establishing the incoming owner',
          sampleFileName: 'Deed_of_Transfer_NewOwner.pdf',
        },
        {
          key: 'surveyPlan',
          number: 2,
          title: '2. Survey Plan',
          documentType: 'Survey Plan',
          assignedOfficer: 'K. P. Jayawardena (Licensed Surveyor)',
          description: 'Cadastral boundary survey plan certifying land extent of the transferred unit',
          sampleFileName: 'Survey_Plan_Boundary_Transfer.pdf',
        },
        {
          key: 'notaryReport',
          number: 3,
          title: '3. Notary Report',
          documentType: 'Notary Report',
          assignedOfficer: 'M. D. Bandara (Legal & Title Officer)',
          description: 'Notary title report verifying 30-year search and registration folios',
          sampleFileName: 'Notary_Title_Search_Report.pdf',
        },
      ]
    }

    // DESCRIPTION_CHANGE
    return [
      {
        key: 'deedPlan',
        number: 1,
        title: '1. Deed Plan',
        documentType: 'Deed of Transfer',
        assignedOfficer: 'M. D. Bandara (Legal & Title Officer)',
        description: 'Original or certified title deed for the current assessment unit',
        sampleFileName: 'Deed_Plan_Assessment_Unit.pdf',
      },
      {
        key: 'surveyPlan',
        number: 2,
        title: '2. Survey Plan',
        documentType: 'Survey Plan',
        assignedOfficer: 'K. P. Jayawardena (Licensed Surveyor)',
        description: 'Updated survey plan reflecting altered boundary or structural perimeter',
        sampleFileName: 'Survey_Plan_Updated_Boundary.pdf',
      },
      {
        key: 'notaryReport',
        number: 3,
        title: '3. Notary Report',
        documentType: 'Notary Report',
        assignedOfficer: 'M. D. Bandara (Legal & Title Officer)',
        description: 'Notarial confirmation of structural ownership and site rights',
        sampleFileName: 'Notary_Title_Verification.pdf',
      },
      {
        key: 'cocReport',
        number: 4,
        title: '4. CoC Report (Certificate of Conformity)',
        documentType: 'Certificate of Conformity (CoC)',
        assignedOfficer: 'G. Fernando (Town Planning Officer)',
        description: 'Statutory CoC issued by Pradeshiya Sabha planning committee',
        sampleFileName: 'Certificate_of_Conformity_CoC.pdf',
      },
      {
        key: 'buildingPlan',
        number: 5,
        title: '5. Approved Building Plan',
        documentType: 'Approved Building Plan',
        assignedOfficer: 'G. Fernando (Town Planning Officer)',
        description: 'Sanctioned architectural and structural drawing with Sabha planning seal',
        sampleFileName: 'Approved_Building_Plan_Sanctioned.pdf',
      },
    ]
  }

  const handleUploadFile = (key: string, file: File) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
    setUploadedDocs((prev) => ({
      ...prev,
      [key]: {
        fileName: file.name,
        fileSize: sizeMB === '0.0 MB' ? '0.8 MB' : sizeMB,
        uploadedAt: new Date().toISOString(),
      },
    }))
    setValidationError(null)
  }

  const handleQuickUploadSample = (key: string, sampleFileName: string) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [key]: {
        fileName: sampleFileName,
        fileSize: '2.4 MB',
        uploadedAt: new Date().toISOString(),
      },
    }))
    setValidationError(null)
  }

  const handleRemoveDoc = (key: string) => {
    setUploadedDocs((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // Verification calculations
  const requiredPhase2Docs = getRequiredDocsForPurpose(submissionType)
  const missingPhase2Docs = requiredPhase2Docs.filter((doc) => !uploadedDocs[doc.key])

  const totalRequiredCount = requiredPhase2Docs.length
  const totalUploadedCount = requiredPhase2Docs.filter((doc) => !!uploadedDocs[doc.key]).length
  const allPhase2Uploaded = missingPhase2Docs.length === 0
  const allDocsUploaded = allPhase2Uploaded

  // ── Step 1 Validation ──
  const validateBase1 = (): boolean => {
    setValidationError(null)
    setProximityWarning(null)

    if (!assessmentNumber.trim()) {
      setValidationError('Assessment number is strictly required (e.g. 78/12a).')
      return false
    }

    if (!propertyNumber.trim()) {
      setValidationError('Property / Street number is required (e.g. No. 45/B).')
      return false
    }

    if (!ownerName.trim()) {
      setValidationError('Primary owner legal name is required.')
      return false
    }

    if (!ownerNic.trim()) {
      setValidationError('Owner NIC / Business Registration Number is required.')
      return false
    }

    // Check proximity warning
    const valResult = validateNewProperty(assessmentNumber, { latitude, longitude }, properties)
    if (valResult.warning) {
      setProximityWarning(valResult.warning)
    }

    return true
  }

  // ── Navigation between Bases ──
  const handleNextToBase2 = () => {
    if (!validateBase1()) return
    setCurrentBase(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNextToBase3 = () => {
    if (!allPhase2Uploaded) {
      const missingList = missingPhase2Docs.map((d) => d.title)
      setValidationError(`Please upload all mandatory documents before continuing: ${missingList.join(', ')}.`)
      return
    }
    setValidationError(null)
    setCurrentBase(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Prepare submission documents payload
  const buildDocumentsPayload = (): SubmissionDocument[] => {
    return requiredPhase2Docs.map((doc, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: uploadedDocs[doc.key]?.fileName || `${doc.documentType}.pdf`,
      type: doc.documentType,
      assignedOfficer: doc.assignedOfficer,
      uploadedAt: uploadedDocs[doc.key]?.uploadedAt || new Date().toISOString(),
      uploadedBy: 'Super Admin',
      status: 'PENDING' as const,
      fileSize: uploadedDocs[doc.key]?.fileSize || '2.4 MB',
    }))
  }

  // ── Handle Submit for Statutory Approval (Base 3) ──
  const handleSubmitForApproval = async () => {
    if (!validateBase1()) {
      setCurrentBase(1)
      return
    }
    if (!allPhase2Uploaded) {
      setCurrentBase(2)
      return
    }

    setIsSubmitting(true)
    try {
      let finalRoadId = roadId

      // If user specified a new road in section 5, create it seamlessly
      if (newRoadName.trim()) {
        try {
          const created = await createRoad({
            name: newRoadName.trim(),
            code: newRoadCode.trim() || `RD-${Date.now().toString().slice(-4)}`,
            zoneId,
            wardId: wardId || 'w-01',
          })
          finalRoadId = created.id
        } catch {
          // fallback to selected road
        }
      }

      const formattedDocuments = buildDocumentsPayload()

      await submitNewProperty({
        propertyId: selectedExistingPropertyId || `prop-sub-${Date.now()}`,
        assessmentNumber: assessmentNumber.trim(),
        propertyNumber: propertyNumber.trim(),
        description: description.trim() || (submissionType === 'DESCRIPTION_CHANGE' ? 'Property description amended' : 'Residential unit'),
        propertyType,
        annualAssessedValue: Number(annualAssessedValue) || 200000,
        zoneId,
        wardId,
        roadId: finalRoadId,
        ownerName: ownerName.trim(),
        ownerNic: ownerNic.trim(),
        ownerMobile: ownerMobile.trim(),
        postalAddress: postalAddress.trim() || `${propertyNumber}, Homagama`,
        latitude,
        longitude,
        status: 'PENDING_APPROVAL',
        submissionType,
        currentPhase: 'Phase 2: Technical & Survey Review',
        approvingOfficer: 'K. P. Jayawardena (Licensed Surveyor)',
        documents: formattedDocuments,
        submittedBy: 'Super Admin',
        submittedAt: new Date().toISOString(),
      })

      setSuccessMessage(
        `Submission successfully dispatched into the Council Approval Queue! It is now active under Phase 2 review.`
      )
      setTimeout(() => navigate('/finances/varipanam/approvals'), 1500)
    } catch (err: any) {
      setValidationError(err.message || 'Submission failed. Please check assessment number or try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Handle Save as Draft (Base 3) ──
  const handleSaveAsDraft = async () => {
    if (!assessmentNumber.trim()) {
      setValidationError('Please provide at least an Assessment Number to save a draft.')
      setCurrentBase(1)
      return
    }

    setIsSubmitting(true)
    try {
      let finalRoadId = roadId
      if (newRoadName.trim()) {
        try {
          const created = await createRoad({
            name: newRoadName.trim(),
            code: newRoadCode.trim() || `RD-${Date.now().toString().slice(-4)}`,
            zoneId,
            wardId: wardId || 'w-01',
          })
          finalRoadId = created.id
        } catch {
          // fallback
        }
      }

      const formattedDocuments = buildDocumentsPayload()

      await submitNewProperty({
        propertyId: selectedExistingPropertyId || `prop-sub-${Date.now()}`,
        assessmentNumber: assessmentNumber.trim(),
        propertyNumber: propertyNumber.trim() || 'Pending Assignment',
        description: description.trim() || 'Draft Property Entry',
        propertyType,
        annualAssessedValue: Number(annualAssessedValue) || 180000,
        zoneId,
        wardId,
        roadId: finalRoadId,
        ownerName: ownerName.trim() || 'Pending Owner Name',
        ownerNic: ownerNic.trim() || 'Pending NIC',
        ownerMobile: ownerMobile.trim(),
        postalAddress: postalAddress.trim() || 'Homagama',
        latitude,
        longitude,
        status: 'DRAFT',
        submissionType,
        currentPhase: 'Phase 1: Application Intake & Lodgement',
        approvingOfficer: 'Subject Clerk (Revenue Division)',
        documents: formattedDocuments,
        submittedBy: 'Super Admin',
        submittedAt: new Date().toISOString(),
      })

      setSuccessMessage('Property draft saved successfully! You can track or resume it from Approvals.')
      setTimeout(() => navigate('/finances/varipanam/approvals?tab=track'), 1500)
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save draft.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* ── Top Header with Back Button & Mock Fill Helper ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/finances/varipanam')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors cursor-pointer shrink-0 shadow-2xs active:scale-98"
            title="Return to properties ledger"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                Cadastral Property Registration & Amendments
              </h1>
              <NeedsConfirmationBadge tooltip="Property additions & ownership transfers require designated statutory officer approval." />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Multi-base sequential pipeline: Base 1 (Dossier) → Base 2 (Statutory Documents) → Base 3 (Final Review).
            </p>
          </div>
        </div>

        {/* Demo / Mock Data Fill Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleFillMockData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
            title="Pre-populate full form and certified attachments with mock data for instant testing"
          >
            <Sparkles className="w-4 h-4 text-[#A31736]" />
            <span>✨ Auto-Fill Demo Flow</span>
          </button>
        </div>
      </div>

      {demoNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{demoNotice}</span>
        </div>
      )}

      {/* ── Step-by-Step Base Stepper Indicator ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Base 1 */}
          <div
            onClick={() => setCurrentBase(1)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              currentBase === 1
                ? 'bg-rose-50/80 border-[#A31736] ring-2 ring-rose-100'
                : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/60'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                currentBase === 1
                  ? 'bg-[#A31736] text-white shadow-xs'
                  : currentBase > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {currentBase > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Base 1 (Phase 1)</span>
              <p className="text-xs font-bold text-gray-900 truncate">Hierarchy & Property Dossier</p>
              <p className="text-[10px] text-gray-500">5 Numbered Sections</p>
            </div>
          </div>

          {/* Base 2 */}
          <div
            onClick={() => {
              if (validateBase1()) setCurrentBase(2)
            }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              currentBase === 2
                ? 'bg-rose-50/80 border-[#A31736] ring-2 ring-rose-100'
                : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/60'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                currentBase === 2
                  ? 'bg-[#A31736] text-white shadow-xs'
                  : currentBase > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {currentBase > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Base 2 (Phase 2)</span>
              <p className="text-xs font-bold text-gray-900 truncate">Mandatory Document Uploads</p>
              <p className="text-[10px] text-gray-500">
                {submissionType === 'DESCRIPTION_CHANGE' ? '5 Statutory Plans' : '3 Mandatory Plans'}
              </p>
            </div>
          </div>

          {/* Base 3 */}
          <div
            onClick={() => {
              if (validateBase1() && allPhase2Uploaded) setCurrentBase(3)
            }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              currentBase === 3
                ? 'bg-rose-50/80 border-[#A31736] ring-2 ring-rose-100'
                : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/60'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                currentBase === 3
                  ? 'bg-[#A31736] text-white shadow-xs'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Base 3 (Final Phase)</span>
              <p className="text-xs font-bold text-gray-900 truncate">Final Review & Endorsement</p>
              <p className="text-[10px] text-gray-500">Save Draft or Submit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Warning & Error Messages */}
      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {proximityWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{proximityWarning}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BASE 1: PURPOSE SELECTION & THE 5 NUMBERED SECTIONS
          ═══════════════════════════════════════════════════════════════════════ */}
      {currentBase === 1 && (
        <div className="space-y-6">
          {/* ── Purpose Selection Cards ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full inline-block">
                Step 1: Choose Application Purpose
              </span>
              <h2 className="text-sm font-black text-gray-900 mt-1">
                Select the Category for Property Registration or Amendment
              </h2>
              <p className="text-xs text-gray-500">
                The selected category determines required statutory documents and review pipelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: New Property (New Number) */}
              <div
                onClick={() => handlePurposeChange('NEW_PROPERTY')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  submissionType === 'NEW_PROPERTY'
                    ? 'border-[#A31736] bg-rose-50/40 shadow-xs ring-2 ring-rose-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  {submissionType === 'NEW_PROPERTY' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
                  )}
                </div>
                <h3 className="text-xs font-black text-gray-900">Add New Property (New Number)</h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Enrol a brand new cadastral assessment unit with a new council assessment number.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  3 Upload Documents
                </span>
              </div>

              {/* Option 2: Ownership Change */}
              <div
                onClick={() => handlePurposeChange('OWNERSHIP_CHANGE')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  submissionType === 'OWNERSHIP_CHANGE'
                    ? 'border-[#A31736] bg-rose-50/40 shadow-xs ring-2 ring-rose-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  {submissionType === 'OWNERSHIP_CHANGE' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
                  )}
                </div>
                <h3 className="text-xs font-black text-gray-900">Ownership Change</h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Transfer an existing registered property unit to a new legal owner or heir.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  3 Upload Documents
                </span>
              </div>

              {/* Option 3: Description Change */}
              <div
                onClick={() => handlePurposeChange('DESCRIPTION_CHANGE')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  submissionType === 'DESCRIPTION_CHANGE'
                    ? 'border-[#A31736] bg-rose-50/40 shadow-xs ring-2 ring-rose-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  {submissionType === 'DESCRIPTION_CHANGE' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
                  )}
                </div>
                <h3 className="text-xs font-black text-gray-900">Description Change</h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Alter assessment values, building additions, subdivisions, or usage classification.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  5 Upload Plans
                </span>
              </div>
            </div>

            {/* Searchable Existing Property Selector for Ownership & Description Change */}
            {(submissionType === 'OWNERSHIP_CHANGE' || submissionType === 'DESCRIPTION_CHANGE') && (() => {
              const filteredExistingProperties = properties.filter((p) => {
                if (!propertySearchQuery.trim()) return true
                const q = propertySearchQuery.toLowerCase()
                return (
                  p.assessmentNumber.toLowerCase().includes(q) ||
                  p.propertyNumber.toLowerCase().includes(q) ||
                  p.currentOwner.name.toLowerCase().includes(q) ||
                  p.currentOwner.nic.toLowerCase().includes(q) ||
                  p.currentOwner.postalAddress.toLowerCase().includes(q) ||
                  (p.description && p.description.toLowerCase().includes(q))
                )
              })

              return (
                <div className="pt-3 border-t border-gray-100 bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#A31736]" />
                      <span>Select Existing Property to Amend (Search & Quick-Fill):</span>
                    </label>
                    {selectedExistingPropertyId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExistingPropertyId('')
                          setPropertySearchQuery('')
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear Selection</span>
                      </button>
                    )}
                  </div>

                  {/* Search Input Box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={propertySearchQuery}
                      onChange={(e) => {
                        setPropertySearchQuery(e.target.value)
                        setIsPropertyDropdownOpen(true)
                      }}
                      onFocus={() => setIsPropertyDropdownOpen(true)}
                      placeholder="Type to search by assessment no, property no, owner name or NIC..."
                      className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] focus:ring-1 focus:ring-rose-100 transition-all shadow-2xs"
                    />
                    {propertySearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setPropertySearchQuery('')
                          setSelectedExistingPropertyId('')
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Floating Dropdown List of Properties */}
                    {isPropertyDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-gray-100 animate-fade-in">
                        {filteredExistingProperties.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400 font-medium">
                            No matching properties found for "{propertySearchQuery}".
                          </div>
                        ) : (
                          filteredExistingProperties.map((p) => {
                            const isSelected = p.id === selectedExistingPropertyId
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  handleSelectExistingProperty(p.id)
                                  setPropertySearchQuery(`${p.assessmentNumber} • ${p.currentOwner.name} (${p.propertyNumber})`)
                                  setIsPropertyDropdownOpen(false)
                                }}
                                className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-rose-50/80 text-gray-900 font-bold border-l-4 border-[#A31736]'
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                      {p.assessmentNumber}
                                    </span>
                                    <span className="font-bold text-gray-900 truncate">{p.propertyNumber}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">• {p.propertyType}</span>
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                                    <span>
                                      Owner: <strong className="text-gray-800">{p.currentOwner.name}</strong>
                                    </span>
                                    <span className="font-mono text-gray-400">NIC: {p.currentOwner.nic}</span>
                                    <span className="text-gray-400 truncate">({p.currentOwner.postalAddress})</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-bold text-gray-900 block">{formatLKR(p.annualAssessedValue)}</span>
                                  <span className="text-[10px] text-gray-400">Annual Value</span>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Backdrop click to close */}
                  {isPropertyDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsPropertyDropdownOpen(false)}
                    />
                  )}

                  {selectedExistingPropertyId && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Property pre-filled into Phase 1 dossier. You can edit any fields below before proceeding.
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500">
                    Type an assessment number, street number, owner name, or NIC to quickly search and populate existing property records.
                  </p>
                </div>
              )
            })()}
          </div>

          {/* ── Section 1: Administrative Hierarchy & Location ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-[#A31736] text-white flex items-center justify-center text-xs font-black">
                1
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                ADMINISTRATIVE HIERARCHY & LOCATION
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Zone *</label>
                <select
                  value={zoneId}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ward *</label>
                <select
                  value={wardId}
                  onChange={(e) => handleWardChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer"
                >
                  {availableWards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Ward {w.number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Road / Street *</label>
                <select
                  value={roadId}
                  onChange={(e) => setRoadId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer"
                >
                  {availableRoads.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.code ? `(${r.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coordinates Inputs (No Leaflet Map) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#A31736]" />
                  <span>Cadastral Coordinate Location (Homagama Sabha Standard)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLatitude(settings.mapCentre[0])
                    setLongitude(settings.mapCentre[1])
                  }}
                  className="text-[11px] font-bold text-[#A31736] hover:underline"
                >
                  Reset to Sabha Centre
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Latitude (Dec. Degrees) *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#A31736]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Longitude (Dec. Degrees) *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#A31736]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Property & Assessment Identity ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-[#A31736] text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                PROPERTY & ASSESSMENT IDENTITY
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Assessment Number * <span className="text-rose-600 font-normal">(Council Ledger ID)</span>
                </label>
                <input
                  type="text"
                  value={assessmentNumber}
                  onChange={(e) => setAssessmentNumber(e.target.value)}
                  placeholder="e.g. 78/12a or 109/4"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Property / Street Number *
                </label>
                <input
                  type="text"
                  value={propertyNumber}
                  onChange={(e) => setPropertyNumber(e.target.value)}
                  placeholder="e.g. No. 45/B, Station Road"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Property Type *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] focus:bg-white cursor-pointer"
                >
                  <option value="Residential">Residential (10% standard rate)</option>
                  <option value="Commercial">Commercial (15% business rate)</option>
                  <option value="Industrial">Industrial (12% industrial rate)</option>
                  <option value="Agricultural">Agricultural (5% concession rate)</option>
                  <option value="Government">Government / Statutory (7% statutory rate)</option>
                  <option value="Other">Other / Mixed-Use</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Annual Assessed Value (LKR) *
                </label>
                <input
                  type="number"
                  value={annualAssessedValue}
                  onChange={(e) => setAnnualAssessedValue(e.target.value)}
                  placeholder="240000"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">
                  Description / Structural Scope *
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Two-storey residential building with perimeter wall, single phase utility connection."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Primary Owner Particulars ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-[#A31736] text-white flex items-center justify-center text-xs font-black">
                3
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                PRIMARY OWNER PARTICULARS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. K. M. Sunil Priyantha Perera"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  NIC / Business Registration No *
                </label>
                <input
                  type="text"
                  value={ownerNic}
                  onChange={(e) => setOwnerNic(e.target.value)}
                  placeholder="e.g. 198523400567 or PV-10293847"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={ownerMobile}
                  onChange={(e) => setOwnerMobile(e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Postal Address *</label>
                <input
                  type="text"
                  value={postalAddress}
                  onChange={(e) => setPostalAddress(e.target.value)}
                  placeholder="e.g. No. 45/B, Station Road, Homagama"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ── Section 4: Optional Supporting Attachments ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-[#A31736] text-white flex items-center justify-center text-xs font-black">
                4
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                OPTIONAL SUPPORTING ATTACHMENTS
              </h3>
            </div>

            <div className="text-xs space-y-2">
              <label className="font-semibold text-gray-700 block">
                Additional Field Notes or Site Photographs (Optional)
              </label>
              <textarea
                rows={2}
                value={optionalAttachmentNotes}
                onChange={(e) => setOptionalAttachmentNotes(e.target.value)}
                placeholder="e.g. Physical site inspection completed by Grama Niladhari on 2026-01-20. Boundary clear of dispute."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#A31736] focus:bg-white"
              />
            </div>
          </div>

          {/* ── Section 5: Add New Road / Street ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-[#A31736] text-white flex items-center justify-center text-xs font-black">
                5
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                ADD NEW ROAD / STREET (Cadastre Extension)
              </h3>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
              <p>
                If the property is located on a newly opened lane or unnamed bypass not present in Section 1,
                simply enter the road name below. It will automatically be registered into the Homagama road register.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">New Road / Street Name</label>
                <input
                  type="text"
                  value={newRoadName}
                  onChange={(e) => setNewRoadName(e.target.value)}
                  placeholder="e.g. Samagi Mawatha 2nd Lane"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Road Code (Optional)</label>
                <input
                  type="text"
                  value={newRoadCode}
                  onChange={(e) => setNewRoadCode(e.target.value)}
                  placeholder="e.g. RD-HMG-99"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900 outline-none focus:border-[#A31736]"
                />
              </div>
            </div>
          </div>

          {/* ── Base 1 Action Bar: BACK & CANCEL & NEXT BUTTONS ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/finances/varipanam')}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/finances/varipanam')}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextToBase2}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <span>Next: Mandatory Documents (Base 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BASE 2: MANDATORY STATUTORY DOCUMENT UPLOADS
          ═══════════════════════════════════════════════════════════════════════ */}
      {currentBase === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full inline-block">
                  Base 2: Mandatory Statutory Documents
                </span>
                <h2 className="text-sm font-black text-gray-900 mt-1">
                  Required Attested Plans & Reports for{' '}
                  <span className="text-[#A31736]">
                    {submissionType === 'NEW_PROPERTY'
                      ? 'Add New Property (New Number)'
                      : submissionType === 'OWNERSHIP_CHANGE'
                      ? 'Ownership Change'
                      : 'Description Change'}
                  </span>
                </h2>
                <p className="text-xs text-gray-500">
                  {submissionType === 'DESCRIPTION_CHANGE'
                    ? 'All 5 statutory plans must be uploaded before advancing to the final stage.'
                    : 'All 3 mandatory statutory documents must be uploaded before advancing.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                  {requiredPhase2Docs.filter((d) => !!uploadedDocs[d.key]).length} of{' '}
                  {requiredPhase2Docs.length} Uploaded
                </span>
              </div>
            </div>

            {/* List of Document Upload Slots */}
            <div className="space-y-4 pt-2">
              {requiredPhase2Docs.map((docConfig) => {
                const uploaded = uploadedDocs[docConfig.key]

                return (
                  <div
                    key={docConfig.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      uploaded
                        ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                            uploaded
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {uploaded ? <Check className="w-5 h-5" /> : docConfig.number}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-black text-gray-900">{docConfig.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                              {docConfig.documentType}
                            </span>
                            {uploaded ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Uploaded & Verified</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Required Upload
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-500 mt-1">{docConfig.description}</p>

                          <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#A31736]" />
                            <span>Statutory Inspector:</span>
                            <strong className="text-gray-800">{docConfig.assignedOfficer}</strong>
                          </div>
                        </div>
                      </div>

                      {/* File Upload Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {uploaded ? (
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <div className="text-left">
                              <span className="text-xs font-bold text-gray-900 block truncate max-w-[150px]">
                                {uploaded.fileName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">{uploaded.fileSize}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(docConfig.key)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuickUploadSample(docConfig.key, docConfig.sampleFileName)}
                              className="px-2.5 py-1.5 text-[11px] font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                              title="Attach pre-verified sample file for testing"
                            >
                              Quick Attach Sample
                            </button>

                            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs">
                              <Upload className="w-3.5 h-3.5 text-gray-600" />
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleUploadFile(docConfig.key, e.target.files[0])
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Base 2 Action Bar: BACK & CANCEL & NEXT BUTTONS ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentBase(1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Base 1</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/finances/varipanam')}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>

            <button
              type="button"
              disabled={!allPhase2Uploaded}
              onClick={handleNextToBase3}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                allPhase2Uploaded
                  ? 'text-white bg-[#A31736] hover:bg-[#801028] active:scale-98'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Next: Final Stage (Base 3)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BASE 3: FINAL REVIEW / STATUTORY SUBMISSION
          ═══════════════════════════════════════════════════════════════════════ */}
      {currentBase === 3 && (
        <div className="space-y-6">
          {/* Dossier Summary Review Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full inline-block">
                Final Review Summary
              </span>
              <h3 className="text-sm font-black text-gray-900 mt-1">
                Cadastral Submission Dossier Verification
              </h3>
              <p className="text-xs text-gray-500">
                Review all submitted particulars and attached statutory documents before sending for council endorsement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Specification Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wide text-gray-700 block border-b border-gray-200 pb-1">
                  Property Specification
                </span>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category Purpose:</span>
                  <span className="font-bold text-[#A31736]">
                    {submissionType === 'NEW_PROPERTY'
                      ? 'New Property (New Number)'
                      : submissionType === 'OWNERSHIP_CHANGE'
                      ? 'Ownership Change'
                      : 'Description Change'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assessment No:</span>
                  <span className="font-mono font-black text-gray-900">{assessmentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Property No:</span>
                  <span className="font-semibold text-gray-900">{propertyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Property Type:</span>
                  <span className="font-semibold text-gray-900">{propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual Value:</span>
                  <span className="font-bold text-gray-900">{formatLKR(Number(annualAssessedValue) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coordinates:</span>
                  <span className="font-mono text-gray-700">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </span>
                </div>
              </div>

              {/* Owner Particulars */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wide text-gray-700 block border-b border-gray-200 pb-1">
                  Primary Owner Particulars
                </span>
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Legal Name:</span>
                  <span className="font-bold text-gray-900">{ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NIC Number:</span>
                  <span className="font-mono font-bold text-gray-900">{ownerNic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mobile Phone:</span>
                  <span className="font-mono text-gray-900">{ownerMobile || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Postal Address:</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">{postalAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statutory Documents:</span>
                  <span className="font-bold text-emerald-700">
                    {totalUploadedCount} of {totalRequiredCount} Attached
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Base 3 (LAST PART) Action Bar: BACK, CANCEL, SAVE DRAFT, SUBMIT ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentBase(2)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Base 2</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/finances/varipanam')}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Save as Draft Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveAsDraft}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Save draft and track in approvals"
              >
                <Save className="w-4 h-4 text-gray-600" />
                <span>Save as Draft</span>
              </button>

              {/* Submit for Statutory Approval Button */}
              <button
                type="button"
                disabled={isSubmitting || !allDocsUploaded}
                onClick={handleSubmitForApproval}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs ${
                  allDocsUploaded && !isSubmitting
                    ? 'text-white bg-[#A31736] hover:bg-[#801028] active:scale-98'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit for Statutory Approval'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddNewPropertyPage
