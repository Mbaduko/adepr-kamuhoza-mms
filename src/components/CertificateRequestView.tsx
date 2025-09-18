"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, type CertificateRequest } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Crown,
  Shield,
  CheckSquare,
  FileCheck
} from "lucide-react"

type ProgressStep = 0 | 1 | 2 | 3

function computeProgressStep(req: CertificateRequest): ProgressStep {
  console.log("Computing progress step for request:", req);
  if (req.status === "rejected") return 0
  if (req.status === "approved") return 3
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
    case "approved_l1":
      return <Badge className="bg-amber-500 text-white border-amber-500">Approved L1</Badge>
    case "approved_l2":
      return <Badge className="bg-blue-600 text-white border-blue-600">Approved L2</Badge>
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
    { name: "Zone Leader", icon: Crown },
    { name: "Pastor", icon: Shield },
    { name: "Parish Pastor", icon: CheckSquare }
  ]
  
  return (
    <div className="w-full space-y-3">
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
      
      <div className="relative">
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out shadow-sm" 
            style={{ width: `${pct}%` }} 
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-primary-foreground bg-primary px-2 py-1 rounded-full shadow-sm">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  )
}

interface CertificateRequestViewProps {
  request: CertificateRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove?: (requestId: string, level: number, comment?: string) => void
  onReject?: (requestId: string, level: number, reason: string) => void
  showActions?: boolean
}

export const CertificateRequestView: React.FC<CertificateRequestViewProps> = ({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  showActions = true
}) => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user!
  const permissions = getUserPermissions(user.role)

  const [approveDialog, setApproveDialog] = React.useState(false)
  const [rejectDialog, setRejectDialog] = React.useState(false)
  const [comment, setComment] = React.useState("")

  const step = computeProgressStep(request)
  
  // Determine what actions the current user can take (based on approvals timeline)
  const isFinalized = request.status === "approved" || request.status === "rejected"
  const canApproveLevel1 = user.role === "zone-leader" && !request.approvals.level1 && !isFinalized
  const canApproveLevel2 = user.role === "pastor" && !!request.approvals.level1 && !request.approvals.level2 && !isFinalized
  const canApproveLevel3 = user.role === "parish-pastor" && !!request.approvals.level2 && !request.approvals.level3 && !isFinalized
  
  const canTakeAction = canApproveLevel1 || canApproveLevel2 || canApproveLevel3
  const currentLevel = canApproveLevel1 ? 1 : canApproveLevel2 ? 2 : canApproveLevel3 ? 3 : 0

  const handleApprove = () => {
    onApprove?.(request.id, currentLevel, comment.trim())
    setComment("")
    setApproveDialog(false)
  }

  const handleReject = () => {
    if (!comment.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for rejection.", variant: "error" })
      return
    }
    
    onReject?.(request.id, currentLevel, comment.trim())
    setComment("")
    setRejectDialog(false)
  }

  const getActionRequiredText = () => {
    if (canApproveLevel1) return "Zone Leader Approval Required"
    if (canApproveLevel2) return "Pastor Approval Required"
    if (canApproveLevel3) return "Parish Pastor Approval Required"
    return ""
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Certificate Request Details
            </DialogTitle>
            <DialogDescription>
              {request.certificateType} certificate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header with status and progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{request.memberName}</h3>
                  <p className="text-muted-foreground">Requested {request.certificateType} certificate</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(request.status)}
                {canTakeAction && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    Action Required
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar step={step} />
              </CardContent>
            </Card>

            {/* Request Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Certificate Type</Label>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{request.certificateType}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Purpose</Label>
                    <div className="text-sm">{request.purpose || "No purpose specified"}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Date</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approval History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.approvals.level1 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Zone Leader Approved</div>
                        <div className="text-xs text-muted-foreground">
                          by {request.approvals.level1.by} on {new Date(request.approvals.level1.doneAt).toLocaleDateString()}
                        </div>
                        {request.approvals.level1.comment && (
                          <div className="text-xs text-muted-foreground mt-1">
                            "{request.approvals.level1.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {request.approvals.level2 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Pastor Approved</div>
                        <div className="text-xs text-muted-foreground">
                          by {request.approvals.level2.by} on {new Date(request.approvals.level2.doneAt).toLocaleDateString()}
                        </div>
                        {request.approvals.level2.comment && (
                          <div className="text-xs text-muted-foreground mt-1">
                            "{request.approvals.level2.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {request.approvals.level3 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Parish Pastor Approved</div>
                        <div className="text-xs text-muted-foreground">
                          by {request.approvals.level3.by} on {new Date(request.approvals.level3.doneAt).toLocaleDateString()}
                        </div>
                        {request.approvals.level3.comment && (
                          <div className="text-xs text-muted-foreground mt-1">
                            "{request.approvals.level3.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {request.status === "rejected" && request.rejectionReason && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg border-red-200 bg-red-50">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-red-800">Request Rejected</div>
                        <div className="text-xs text-red-600 mt-1">
                          Reason: {request.rejectionReason}
                        </div>
                      </div>
                    </div>
                  )}

                  {!request.approvals.level1 && !request.approvals.level2 && !request.approvals.level3 && request.status !== "rejected" && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No approvals yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Required Section */}
            {showActions && canTakeAction && (
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {getActionRequiredText()}
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    This request requires your approval to proceed to the next level.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => setApproveDialog(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => setRejectDialog(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Please provide a comment for this approval (optional but recommended).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approve-comment">Comment</Label>
              <Textarea
                id="approve-comment"
                placeholder="Enter your approval comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for Rejection *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejection..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
