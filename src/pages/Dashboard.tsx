"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, mockMembers, mockZones, type CertificateRequest } from "@/data/mockData"
import {
  listAll,
  listByMemberId,
  listPendingLevel1ForZone,
  approveRequest,
  rejectRequest,
  getMemberZoneId,
} from "@/data/certificates-store"
import { Users, FileText, MapPin, Award, TrendingUp, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react"

type ProgressStep = 0 | 1 | 2 | 3
// 0 = Submitted, 1 = Level 1 approved, 2 = Level 2 approved, 3 = Final approved

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
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>Submitted</span>
        <span>Zone Leader</span>
        <span>Pastor</span>
        <span>Final</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
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
  const user = state.user
  const userRole = user?.role

  const [requests, setRequests] = React.useState<CertificateRequest[]>([])
  const [pendingL1, setPendingL1] = React.useState<CertificateRequest[]>([])
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const permissions = React.useMemo(() => (user ? getUserPermissions(user.role) : ({} as any)), [user])

  const refresh = React.useCallback(() => {
    const all = listAll()
    setRequests(all)

    if (user?.role === "zone-leader" && user.zoneId) {
      setPendingL1(listPendingLevel1ForZone(user.zoneId))
    } else {
      setPendingL1([])
    }
  }, [user])

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
        pendingApprovals: user.zoneId ? listPendingLevel1ForZone(user.zoneId).length : 0,
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

  // Data sets for the new sections
  const myRecentRequests = userRole === "member" ? listByMemberId(user.id).slice(0, 5) : []

  const zoneRecentRequests =
    userRole === "zone-leader" && user.zoneId
      ? listAll()
          .filter((r) => getMemberZoneId(r.memberId) === user.zoneId)
          .slice(0, 5)
      : []

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
    } finally {
      setBusyId(null)
    }
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
        <Card>
          <CardHeader>
            <CardTitle>My Certificate Progress</CardTitle>
            <CardDescription>Track the status of your recent requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRecentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              myRecentRequests.map((req) => {
                const step = computeProgressStep(req)
                return (
                  <div key={req.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{req.certificateType} Certificate</div>
                      <div>{statusBadge(req.status)}</div>
                    </div>
                    <RequestMeta req={req} />
                    <div className="mt-3">
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
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Zone Requests</CardTitle>
              <CardDescription>Latest certificate requests from your zone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {zoneRecentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent requests in your zone.</p>
              ) : (
                zoneRecentRequests.map((req) => {
                  const step = computeProgressStep(req)
                  return (
                    <div key={req.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">
                          <span className="font-medium">{req.memberName}</span>{" "}
                          <span className="text-muted-foreground">requested {req.certificateType} certificate</span>
                        </div>
                        <div>{statusBadge(req.status)}</div>
                      </div>
                      <RequestMeta req={req} />
                      <div className="mt-3">
                        <ProgressBar step={step} />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {canApproveLevel1 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Level 1 approvals awaiting your action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingL1.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No certificates need approval right now.</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableCaption>Level 1 approvals in your zone</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingL1.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.memberName}</TableCell>
                            <TableCell className="capitalize">{req.certificateType}</TableCell>
                            <TableCell>{new Date(req.requestDate).toLocaleDateString()}</TableCell>
                            <TableCell>{statusBadge(req.status)}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === req.id}
                                onClick={() => handleReject(req.id)}
                              >
                                {busyId === req.id ? "..." : "Reject"}
                              </Button>
                              <Button size="sm" disabled={busyId === req.id} onClick={() => handleApprove(req.id)}>
                                {busyId === req.id ? "..." : "Approve"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
