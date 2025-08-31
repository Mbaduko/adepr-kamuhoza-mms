"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { useMembersStore } from "@/data/members-store"
import { useZonesStore } from "@/data/zones-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import {
  Users,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  Award,
  Crown,
  Settings,
  RefreshCw,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Info,
  UserPlus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Pastors: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = state.user!

  // Use stores
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

  // State
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [zoneFilter, setZoneFilter] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("name")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllMembers(),
          fetchAllZones
        ])
      } catch (error) {
        console.error('Failed to load pastors data:', error)
        // Don't show error toast as endpoints might not be ready
      }
    }

    loadData()
  }, [fetchAllMembers, fetchAllZones])

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchAllMembers(),
        fetchAllZones
      ])
      toast({
        title: "Success",
        description: "Pastors data refreshed successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Filter pastors (members with pastor roles)
  const pastors = React.useMemo(() => {
    // For now, we'll show all members since the API doesn't have role field yet
    // In a real implementation, this would filter by role
    return members
  }, [members])

  // Filter and sort pastors
  const filteredPastors = React.useMemo(() => {
    let filtered = pastors

    if (searchTerm) {
      filtered = filtered.filter(pastor =>
        pastor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pastor.zoneId && getZoneName(pastor.zoneId).toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(pastor => pastor.accountStatus === statusFilter)
    }

    if (zoneFilter !== "all") {
      filtered = filtered.filter(pastor => pastor.zoneId === zoneFilter)
    }

    // Sort pastors
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [pastors, searchTerm, statusFilter, zoneFilter, sortBy, sortOrder])

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      total: pastors.length,
      active: pastors.filter(p => p.accountStatus === "active").length,
      inactive: pastors.filter(p => p.accountStatus === "inactive").length,
      totalMembers: members.length,
      totalZones: zones.length,
      avgMembersPerPastor: pastors.length > 0 ? Math.round(members.length / pastors.length) : 0,
      fullTime: pastors.length, // Assuming all are full-time for now
      partTime: 0 // No part-time data in current schema
    }
  }, [pastors, members, zones])

  const isLoading = membersLoading || zonesLoading
  const hasError = membersError || zonesError
  const isInitialized = membersInitialized && zonesInitialized

  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId)
    return zone?.name || "Unknown Zone"
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800"
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.inactive}>
        {status}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      pastor: "bg-blue-100 text-blue-800",
      "parish-pastor": "bg-purple-100 text-purple-800"
    }
    return (
      <Badge className={variants[role as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {role === "parish-pastor" ? "Parish Pastor" : "Pastor"}
      </Badge>
    )
  }

  // Check if user is parish pastor
  if (user.role !== "parish-pastor") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Only parish pastors can access the pastors management page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pastors Management</h1>
          <p className="text-muted-foreground">
            Manage all pastors in the parish and view their performance metrics.
          </p>
        </div>

          <div className="flex items-center gap-2">
            <Button
            variant="outline" 
              size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
            </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Pastor
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {membersError || zonesError}
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
                Pastor and zone services are connected and ready
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pastors</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In the parish</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently serving</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Not active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Under care</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalZones}</div>
            <p className="text-xs text-muted-foreground">Managed zones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Members/Pastor</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMembersPerPastor}</div>
            <p className="text-xs text-muted-foreground">Per pastor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Full-time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fullTime}</div>
            <p className="text-xs text-muted-foreground">Dedicated staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Part-time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.partTime}</div>
            <p className="text-xs text-muted-foreground">Part-time staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                  id="search"
                placeholder="Search pastors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="joinDate">Join Date</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="gap-2 w-full"
            >
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setZoneFilter("all")
              setSortBy("name")
              setSortOrder("asc")
                }}
                className="w-full"
              >
              Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Pastors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Pastors ({filteredPastors.length})</CardTitle>
              <CardDescription>Manage and view all pastors in the parish</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Pastor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Zone</TableHead>
                  <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredPastors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all" || zoneFilter !== "all" 
                            ? "No pastors match your filters." 
                            : "No pastors found."}
                        </p>
                      </div>
                  </TableCell>
                  </TableRow>
                ) : (
                  filteredPastors.map((pastor) => (
                    <TableRow key={pastor.id}>
                  <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={pastor.profileImage} />
                            <AvatarFallback>{getInitials(pastor.name)}</AvatarFallback>
                          </Avatar>
                    <div>
                            <p className="font-medium">{pastor.name}</p>
                            <p className="text-sm text-muted-foreground">{pastor.email}</p>
                          </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {pastor.email}
                      </div>
                          {pastor.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {pastor.phone}
                      </div>
                          )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                          {pastor.zoneId ? getZoneName(pastor.zoneId) : "Unassigned"}
                    </div>
                  </TableCell>
                  <TableCell>
                        {getRoleBadge("member")} {/* Using member as default since role field doesn't exist yet */}
                  </TableCell>
                  <TableCell>
                        {getStatusBadge(pastor.accountStatus)}
                  </TableCell>
                  <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          N/A {/* joinDate not available in current schema */}
                    </div>
                  </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                      </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Pastor
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Zone
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Pastor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                  </TableCell>
                </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
                  <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading pastors data...</span>
            </div>
                    </CardContent>
                  </Card>
      )}

      {/* Empty State - Service Not Ready */}
      {isInitialized && !isLoading && !hasError && pastors.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Pastor service is connected but no pastors are available yet. This is normal when the system is first set up.
              </span>
                      </div>
                    </CardContent>
                  </Card>
      )}
    </div>
  )
}

