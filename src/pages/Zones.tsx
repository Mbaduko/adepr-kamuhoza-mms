"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { useZonesStore } from "@/data/zones-store"
import { useMembersStore } from "@/data/members-store"
import { ZoneService, CreateZoneData, Zone, UpdateZoneData } from "@/services/zoneService"
import { MemberService } from "@/services/memberService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Eye,
  RefreshCw,
  Info,
  Crown,
} from "lucide-react"

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
    fetchAllZones,
    updateZone
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
  const [openNewZone, setOpenNewZone] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState<CreateZoneData>({
    name: "",
    description: "",
    zone_leader_id: "",
  })

  // Action states
  const [selectedZone, setSelectedZone] = React.useState<Zone | null>(null)
  const [openViewZone, setOpenViewZone] = React.useState(false)
  const [openEditZone, setOpenEditZone] = React.useState(false)
  const [openAssignLeader, setOpenAssignLeader] = React.useState(false)
  const [assignLeaderData, setAssignLeaderData] = React.useState({ zone_leader_id: "" })

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
        description: "Zones data refreshed successfully.",
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

  // Form handlers
  const handleInputChange = (field: keyof CreateZoneData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      zone_leader_id: "",
    })
    setOpenNewZone(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Name, Description)",
          variant: "error"
        })
        return
      }

      // Prepare data for API - remove empty zone_leader_id if not selected
      const apiData = {
        ...formData,
        zone_leader_id: formData.zone_leader_id || undefined
      }

      if (openEditZone && selectedZone) {
        // Update existing zone (name/description only; leader is managed separately)
        const response = await ZoneService.updateZone(selectedZone.id, {
          name: formData.name,
          description: formData.description,
        } as UpdateZoneData)

        if (response.success) {
          toast({
            title: "Success",
            description: "Zone updated successfully!",
            variant: "success"
          })
          
          handleCloseDialogs()
          // Refresh zones list
          await fetchAllZones()
        } else {
          toast({
            title: "Error",
            description: response.error?.message || "Failed to update zone. Please try again.",
            variant: "error"
          })
        }
      } else {
        // Create new zone
        const response = await ZoneService.createZone(apiData)

        if (response.success) {
          toast({
            title: "Success",
            description: "New zone created successfully!",
            variant: "success"
          })
          
          handleCancel()
          // Refresh zones list
          await fetchAllZones()
        } else {
          toast({
            title: "Error",
            description: response.error?.message || "Failed to create zone. Please try again.",
            variant: "error"
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save zone. Please try again.",
        variant: "error"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Action handlers
  const handleViewZone = (zone: Zone) => {
    setSelectedZone(zone)
    setOpenViewZone(true)
  }

  const handleEditZone = (zone: Zone) => {
    setSelectedZone(zone)
    setFormData({
      name: zone.name,
      description: zone.description,
      zone_leader_id: zone.leaderId || "",
    })
    setOpenEditZone(true)
  }

  const handleAssignLeader = (zone: Zone) => {
    setSelectedZone(zone)
    setAssignLeaderData({ zone_leader_id: "" })
    setOpenAssignLeader(true)
  }

  // When dialog opens, only consider non-leader members; if exactly one eligible, preselect; else clear
  React.useEffect(() => {
    if (!openAssignLeader || !selectedZone) return;
    const zoneMembersList = members.filter(m => m.zoneId === selectedZone.id);
    const eligible = zoneMembersList.filter(m => {
      const roleUpper = (m.role || "").toString().toUpperCase();
      const isLeaderByRole = roleUpper.includes("LEADER") || roleUpper === "PASTOR" || roleUpper === "PARISH_PASTOR";
      const isCurrentLeaderById = !!selectedZone?.leaderId && m.id === selectedZone.leaderId;
      return !isLeaderByRole && !isCurrentLeaderById;
    });

    if (eligible.length === 1) {
      const preselect = eligible[0].authId || eligible[0].id || "";
      setAssignLeaderData({ zone_leader_id: preselect });
      return;
    }

    setAssignLeaderData(prev => {
      const keep = prev.zone_leader_id && eligible.some(m => (m.id === prev.zone_leader_id) || (m.authId === prev.zone_leader_id)) ? prev.zone_leader_id : "";
      return { zone_leader_id: keep };
    });
  }, [openAssignLeader, selectedZone, members])

  

  const zoneMembers = React.useMemo(() => {
    const list = selectedZone ? members.filter(m => m.zoneId === selectedZone.id) : []
    return list
  }, [members, selectedZone, openAssignLeader])

  const eligibleLeaderCandidates = React.useMemo(() => {
    const toUpper = (value?: string) => (value || "").toString().toUpperCase()
    const filtered = zoneMembers.filter(m => {
      const roleUpper = toUpper(m.role as unknown as string)
      const isLeaderByRole = roleUpper.includes("LEADER") || roleUpper === "PASTOR" || roleUpper === "PARISH_PASTOR"
      const isCurrentLeaderById = !!selectedZone?.leaderId && m.id === selectedZone.leaderId
      return !isLeaderByRole && !isCurrentLeaderById
    })
    return filtered
  }, [zoneMembers, selectedZone, openAssignLeader])

  const eligibleLeaderCandidatesWithIds = React.useMemo(() => {
    const list = eligibleLeaderCandidates.filter(m => !!(m.id || m.authId))
    return list
  }, [eligibleLeaderCandidates, openAssignLeader, selectedZone])

  const handleCloseDialogs = () => {
    setOpenViewZone(false)
    setOpenEditZone(false)
    setOpenAssignLeader(false)
    setSelectedZone(null)
    setAssignLeaderData({ zone_leader_id: "" })
  }

  // Helper function to check if zone has a leader
  const hasLeader = (zone: Zone): boolean => {
    return !!(zone.leaderId && zone.leaderId.trim() !== '');
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

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
    // A zone leader is a member in that zone who has the 'zone-leader' role.
    // Our Member model may not include role explicitly, so we try multiple strategies.
    const memberWithRole = (members as any[]).find(m => m.zoneId === zoneId && (m.role === 'zone-leader' || m.role === 'ZONE_LEADER'))
    if (memberWithRole) return memberWithRole

    const zone = zones.find(z => z.id === zoneId)
    if (zone?.leaderId) {
      const byId = members.find(m => m.id === zone.leaderId)
      if (byId) return byId
    }
    return undefined
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

          <Button onClick={() => setOpenNewZone(true)}>
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
            {filteredZones.length} zones found
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-sm text-muted-foreground">Created: {formatDate(zone.created_at)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {leader ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                                <Crown className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{leader.name}</p>
                                <p className="text-xs text-muted-foreground">{leader.email}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                No Leader
                              </Badge>
                            </div>
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
                          <p className="text-sm text-muted-foreground max-w-[200px]">
                            {zone.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewZone(zone)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                                <Button
                              variant="ghost" 
                                  size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditZone(zone)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                              variant="ghost" 
                                  size="sm"
                              className="h-8 w-8 p-0"
                                  onClick={() => handleAssignLeader(zone)}
                              title="Assign or change zone leader"
                                >
                                  <Crown className="h-4 w-4" />
                                </Button>
                          </div>
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

      {/* Add Zone Dialog */}
      <Dialog open={openNewZone} onOpenChange={setOpenNewZone}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Create New Zone
            </DialogTitle>
            <DialogDescription>
              Add a new zone to organize church members by geographical areas.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Zone Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter zone name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the zone area"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zone_leader_id" className="text-sm font-medium">
                  Zone Leader
                </Label>
                <Select onValueChange={(value) => handleInputChange("zone_leader_id", value)} value={formData.zone_leader_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a zone leader (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Zone"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Zone Dialog */}
      <Dialog open={openViewZone} onOpenChange={setOpenViewZone}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Zone Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this zone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedZone && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Zone Name</Label>
                  <p className="text-sm font-medium">{selectedZone.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                  <p className="text-sm">{formatDate(selectedZone.created_at)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedZone.description || "No description"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Zone Leader</Label>
                {selectedZone.leaderId ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                      <Crown className="h-3 w-3 text-yellow-600" />
                    </div>
                    <span className="text-sm">{getZoneLeader(selectedZone.id)?.name || "Unknown Leader"}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No leader assigned</p>
                  )}
                </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Member Count</Label>
                <p className="text-sm">{getMemberCount(selectedZone.id)} members</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleCloseDialogs}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Zone Dialog */}
      <Dialog open={openEditZone} onOpenChange={setOpenEditZone}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Zone
            </DialogTitle>
            <DialogDescription>
              Update zone information and settings.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Zone Name *
                </Label>
              <Input
                id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter zone name"
                  required
              />
            </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">
                  Description *
                </Label>
              <Textarea
                id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the zone area"
                rows={3}
                  required
              />
            </div>
              
              {/* Zone leader is assigned via the Assign Leader action, not in edit */}
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialogs}>
              Cancel
            </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Zone"}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Leader Dialog */}
      <Dialog open={openAssignLeader} onOpenChange={setOpenAssignLeader}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Assign Zone Leader
            </DialogTitle>
            <DialogDescription>
              {selectedZone && `Select a leader for ${selectedZone.name} from zone members`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assign-leader" className="text-sm font-medium">
                Select Leader
              </Label>
              <Select 
                value={assignLeaderData.zone_leader_id || "none"}
                onValueChange={(value) => {
                  const normalized = !value || value === "none" ? "" : value
                  setAssignLeaderData({ zone_leader_id: normalized })
                }}
                disabled={eligibleLeaderCandidatesWithIds.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    eligibleLeaderCandidatesWithIds.length > 0
                      ? "Select an eligible member"
                      : "No eligible members"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Leader Selected</SelectItem>
                  {eligibleLeaderCandidatesWithIds.length > 0 ? (
                    eligibleLeaderCandidatesWithIds.map(member => {
                      const value = member.authId || member.id || ''
                      if (!value) return null
                      return (
                        <SelectItem key={value} value={value}>
                          {member.name}
                        </SelectItem>
                      )
                    })
                  ) : (
                    <SelectItem value="no-members" disabled>
                      No eligible members in this zone
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedZone && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Zone:</strong> {selectedZone.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Available Members:</strong> {members.filter(member => member.zoneId === selectedZone.id).length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Current Leader:</strong> {getZoneLeader(selectedZone.id)?.name || "None"}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCloseDialogs}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!selectedZone) return;
                
                try {
                  // Validate selection before proceeding
                  if (!assignLeaderData.zone_leader_id) {
                    toast({
                      title: "Select a member",
                      description: "Please choose a member to assign as zone leader.",
                      variant: "error"
                    });
                    return;
                  }

                  setIsSubmitting(true);

                  // Our dropdown stores member.profile_id. The role API needs auth_id.
                  const selectedMember = zoneMembers.find(m => m.id === assignLeaderData.zone_leader_id) || members.find(m => m.authId === assignLeaderData.zone_leader_id);
                  const userIdForApi = selectedMember?.authId ?? assignLeaderData.zone_leader_id;

                  const response = await MemberService.updateUserRole(userIdForApi, {
                    role: "ZONE_LEADER",
                    zone_id: selectedZone.id,
                    replace_existing: true,
                  });

                  if (response.success) {
                    toast({
                      title: "Success",
                      description: "Zone leader role assigned to selected member.",
                      variant: "success"
                    });
                    handleCloseDialogs();
                    // Refresh members so leader rendering reflects updated role
                    await fetchAllMembers();
                  } else {
                    toast({
                      title: "Error",
                      description: response.error?.message || "Failed to update member role. Please try again.",
                      variant: "error"
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to assign zone leader role. Please try again.",
                    variant: "error"
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Assigning..." : "Assign Leader"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}