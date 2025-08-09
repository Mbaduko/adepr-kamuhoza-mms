import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getUserPermissions, mockCertificateRequests, mockMembers, mockZones } from '@/data/mockData';
import { 
  Users, 
  FileText, 
  MapPin, 
  Award, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state } = useAuth();
  
  if (!state.user) return null;

  const permissions = getUserPermissions(state.user.role);
  const userRole = state.user.role;

  // Calculate stats based on role
  const getStats = () => {
    const baseStats = {
      pendingRequests: mockCertificateRequests.filter(req => req.status === 'pending').length,
      approvedRequests: mockCertificateRequests.filter(req => req.status === 'approved').length,
      totalMembers: mockMembers.length,
      totalZones: mockZones.length,
    };

    if (userRole === 'member') {
      const userRequests = mockCertificateRequests.filter(req => req.memberId === state.user?.id);
      return {
        type: 'member' as const,
        myRequests: userRequests.length,
        approvedRequests: userRequests.filter(req => req.status === 'approved').length,
        pendingRequests: userRequests.filter(req => req.status === 'pending').length,
        inReviewRequests: userRequests.filter(req => req.status === 'in-review').length,
      };
    }

    if (userRole === 'zone-leader') {
      const zoneMembers = mockMembers.filter(member => member.zoneId === state.user?.zoneId);
      return {
        type: 'zone-leader' as const,
        zoneMembers: zoneMembers.length,
        pendingApprovals: mockCertificateRequests.filter(req => req.status === 'pending').length,
        ...baseStats,
      };
    }

    return {
      type: 'admin' as const,
      ...baseStats,
    };
  };

  const stats = getStats();

  const getQuickActions = () => {
    const actions = [];

    if (permissions.canRequestCertificate) {
      actions.push({
        title: 'Request Certificate',
        description: 'Submit a new certificate request',
        icon: Award,
        href: '/certificates/new',
        variant: 'default' as const,
      });
    }

    if (permissions.canViewZoneMembers) {
      actions.push({
        title: 'Manage Members',
        description: 'View and manage zone members',
        icon: Users,
        href: '/members',
        variant: 'outline' as const,
      });
    }

    if (permissions.canManageZones) {
      actions.push({
        title: 'Manage Zones',
        description: 'Create and assign zones',
        icon: MapPin,
        href: '/zones',
        variant: 'outline' as const,
      });
    }

    if (permissions.canViewStats) {
      actions.push({
        title: 'View Statistics',
        description: 'Church analytics and reports',
        icon: TrendingUp,
        href: '/statistics',
        variant: 'outline' as const,
      });
    }

    return actions;
  };

  const quickActions = getQuickActions();

  const getRecentActivity = () => {
    if (userRole === 'member') {
      return mockCertificateRequests
        .filter(req => req.memberId === state.user?.id)
        .slice(0, 3)
        .map(req => ({
          title: `${req.certificateType} Certificate`,
          description: `Status: ${req.status}`,
          time: new Date(req.requestDate).toLocaleDateString(),
          status: req.status,
        }));
    }

    return mockCertificateRequests
      .slice(0, 5)
      .map(req => ({
        title: `Certificate Request - ${req.memberName}`,
        description: `${req.certificateType} certificate`,
        time: new Date(req.requestDate).toLocaleDateString(),
        status: req.status,
      }));
  };

  const recentActivity = getRecentActivity();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'in-review': return <AlertCircle className="h-4 w-4 text-accent" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {state.user.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening in your church community today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.type === 'member' ? (
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
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-accent" />
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
                  {stats.type === 'zone-leader' ? 'Zone Members' : 'Total Members'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.type === 'zone-leader' ? stats.zoneMembers : stats.totalMembers}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
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
            <CardDescription>
              Common tasks for your role
            </CardDescription>
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
                  <a href={action.href}>Go</a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and requests
            </CardDescription>
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
    </div>
  );
};