"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, mockMembers, mockZones, type CertificateRequest } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import { CertificateRequestView } from "@/components/CertificateRequestView"
import {
  listAll,
  listByMemberId,
  listPendingLevel1ForZone,
  approveRequest,
  rejectRequest,
  getMemberZoneId,
} from "@/data/certificates-store"
import { Users, FileText, MapPin, Award, TrendingUp, CheckCircle, Clock, AlertCircle, ChevronRight, FileCheck, UserCheck, Shield, CheckSquare, User, XCircle, Eye } from "lucide-react"

type ProgressStep = 0 | 1 | 2 | 3
// 0 = Submitted, 1 = Level 1 approved, 2 = Level 2 approved, 3 = Parish Pastor approved

function computeProgressStep(req: CertificateRequest): ProgressStep {
  if (req.status === "rejected") return 0
  if (req.status === "approved") return 3
  // in-review or pending:
  if (req.approvals.level2) return 2
  if (req.approvals.level1) return 1
  return 0
}

function statusBadge(status: CertificateRequest["status"]) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-600 text-white border-green-600">Approved</Badge>
    case "pending":
      return <Badge className="bg-amber-500 text-white border-amber-500">Pending</Badge>
    case "in-review":
      return <Badge className="bg-blue-600 text-white border-blue-600">In Review</Badge>
    case "rejected":
      return <Badge className="bg-red-600 text-white border-red-600">Rejected</Badge>
    default:
      return <Badge>Unknown</Badge>
  }
}

function ProgressBar({ step }: { step: ProgressStep }) {
  const pct = step === 0 ? 25 : step === 1 ? 50 : step === 2 ? 75 : 100
  const steps = [
    { name: "Submitted", icon: FileCheck },
    { name: "Zone Leader", icon: UserCheck },
    { name: "Pastor", icon: Shield },
    { name: "Parish Pastor", icon: CheckSquare }
  ]
  
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
  )
}

function RequestMeta({ req }: { req: CertificateRequest }) {
  return (
    <div className="text-xs text-muted-foreground">
      <span className="mr-2">Requested: {new Date(req.requestDate).toLocaleDateString()}</span>
      <span className="mr-2">Type: {req.certificateType}</span>
      {req.purpose ? <span title="Purpose">Purpose: {req.purpose}</span> : null}
    </div>
  )
}

