"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { useMembersStore } from "@/data/members-store"
import { useZonesStore } from "@/data/zones-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  RefreshCw,
  Info,
  UserPlus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Crown,
  Shield,
  UserCheck,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberService, CreateUserData } from '@/services/memberService';

export const Members: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user!

  // Use stores
  const { 
    members, 
    loading: membersLoading, 
    error: membersError,
    isInitialized: membersInitialized,
    fetchAllMembers,
    fetchMembersByZone
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
  const [zoneFilter, setZoneFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  
  // Add New User Dialog State
  const [openNewUser, setOpenNewUser] = React.useState(false);

  // Get default role based on current user's role
  const getDefaultRole = () => {
    const currentUserRole = user?.role;
    
    switch (currentUserRole) {
      case 'parish-pastor':
        return 'PASTOR'; // Parish pastors can create pastors by default
      case 'pastor':
      case 'zone-leader':
      default:
        return 'MEMBER'; // Everyone else creates members by default
    }
  };

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    const currentUserRole = user?.role;
    
    switch (currentUserRole) {
      case 'parish-pastor':
        return [
          { value: 'MEMBER', label: 'Member' },
          { value: 'PASTOR', label: 'Pastor' }
        ];
      case 'pastor':
        return [
          { value: 'MEMBER', label: 'Member' }
        ];
      case 'zone-leader':
        return [
          { value: 'MEMBER', label: 'Member' }
        ];
      default:
        return [
          { value: 'MEMBER', label: 'Member' }
        ];
    }
  };

  // Initialize form with default role
  const [formData, setFormData] = React.useState<CreateUserData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "MALE",
    date_of_birth: "",
    profile_photo_url: "",
    address: "",
    highest_degree: "",
    marital_status: "SINGLE",
    baptism_date: "",
    is_married_in_church: false,
    marriage_date: "",
    choir: "",
    email: "",
    password: "",
    role: getDefaultRole() as "MEMBER" | "PASTOR",
    account_status: "ACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form handlers
  const handleInputChange = (field: keyof CreateUserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData({
      first_name: "",
      last_name: "",
      phone_number: "",
      gender: "MALE",
      date_of_birth: "",
      profile_photo_url: "",
      address: "",
      highest_degree: "",
      marital_status: "SINGLE",
      baptism_date: "",
      is_married_in_church: false,
      marriage_date: "",
      choir: "",
      email: "",
      password: "",
      role: getDefaultRole() as "MEMBER" | "PASTOR",
      account_status: "ACTIVE",
    });
    setOpenNewUser(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (First Name, Last Name, Email, Password)",
          variant: "error",
        });
        return;
      }

      const response = await MemberService.createUser(formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "New member created successfully!",
          variant: "success",
        });
        
        handleCancel();
        // Refresh members list
        await fetchAllMembers();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create member. Please try again.",
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create member. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllMembers(),
          fetchAllZones()
        ])
      } catch (error) {
        console.error('Failed to load members data:', error)
        // Don't show error toast as endpoints might not be ready
      }
    }

    loadData()
  }, [fetchAllMembers, fetchAllZones])

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchAllMembers(),
        fetchAllZones()
      ])
      toast({
        title: "Success",
        description: "Members data refreshed successfully.",
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

  // Filter members based on search and filters
  const filteredMembers = React.useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesZone = zoneFilter === "all" || member.zoneId === zoneFilter
      
      const matchesStatus = statusFilter === "all" || member.accountStatus === statusFilter
      
      return matchesSearch && matchesZone && matchesStatus
    })
  }, [members, searchTerm, zoneFilter, statusFilter])

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      total: members.length,
      active: members.filter(m => m.accountStatus === "active").length,
      inactive: members.filter(m => m.accountStatus === "inactive").length,
      byZone: zones.length,
    }
  }, [members, zones])

  const isLoading = membersLoading || zonesLoading
  const hasError = membersError || zonesError
  const isInitialized = membersInitialized && zonesInitialized

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

  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId)
    return zone?.name || "Unknown Zone"
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage and view all church members. Search, filter, and track member information.
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

          <Button onClick={() => setOpenNewUser(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
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
                Member and zone services are connected and ready
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byZone}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter members by various criteria.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                  id="search"
                  placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                  <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                  {zones.map(zone => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Showing {filteredMembers.length} of {members.length} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || zoneFilter !== "all" || statusFilter !== "all" 
                            ? "No members match your filters." 
                            : "No members found."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.profileImage} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                                                     <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">Member</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                            {member.email}
                          </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {member.phone || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {getZoneName(member.zoneId || "")}
                        </div>
                      </TableCell>
                                             <TableCell>
                         {getStatusBadge(member.accountStatus)}
                       </TableCell>
                                             <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "N/A"}
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
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Member
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
              <span className="ml-2 text-muted-foreground">Loading members data...</span>
                   </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Service Not Ready */}
      {isInitialized && !isLoading && !hasError && members.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Member service is connected but no members are available yet. This is normal when the system is first set up.
              </span>
                  </div>
          </CardContent>
        </Card>
      )}

      {/* Add New User Dialog */}
      <Dialog open={openNewUser} onOpenChange={setOpenNewUser}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Member
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new member to the church. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    First Name *
                  </Label>
               <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="Enter first name"
                    required
               />
             </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
               <Input
                 id="email"
                 type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
               />
             </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
               <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password"
                    required
               />
             </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-sm font-medium">
                    Phone Number
                  </Label>
               <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange("phone_number", e.target.value)}
                    placeholder="Enter phone number"
               />
             </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <Select value={formData.gender} onValueChange={value => handleInputChange("gender", value as "MALE" | "FEMALE")}>
                   <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status" className="text-sm font-medium">
                    Marital Status
                  </Label>
                  <Select value={formData.marital_status} onValueChange={value => handleInputChange("marital_status", value as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED")}>
                   <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="DIVORCED">Divorced</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             </div>

            {/* Address and Education Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Address & Education</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
               <Textarea
                 id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter full address"
                    rows={3}
               />
             </div>
                <div className="space-y-2">
                  <Label htmlFor="highest_degree" className="text-sm font-medium">
                    Highest Degree
                  </Label>
                  <Input
                    id="highest_degree"
                    value={formData.highest_degree}
                    onChange={(e) => handleInputChange("highest_degree", e.target.value)}
                    placeholder="e.g., Bachelor's Degree, Master's Degree"
                  />
             </div>
           </div>
            </div>

            {/* Church Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Church Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baptism_date" className="text-sm font-medium">
                    Baptism Date
                  </Label>
              <Input
                    id="baptism_date"
                    type="date"
                    value={formData.baptism_date}
                    onChange={(e) => handleInputChange("baptism_date", e.target.value)}
              />
            </div>
                <div className="space-y-2">
                  <Label htmlFor="choir" className="text-sm font-medium">
                    Choir
                  </Label>
              <Input
                    id="choir"
                    value={formData.choir}
                    onChange={(e) => handleInputChange("choir", e.target.value)}
                    placeholder="e.g., Youth Choir, Adult Choir"
              />
            </div>
                <div className="space-y-2">
                  <Label htmlFor="is_married_in_church" className="text-sm font-medium">
                    Married in Church
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_married_in_church"
                      checked={formData.is_married_in_church}
                      onCheckedChange={(checked) => handleInputChange("is_married_in_church", checked)}
                    />
                    <Label htmlFor="is_married_in_church" className="text-sm">
                      Yes, married in church
                    </Label>
            </div>
                </div>
                {formData.is_married_in_church && (
                  <div className="space-y-2">
                    <Label htmlFor="marriage_date" className="text-sm font-medium">
                      Marriage Date
                    </Label>
              <Input
                      id="marriage_date"
                type="date"
                      value={formData.marriage_date}
                      onChange={(e) => handleInputChange("marriage_date", e.target.value)}
              />
            </div>
                )}
              </div>
              </div>

            {/* Role Assignment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Role Assignment</h3>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Church Role
                </Label>
                <Select value={formData.role} onValueChange={value => handleInputChange("role", value as "MEMBER" | "PASTOR")}>
                <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                    {getAvailableRoles().map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          {role.value === "MEMBER" && <User className="h-4 w-4" />}
                          {role.value === "PASTOR" && <Crown className="h-4 w-4" />}
                          {role.label}
                        </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                <p className="text-xs text-muted-foreground">
                  Available roles are based on your current permissions. Parish Pastors can create Pastors, while others can only create Members. Zone Leaders are assigned when someone is made a zone leader, not created directly.
                </p>
            </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Member
                  </>
                )}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
