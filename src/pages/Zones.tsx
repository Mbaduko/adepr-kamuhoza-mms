"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { useZonesStore } from "@/data/zones-store"
import { useMembersStore } from "@/data/members-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  MapPin,
  Search,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Info,
  UserPlus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Zones: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user!

  // Use stores
  const { 
    zones, 
    loading: zonesLoading, 
    error: zonesError,
    isInitialized: zonesInitialized,
    fetchAllZones
  } = useZonesStore()
  
  const { 
    members, 
    loading: membersLoading, 
    error: membersError,
    isInitialized: membersInitialized,
    fetchAllMembers
  } = useMembersStore()

  // State
  const [searchTerm, setSearchTerm] = React.useState("")

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllZones(),
          fetchAllMembers()
        ])
      } catch (error) {
        console.error('Failed to load zones data:', error)
        // Don't show error toast as endpoints might not be ready
      }
    }

    loadData()
  }, [fetchAllZones, fetchAllMembers])

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchAllZones(),
        fetchAllMembers()
      ])
      toast({
        title: "Success",
        description: "Zones data refreshed successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Filter zones based on search
  const filteredZones = React.useMemo(() => {
    return zones.filter(zone => 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [zones, searchTerm])

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      total: zones.length,
      totalMembers: members.length,
      averageMembersPerZone: zones.length > 0 ? Math.round(members.length / zones.length) : 0,
      zonesWithMembers: zones.filter(zone => 
        members.some(member => member.zoneId === zone.id)
      ).length,
    }
  }, [zones, members])

  const isLoading = zonesLoading || membersLoading
  const hasError = zonesError || membersError
  const isInitialized = zonesInitialized && membersInitialized

  const getMemberCount = (zoneId: string) => {
    return members.filter(member => member.zoneId === zoneId).length
  }

  const getZoneLeader = (zoneId: string) => {
    return members.find(member => 
      member.zoneId === zoneId && member.role === "zone-leader"
    )
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Zones</h1>
          <p className="text-muted-foreground">
            Manage church zones and view member distribution across different areas.
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

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                {zonesError || membersError}
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
                Zone and member services are connected and ready
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Members/Zone</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMembersPerZone}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.zonesWithMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Zones</CardTitle>
          <CardDescription>Find specific zones by name or description.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                id="search"
              placeholder="Search zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
          <CardDescription>
            Showing {filteredZones.length} of {zones.length} zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? "No zones match your search." : "No zones found."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredZones.map((zone) => {
                    const memberCount = getMemberCount(zone.id)
                    const leader = getZoneLeader(zone.id)
                    
                    return (
                      <TableRow key={zone.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={zone.image} />
                              <AvatarFallback>
                                {zone.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-sm text-muted-foreground">Zone {zone.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {leader ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={leader.profileImage} />
                                <AvatarFallback>
                                  {leader.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{leader.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No leader assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{memberCount}</span>
                            <span className="text-sm text-muted-foreground">members</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {zone.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={memberCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {memberCount > 0 ? "Active" : "Empty"}
                          </Badge>
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
                                Edit Zone
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign Members
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Zone
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
              <span className="ml-2 text-muted-foreground">Loading zones data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Service Not Ready */}
      {isInitialized && !isLoading && !hasError && zones.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Zone service is connected but no zones are available yet. This is normal when the system is first set up.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}