export const Dashboard: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user
  const userRole = user?.role

  const [requests, setRequests] = React.useState<CertificateRequest[]>([])
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = React.useState<CertificateRequest | null>(null)
  const [openRequestView, setOpenRequestView] = React.useState(false)

  // Get recent requests for different user types
  const myRecentRequests = React.useMemo(() => {
    if (userRole === "member") {
      return requests.filter(req => req.memberId === user?.id).slice(0, 3)
    }
    return []
  }, [requests, user?.id, userRole])

  const zoneRecentRequests = React.useMemo(() => {
    if (userRole === "zone-leader" && user?.zoneId) {
      // Zone leaders see: pending requests from their zone + requests they've approved + their own requests
      const zoneMembers = mockMembers.filter(m => m.zoneId === user.zoneId).map(m => m.id)
      const relevantRequests = requests.filter(req => {
        // Include their own requests
        if (req.memberId === user.id) return true
        // Include pending requests from their zone
        if (zoneMembers.includes(req.memberId) && req.status === "pending") return true
        // Include requests they've approved (level1)
        if (req.approvals.level1?.approvedBy === user.name) return true
        return false
      })
      return relevantRequests.slice(0, 5)
    }
    return []
  }, [requests, user?.id, user?.zoneId, userRole])

  // Filter requests for pastors and parish-pastors based on approval level
  const pastorRelevantRequests = React.useMemo(() => {
    if (userRole === "pastor") {
      // Pastors see: requests needing their approval (level2) + requests they've approved + their own requests
      const relevantRequests = requests.filter(req => {
        // Include their own requests
        if (req.memberId === user?.id) return true
        // Include requests needing their approval (have level1 but no level2)
        if (req.status === "in-review" && req.approvals.level1 && !req.approvals.level2) return true
        // Include requests they've approved (level2)
        if (req.approvals.level2?.approvedBy === user?.name) return true
        return false
      })
      return relevantRequests.slice(0, 5)
    }
    return []
  }, [requests, user?.id, userRole])

  const parishPastorRelevantRequests = React.useMemo(() => {
    if (userRole === "parish-pastor") {
      // Parish pastors see: requests needing their approval (level3) + requests they've approved + their own requests
      const relevantRequests = requests.filter(req => {
        // Include their own requests
        if (req.memberId === user?.id) return true
        // Include requests needing their approval (have level2 but no level3)
        if (req.status === "in-review" && req.approvals.level2 && !req.approvals.level3) return true
        // Include requests they've approved (level3)
        if (req.approvals.level3?.approvedBy === user?.name) return true
        return false
      })
      return relevantRequests.slice(0, 5)
    }
    return []
  }, [requests, user?.id, userRole])

  const permissions = React.useMemo(() => (user ? getUserPermissions(user.role) : ({} as any)), [user])

  const refresh = React.useCallback(() => {
    const all = listAll()
    setRequests(all)
  }, [user])

  const handleViewRequest = (request: CertificateRequest) => {
    setSelectedRequest(request)
    setOpenRequestView(true)
  }

  const handleApproveRequest = (requestId: string, level: number, comments?: string) => {
    try {
      approveRequest({ id: requestId, level, approvedBy: user.name, comments })
      refresh()
      toast({ title: "Request Approved", description: `Certificate request approved successfully.` })
    } catch (error) {
      console.error("Failed to approve request:", error)
      toast({ title: "Error", description: "Failed to approve request. Please try again.", variant: "destructive" })
    }
  }

  const handleRejectRequest = (requestId: string, level: number, reason: string) => {
    try {
      rejectRequest({ id: requestId, level, approvedBy: user.name, reason })
      refresh()
      toast({ title: "Request Rejected", description: `Certificate request rejected.` })
    } catch (error) {
      console.error("Failed to reject request:", error)
      toast({ title: "Error", description: "Failed to reject request. Please try again.", variant: "destructive" })
    }
  }

  React.useEffect(() => {
    refresh()
  }, [refresh])

  if (!user) return null

  // Stats based on dynamic requests
  const getStats = () => {
    const baseStats = {
      pendingRequests: requests.filter((req) => req.status === "pending").length,
      approvedRequests: requests.filter((req) => req.status === "approved").length,
      totalMembers: mockMembers.length,
      totalZones: mockZones.length,
    }

    if (userRole === "member") {
      const userRequests = requests.filter((req) => req.memberId === user.id)
      return {
        type: "member" as const,
        myRequests: userRequests.length,
        approvedRequests: userRequests.filter((req) => req.status === "approved").length,
        pendingRequests: userRequests.filter((req) => req.status === "pending").length,
        inReviewRequests: userRequests.filter((req) => req.status === "in-review").length,
      }
    }

    if (userRole === "zone-leader") {
      const zoneMembers = mockMembers.filter((m) => m.zoneId === user.zoneId)
      return {
        type: "zone-leader" as const,
        zoneMembers: zoneMembers.length,
        ...baseStats,
      }
    }

    return {
      type: "admin" as const,
      ...baseStats,
    }
  }

  const stats = getStats()

  const getQuickActions = () => {
    const actions: {
      title: string
      description: string
      icon: React.ComponentType<{ className?: string }>
      href: string
      variant: "default" | "outline"
    }[] = []

    if (permissions?.canRequestCertificate) {
      actions.push({
        title: "Request Certificate",
        description: "Submit a new certificate request",
        icon: Award,
        href: "/certificates/new",
        variant: "default",
      })
    }

    if (permissions?.canViewZoneMembers) {
      actions.push({
        title: "Manage Members",
        description: "View and manage zone members",
        icon: Users,
        href: "/members",
        variant: "outline",
      })
    }

    if (permissions?.canManageZones) {
      actions.push({
        title: "Manage Zones",
        description: "Create and assign zones",
        icon: MapPin,
        href: "/zones",
        variant: "outline",
      })
    }

    if (permissions?.canViewStats) {
      actions.push({
        title: "View Statistics",
        description: "Church analytics and reports",
        icon: TrendingUp,
        href: "/statistics",
        variant: "outline",
      })
    }

    return actions
  }

  const quickActions = getQuickActions()

  const getRecentActivity = () => {
    if (userRole === "member") {
      return requests
        .filter((req) => req.memberId === user.id)
        .slice(0, 3)
        .map((req) => ({
          title: `${req.certificateType} Certificate`,
          description: `Status: ${req.status}`,
          time: new Date(req.requestDate).toLocaleDateString(),
          status: req.status,
        }))
    }

    return requests.slice(0, 5).map((req) => ({
      title: `Certificate Request - ${req.memberName}`,
      description: `${req.certificateType} certificate`,
      time: new Date(req.requestDate).toLocaleDateString(),
      status: req.status,
    }))
  }

  const recentActivity = getRecentActivity()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "in-review":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }



  const canApproveLevel1 = userRole === "zone-leader" && !!user.zoneId

  async function handleApprove(id: string) {
    if (!canApproveLevel1) return
    try {
      setBusyId(id)
      approveRequest({ id, level: 1, approvedBy: user.name })
      refresh()
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id: string) {
    if (!canApproveLevel1) return
    const reason = window.prompt("Please provide a reason for rejection:")
    if (reason === null) return
    try {
      setBusyId(id)
      rejectRequest({ id, level: 1, approvedBy: user.name, reason: reason || "No reason provided" })
      refresh()
      toast({ title: "Request Rejected", description: "The certificate request has been rejected." })
    } catch (error) {
      console.error("Failed to reject request:", error)
      toast({ title: "Error", description: "Failed to reject request. Please try again.", variant: "destructive" })
    } finally {
      setBusyId(null)
    }
  }

  // Approval action components
  const ApproveRejectActions: React.FC<{ req: CertificateRequest }> = ({ req }) => {
    const [openApprove, setOpenApprove] = React.useState(false)
    const [openReject, setOpenReject] = React.useState(false)
    const [comment, setComment] = React.useState("")

    const approve = () => {
      approveRequest({ id: req.id, level: 1, approvedBy: user.name, comments: comment })
      setComment("")
      setOpenApprove(false)
      refresh()
      toast({ title: "Request Approved", description: `Certificate request approved successfully.` })
    }

    const reject = () => {
      if (!comment.trim()) {
        toast({ title: "Reason required", description: "Please provide a reason to reject.", variant: "destructive" })
        return
      }
      rejectRequest({ id: req.id, level: 1, approvedBy: user.name, reason: comment.trim() })
      setComment("")
      setOpenReject(false)
      refresh()
      toast({ title: "Request Rejected", description: `Certificate request rejected.` })
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
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground mt-2">{"Here's what's happening in your church community today."}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.type === "member" ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inReviewRequests}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stats.type === "zone-leader" ? "Zone Members" : "Total Members"}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.type === "zone-leader" ? (stats as any).zoneMembers : stats.totalMembers}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalZones}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <Button variant={action.variant} size="sm" asChild>
                  <a href={action.href} className="inline-flex items-center">
                    Go
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificate Progress + Approval Queue */}
      {userRole === "member" && (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">My Certificate Progress</CardTitle>
                <CardDescription className="text-base">Track the status of your recent requests</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {myRecentRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No certificate requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start by requesting your first certificate</p>
                <Button className="mt-4" asChild>
                  <a href="/dashboard/certificates">Request Certificate</a>
                </Button>
              </div>
            ) : (
              myRecentRequests.map((req) => {
                const step = computeProgressStep(req)
                return (
                  <div key={req.id} className="rounded-xl border-2 border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{req.certificateType} Certificate</div>
                          <div className="text-sm text-muted-foreground">Request #{req.id.slice(0, 8)}</div>
                        </div>
                      </div>
                      <div>{statusBadge(req.status)}</div>
                    </div>
                    <RequestMeta req={req} />
                    <div className="mt-4">
                      <ProgressBar step={step} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}

      {userRole === "zone-leader" && (
        <Card className="border-2 border-primary/10 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">My Certificate Requests</CardTitle>
                  <CardDescription className="text-base">Requests from your zone and ones you've reviewed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {zoneRecentRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No relevant certificate requests</p>
                  <p className="text-sm text-muted-foreground mt-1">Requests will appear here when zone members submit them or after you review them</p>
                </div>
              ) : (
                zoneRecentRequests.map((req) => {
                  const step = computeProgressStep(req)
                  const isMyRequest = req.memberId === user?.id
                  const iApprovedThis = req.approvals.level1?.approvedBy === user?.name
                  const needsMyApproval = req.status === "pending" && canApproveLevel1
                  
                  return (
                    <div key={req.id} className="rounded-xl border-2 border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {req.memberName}
                              {isMyRequest && <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">My Request</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              requested {req.certificateType} certificate
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {statusBadge(req.status)}
                          {needsMyApproval && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              Needs Approval
                            </Badge>
                          )}
                          {iApprovedThis && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              You Approved
                            </Badge>
                          )}
                        </div>
                      </div>
                      <RequestMeta req={req} />
                      <div className="mt-4">
                        <ProgressBar step={step} />
                      </div>
                      {needsMyApproval && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Zone Leader Approval Required</span>
                            <ApproveRejectActions req={req} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
      )}

      {userRole === "pastor" && (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">My Certificate Requests</CardTitle>
                <CardDescription className="text-base">Requests needing your approval and ones you've reviewed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {pastorRelevantRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No relevant certificate requests</p>
                <p className="text-sm text-muted-foreground mt-1">Requests will appear here when they need your approval or after you review them</p>
              </div>
            ) : (
              pastorRelevantRequests.map((req) => {
                const step = computeProgressStep(req)
                const needsPastorApproval = req.status === "in-review" && req.approvals.level1 && !req.approvals.level2
                const isMyRequest = req.memberId === user?.id
                const iApprovedThis = req.approvals.level2?.approvedBy === user?.name
                
                return (
                  <div key={req.id} className="rounded-xl border-2 border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {req.memberName}
                            {isMyRequest && <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">My Request</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            requested {req.certificateType} certificate
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(req.status)}
                        {needsPastorApproval && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            Needs Approval
                          </Badge>
                        )}
                        {iApprovedThis && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            You Approved
                          </Badge>
                        )}
                      </div>
                    </div>
                    <RequestMeta req={req} />
                    <div className="mt-4">
                      <ProgressBar step={step} />
                    </div>
                    {needsPastorApproval && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Pastor Approval Required</span>
                                                     <div className="flex items-center gap-2">
                             <Button size="sm" variant="outline" onClick={() => handleViewRequest(req)}>
                               <Eye className="h-4 w-4 mr-1" />
                               View Details
                             </Button>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}

      {userRole === "parish-pastor" && (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">My Certificate Requests</CardTitle>
                <CardDescription className="text-base">Requests needing your final approval and ones you've reviewed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {parishPastorRelevantRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No relevant certificate requests</p>
                <p className="text-sm text-muted-foreground mt-1">Requests will appear here when they need your final approval or after you review them</p>
              </div>
            ) : (
              parishPastorRelevantRequests.map((req) => {
                const step = computeProgressStep(req)
                const needsParishPastorApproval = req.status === "in-review" && req.approvals.level2 && !req.approvals.level3
                const isMyRequest = req.memberId === user?.id
                const iApprovedThis = req.approvals.level3?.approvedBy === user?.name
                
                return (
                  <div key={req.id} className="rounded-xl border-2 border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {req.memberName}
                            {isMyRequest && <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">My Request</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            requested {req.certificateType} certificate
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(req.status)}
                        {needsParishPastorApproval && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            Final Approval
                          </Badge>
                        )}
                        {iApprovedThis && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            You Approved
                          </Badge>
                        )}
                      </div>
                    </div>
                    <RequestMeta req={req} />
                    <div className="mt-4">
                      <ProgressBar step={step} />
                    </div>
                    {needsParishPastorApproval && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Parish Pastor Approval Required</span>
                                                     <div className="flex items-center gap-2">
                             <Button size="sm" variant="outline" onClick={() => handleViewRequest(req)}>
                               <Eye className="h-4 w-4 mr-1" />
                               View Details
                             </Button>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}

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
