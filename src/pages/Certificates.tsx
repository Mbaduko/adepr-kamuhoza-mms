"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, type CertificateRequest } from "@/data/mockData"
import { CertificateRequestView } from "@/components/CertificateRequestView"
import {
  listAll,
  listByMemberId,
  createRequest,
  approveRequest,
  rejectRequest,
  listPendingLevel1ForZone,
  listPendingLevel2,
  listPendingLevel3,
  summarize,
} from "@/data/certificates-store"
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
  UserCheck,
  Crown,
  Shield,
  Check,
  FileCheck,
  CheckSquare,
  Award,
  FileText,
  Download,
} from "lucide-react"

type CertType = CertificateRequest["certificateType"]

function StatusBadge({ status }: { status: CertificateRequest["status"] }) {
  const map: Record<
    CertificateRequest["status"],
    { label: string; className: string; icon: React.ReactNode }
  > = {
    pending: { 
      label: "Pending", 
      className: "bg-warning text-warning-foreground",
      icon: <Clock className="h-3 w-3" />
    },
    "in-review": { 
      label: "In Review", 
      className: "bg-accent text-accent-foreground",
      icon: <AlertCircle className="h-3 w-3" />
    },
    approved: { 
      label: "Approved", 
      className: "bg-success text-success-foreground",
      icon: <CheckCircle className="h-3 w-3" />
    },
    rejected: { 
      label: "Rejected", 
      className: "bg-destructive text-destructive-foreground",
      icon: <XCircle className="h-3 w-3" />
    },
  }
  const cfg = map[status]
  return (
    <Badge className={`${cfg.className} flex items-center gap-1`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  )
}

// Enhanced progress bar component - in sync with app colors
function ProgressBar({ step }: { step: number }) {
  const pct = step === 0 ? 25 : step === 1 ? 50 : step === 2 ? 75 : 100;
  const steps = [
    { name: "Submitted", icon: FileCheck },
    { name: "Zone Leader", icon: UserCheck },
    { name: "Pastor", icon: Shield },
    { name: "Parish Pastor", icon: CheckSquare }
  ];
  
  return (
    <div className="w-full space-y-3">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          return (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                index <= step 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs mt-1 text-center transition-colors duration-300 ${
                index <= step ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {stepItem.name}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out shadow-sm" 
            style={{ width: `${pct}%` }} 
          />
        </div>
        {/* Progress percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-primary-foreground bg-primary px-2 py-1 rounded-full shadow-sm">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

function computeProgressStep(req: CertificateRequest): number {
  if (req.status === "rejected") return 0;
  if (req.status === "approved") return 3;
  // in-review or pending:
  if (req.approvals.level3) return 3;
  if (req.approvals.level2) return 2;
  if (req.approvals.level1) return 1;
  return 0;
}

function RequestDetails({ req }: { req: CertificateRequest }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium">Member</div>
          <div className="font-semibold text-foreground">{req.memberName}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium">Requested</div>
          <div className="font-semibold text-foreground">{new Date(req.requestDate).toLocaleString()}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium">Type</div>
          <div className="font-semibold text-foreground capitalize">{req.certificateType}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium">Status</div>
          <div className="font-semibold">
            <StatusBadge status={req.status} />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground font-medium">Purpose</div>
        <div className="p-3 bg-muted rounded-lg border border-border">{req.purpose}</div>
      </div>

      <div className="space-y-4">
        <div className="text-lg font-semibold text-foreground">Approvals Timeline</div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-3 w-3 text-primary" />
              </div>
              <div className="font-semibold text-foreground">Level 1 - Zone Leader</div>
            </div>
            {req.approvals.level1 ? (
              <div className="text-sm text-muted-foreground ml-8">
                Approved by {req.approvals.level1.approvedBy} on {new Date(req.approvals.level1.date).toLocaleString()}
                {req.approvals.level1.comments && (
                  <div className="mt-2 p-2 bg-success/10 rounded border border-success/20 text-success-foreground">
                    {req.approvals.level1.comments}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground ml-8">Pending</div>
            )}
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-3 w-3 text-primary" />
              </div>
              <div className="font-semibold text-foreground">Level 2 - Pastor</div>
            </div>
            {req.approvals.level2 ? (
              <div className="text-sm text-muted-foreground ml-8">
                Approved by {req.approvals.level2.approvedBy} on {new Date(req.approvals.level2.date).toLocaleString()}
                {req.approvals.level2.comments && (
                  <div className="mt-2 p-2 bg-success/10 rounded border border-success/20 text-success-foreground">
                    {req.approvals.level2.comments}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground ml-8">Pending</div>
            )}
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-3 w-3 text-primary" />
              </div>
              <div className="font-semibold text-foreground">Level 3 - Parish Pastor</div>
            </div>
            {req.approvals.level3 ? (
              <div className="text-sm text-muted-foreground ml-8">
                Approved by {req.approvals.level3.approvedBy} on {new Date(req.approvals.level3.date).toLocaleString()}
                {req.approvals.level3.comments && (
                  <div className="mt-2 p-2 bg-success/10 rounded border border-success/20 text-success-foreground">
                    {req.approvals.level3.comments}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground ml-8">Pending</div>
            )}
          </div>
          
          {req.rejectionReason && (
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <div className="font-semibold text-destructive">Rejection Reason</div>
              </div>
              <div className="text-sm text-destructive ml-6">{req.rejectionReason}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DetailsButton: React.FC<{ req: CertificateRequest }> = ({ req }) => {
  const { state } = useAuth()
  const user = state.user!
  const [open, setOpen] = React.useState(false)
  
  const handleApproveRequest = (requestId: string, level: number, comments?: string) => {
    try {
      approveRequest({ id: requestId, level: level as 1 | 2 | 3, approvedBy: user.name, comments })
      toast({ title: "Request Approved", description: `Certificate request approved successfully.` })
    } catch (error) {
      console.error("Failed to approve request:", error)
      toast({ title: "Error", description: "Failed to approve request. Please try again.", variant: "destructive" })
    }
  }

  const handleRejectRequest = (requestId: string, level: number, reason: string) => {
    try {
      rejectRequest({ id: requestId, level: level as 1 | 2 | 3, approvedBy: user.name, reason })
      toast({ title: "Request Rejected", description: `Certificate request rejected.` })
    } catch (error) {
      console.error("Failed to reject request:", error)
      toast({ title: "Error", description: "Failed to reject request. Please try again.", variant: "destructive" })
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
        View
      </Button>
      
      <CertificateRequestView
        request={req}
        open={open}
        onOpenChange={setOpen}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        showActions={true}
      />
    </>
  )
}

// Download certificate function
const downloadCertificate = (req: CertificateRequest) => {
  const { toast } = useToast();
  
  // Create certificate content
  const certificateContent = `
ADEPR MUHOZA CHURCH
OFFICIAL CERTIFICATE

Certificate Type: ${req.certificateType.toUpperCase()}
Member Name: ${req.memberName}
Request ID: ${req.id}
Purpose: ${req.purpose}
Request Date: ${new Date(req.requestDate).toLocaleDateString()}

APPROVAL TIMELINE:
Level 1 - Zone Leader: ${req.approvals.level1 ? `Approved by ${req.approvals.level1.approvedBy} on ${new Date(req.approvals.level1.date).toLocaleDateString()}` : 'Pending'}
Level 2 - Pastor: ${req.approvals.level2 ? `Approved by ${req.approvals.level2.approvedBy} on ${new Date(req.approvals.level2.date).toLocaleDateString()}` : 'Pending'}
Level 3 - Parish Pastor: ${req.approvals.level3 ? `Approved by ${req.approvals.level3.approvedBy} on ${new Date(req.approvals.level3.date).toLocaleDateString()}` : 'Pending'}

This certificate is hereby issued and approved by the church administration.

Issued on: ${new Date().toLocaleDateString()}
  `.trim();

  // Create blob and download
  const blob = new Blob([certificateContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${req.certificateType}_certificate_${req.memberName.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  // Show success toast
  toast({ 
    title: "Certificate Downloaded", 
    description: `${req.certificateType} certificate has been downloaded successfully.` 
  });
};

// Enhanced request card component - in sync with app colors
const RequestCard: React.FC<{ req: CertificateRequest }> = ({ req }) => {
  const step = computeProgressStep(req);
  const { state } = useAuth();
  const isRequester = state.user?.id === req.memberId;
  const isApproved = req.status === 'approved';
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{req.certificateType} Certificate</h3>
              <p className="text-sm text-muted-foreground">Request #{req.id.slice(0, 8)}</p>
            </div>
            <StatusBadge status={req.status} />
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <div>
              <span className="font-medium">Purpose:</span> {req.purpose}
            </div>
            <div>
              <span className="font-medium">Requested on:</span> {new Date(req.requestDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <ProgressBar step={step} />
      </div>
      <div className="flex justify-between items-center">
        {isRequester && isApproved && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-primary border-primary hover:bg-primary/10"
            onClick={() => downloadCertificate(req)}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
        <DetailsButton req={req} />
      </div>
    </div>
  )
}

const RequestsTable: React.FC<{
  rows: CertificateRequest[]
  renderActions: (req: CertificateRequest) => React.ReactNode
}> = ({ rows, renderActions }) => {
  const { state } = useAuth();
  
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-900">ID</TableHead>
            <TableHead className="font-semibold text-gray-900">Member</TableHead>
            <TableHead className="font-semibold text-gray-900">Type</TableHead>
            <TableHead className="font-semibold text-gray-900">Purpose</TableHead>
            <TableHead className="font-semibold text-gray-900">Date</TableHead>
            <TableHead className="font-semibold text-gray-900">Status</TableHead>
            <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <p>No requests found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const isRequester = state.user?.id === r.memberId;
              const isApproved = r.status === 'approved';
              
              return (
                <TableRow key={r.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-medium">{r.memberName}</TableCell>
                  <TableCell className="capitalize font-medium">{r.certificateType}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={r.purpose}>
                    {r.purpose}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isRequester && isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-primary border-primary hover:bg-primary/10"
                          onClick={() => downloadCertificate(r)}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      )}
                      {renderActions(r)}
                    </div>
                  </TableCell>
                </TableRow>
              );
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
  const permissions = getUserPermissions(user.role)

  const [all, setAll] = React.useState<CertificateRequest[]>([])
  const [my, setMy] = React.useState<CertificateRequest[]>([])
  const [pendingL1, setPendingL1] = React.useState<CertificateRequest[]>([])
  const [pendingL2, setPendingL2] = React.useState<CertificateRequest[]>([])
  const [pendingL3, setPendingL3] = React.useState<CertificateRequest[]>([])

  // New request dialog state and form fields
  const [openNew, setOpenNew] = React.useState(false)
  const [certType, setCertType] = React.useState<CertType>("baptism")
  const [purpose, setPurpose] = React.useState("")
  const [selectedRequest, setSelectedRequest] = React.useState<CertificateRequest | null>(null)
  const [openRequestView, setOpenRequestView] = React.useState(false)

  const canRequest = (user.role === "member" || user.role === "zone-leader") && user.role !== "parish-pastor"
  const canApproveL1 = user.role === "zone-leader" && !!user.zoneId
  const canApproveL2 = user.role === "pastor"
  const canApproveL3 = user.role === "parish-pastor"

  const reload = React.useCallback(() => {
    setAll(listAll())
    setMy(listByMemberId(user.id))
    if (user.zoneId) {
      setPendingL1(listPendingLevel1ForZone(user.zoneId))
    } else {
      setPendingL1([])
    }
    setPendingL2(listPendingLevel2())
    setPendingL3(listPendingLevel3())
  }, [user.id, user.zoneId])

  const handleViewRequest = (request: CertificateRequest) => {
    setSelectedRequest(request)
    setOpenRequestView(true)
  }

  const handleApproveRequest = (requestId: string, level: number, comments?: string) => {
    try {
      approveRequest({ id: requestId, level: level as 1 | 2 | 3, approvedBy: user.name, comments })
      reload()
      toast({ title: "Request Approved", description: `Certificate request approved successfully.` })
    } catch (error) {
      console.error("Failed to approve request:", error)
      toast({ title: "Error", description: "Failed to approve request. Please try again.", variant: "destructive" })
    }
  }

  const handleRejectRequest = (requestId: string, level: number, reason: string) => {
    try {
      rejectRequest({ id: requestId, level: level as 1 | 2 | 3, approvedBy: user.name, reason })
      reload()
      toast({ title: "Request Rejected", description: `Certificate request rejected.` })
    } catch (error) {
      console.error("Failed to reject request:", error)
      toast({ title: "Error", description: "Failed to reject request. Please try again.", variant: "destructive" })
    }
  }

  React.useEffect(() => {
    reload()
  }, [reload])

  const mySummary = summarize(my)
  const globalSummary = summarize(all)
  const l1Summary = summarize(pendingL1)
  const l2Summary = summarize(pendingL2)
  const l3Summary = summarize(pendingL3)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose.trim()) {
      toast({ title: "Purpose required", description: "Please describe the purpose for this certificate." })
      return
    }
    createRequest({
      memberId: user.id,
      memberName: user.name,
      certificateType: certType,
      purpose: purpose.trim(),
    })
    setPurpose("")
    setCertType("baptism")
    setOpenNew(false)
    toast({ title: "Request submitted", description: "Your certificate request has been created." })
    reload()
  }

  const ApproveRejectActions: React.FC<{ req: CertificateRequest; level: 1 | 2 | 3 }> = ({ req, level }) => {
    const [openApprove, setOpenApprove] = React.useState(false)
    const [openReject, setOpenReject] = React.useState(false)
    const [comment, setComment] = React.useState("")

    const approve = () => {
      approveRequest({ id: req.id, level, approvedBy: user.name, comments: comment })
      setComment("")
      setOpenApprove(false)
      toast({ title: "Approved", description: `Request ${req.id} approved at level ${level}.` })
      reload()
    }

    const reject = () => {
      if (!comment.trim()) {
        toast({ title: "Reason required", description: "Please provide a reason to reject.", variant: "destructive" })
        return
      }
      rejectRequest({ id: req.id, level, approvedBy: user.name, reason: comment.trim() })
      setComment("")
      setOpenReject(false)
      toast({ title: "Rejected", description: `Request ${req.id} rejected.` })
      reload()
    }

    return (
      <div className="flex items-center gap-2">
        <Dialog open={openApprove} onOpenChange={setOpenApprove}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Request</DialogTitle>
              <DialogDescription>Optionally add a comment for the approval.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`approve-comment-${req.id}`}>Comment</Label>
              <Textarea
                id={`approve-comment-${req.id}`}
                placeholder="Optional comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenApprove(false)}>
                Cancel
              </Button>
              <Button onClick={approve}>Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openReject} onOpenChange={setOpenReject}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive" className="gap-1">
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>Please provide a reason for rejection.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`reject-reason-${req.id}`}>Reason</Label>
              <Textarea
                id={`reject-reason-${req.id}`}
                placeholder="Enter reason to reject"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenReject(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={reject}>
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DetailsButton req={req} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Requests</h1>
          <p className="text-gray-600">
            Request certificates and track approvals. Approvers can review and action pending requests.
          </p>
        </div>

        {canRequest && (
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Certificate Request</DialogTitle>
                <DialogDescription>Submit a request for your official church certificate.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Certificate Type</Label>
                  <Select value={certType} onValueChange={(v: CertType) => setCertType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baptism">Baptism</SelectItem>
                      <SelectItem value="confirmation">Confirmation</SelectItem>
                      <SelectItem value="marriage">Marriage</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Purpose</Label>
                  <Textarea
                    placeholder="Describe the purpose for this certificate..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpenNew(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total Requests</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.total : globalSummary.total}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Pending</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.pending : globalSummary.pending}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">In Review</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.inReview : globalSummary.inReview}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Approved</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.approved : globalSummary.approved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={(canApproveL1 || canApproveL2 || canApproveL3) ? "approvals" : "my"}>
        <TabsList className="mb-6 bg-gray-100">
          {user.role !== "parish-pastor" && (
            <TabsTrigger value="my" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">My Requests</TabsTrigger>
          )}
          {(canApproveL1 || canApproveL2 || canApproveL3) && (
            <TabsTrigger value="approvals" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Pending Approvals</TabsTrigger>
          )}
          {user.role !== "member" && <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">All Requests</TabsTrigger>}
        </TabsList>

        {/* My Requests */}
        {user.role !== "parish-pastor" && (
          <TabsContent value="my">
            {user.role === "member" || user.role === "zone-leader" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {my.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No requests yet</CardTitle>
                      <CardDescription>Use the New Request button to get started.</CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  my.map((req) => <RequestCard key={req.id} req={req} />)
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>My Requests</CardTitle>
                  <CardDescription>Track progress of your submissions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RequestsTable rows={my} renderActions={(req) => <DetailsButton req={req} />} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Approvals */}
        {(canApproveL1 || canApproveL2 || canApproveL3) && (
          <TabsContent value="approvals">
            <div className="grid gap-6">
              {canApproveL1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Level 1 Approvals (Zone Leader)</CardTitle>
                    <CardDescription>Requests from your zone awaiting initial approval.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm text-muted-foreground">Pending: {l1Summary.total}</div>
                    <RequestsTable
                      rows={pendingL1}
                      renderActions={(req) => <ApproveRejectActions req={req} level={1} />}
                    />
                  </CardContent>
                </Card>
              )}
              {canApproveL2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Level 2 Approvals (Pastor)</CardTitle>
                    <CardDescription>Requests approved by Zone Leaders awaiting your review.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm text-muted-foreground">Pending: {l2Summary.total}</div>
                    <RequestsTable
                      rows={pendingL2}
                      renderActions={(req) => <ApproveRejectActions req={req} level={2} />}
                    />
                  </CardContent>
                </Card>
              )}
              {canApproveL3 && (
                <Card>
                  <CardHeader>
                                      <CardTitle>Level 3 Approvals (Parish Pastor)</CardTitle>
                  <CardDescription>Requests awaiting parish pastor approval.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm text-muted-foreground">Pending: {l3Summary.total}</div>
                    <RequestsTable
                      rows={pendingL3}
                      renderActions={(req) => <ApproveRejectActions req={req} level={3} />}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}

        {/* All Requests (for leaders) */}
        {user.role !== "member" && (
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Certificate Requests</CardTitle>
                <CardDescription>Overview of all submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsTable rows={all} renderActions={(req) => <DetailsButton req={req} />} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Certificate Request View Dialog */}
      {selectedRequest && (
        <CertificateRequestView
          request={selectedRequest}
          open={openRequestView}
          onOpenChange={setOpenRequestView}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          showActions={true}
        />
      )}
    </div>
  )
}
