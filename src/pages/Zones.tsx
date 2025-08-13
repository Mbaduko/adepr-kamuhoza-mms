"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, mockZones, mockMembers, type Zone } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import {
  MapPin,
  Plus,
  Edit,
  Eye,
  Users,
  Crown,
  Search,
  User
} from "lucide-react"

export const Zones: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user!
  const permissions = getUserPermissions(user.role)

  const [zones, setZones] = React.useState<Zone[]>([])
  const [filteredZones, setFilteredZones] = React.useState<Zone[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedZone, setSelectedZone] = React.useState<Zone | null>(null)
  const [openDetails, setOpenDetails] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [openCreate, setOpenCreate] = React.useState(false)
  const [openAssignLeader, setOpenAssignLeader] = React.useState(false)

  // Form states
  const [createForm, setCreateForm] = React.useState({ name: "", description: "", leaderEmail: "" })
  const [editForm, setEditForm] = React.useState({ name: "", description: "", leaderEmail: "" })
  const [assignLeaderForm, setAssignLeaderForm] = React.useState({ leaderEmail: "" })

  React.useEffect(() => {
    if (permissions?.canManageZones || permissions?.canViewAllMembers) {
      setZones(mockZones)
    }
  }, [permissions])

  React.useEffect(() => {
    let filtered = zones
    if (searchTerm) {
      filtered = filtered.filter(zone =>
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredZones(filtered)
  }, [zones, searchTerm])

  const getZoneLeader = (zone: Zone) => {
    if (!zone.leaderId) return null
    return mockMembers.find(m => m.id === zone.leaderId)
  }

  const handleViewDetails = (zone: Zone) => {
    setSelectedZone(zone)
    setOpenDetails(true)
  }

  const handleEdit = (zone: Zone) => {
    setSelectedZone(zone)
    const leader = mockMembers.find(m => m.id === zone.leaderId)
    setEditForm({
      name: zone.name,
      description: zone.description,
      leaderEmail: leader?.email || ""
    })
    setOpenEdit(true)
  }

  const handleAssignLeader = (zone: Zone) => {
    setSelectedZone(zone)
    setAssignLeaderForm({ leaderEmail: "" })
    setOpenAssignLeader(true)
  }

  const createZone = () => {
    if (!createForm.name.trim()) {
      toast({ title: "Required Fields", description: "Zone name is required.", variant: "destructive" })
      return
    }

    if (zones.some(zone => zone.name.toLowerCase() === createForm.name.toLowerCase())) {
      toast({ title: "Zone Exists", description: "A zone with this name already exists.", variant: "destructive" })
      return
    }

    let leaderId: string | undefined
    if (createForm.leaderEmail.trim()) {
      const leader = mockMembers.find(m => m.email.toLowerCase() === createForm.leaderEmail.toLowerCase())
      if (!leader) {
        toast({ title: "User Not Found", description: "No user found with this email address.", variant: "destructive" })
        return
      }
      leaderId = leader.id
    }

    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      leaderId,
      memberCount: 0
    }

    setZones([...zones, newZone])
    setOpenCreate(false)
    setCreateForm({ name: "", description: "", leaderEmail: "" })
    toast({ title: "Zone Created", description: "New zone has been created successfully." })
  }

  const saveEdit = () => {
    if (!selectedZone) return

    if (!editForm.name.trim()) {
      toast({ title: "Required Fields", description: "Zone name is required.", variant: "destructive" })
      return
    }

    if (zones.some(zone => 
      zone.name.toLowerCase() === editForm.name.toLowerCase() && 
      zone.id !== selectedZone.id
    )) {
      toast({ title: "Zone Exists", description: "A zone with this name already exists.", variant: "destructive" })
      return
    }

    let leaderId: string | undefined
    if (editForm.leaderEmail.trim()) {
      const leader = mockMembers.find(m => m.email.toLowerCase() === editForm.leaderEmail.toLowerCase())
      if (!leader) {
        toast({ title: "User Not Found", description: "No user found with this email address.", variant: "destructive" })
        return
      }
      leaderId = leader.id
    }

    const updatedZones = zones.map(zone =>
      zone.id === selectedZone.id
        ? { ...zone, name: editForm.name.trim(), description: editForm.description.trim(), leaderId }
        : zone
    )
    setZones(updatedZones)
    setOpenEdit(false)
    toast({ title: "Zone Updated", description: "Zone information has been updated successfully." })
  }

  const assignLeader = () => {
    if (!selectedZone) return

    if (!assignLeaderForm.leaderEmail.trim()) {
      toast({ title: "Required Fields", description: "Leader email is required.", variant: "destructive" })
      return
    }

    const leader = mockMembers.find(m => m.email.toLowerCase() === assignLeaderForm.leaderEmail.toLowerCase())
    if (!leader) {
      toast({ title: "User Not Found", description: "No user found with this email address.", variant: "destructive" })
      return
    }

    const updatedZones = zones.map(zone =>
      zone.id === selectedZone.id
        ? { ...zone, leaderId: leader.id }
        : zone
    )
    setZones(updatedZones)
    setOpenAssignLeader(false)
    toast({ title: "Leader Assigned", description: `Zone leader has been assigned to ${leader.name}.` })
  }

  const stats = {
    total: zones.length,
    withLeaders: zones.filter(z => z.leaderId).length,
    totalMembers: zones.reduce((sum, zone) => sum + mockMembers.filter(m => m.zoneId === zone.id).length, 0),
    avgMembersPerZone: zones.length > 0 ? Math.round(zones.reduce((sum, zone) => sum + mockMembers.filter(m => m.zoneId === zone.id).length, 0) / zones.length) : 0
  }

  if (!permissions?.canManageZones && !permissions?.canViewAllMembers) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to manage zones.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Zone Management</h1>
          <p className="text-muted-foreground mt-2">Manage church zones and assign leaders</p>
        </div>
        {permissions?.canManageZones && (
          <Button className="gap-2" onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4" />
            Create Zone
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zones with Leaders</CardTitle>
            <Crown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withLeaders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Members/Zone</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMembersPerZone}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Zones</CardTitle>
          <CardDescription>Find specific zones by name or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Zones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
          <CardDescription>
            {filteredZones.length} zone{filteredZones.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                        <p className="text-muted-foreground">No zones found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredZones.map((zone) => {
                    const leader = getZoneLeader(zone)
                    return (
                      <TableRow key={zone.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{zone.name}</div>
                              <div className="text-sm text-muted-foreground">Zone ID: {zone.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {leader ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                <Crown className="h-4 w-4 text-amber-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{leader.name}</div>
                                <div className="text-xs text-muted-foreground">{leader.email}</div>
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">No Leader</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{mockMembers.filter(m => m.zoneId === zone.id).length}</span>
                            <span className="text-sm text-muted-foreground">members</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {zone.description || "No description"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(zone)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {permissions?.canManageZones && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(zone)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAssignLeader(zone)}
                                >
                                  <Crown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

      {/* Zone Details Dialog */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Zone Details</DialogTitle>
            <DialogDescription>Complete information about the zone</DialogDescription>
          </DialogHeader>
          {selectedZone && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedZone.name}</h3>
                  <div className="text-sm text-muted-foreground">Zone ID: {selectedZone.id}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="text-sm">{selectedZone.description || "No description provided"}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Member Count</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {mockMembers.filter(m => m.zoneId === selectedZone.id).length} members
                  </div>
                </div>
              </div>

              {getZoneLeader(selectedZone) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Zone Leader</Label>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{getZoneLeader(selectedZone)!.name}</div>
                      <div className="text-sm text-muted-foreground">{getZoneLeader(selectedZone)!.email}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Zone Members</Label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {mockMembers.filter(m => m.zoneId === selectedZone.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members assigned to this zone</p>
                  ) : (
                    mockMembers.filter(m => m.zoneId === selectedZone.id).map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-2 border rounded">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {member.accountStatus}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Zone Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>Update zone information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Zone Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-leader">Zone Leader Email</Label>
              <Input
                id="edit-leader"
                type="email"
                value={editForm.leaderEmail}
                onChange={(e) => setEditForm({ ...editForm, leaderEmail: e.target.value })}
                placeholder="Enter leader's email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Leader Dialog */}
      <Dialog open={openAssignLeader} onOpenChange={setOpenAssignLeader}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Zone Leader</DialogTitle>
            <DialogDescription>
              Assign a new leader to {selectedZone?.name} zone
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="assign-leader">Leader Email *</Label>
              <Input
                id="assign-leader"
                type="email"
                value={assignLeaderForm.leaderEmail}
                onChange={(e) => setAssignLeaderForm({ leaderEmail: e.target.value })}
                placeholder="Enter leader's email address"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              The user must be a registered member of the church. They will be assigned the zone-leader role.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAssignLeader(false)}>
              Cancel
            </Button>
            <Button onClick={assignLeader}>
              Assign Leader
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Zone Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Zone</DialogTitle>
            <DialogDescription>Add a new zone to the church structure</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Zone Name *</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Enter zone name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Enter zone description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-leader">Zone Leader Email</Label>
              <Input
                id="create-leader"
                type="email"
                value={createForm.leaderEmail}
                onChange={(e) => setCreateForm({ ...createForm, leaderEmail: e.target.value })}
                placeholder="Enter leader's email address (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button onClick={createZone}>
              Create Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}