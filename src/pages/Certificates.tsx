"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { useCertificatesStore } from "@/data/certificates-store"
import { CertificateRequestView } from "@/components/CertificateRequestView"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send,
  XCircle,
  BarChart3,
  PlusCircle,
  FileText,
  Download,
  RefreshCw,
  Info,
} from "lucide-react"
import { CertificateRequest, CertificateService, CertificateTypeApi } from "@/services/certificateService"
import { useMembersStore } from "@/data/members-store"
import type { Member } from "@/services/memberService"

function StatusBadge({ status }: { status: CertificateRequest["status"] }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", className: "bg-warning text-warning-foreground", icon: <Clock className="h-3 w-3" /> },
    approved: { label: "Approved", className: "bg-success text-success-foreground", icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { label: "Rejected", className: "bg-destructive text-destructive-foreground", icon: <XCircle className="h-3 w-3" /> },
    approved_l1: { label: "Approved L1", className: "bg-warning/70 text-success-foreground", icon: <CheckCircle className="h-3 w-3" /> },
    approved_l2: { label: "Approved L2", className: "bg-success/50 text-success-foreground", icon: <CheckCircle className="h-3 w-3" /> },
    approved_final: { label: "Approved", className: "bg-success text-success-foreground", icon: <CheckCircle className="h-3 w-3" /> },
    "in-review": { label: "In Review", className: "bg-muted text-muted-foreground", icon: <AlertCircle className="h-3 w-3" /> },
  }

  const toTitle = (val: string) => (val || "").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim()
  const fallback = {
    label: toTitle(typeof status === "string" ? status : "Unknown" ) || "Unknown",
    className: "bg-muted text-muted-foreground",
    icon: <AlertCircle className="h-3 w-3" />,
  }

  const cfg = map[String(status)] ?? fallback
  return (
    <Badge className={`${cfg.className} flex items-center gap-1`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  )
}

const downloadCertificate = async (req: CertificateRequest, member?: Member | null) => {
  type JsPDFCtor = new (...args: Array<unknown>) => {
    setFont: (family: string, style?: string) => void
    setFontSize: (size: number) => void
    setDrawColor: (val: number) => void
    addImage: (imageData: string, format: 'PNG' | 'JPEG', x: number, y: number, w: number, h: number) => void
    text: (text: string, x: number, y: number, options?: unknown) => void
    line: (x1: number, y1: number, x2: number, y2: number) => void
    splitTextToSize: (text: string, size: number) => string[]
    save: (filename: string) => void
  }

  const ensureJsPDF = async (): Promise<JsPDFCtor> => {
    const w = window as unknown as { jspdf?: { jsPDF?: JsPDFCtor } }
    if (w.jspdf?.jsPDF) return w.jspdf.jsPDF
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load jsPDF'))
      document.body.appendChild(script)
    })
    return w.jspdf!.jsPDF!
  }

  const toDataUrl = async (url: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      return await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    } catch {
      return ''
    }
  }

  const formatDate = (d?: Date | string) => {
    if (!d) return ""
    try { return new Date(d).toLocaleDateString() } catch { return String(d) }
  }

  const jsPDF = await ensureJsPDF()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  // Margins and dimensions
  const margin = 60
  const pageWidth = 595
  const contentWidth = pageWidth - (margin * 2)
  let y = margin

  // Clean header without borders

  // Logo and Header
  const logoData = await toDataUrl('/logo.png')
  if (logoData) doc.addImage(logoData, 'PNG', margin, y - 5, 50, 50)
  
  // Church name and details
  doc.setFont('times', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(50, 50, 50)
  doc.text('ADEPR MUHOZA CHURCH', pageWidth - margin - 200, y + 10, { align: 'right' })
  
  doc.setFont('times', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('Parish of Muhoza', pageWidth - margin - 200, y + 25, { align: 'right' })
  doc.text('Rwanda', pageWidth - margin - 200, y + 38, { align: 'right' })
  
  y += 60
  
  // Decorative line
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(1)
  doc.line(margin + 50, y, pageWidth - margin - 50, y)
  y += 20

  // Certificate title with decorative styling
  doc.setFont('times', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(30, 30, 30)
  
  // Decorative line above title
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(1)
  doc.line(margin + 50, y - 10, pageWidth - margin - 50, y - 10)
  
  const title = `${String(req.certificateType).toUpperCase()} CERTIFICATE`
  doc.text(title, pageWidth / 2, y, { align: 'center' })
  
  // Decorative line below title
  doc.line(margin + 50, y + 10, pageWidth - margin - 50, y + 10)
  y += 40

  // Member and request info with professional styling
  doc.setFontSize(14)
  doc.setFont('times', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text('CERTIFICATE DETAILS', margin, y)
  y += 20

  // Clean info section with subtle styling
  doc.setFontSize(12)
  doc.setFont('times', 'normal')
  const leftColX = margin
  const rightColX = margin + 200
  const addRow = (label: string, value: string) => {
    doc.setFont('times', 'bold'); 
    doc.setTextColor(70, 70, 70);
    doc.text(label + ':', leftColX, y)
    doc.setFont('times', 'normal'); 
    doc.setTextColor(30, 30, 30);
    doc.text(value || '-', rightColX, y)
    y += 20
  }

  addRow('Member Name', req.memberName)
  addRow('Certificate Type', String(req.certificateType))
  addRow('Purpose', req.purpose)
  addRow('Request Date', formatDate(req.requestDate))
  y += 10

  // Member-specific details with enhanced styling
  if (member) {
    y += 20
    doc.setFontSize(14)
    doc.setFont('times', 'bold')
    doc.setTextColor(50, 50, 50)
    doc.text('MEMBER INFORMATION', margin, y)
    y += 20

    // Clean member details with better spacing
    doc.setFontSize(12)
    const addMemberRow = (label: string, value: string) => {
      doc.setFont('times', 'bold'); 
      doc.setTextColor(70, 70, 70);
      doc.text(label + ':', leftColX, y)
      doc.setFont('times', 'normal'); 
      doc.setTextColor(30, 30, 30);
      doc.text(value || '-', rightColX, y)
      y += 20
    }

    addMemberRow('Gender', (member.gender || '').toString())
    addMemberRow('Date of Birth', formatDate(member.dateOfBirth))
    addMemberRow('Address', member.address || '')
    if (member.choir) addMemberRow('Choir', member.choir)

    // Sacrament details by certificate type
    if (req.certificateType === 'baptism' && member.sacraments?.baptism?.date) {
      addMemberRow('Baptism Date', formatDate(member.sacraments.baptism.date))
    }
    if (req.certificateType === 'marriage' && member.sacraments?.marriage?.date) {
      addMemberRow('Marriage Date', formatDate(member.sacraments.marriage.date))
      if (member.sacraments.marriage.place) addMemberRow('Marriage Place', member.sacraments.marriage.place)
    }
    y += 10
  }

  // Type-specific formal text with professional styling
  y += 20
  doc.setFontSize(14)
  doc.setFont('times', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text('OFFICIAL STATEMENT', margin, y)
  y += 20

  // Clean statement without background

  const para = (() => {
    switch (req.certificateType) {
      case 'baptism':
        return 'This is to certify that the above-named member has received the sacrament of baptism and is duly recorded in the church register. This certificate is issued as official confirmation of their baptismal status within ADEPR Muhoza Church.'
      case 'recommendation':
        return 'This is to certify that the above-named member is a member in good standing and is hereby recommended by ADEPR Muhoza Church. This member has demonstrated faithful participation and adherence to church principles.'
      case 'marriage':
        return 'This is to certify that the marriage record for the above-named member has been verified and approved by the church authorities. This certificate confirms the validity of their marriage within the church.'
      default:
        return 'This is to certify the above request as approved by ADEPR Muhoza Church. This document serves as official confirmation of the requested certification.'
    }
  })()

  doc.setFontSize(12)
  doc.setFont('times', 'normal')
  doc.setTextColor(40, 40, 40)
  const split = doc.splitTextToSize(para, contentWidth)
  split.forEach((line: string) => { doc.text(line, margin, y); y += 16 })
  y += 20

  // Approvals Timeline with enhanced styling
  doc.setFontSize(14)
  doc.setFont('times', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text('APPROVAL TIMELINE', margin, y)
  y += 20

  // Clean approvals without background
  
  doc.setFontSize(11)
  doc.setFont('times', 'normal')
  const approvals: Array<string> = []
  if (req.approvals?.level1) approvals.push(`✓ Zone Leader: Approved — ${formatDate(req.approvals.level1.doneAt)}${req.approvals.level1.comment ? ` — "${req.approvals.level1.comment}"` : ''}`)
  if (req.approvals?.level2) approvals.push(`✓ Pastor: Approved — ${formatDate(req.approvals.level2.doneAt)}${req.approvals.level2.comment ? ` — "${req.approvals.level2.comment}"` : ''}`)
  if (req.approvals?.level3) approvals.push(`✓ Parish Pastor: Approved — ${formatDate(req.approvals.level3.doneAt)}${req.approvals.level3.comment ? ` — "${req.approvals.level3.comment}"` : ''}`)
  if (approvals.length === 0) approvals.push('No approvals recorded')
  
  approvals.forEach((line) => { 
    doc.setTextColor(60, 60, 60);
    doc.text(line, margin, y); 
    y += 18 
  })
  y += 20

  // Professional footer and signature area
  y = Math.max(y + 30, 700)
  
  // Decorative line
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(2)
  doc.line(margin, y, pageWidth - margin, y)
  
  // Clean signature area without background
  y += 20
  
  // Signature line
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(1)
  doc.line(margin + 20, y + 20, margin + 200, y + 20)
  
  // Authorized signature text
  doc.setFontSize(12)
  doc.setFont('times', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text('Authorized Signature', margin + 20, y + 35)
  
  // Issue date
  doc.setFont('times', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text(`Issued on ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, pageWidth - margin - 200, y + 35, { align: 'right' })
  
  // Church seal area
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(1)
  doc.circle(pageWidth - margin - 50, y + 20, 25)
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('OFFICIAL', pageWidth - margin - 50, y + 15, { align: 'center' })
  doc.text('SEAL', pageWidth - margin - 50, y + 25, { align: 'center' })

  // Save with professional filename
  const filename = `${req.certificateType.toUpperCase()}_CERTIFICATE_${req.memberName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

// Expose a global helper for modal view to trigger download without direct import coupling
;(window as unknown as { __downloadCert?: (req: CertificateRequest) => void }).__downloadCert = async (req: CertificateRequest) => {
  try {
    const { members } = useMembersStore.getState()
    const m = members.find(mm => mm.authId === req.memberId || mm.id === req.memberId) || null
    await downloadCertificate(req, m)
  } catch {
    // no-op
  }
}

const RequestsTable: React.FC<{ rows: CertificateRequest[]; renderActions: (req: CertificateRequest) => React.ReactNode }> = ({ rows, renderActions }) => {
  const { state } = useAuth()
  const { members } = useMembersStore()
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No requests found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const isRequester = state.user?.id === r.memberId
              const isFinalApproved = r.status === 'approved' || r.status === 'approved_final' || !!r.approvals?.level3
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.memberName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(members.find(mm => mm.authId === r.memberId || mm.id === r.memberId) || { email: '' }).email}
                  </TableCell>
                  <TableCell className="capitalize">{r.certificateType}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={r.purpose}>{r.purpose}</TableCell>
                  <TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isRequester && isFinalApproved && (
                        <Button size="sm" variant="outline" onClick={() => {
                          const m = members.find(mm => mm.authId === r.memberId || mm.id === r.memberId) || null
                          downloadCertificate(r, m)
                        }}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                      {renderActions(r)}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export const Certificates: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user!
  const [initializedFromQuery, setInitializedFromQuery] = React.useState(false)

  const { requests, loading, error, isInitialized, fetchAllRequests, fetchRequestsByMember, createRequest, reviewRequest } = useCertificatesStore()
  const { members, fetchAllMembers } = useMembersStore()

  const [openNew, setOpenNew] = React.useState(false)
  const [certType, setCertType] = React.useState<CertificateTypeApi>("baptism")
  const [purpose, setPurpose] = React.useState("")
  const [selectedRequest, setSelectedRequest] = React.useState<CertificateRequest | null>(null)
  const [openRequestView, setOpenRequestView] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Popup states for approve/reject actions
  const [openApproveDialog, setOpenApproveDialog] = React.useState(false)
  const [openRejectDialog, setOpenRejectDialog] = React.useState(false)
  const [actionRequest, setActionRequest] = React.useState<CertificateRequest | null>(null)
  const [approveComment, setApproveComment] = React.useState("")
  const [rejectReason, setRejectReason] = React.useState("")
  const [isActionSubmitting, setIsActionSubmitting] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      try {
          await Promise.all([
            fetchAllRequests(),
            fetchAllMembers?.() || Promise.resolve()
          ])
      } catch (e) {
        console.warn('Certificates: load failed', e)
      }
    }
    load()
  }, [fetchAllRequests, fetchAllMembers])

  // Open New Request dialog when query param new=1 is present
  React.useEffect(() => {
    if (initializedFromQuery) return
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('new') === '1') {
        setOpenNew(true)
      }
    } catch { /* no-op */ }
    setInitializedFromQuery(true)
  }, [initializedFromQuery])

  // Keep the currently opened request view in sync with store updates
  React.useEffect(() => {
    if (!selectedRequest) return
    const updated = requests.find(r => r.id === selectedRequest.id)
    if (updated && updated !== selectedRequest) {
      setSelectedRequest(updated)
    }
  }, [requests, selectedRequest])

  const handleRefresh = async () => {
    try {
      if (user.role === "member") await fetchRequestsByMember(user.id)
      else await fetchAllRequests()
      toast({ title: "Success", description: "Certificate requests refreshed successfully.", variant: "success" })
    } catch (e) {
      toast({ title: "Error", description: "Failed to refresh data. Please try again.", variant: "error" })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose.trim()) {
      toast({ title: "Purpose required", description: "Please describe the purpose for this certificate.", variant: "error" })
      return
    }
    
    setIsSubmitting(true)
    try {
      const res = await CertificateService.requestCertificate({ certificate_type: certType, reason: purpose.trim() })
      if (res.success && res.data) {
        await handleRefresh()
        setPurpose("")
        setCertType("baptism")
        setOpenNew(false)
        toast({ title: "Request submitted", description: res.data.message || "Your certificate request has been created.", variant: "success" })
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to create certificate request", variant: "error" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewRequest = (request: CertificateRequest) => {
    setSelectedRequest(request)
    setOpenRequestView(true)
  }


  // New handlers for opening popup dialogs
  const handleApproveClick = (request: CertificateRequest) => {
    setActionRequest(request)
    setApproveComment("")
    setOpenApproveDialog(true)
  }

  const handleRejectClick = (request: CertificateRequest) => {
    setActionRequest(request)
    setRejectReason("")
    setOpenRejectDialog(true)
  }

  // Handlers for confirming actions
  const handleConfirmApprove = async () => {

    setIsActionSubmitting(true)
    try {
      const ok = await reviewRequest(actionRequest.id, 'approve', approveComment.trim() || "Approved")
      if (ok) {
        toast({ title: "Request Approved", description: "Certificate request approved successfully.", variant: "success" })
        setOpenApproveDialog(false)
        setActionRequest(null)
        setApproveComment("")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve request. Please try again.", variant: "error" })
    } finally {
      setIsActionSubmitting(false);
      setOpenApproveDialog(false);
      handleRefresh()
    }
  }

  const handleConfirmReject = async () => {
    
    setIsActionSubmitting(true)
    try {
      const ok = await reviewRequest(actionRequest.id, 'reject', rejectReason.trim() || "No reason provided");
      if (ok) {
        toast({ title: "Request Rejected", description: "Certificate request rejected.", variant: "error" })
        setOpenRejectDialog(false)
        setActionRequest(null)
        setRejectReason("")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject request. Please try again.", variant: "error" })
    } finally {
      setIsActionSubmitting(false);
      setOpenRejectDialog(false);
      handleRefresh();
    }
  }

  const myRequests = React.useMemo(() => {
    // Use auth_id for matching, fallback to name match; if none match, show all
    const myAuthId = user.id
    const normalizedUserName = (user.name || '').trim().toLowerCase()
    const mine = requests.filter(r => r.memberId === myAuthId || (r.memberName || '').trim().toLowerCase() === normalizedUserName)
    return mine.length > 0 ? mine : requests
  }, [requests, user.id, user.name])

  // TEMP DEBUG: log incoming data to diagnose empty UI
  React.useEffect(() => {
    if (!Array.isArray(requests)) return
    try {
      console.log('Certificates Debug → user/auth and first rows', {
        userAuthId: user.id,
        userName: user.name,
        totalRequests: requests.length,
        memberIds: requests.map(r => r.memberId).slice(0, 10),
        names: requests.map(r => r.memberName).slice(0, 10),
        sample: requests.slice(0, 3),
      })
    } catch (_) {
      console.log('Certificates Debug → user/auth and first rows')
    }
  }, [requests, user.id, user.name])
  const stats = React.useMemo(() => {
    const relevant = user.role === "member" ? myRequests : requests
    const isFinalApproved = (r: CertificateRequest) => r.status === "approved" || r.status === "approved_final" || !!r.approvals?.level3
    const isInReview = (r: CertificateRequest) => !isFinalApproved(r) && r.status !== 'rejected' && (r.status === 'in-review' || !!r.approvals?.level1 || !!r.approvals?.level2)
    return {
      total: relevant.length,
      pending: relevant.filter(r => r.status === "pending" && !r.approvals?.level1 && !r.approvals?.level2 && !r.approvals?.level3).length,
      inReview: relevant.filter(r => isInReview(r)).length,
      approved: relevant.filter(r => isFinalApproved(r)).length,
      rejected: relevant.filter(r => r.status === "rejected").length,
    }
  }, [requests, myRequests, user.role])

  const defaultTab = React.useMemo(() => {
    if (user.role === "member") return "my";
    const hasPending = requests.some(r => {
      if (user.role === 'zone-leader') return r.status === 'pending' && !r.approvals?.level1
      if (user.role === 'pastor') return !!r.approvals?.level1 && !r.approvals?.level2 && r.status !== 'approved' && r.status !== 'rejected'
      if (user.role === 'parish-pastor') return !!r.approvals?.level2 && !r.approvals?.level3 && r.status !== 'approved' && r.status !== 'rejected'
      return false
    })
    return hasPending ? "pending" : "all"
  }, [user.role, requests])

  const canRequest = user.role === "member"
  const canApprove = user.role === "zone-leader" || user.role === "pastor" || user.role === "parish-pastor"
  if (!user) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Certificate Requests</h1>
          <p className="text-muted-foreground">Request certificates and track approvals. Approvers can review and action pending requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        {canRequest && (
          <Dialog open={openNew} onOpenChange={(v) => {
            setOpenNew(v)
            if (!v) {
              // Remove the query param when closing
              try {
                const url = new URL(window.location.href)
                if (url.searchParams.has('new')) {
                  url.searchParams.delete('new')
                  window.history.replaceState({}, '', url.toString())
                }
              } catch { /* no-op */ }
            }
          }}>
            <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Certificate Request</DialogTitle>
                <DialogDescription>Submit a request for your official church certificate.</DialogDescription>
              </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Certificate Type</Label>
                    <Select value={certType} onValueChange={(v: CertificateTypeApi) => setCertType(v)} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baptism">Baptism</SelectItem>
                        <SelectItem value="recommendation">Recommendation</SelectItem>
                      <SelectItem value="marriage">Marriage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  <div className="space-y-2">
                  <Label>Purpose</Label>
                    <Textarea 
                      rows={4} 
                      placeholder="Describe the purpose for this certificate..." 
                      value={purpose} 
                      onChange={(e) => setPurpose(e.target.value)}
                      disabled={isSubmitting}
                    />
                </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenNew(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Send className={`h-4 w-4 mr-2 ${isSubmitting ? 'animate-pulse' : ''}`} />
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="my">My Requests</TabsTrigger>
          {canApprove && <TabsTrigger value="pending">Pending Approvals</TabsTrigger>}
          {user.role !== "member" && <TabsTrigger value="all">All Requests</TabsTrigger>}
        </TabsList>

        <TabsContent value="my">
              <Card>
                <CardHeader>
                  <CardTitle>My Requests</CardTitle>
                  <CardDescription>Track progress of your submissions.</CardDescription>
                </CardHeader>
                <CardContent>
              <RequestsTable 
                rows={myRequests} 
                renderActions={(req) => (
                  <Button size="sm" variant="outline" onClick={() => handleViewRequest(req)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )} 
                    />
                  </CardContent>
                </Card>
        </TabsContent>

        {canApprove && (
          <TabsContent value="pending">
                <Card>
                  <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Requests awaiting your approval.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RequestsTable
                      rows={requests.filter(r => {
                        if (user.role === "zone-leader") return r.status === "pending" && !r.approvals?.level1
                        if (user.role === "pastor") return !!r.approvals?.level1 && !r.approvals?.level2 && r.status !== 'approved' && r.status !== 'rejected'
                        if (user.role === "parish-pastor") return !!r.approvals?.level2 && !r.approvals?.level3 && r.status !== 'approved' && r.status !== 'rejected'
                        return false
                      })}
                      renderActions={(req) => (
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleApproveClick(req)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectClick(req)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewRequest(req)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                    />

                  </CardContent>
                </Card>
          </TabsContent>
        )}

        {user.role !== "member" && (
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Certificate Requests</CardTitle>
                <CardDescription>Overview of all submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsTable 
                  rows={requests} 
                  renderActions={(req) => (
                    <Button size="sm" variant="outline" onClick={() => handleViewRequest(req)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {selectedRequest && (
        <CertificateRequestView
          request={selectedRequest}
          open={openRequestView}
          onOpenChange={(open) => {
            setOpenRequestView(open)
            if (!open) {
              setSelectedRequest(null)
              // Ensure list reflects any updates after closing the modal
              handleRefresh()
            }
          }}
          onApprove={async (requestId, _level, comment) => {
            try {
              const ok = await reviewRequest(requestId, 'approve', (comment || '').trim() || 'Approved');
              if (ok) {
                // Update the selected request view immediately using the store's updated state
                const updated = requests.find(r => r.id === requestId)
                if (updated) setSelectedRequest(updated)
                toast({ title: 'Request Approved', description: 'Certificate request approved successfully.', variant: 'success' })
                // Keep modal open so user sees updated status; list will refresh on close
              }
            } catch (_) {
              toast({ title: 'Error', description: 'Failed to approve request. Please try again.', variant: 'error' })
            }
          }}
          onReject={async (requestId, _level, reason) => {
            try {
              const ok = await reviewRequest(requestId, 'reject', (reason || '').trim() || 'No reason provided');
              if (ok) {
                const updated = requests.find(r => r.id === requestId)
                if (updated) setSelectedRequest(updated)
                toast({ title: 'Request Rejected', description: 'Certificate request rejected.', variant: 'error' })
                // Keep modal open so user sees updated status; list will refresh on close
              }
            } catch (_) {
              toast({ title: 'Error', description: 'Failed to reject request. Please try again.', variant: 'error' })
            }
          }}
          showActions={true}
        />
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading certificate requests...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isInitialized && !loading && !error && requests.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Certificate service is connected but no requests are available yet. This is normal when the system is first set up.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Request Dialog */}
      <Dialog open={openApproveDialog} onOpenChange={setOpenApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Certificate Request
            </DialogTitle>
            <DialogDescription>
              Approve request #{actionRequest?.id} for {actionRequest?.memberName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approve-comment">Approval Comment*</Label>
              <Textarea
                id="approve-comment"
                rows={3}
                placeholder="Add any comments about this approval..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                disabled={isActionSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpenApproveDialog(false)}
              disabled={isActionSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmApprove}
              disabled={isActionSubmitting}
            >
              <CheckCircle className={`h-4 w-4 mr-2 ${isActionSubmitting ? 'animate-pulse' : ''}`} />
              {isActionSubmitting ? 'Approving...' : 'Approve Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Certificate Request
            </DialogTitle>
            <DialogDescription>
              Reject request #{actionRequest?.id} for {actionRequest?.memberName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for Rejection *</Label>
              <Textarea
                id="reject-reason"
                rows={3}
                placeholder="Please provide a reason for rejecting this request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={isActionSubmitting}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpenRejectDialog(false)}
              disabled={isActionSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isActionSubmitting || !rejectReason.trim()}
            >
              <XCircle className={`h-4 w-4 mr-2 ${isActionSubmitting ? 'animate-pulse' : ''}`} />
              {isActionSubmitting ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


