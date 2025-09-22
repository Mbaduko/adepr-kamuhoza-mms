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

const downloadCertificate = (req: CertificateRequest) => {
  const content = `
ADEPR MUHOZA CHURCH
OFFICIAL CERTIFICATE

Certificate Type: ${req.certificateType.toUpperCase()}
Member Name: ${req.memberName}
Request ID: ${req.id}
Purpose: ${req.purpose}
Request Date: ${new Date(req.requestDate).toLocaleDateString()}
`.trim()
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${req.certificateType}_certificate_${req.memberName.replace(/\s+/g, '_')}.txt`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

const RequestsTable: React.FC<{ rows: CertificateRequest[]; renderActions: (req: CertificateRequest) => React.ReactNode }> = ({ rows, renderActions }) => {
  const { state } = useAuth()
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Member</TableHead>
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
              const isApproved = r.status === 'approved'
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-medium">{r.memberName}</TableCell>
                  <TableCell className="capitalize">{r.certificateType}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={r.purpose}>{r.purpose}</TableCell>
                  <TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isRequester && isApproved && (
                        <Button size="sm" variant="outline" onClick={() => downloadCertificate(r)}>
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

  const { requests, loading, error, isInitialized, fetchAllRequests, fetchRequestsByMember, createRequest, reviewRequest } = useCertificatesStore()

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
          await fetchAllRequests()
      } catch (e) {
        console.warn('Certificates: load failed', e)
      }
    }
    load()
  }, [fetchAllRequests])

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
    return {
      total: relevant.length,
      pending: relevant.filter(r => r.status === "pending").length,
      inReview: relevant.filter(r => r.approvals?.level1 || r.approvals?.level2).length,
      approved: relevant.filter(r => r.status === "approved").length,
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
          <Dialog open={openNew} onOpenChange={setOpenNew}>
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
          onOpenChange={setOpenRequestView}
          onApprove={async (requestId, _level, comment) => {
            try {
              const ok = await reviewRequest(requestId, 'approve', (comment || '').trim() || 'Approved');
              if (ok) {
                toast({ title: 'Request Approved', description: 'Certificate request approved successfully.', variant: 'success' })
                setOpenRequestView(false)
                setSelectedRequest(null)
                handleRefresh()
              }
            } catch (_) {
              toast({ title: 'Error', description: 'Failed to approve request. Please try again.', variant: 'error' })
            }
          }}
          onReject={async (requestId, _level, reason) => {
            try {
              const ok = await reviewRequest(requestId, 'reject', (reason || '').trim() || 'No reason provided');
              if (ok) {
                toast({ title: 'Request Rejected', description: 'Certificate request rejected.', variant: 'error' })
                setOpenRequestView(false)
                setSelectedRequest(null)
                handleRefresh()
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


