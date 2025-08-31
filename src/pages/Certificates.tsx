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
import { CertificateRequest } from "@/services/certificateService"

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

// Download certificate function
const downloadCertificate = (req: CertificateRequest) => {
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
};

const RequestsTable: React.FC<{
  rows: CertificateRequest[]
  renderActions: (req: CertificateRequest) => React.ReactNode
}> = ({ rows, renderActions }) => {
  const { state } = useAuth();
  
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
              const isRequester = state.user?.id === r.memberId;
              const isApproved = r.status === 'approved';
              
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-medium">{r.memberName}</TableCell>
                  <TableCell className="capitalize">{r.certificateType}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={r.purpose}>
                    {r.purpose}
                  </TableCell>
                  <TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isRequester && isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCertificate(r)}
                        >
                          <Download className="h-3 w-3 mr-1" />
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

  // Use certificates store
  const { 
    requests, 
    loading, 
    error,
    isInitialized,
    fetchAllRequests,
    fetchRequestsByMember,
    createRequest,
    approveRequest,
    rejectRequest
  } = useCertificatesStore()

  // New request dialog state
  const [openNew, setOpenNew] = React.useState(false)
  const [certType, setCertType] = React.useState<CertType>("baptism")
  const [purpose, setPurpose] = React.useState("")
  const [selectedRequest, setSelectedRequest] = React.useState<CertificateRequest | null>(null)
  const [openRequestView, setOpenRequestView] = React.useState(false)

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        if (user.role === "member") {
          await fetchRequestsByMember(user.id)
    } else {
          await fetchAllRequests()
        }
    } catch (error) {
        console.error('Failed to load certificate requests:', error)
        // Don't show error toast as endpoints might not be ready
      }
    }

    loadData()
  }, [fetchAllRequests, fetchRequestsByMember, user.id, user.role])

  const handleRefresh = async () => {
    try {
      if (user.role === "member") {
        await fetchRequestsByMember(user.id)
      } else {
        await fetchAllRequests()
      }
      toast({
        title: "Success",
        description: "Certificate requests refreshed successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose.trim()) {
      toast({ 
        title: "Purpose required", 
        description: "Please describe the purpose for this certificate.",
        variant: "destructive"
      })
      return
    }

    const success = await createRequest({
      memberId: user.id,
      memberName: user.name,
      certificateType: certType,
      purpose: purpose.trim(),
    })

    if (success) {
    setPurpose("")
    setCertType("baptism")
    setOpenNew(false)
      toast({ 
        title: "Request submitted", 
        description: "Your certificate request has been created." 
      })
    }
  }

  const handleViewRequest = (request: CertificateRequest) => {
    setSelectedRequest(request)
    setOpenRequestView(true)
  }

  const handleApproveRequest = async (requestId: string, level: number, comments?: string) => {
    const success = await approveRequest(requestId, level as 1 | 2 | 3, user.name, comments)
    if (success) {
      toast({ 
        title: "Request Approved", 
        description: `Certificate request approved successfully.` 
      })
    }
  }

  const handleRejectRequest = async (requestId: string, level: number, reason: string) => {
    const success = await rejectRequest(requestId, level as 1 | 2 | 3, user.name, reason)
    if (success) {
      toast({ 
        title: "Request Rejected", 
        description: `Certificate request rejected.` 
      })
    }
  }

  // Filter requests based on user role
  const myRequests = React.useMemo(() => {
    return requests.filter(req => req.memberId === user.id)
  }, [requests, user.id])

  const pendingRequests = React.useMemo(() => {
    return requests.filter(req => req.status === "pending")
  }, [requests])

  const inReviewRequests = React.useMemo(() => {
    return requests.filter(req => req.status === "in-review")
  }, [requests])

  const approvedRequests = React.useMemo(() => {
    return requests.filter(req => req.status === "approved")
  }, [requests])

  // Calculate stats
  const stats = React.useMemo(() => {
    const relevantRequests = user.role === "member" ? myRequests : requests
    return {
      total: relevantRequests.length,
      pending: relevantRequests.filter(req => req.status === "pending").length,
      inReview: relevantRequests.filter(req => req.status === "in-review").length,
      approved: relevantRequests.filter(req => req.status === "approved").length,
      rejected: relevantRequests.filter(req => req.status === "rejected").length,
    }
  }, [requests, myRequests, user.role])

  const canRequest = user.role === "member"
  const canApprove = user.role === "zone-leader" || user.role === "pastor" || user.role === "parish-pastor"

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Certificate Requests</h1>
          <p className="text-muted-foreground">
            Request certificates and track approvals. Approvers can review and action pending requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
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
                  <Select value={certType} onValueChange={(v: CertType) => setCertType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baptism">Baptism</SelectItem>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                      <SelectItem value="marriage">Marriage</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Textarea
                    placeholder="Describe the purpose for this certificate..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={4}
                  />
                </div>
                  <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenNew(false)}>
                    Cancel
                  </Button>
                    <Button type="submit">
                      <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                  </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status Info */}
      {isInitialized && !loading && !error && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Certificate service is connected and ready
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
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

      {/* Tabs */}
      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">My Requests</TabsTrigger>
          {canApprove && <TabsTrigger value="pending">Pending Approvals</TabsTrigger>}
          {user.role !== "member" && <TabsTrigger value="all">All Requests</TabsTrigger>}
        </TabsList>

        {/* My Requests */}
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

        {/* Pending Approvals */}
        {canApprove && (
          <TabsContent value="pending">
                <Card>
                  <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Requests awaiting your approval.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RequestsTable
                  rows={pendingRequests} 
                  renderActions={(req) => (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveRequest(req.id, 1)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectRequest(req.id, 1, "Rejected")}
                      >
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

        {/* All Requests */}
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

      {/* Loading State */}
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

      {/* Empty State - Service Not Ready */}
      {isInitialized && !loading && !error && requests.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Certificate service is connected but no requests are available yet. This is normal when the system is first set up.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
