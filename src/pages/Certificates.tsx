"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, type CertificateRequest } from "@/data/mockData"
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
} from "lucide-react"

type CertType = CertificateRequest["certificateType"]

function StatusBadge({ status }: { status: CertificateRequest["status"] }) {
  const map: Record<
    CertificateRequest["status"],
    { label: string; className: string; variant?: "secondary" | "destructive" | "default" | "outline" }
  > = {
    pending: { label: "Pending (Level 1)", className: "bg-warning text-warning-foreground", variant: "secondary" },
    "in-review": { label: "In Review", className: "bg-accent text-accent-foreground", variant: "secondary" },
    approved: { label: "Approved", className: "bg-success text-success-foreground", variant: "secondary" },
    rejected: { label: "Rejected", className: "", variant: "destructive" },
  }
  const cfg = map[status]
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

function RequestDetails({ req }: { req: CertificateRequest }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <div className="text-sm text-muted-foreground">Member</div>
          <div className="font-medium">{req.memberName}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Requested</div>
          <div className="font-medium">{new Date(req.requestDate).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Type</div>
          <div className="font-medium capitalize">{req.certificateType}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="font-medium">
            <StatusBadge status={req.status} />
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Purpose</div>
        <div className="mt-1">{req.purpose}</div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Approvals Timeline</div>
        <div className="space-y-3">
          <div className="p-3 rounded border">
            <div className="font-medium">Level 1 - Zone Leader</div>
            {req.approvals.level1 ? (
              <div className="text-sm text-muted-foreground">
                Approved by {req.approvals.level1.approvedBy} on {new Date(req.approvals.level1.date).toLocaleString()}
                {req.approvals.level1.comments ? <div className="mt-1">{req.approvals.level1.comments}</div> : null}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Pending</div>
            )}
          </div>
          <div className="p-3 rounded border">
            <div className="font-medium">Level 2 - Pastor</div>
            {req.approvals.level2 ? (
              <div className="text-sm text-muted-foreground">
                Approved by {req.approvals.level2.approvedBy} on {new Date(req.approvals.level2.date).toLocaleString()}
                {req.approvals.level2.comments ? <div className="mt-1">{req.approvals.level2.comments}</div> : null}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Pending</div>
            )}
          </div>
          <div className="p-3 rounded border">
            <div className="font-medium">Level 3 - Parish Pastor (Final)</div>
            {req.approvals.level3 ? (
              <div className="text-sm text-muted-foreground">
                Approved by {req.approvals.level3.approvedBy} on {new Date(req.approvals.level3.date).toLocaleString()}
                {req.approvals.level3.comments ? <div className="mt-1">{req.approvals.level3.comments}</div> : null}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Pending</div>
            )}
          </div>
          {req.rejectionReason ? (
            <div className="p-3 rounded border border-destructive/50 bg-destructive/5">
              <div className="font-medium text-destructive">Rejection Reason</div>
              <div className="text-sm text-muted-foreground">{req.rejectionReason}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const DetailsButton: React.FC<{ req: CertificateRequest }> = ({ req }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1 bg-transparent">
          <Eye className="h-4 w-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>ID: {req.id}</DialogDescription>
        </DialogHeader>
        <RequestDetails req={req} />
      </DialogContent>
    </Dialog>
  )
}

// Visual stepper for approvals
function detectRejectedLevel(req: CertificateRequest): 1 | 2 | 3 | null {
  if (req.status !== "rejected") return null
  const isRej = (c?: string) => (c || "").toLowerCase().startsWith("rejected")
  if (req.approvals.level3 && isRej(req.approvals.level3.comments)) return 3
  if (req.approvals.level2 && isRej(req.approvals.level2.comments)) return 2
  if (req.approvals.level1 && isRej(req.approvals.level1.comments)) return 1
  // fallback: infer by which level not yet approved
  if (!req.approvals.level1) return 1
  if (!req.approvals.level2) return 2
  return 3
}

const StepIcon: React.FC<{ state: "done" | "current" | "pending" | "rejected"; icon: React.ReactNode }> = ({
  state,
  icon,
}) => {
  if (state === "done") {
    return (
      <div className="h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center">
        <Check className="h-4 w-4" />
      </div>
    )
  }
  if (state === "rejected") {
    return (
      <div className="h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
        <XCircle className="h-4 w-4" />
      </div>
    )
  }
  if (state === "current") {
    return (
      <div className="h-8 w-8 rounded-full border-2 border-primary text-primary flex items-center justify-center">
        {icon}
      </div>
    )
  }
  return (
    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">{icon}</div>
  )
}

const RequestProgress: React.FC<{ req: CertificateRequest }> = ({ req }) => {
  const rejectedAt = detectRejectedLevel(req)
  const steps = [
    {
      key: 1 as const,
      label: "Level 1",
      sub: "Zone Leader",
      done: !!req.approvals.level1,
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      key: 2 as const,
      label: "Level 2",
      sub: "Pastor",
      done: !!req.approvals.level2,
      icon: <Crown className="h-4 w-4" />,
    },
    {
      key: 3 as const,
      label: "Level 3",
      sub: "Parish Pastor",
      done: !!req.approvals.level3 || req.status === "approved",
      icon: <Shield className="h-4 w-4" />,
    },
  ]

  // Determine state per step
  const states = steps.map((s, idx) => {
    if (rejectedAt && s.key === rejectedAt) return "rejected" as const
    if (s.done) return "done" as const
    const allPrevDone = steps.slice(0, idx).every((p) => p.done)
    return allPrevDone && !rejectedAt ? ("current" as const) : ("pending" as const)
  })

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const state = states[i]
        const nextState = states[i + 1]
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <StepIcon state={state} icon={s.icon} />
              <div className="mt-1 text-[10px] leading-tight text-center">
                <div className="font-medium">{s.label}</div>
                <div className="text-muted-foreground">{s.sub}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "h-0.5 w-10 md:w-16 rounded",
                  state === "rejected" || nextState === "rejected"
                    ? "bg-destructive"
                    : state === "done"
                      ? "bg-success"
                      : "bg-muted",
                ].join(" ")}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const RequestCard: React.FC<{ req: CertificateRequest }> = ({ req }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base capitalize">{req.certificateType} Certificate</CardTitle>
            <CardDescription className="text-xs">
              Requested on {new Date(req.requestDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <StatusBadge status={req.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="text-sm">
          <div className="text-muted-foreground mb-1">Purpose</div>
          <div className="line-clamp-3">{req.purpose}</div>
        </div>

        <div className="pt-2">
          <RequestProgress req={req} />
        </div>

        <div className="pt-3">
          <DetailsButton req={req} />
        </div>
      </CardContent>
    </Card>
  )
}

const RequestsTable: React.FC<{
  rows: CertificateRequest[]
  renderActions: (req: CertificateRequest) => React.ReactNode
}> = ({ rows, renderActions }) => {
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
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No requests found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell>{r.memberName}</TableCell>
                <TableCell className="capitalize">{r.certificateType}</TableCell>
                <TableCell className="max-w-[320px] truncate" title={r.purpose}>
                  {r.purpose}
                </TableCell>
                <TableCell className="whitespace-nowrap">{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-right">{renderActions(r)}</TableCell>
              </TableRow>
            ))
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

  // New request form
  const [certType, setCertType] = React.useState<CertType>("baptism")
  const [purpose, setPurpose] = React.useState("")

  const canRequest = user.role === "member" || user.role === "zone-leader"
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

        {/* View details */}
        <DetailsButton req={req} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificate Requests</h1>
          <p className="text-muted-foreground">
            Request certificates and track approvals. Approvers can review and action pending requests.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* My/Relevant stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.total : globalSummary.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.pending : globalSummary.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.inReview : globalSummary.inReview}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.role === "member" || user.role === "zone-leader" ? mySummary.approved : globalSummary.approved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request form (Member & Zone Leader) */}
      {canRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              New Certificate Request
            </CardTitle>
            <CardDescription>Submit a request for your official church certificate.</CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="md:col-span-2 space-y-2">
                <Label>Purpose</Label>
                <Textarea
                  placeholder="Describe the purpose for this certificate..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="my">
        <TabsList className="mb-4">
          <TabsTrigger value="my">My Requests</TabsTrigger>
          {(canApproveL1 || canApproveL2 || canApproveL3) && (
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          )}
          {user.role !== "member" && <TabsTrigger value="all">All Requests</TabsTrigger>}
        </TabsList>

        {/* My Requests */}
        <TabsContent value="my">
          {user.role === "member" || user.role === "zone-leader" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {my.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No requests yet</CardTitle>
                    <CardDescription>Submit a new certificate request to get started.</CardDescription>
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
                    <CardTitle>Level 3 Approvals (Parish Pastor - Final)</CardTitle>
                    <CardDescription>Requests awaiting final approval.</CardDescription>
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
    </div>
  )
}
