import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { useCertificatesStore } from "@/data/certificates-store";
import { useMembersStore } from "@/data/members-store";
import { usePastorsStore } from "@/data/pastors-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0ea5e9", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#f97316"]; 

export const Statistics: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const { toast } = useToast();

  const {
    requests,
    loading: certsLoading,
    isInitialized: certsInit,
    fetchAllRequests,
  } = useCertificatesStore();

  const {
    members,
    totalMembers,
    zones,
    loading: membersLoading,
    isInitialized: membersInit,
    fetchAllMembers,
  } = useMembersStore();

  const {
    pastors,
    totalPastors,
    loading: pastorsLoading,
    isInitialized: pastorsInit,
    fetchAllPastors,
  } = usePastorsStore();

  React.useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchAllRequests?.(),
          fetchAllMembers?.(),
          fetchAllPastors?.(),
        ]);
      } catch (e) {
        // no-op
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchAllRequests?.(),
        fetchAllMembers?.(),
        fetchAllPastors?.(),
      ]);
      toast({ title: "Refreshed", description: "Statistics updated", variant: "success" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to refresh statistics", variant: "error" });
    }
  };

  // Aggregations
  const certByStatus = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const isFinalApproved = (r: any) => r.status === 'approved' || r.status === 'approved_final' || !!r.approvals?.level3;
    const normalizeStatus = (r: any) => {
      if (r.status === 'rejected') return 'rejected';
      if (isFinalApproved(r)) return 'approved';
      if (r.status === 'pending' && !r.approvals?.level1 && !r.approvals?.level2 && !r.approvals?.level3) return 'pending';
      return 'in-review';
    }
    for (const r of requests) {
      const key = normalizeStatus(r);
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [requests]);

  const certByType = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of requests) {
      counts[r.certificateType] = (counts[r.certificateType] || 0) + 1;
    }
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [requests]);

  const certsOverTime = React.useMemo(() => {
    const byMonth: Record<string, number> = {};
    for (const r of requests) {
      const d = new Date(r.requestDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, count]) => ({ month, count }));
  }, [requests]);

  const genderBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      const g = (m.gender || "UNKNOWN").toUpperCase();
      counts[g] = (counts[g] || 0) + 1;
    }
    return Object.entries(counts).map(([gender, count]) => ({ gender, count }));
  }, [members]);

  const membersByStatus = React.useMemo(() => {
    const active = members.filter(m => (m.accountStatus || '').toString().toUpperCase() === 'ACTIVE').length;
    const inactive = (members?.length || 0) - active;
    return [
      { status: 'ACTIVE', count: active },
      { status: 'INACTIVE', count: inactive },
    ];
  }, [members]);

  const zoneIdToName = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const z of zones || []) {
      map[z.id] = z.name;
    }
    return map;
  }, [zones]);

  const membersByZone = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      const key = m.zoneId || "UNKNOWN";
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).map(([zoneId, count]) => ({ zone: zoneIdToName[zoneId] || zoneId, count }));
  }, [members, zoneIdToName]);

  const membersByMarital = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      const ms = (m.maritalStatus || "UNKNOWN").toUpperCase();
      counts[ms] = (counts[ms] || 0) + 1;
    }
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [members]);

  // Pastors aggregations
  const pastorsByStatus = React.useMemo(() => {
    const active = (pastors || []).filter(p => (p.account_status || '').toString().toUpperCase() === 'ACTIVE').length;
    const inactive = (pastors?.length || 0) - active;
    return [
      { status: 'ACTIVE', count: active },
      { status: 'INACTIVE', count: inactive },
    ];
  }, [pastors]);

  const pastorsByVerification = React.useMemo(() => {
    const verified = (pastors || []).filter(p => !!p.is_verified).length;
    const unverified = (pastors?.length || 0) - verified;
    return [
      { status: 'Verified', count: verified },
      { status: 'Unverified', count: unverified },
    ];
  }, [pastors]);

  const isParishPastor = user?.role === "parish-pastor" || user?.role === "PARISH_PASTOR";

  const [activeSection, setActiveSection] = React.useState<"certificates" | "members" | "pastors">("certificates");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Statistics</h2>
          <p className="text-muted-foreground">Overview of certificates and members{isParishPastor ? ", plus pastors" : ""}.</p>
        </div>
        <Button onClick={handleRefresh} disabled={certsLoading || membersLoading || pastorsLoading}>Refresh</Button>
      </div>

      {/* Section Navigator */}
      <div className="flex items-center gap-2">
        <Button
          variant={activeSection === "certificates" ? "default" : "outline"}
          onClick={() => setActiveSection("certificates")}
        >
          Certificates
        </Button>
        <Button
          variant={activeSection === "members" ? "default" : "outline"}
          onClick={() => setActiveSection("members")}
        >
          Members
        </Button>
        {isParishPastor && (
          <Button
            variant={activeSection === "pastors" ? "default" : "outline"}
            onClick={() => setActiveSection("pastors")}
          >
            Pastors
          </Button>
        )}
      </div>

      {/* Certificates Section */}
      {activeSection === "certificates" && (
      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between flex-wrap gap-2">
            <h3 className="text-xl font-semibold">Certificates</h3>
            <Badge variant="secondary" className="text-sm">Total: {requests.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Requests and trends</p>
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>By Status</CardTitle>
              <CardDescription>Pending, In review, Approved, Rejected</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={certByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Requests" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>By Type</CardTitle>
              <CardDescription>Baptism, Recommendation, Marriage, Membership</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="count" data={certByType} nameKey="type" outerRadius={80} label>
                    {certByType.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Requests over Time</CardTitle>
            <CardDescription>Monthly totals</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={certsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Requests" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Members Section */}
      {activeSection === "members" && (
      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between flex-wrap gap-2">
            <h3 className="text-xl font-semibold">Members</h3>
            <Badge variant="secondary" className="text-sm">Total: {totalMembers || members.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Population and breakdown</p>
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>By Gender</CardTitle>
              <CardDescription>Breakdown</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gender" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Members" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By Status</CardTitle>
              <CardDescription>Account status</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Members" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>By Zone</CardTitle>
              <CardDescription>Distribution across zones</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersByZone}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Members" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By Marital Status</CardTitle>
              <CardDescription>Single, Married, etc.</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersByMarital}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Members" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Pastors Section */}
      {isParishPastor && activeSection === "pastors" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-end justify-between flex-wrap gap-2">
              <h3 className="text-xl font-semibold">Pastors</h3>
              <Badge variant="secondary" className="text-sm">Total: {pastors.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Parish-wide overview</p>
          </div>
          <Separator />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By Status</CardTitle>
                <CardDescription>Active vs Inactive</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pastorsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Pastors" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
                <CardDescription>Email verification</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="count" data={pastorsByVerification} nameKey="status" outerRadius={80} label>
                      {pastorsByVerification.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={idx === 0 ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;


