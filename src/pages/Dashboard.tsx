"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useCertificatesStore } from "@/data/certificates-store"
import { useMembersStore } from "@/data/members-store"
import { useZonesStore } from "@/data/zones-store"
import {
  Users, 
  FileText, 
  MapPin, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  User, 
  RefreshCw,
  XCircle,
  Info
} from "lucide-react"

export const Dashboard: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = state.user
  const userRole = user?.role

  // Use stores
  const { 
    requests, 
    loading: certificatesLoading, 
    error: certificatesError,
    isInitialized: certificatesInitialized,
    fetchAllRequests 
  } = useCertificatesStore()
  
  const { 
    members, 
    loading: membersLoading, 
    error: membersError,
    isInitialized: membersInitialized,
    fetchAllMembers 
  } = useMembersStore()
  
  const { 
    zones, 
    loading: zonesLoading, 
    error: zonesError,
    isInitialized: zonesInitialized,
    fetchAllZones 
  } = useZonesStore()

  // Calculate stats - moved outside conditional
  const stats = React.useMemo(() => {
    const pendingRequests = requests.filter(req => req.status === "pending").length
    const approvedRequests = requests.filter(req => req.status === "approved").length
    const rejectedRequests = requests.filter(req => req.status === "rejected").length
    const inReviewRequests = requests.filter(req => req.status === "in-review").length

    if (userRole === "member") {
      const userRequests = requests.filter(req => req.memberId === user?.id)
      return {
        type: "member" as const,
        myRequests: userRequests.length,
        approvedRequests: userRequests.filter(req => req.status === "approved").length,
        rejectedRequests: userRequests.filter(req => req.status === "rejected").length,
        inReviewRequests: userRequests.filter(req => req.status === "in-review").length,
      }
    }

    return {
      type: "admin" as const,
      totalMembers: members.length,
      totalZones: zones.length,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      inReviewRequests,
    }
  }, [requests, members, zones, user?.id, userRole])

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllRequests(),
          fetchAllMembers(),
          fetchAllZones()
        ])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Don't show error toast as endpoints might not be ready
      }
    }

    loadData()
  }, [fetchAllRequests, fetchAllMembers, fetchAllZones])

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchAllRequests(),
        fetchAllMembers(),
        fetchAllZones()
      ])
      toast({
        title: "Success",
        description: "Dashboard data refreshed successfully.",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "error"
      })
    }
  }

  if (!user) return null

  const getQuickActions = () => {
    const actions: {
      title: string
      description: string
      icon: React.ComponentType<{ className?: string }>
      href: string
      variant: "default" | "outline"
    }[] = []

    if (userRole === "member") {
      actions.push({
        title: "Request Certificate",
        description: "Submit a new certificate request",
        icon: Award,
        href: "/certificates",
        variant: "default",
      })
    }

    if (userRole === "zone-leader" || userRole === "pastor" || userRole === "parish-pastor") {
      actions.push({
        title: "Manage Members",
        description: "View and manage members",
        icon: Users,
        href: "/members",
        variant: "outline",
      })
    }

    if (userRole === "pastor" || userRole === "parish-pastor") {
      actions.push({
        title: "Manage Zones",
        description: "Create and assign zones",
        icon: MapPin,
        href: "/zones",
        variant: "outline",
      })
    }

      actions.push({
      title: "Certificate Requests",
      description: "View and manage certificate requests",
        icon: FileText,
      href: "/certificates",
        variant: "outline",
      })

    actions.push({
      title: "My Profile",
      description: "View and update your profile information",
      icon: User,
      href: "/dashboard/profile",
      variant: "outline",
    })

    return actions
  }

  const quickActions = getQuickActions()

  const getRecentActivity = () => {
    if (userRole === "member") {
      return requests
        .filter(req => req.memberId === user.id)
        .slice(0, 3)
        .map(req => ({
          title: `${req.certificateType} Certificate`,
          description: `Status: ${req.status}`,
          time: new Date(req.requestDate).toLocaleDateString(),
          status: req.status,
        }))
    }

    return requests.slice(0, 5).map(req => ({
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
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const isLoading = certificatesLoading || membersLoading || zonesLoading
  const hasError = certificatesError || membersError || zonesError
  const isInitialized = certificatesInitialized && membersInitialized && zonesInitialized

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h1>
            <Badge variant="outline" className="text-sm">
              {user.role.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">Here's what's happening in your church community today.</p>
          {user.choir && (
            <p className="text-sm text-muted-foreground mt-1">Choir: {user.choir}</p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {certificatesError || membersError || zonesError}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status Info */}
      {isInitialized && !isLoading && !hasError && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                All services are connected and ready
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejectedRequests}</div>
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
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
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
                <Button 
                  variant={action.variant} 
                  size="sm" 
                  onClick={() => navigate(action.href)}
                  className="inline-flex items-center"
                >
                  Go
                  <ChevronRight className="ml-1 h-4 w-4" />
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
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-1">Activity will appear here as you use the system</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Services Not Ready */}
      {isInitialized && !isLoading && !hasError && stats.totalMembers === 0 && stats.totalZones === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Services are connected but no data is available yet. This is normal when the system is first set up.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
