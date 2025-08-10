import { mockCertificateRequests, mockMembers, type CertificateRequest } from "@/data/mockData"

const STORAGE_KEY = "certificates:requests:v1"

function readStore(): CertificateRequest[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    // seed on first run
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCertificateRequests))
    return [...mockCertificateRequests]
  }
  try {
    const parsed = JSON.parse(raw) as CertificateRequest[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(data: CertificateRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function listAll(): CertificateRequest[] {
  const rows = readStore()
  return rows.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
}

export function listByMemberId(memberId: string): CertificateRequest[] {
  return listAll().filter((r) => r.memberId === memberId)
}

export type NewRequestInput = {
  memberId: string
  memberName: string
  certificateType: CertificateRequest["certificateType"]
  purpose: string
}

export function createRequest(input: NewRequestInput): CertificateRequest {
  const rows = readStore()
  const id = `cert-${Date.now()}`
  const newReq: CertificateRequest = {
    id,
    memberId: input.memberId,
    memberName: input.memberName,
    certificateType: input.certificateType,
    purpose: input.purpose,
    requestDate: new Date().toISOString(),
    status: "pending",
    approvals: {},
  }
  rows.unshift(newReq)
  writeStore(rows)
  return newReq
}

type Level = 1 | 2 | 3

export function approveRequest(opts: { id: string; level: Level; approvedBy: string; comments?: string }) {
  const rows = readStore()
  const idx = rows.findIndex((r) => r.id === opts.id)
  if (idx === -1) return
  const now = new Date().toISOString()
  const row = rows[idx]

  if (opts.level === 1) {
    row.approvals.level1 = { approvedBy: opts.approvedBy, date: now, comments: opts.comments }
    // move to in-review (pastor review)
    row.status = "in-review"
  } else if (opts.level === 2) {
    row.approvals.level2 = { approvedBy: opts.approvedBy, date: now, comments: opts.comments }
    // still in-review awaiting parish pastor
    row.status = "in-review"
  } else if (opts.level === 3) {
    row.approvals.level3 = { approvedBy: opts.approvedBy, date: now, comments: opts.comments }
    row.status = "approved"
  }

  rows[idx] = row
  writeStore(rows)
}

export function rejectRequest(opts: { id: string; level: Level; approvedBy: string; reason: string }) {
  const rows = readStore()
  const idx = rows.findIndex((r) => r.id === opts.id)
  if (idx === -1) return
  const row = rows[idx]
  row.status = "rejected"
  row.rejectionReason = opts.reason
  // keep the approver level noted (optional)
  const now = new Date().toISOString()
  if (opts.level === 1) {
    row.approvals.level1 = { approvedBy: opts.approvedBy, date: now, comments: `Rejected: ${opts.reason}` }
  } else if (opts.level === 2) {
    row.approvals.level2 = { approvedBy: opts.approvedBy, date: now, comments: `Rejected: ${opts.reason}` }
  } else if (opts.level === 3) {
    row.approvals.level3 = { approvedBy: opts.approvedBy, date: now, comments: `Rejected: ${opts.reason}` }
  }
  rows[idx] = row
  writeStore(rows)
}

export function getMemberZoneId(memberId: string): string | undefined {
  const m = mockMembers.find((mm) => mm.id === memberId)
  return m?.zoneId
}

// Helpers for approval queues
export function listPendingLevel1ForZone(zoneId: string): CertificateRequest[] {
  return listAll().filter((r) => {
    if (r.status === "rejected" || r.status === "approved") return false
    const memberZone = getMemberZoneId(r.memberId)
    return !r.approvals.level1 && memberZone === zoneId
  })
}

export function listPendingLevel2(): CertificateRequest[] {
  return listAll().filter((r) => {
    if (r.status === "rejected" || r.status === "approved") return false
    return !!r.approvals.level1 && !r.approvals.level2
  })
}

export function listPendingLevel3(): CertificateRequest[] {
  return listAll().filter((r) => {
    if (r.status === "rejected" || r.status === "approved") return false
    return !!r.approvals.level1 && !!r.approvals.level2 && !r.approvals.level3
  })
}

export function summarize(requests: CertificateRequest[]) {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inReview: requests.filter((r) => r.status === "in-review").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    byType: {
      baptism: requests.filter((r) => r.certificateType === "baptism").length,
      confirmation: requests.filter((r) => r.certificateType === "confirmation").length,
      marriage: requests.filter((r) => r.certificateType === "marriage").length,
      membership: requests.filter((r) => r.certificateType === "membership").length,
    },
  }
}

