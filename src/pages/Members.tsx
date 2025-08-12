"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, mockMembers, mockZones, type Member } from "@/data/mockData"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Award,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const Members: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user!
  const permissions = getUserPermissions(user.role)

  const [members, setMembers] = React.useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedZone, setSelectedZone] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null)
  const [openDetails, setOpenDetails] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [openAdd, setOpenAdd] = React.useState(false)

  // Form state for editing
  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female",
    maritalStatus: "single" as "single" | "married" | "divorced" | "widowed",
    address: "",
    zoneId: "",
    isChoirMember: false,
    accountStatus: "active" as "active" | "inactive"
  })

  // Form state for adding new member
  const [addForm, setAddForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female",
    maritalStatus: "single" as "single" | "married" | "divorced" | "widowed",
    address: "",
    zoneId: "",
    isChoirMember: false,
    accountStatus: "active" as "active" | "inactive"
  })

  React.useEffect(() => {
    // Load members based on user role
    if (user.role === "zone-leader" && user.zoneId) {
      const zoneMembers = mockMembers.filter(m => m.zoneId === user.zoneId)
      setMembers(zoneMembers)
    } else if (user.role === "pastor" || user.role === "parish-pastor") {
      setMembers(mockMembers)
    } else {
      setMembers([])
    }
  }, [user.role, user.zoneId])

  React.useEffect(() => {
    // Filter members based on search and filters
    let filtered = members

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm)
      )
    }

    if (selectedZone !== "all") {
      filtered = filtered.filter(member => member.zoneId === selectedZone)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(member => member.accountStatus === selectedStatus)
    }

    setFilteredMembers(filtered)
  }, [members, searchTerm, selectedZone, selectedStatus])

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      dateOfBirth: member.dateOfBirth || "",
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      address: member.address || "",
      zoneId: member.zoneId || "",
      isChoirMember: member.isChoirMember,
      accountStatus: member.accountStatus
    })
    setOpenEdit(true)
  }

  const handleDelete = (member: Member) => {
    setSelectedMember(member)
    setOpenDelete(true)
  }

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member)
    setOpenDetails(true)
  }

  const saveEdit = () => {
    if (!selectedMember) return

    // In a real app, this would be an API call
    const updatedMembers = members.map(member =>
      member.id === selectedMember.id
        ? { ...member, ...editForm }
        : member
    )
    setMembers(updatedMembers)
    setOpenEdit(false)
    toast({ title: "Member Updated", description: "Member information has been updated successfully." })
  }

  const confirmDelete = () => {
    if (!selectedMember) return

    // In a real app, this would be an API call
    const updatedMembers = members.filter(member => member.id !== selectedMember.id)
    setMembers(updatedMembers)
    setOpenDelete(false)
    toast({ title: "Member Removed", description: "Member has been removed from the system." })
  }

  const handleAddMember = () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast({ title: "Required Fields", description: "Name and email are required.", variant: "destructive" })
      return
    }

    // In a real app, this would be an API call
    const newMember: Member = {
      id: Date.now().toString(), // Simple ID generation
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      phone: addForm.phone.trim(),
      dateOfBirth: addForm.dateOfBirth,
      gender: addForm.gender,
      maritalStatus: addForm.maritalStatus,
      address: addForm.address.trim(),
      zoneId: addForm.zoneId,
      isChoirMember: addForm.isChoirMember,
      accountStatus: addForm.accountStatus,
      sacraments: {}
    }

    setMembers([...members, newMember])
    setOpenAdd(false)
    
    // Reset form
    setAddForm({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "male",
      maritalStatus: "single",
      address: "",
      zoneId: "",
      isChoirMember: false,
      accountStatus: "active"
    })
    
    toast({ title: "Member Added", description: "New member has been added successfully." })
  }

  const getMemberStats = () => {
    const total = members.length
    const active = members.filter(m => m.accountStatus === "active").length
    const inactive = members.filter(m => m.accountStatus === "inactive").length
    const newThisMonth = Math.floor(total * 0.1) // Simulate 10% of members as new this month

    return { total, active, inactive, newThisMonth }
  }

  const stats = getMemberStats()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "zone-leader":
        return <Crown className="h-4 w-4 text-amber-600" />
      case "pastor":
        return <Shield className="h-4 w-4 text-blue-600" />
      case "parish-pastor":
        return <Award className="h-4 w-4 text-purple-600" />
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />
    }
  }

  if (!permissions?.canViewZoneMembers && !permissions?.canViewAllMembers) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to view member information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Member Management</h1>
          <p className="text-muted-foreground mt-2">
            {user.role === "zone-leader" 
              ? "Manage members in your zone" 
              : "Manage all church members"
            }
          </p>
        </div>
        {permissions?.canViewZoneMembers || permissions?.canViewAllMembers ? (
          <Button className="gap-2" onClick={() => setOpenAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        ) : null}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific members or filter by criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {mockZones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                                     <TableHead>Date of Birth</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No members found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.profileImage} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                                                     <div>
                             <div className="font-medium">{member.name}</div>
                             <div className="text-sm text-muted-foreground flex items-center gap-1">
                               <UserCheck className="h-4 w-4 text-gray-600" />
                               Member
                               {member.isChoirMember && (
                                 <Badge variant="outline" className="ml-1 text-xs">
                                   Choir
                                 </Badge>
                               )}
                             </div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {mockZones.find(z => z.id === member.zoneId)?.name || 'Unassigned'}
                        </div>
                      </TableCell>
                                             <TableCell>
                         {getStatusBadge(member.accountStatus)}
                       </TableCell>
                                             <TableCell>
                         <div className="flex items-center gap-1 text-sm">
                           <Calendar className="h-3 w-3 text-muted-foreground" />
                           {new Date(member.dateOfBirth).toLocaleDateString()}
                         </div>
                       </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(member)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(permissions?.canEditZoneMembers || permissions?.canEditAllMembers) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {(permissions?.canDeleteZoneMembers || permissions?.canDeleteAllMembers) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(member)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>Complete information about the member</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedMember.profileImage} />
                  <AvatarFallback className="text-lg">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                                 <div>
                   <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <UserCheck className="h-4 w-4 text-gray-600" />
                     <span className="text-muted-foreground capitalize">
                       Member
                     </span>
                   </div>
                   {getStatusBadge(selectedMember.accountStatus)}
                 </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedMember.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedMember.phone || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Zone</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {mockZones.find(z => z.id === selectedMember.zoneId)?.name || 'Unassigned'}
                  </div>
                </div>
                                 <div className="space-y-2">
                   <Label className="text-sm font-medium">Date of Birth</Label>
                   <div className="flex items-center gap-2 text-sm">
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                     {new Date(selectedMember.dateOfBirth).toLocaleDateString()}
                   </div>
                 </div>
                {selectedMember.address && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Address</Label>
                    <div className="text-sm">{selectedMember.address}</div>
                  </div>
                )}
                                 <div className="space-y-2 md:col-span-2">
                   <Label className="text-sm font-medium">Gender</Label>
                   <div className="text-sm capitalize">{selectedMember.gender}</div>
                 </div>
                 <div className="space-y-2 md:col-span-2">
                   <Label className="text-sm font-medium">Marital Status</Label>
                   <div className="text-sm capitalize">{selectedMember.maritalStatus}</div>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
                     <div className="grid gap-4">
             <div className="grid gap-2">
               <Label htmlFor="name">Full Name *</Label>
               <Input
                 id="name"
                 value={editForm.name}
                 onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="email">Email *</Label>
               <Input
                 id="email"
                 type="email"
                 value={editForm.email}
                 onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="phone">Phone Number</Label>
               <Input
                 id="phone"
                 value={editForm.phone}
                 onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="dob">Date of Birth</Label>
               <Input
                 id="dob"
                 type="date"
                 value={editForm.dateOfBirth}
                 onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label htmlFor="gender">Gender</Label>
                 <Select value={editForm.gender} onValueChange={(value: "male" | "female") => setEditForm({ ...editForm, gender: value })}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="male">Male</SelectItem>
                     <SelectItem value="female">Female</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="marital">Marital Status</Label>
                 <Select value={editForm.maritalStatus} onValueChange={(value: "single" | "married" | "divorced" | "widowed") => setEditForm({ ...editForm, maritalStatus: value })}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="single">Single</SelectItem>
                     <SelectItem value="married">Married</SelectItem>
                     <SelectItem value="divorced">Divorced</SelectItem>
                     <SelectItem value="widowed">Widowed</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <div className="grid gap-2">
               <Label htmlFor="zone">Zone</Label>
               <Select value={editForm.zoneId} onValueChange={(value) => setEditForm({ ...editForm, zoneId: value })}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select zone" />
                 </SelectTrigger>
                 <SelectContent>
                   {mockZones.map((zone) => (
                     <SelectItem key={zone.id} value={zone.id}>
                       {zone.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="grid gap-2">
               <Label htmlFor="address">Address</Label>
               <Textarea
                 id="address"
                 value={editForm.address}
                 onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                 rows={2}
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="status">Account Status</Label>
               <Select value={editForm.accountStatus} onValueChange={(value: "active" | "inactive") => setEditForm({ ...editForm, accountStatus: value })}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="active">Active</SelectItem>
                   <SelectItem value="inactive">Inactive</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 id="choir"
                 checked={editForm.isChoirMember}
                 onChange={(e) => setEditForm({ ...editForm, isChoirMember: e.target.checked })}
                 className="rounded"
               />
               <Label htmlFor="choir">Choir Member</Label>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.name} from the system? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Enter the member's information to register them in the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-phone">Phone Number</Label>
              <Input
                id="add-phone"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-dob">Date of Birth</Label>
              <Input
                id="add-dob"
                type="date"
                value={addForm.dateOfBirth}
                onChange={(e) => setAddForm({ ...addForm, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-gender">Gender</Label>
                <Select value={addForm.gender} onValueChange={(value: "male" | "female") => setAddForm({ ...addForm, gender: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-marital">Marital Status</Label>
                <Select value={addForm.maritalStatus} onValueChange={(value: "single" | "married" | "divorced" | "widowed") => setAddForm({ ...addForm, maritalStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-zone">Zone</Label>
              <Select value={addForm.zoneId} onValueChange={(value) => setAddForm({ ...addForm, zoneId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {mockZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-address">Address</Label>
              <Textarea
                id="add-address"
                value={addForm.address}
                onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                placeholder="Enter full address"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-status">Account Status</Label>
              <Select value={addForm.accountStatus} onValueChange={(value: "active" | "inactive") => setAddForm({ ...addForm, accountStatus: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-choir"
                checked={addForm.isChoirMember}
                onChange={(e) => setAddForm({ ...addForm, isChoirMember: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="add-choir">Choir Member</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
