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
import { usePastorsStore } from "@/data/pastors-store"
import { PastorService, PastorData } from '@/services/pastorService';
import { MemberService, UpdateUserPayload } from '@/services/memberService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

export const Pastors: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = state.user;

  // Use stores
  const { 
    pastors: storePastors, 
    loading: pastorsLoading, 
    error: pastorsError,
    isInitialized: pastorsInitialized,
    fetchAllPastors
  } = usePastorsStore()

  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllPastors && fetchAllPastors()
        ])
      } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "error"
      })
      }
    }

    loadData()
  }, [fetchAllPastors])

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchAllPastors && fetchAllPastors()
      ])
      toast({
        title: "Success",
        description: "Pastors data refreshed successfully.",
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

  // Local UI state for filtering / sorting
  const [searchTerm, setSearchTerm] = React.useState<string>("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("first_name")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")

  // Dialog state
  const [selectedPastor, setSelectedPastor] = React.useState<PastorData | null>(null)
  const [isViewOpen, setIsViewOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState({ first_name: "", last_name: "", email: "", phone_number: "" })
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [addForm, setAddForm] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    gender: "MALE" as "MALE" | "FEMALE",
    date_of_birth: "",
    profile_photo_url: "",
    address: "",
    highest_degree: "",
    marital_status: "SINGLE" as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED",
    baptism_date: "",
    is_married_in_church: false,
    marriage_date: "",
    choir: "",
    zone_id: "",
    role: "PASTOR" as const,
    account_status: "ACTIVE" as const,
  })
  const [isCreatingPastor, setIsCreatingPastor] = React.useState(false)
  const [isUpdatingPastor, setIsUpdatingPastor] = React.useState(false)


  const DEGREE_OPTIONS = [
    "Certificate",
    "Diploma",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctoral Degree",
    "Professional Degree",
    "Honorary Degree",
  ];

  // Filter pastors (members with pastor roles)
    const pastors = React.useMemo(() => {
      return storePastors || []
    }, [storePastors])

  // Filter and sort pastors
  const filteredPastors = React.useMemo(() => {
    let filtered = pastors

    if (searchTerm) {
      filtered = filtered.filter(pastor =>
        pastor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(pastor => (pastor.account_status || '').toLowerCase() === statusFilter)
    }

    // Sort pastors
        filtered.sort((a, b) => {
          const aVal: unknown = (a as unknown as Record<string, unknown>)[sortBy]
          const bVal: unknown = (b as unknown as Record<string, unknown>)[sortBy]
          
          // String comparison
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const aStr = aVal.toLowerCase()
            const bStr = bVal.toLowerCase()
            if (sortOrder === "asc") {
              return aStr > bStr ? 1 : aStr < bStr ? -1 : 0
            } else {
              return aStr < bStr ? 1 : aStr > bStr ? -1 : 0
            }
          }
          
          // Numeric comparison
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === "asc" ? (aVal - bVal) : (bVal - aVal)
          }
          
          // Fallback: compare stringified values
          const aStr = String(aVal ?? '')
          const bStr = String(bVal ?? '')
          if (sortOrder === "asc") {
            return aStr > bStr ? 1 : aStr < bStr ? -1 : 0
          } else {
            return aStr < bStr ? 1 : aStr > bStr ? -1 : 0
          }
        })

    return filtered
  }, [pastors, searchTerm, statusFilter, sortBy, sortOrder])

  // Calculate stats
  const stats = React.useMemo(() => {
    const activeCount = pastors.filter(p => (p.account_status || '').toLowerCase() === 'active').length
    const inactiveCount = pastors.filter(p => (p.account_status || '').toLowerCase() === 'inactive').length
    const verifiedCount = pastors.filter(p => !!p.is_verified).length

    return {
      total: pastors.length,
      active: activeCount,
      inactive: inactiveCount,
      verified: verifiedCount,
    }
  }, [pastors])

  const isLoading = pastorsLoading
  const pastorsErrorLocal = pastorsError
  const pastorsInitializedLocal = pastorsInitialized
  const pastorError: string | null = null
  const zonesErrorLocal: string | null = null

  const hasError = Boolean(pastorsErrorLocal) || Boolean(pastorError)
  const isInitialized = Boolean(pastorsInitializedLocal)

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
  if (!user || user.role !== "parish-pastor") {
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

          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
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
                {pastorsErrorLocal || zonesErrorLocal}
              </span>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Email verified</p>
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
          <div className="grid gap-4 md:grid-cols-5">
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
              <Label htmlFor="sort">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_name">First Name</SelectItem>
                <SelectItem value="last_name">Last Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="account_status">Status</SelectItem>
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
              setSortBy("first_name")
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
                  <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredPastors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all" 
                            ? "No pastors match your filters." 
                            : "No pastors found."}
                        </p>
                      </div>
                  </TableCell>
                  </TableRow>
                ) : (
                  filteredPastors.map((pastor) => {
                    const fullName = `${pastor.first_name || ''} ${pastor.last_name || ''}`.trim() || pastor.email;
                    return (
                      <TableRow key={pastor.profile_id}>
                  <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                              <AvatarImage src={undefined} />
                              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                          </Avatar>
                    <div>
                              <p className="font-medium">{fullName}</p>
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
                            {pastor.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                                {pastor.phone_number}
                      </div>
                          )}
                    </div>
                  </TableCell>
                        
                  <TableCell>
                          {getRoleBadge("pastor")}
                  </TableCell>
                  <TableCell>
                          {getStatusBadge((pastor.account_status || '').toLowerCase())}
                  </TableCell>
                  <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                            {pastor.created_at ? new Date(pastor.created_at).toLocaleDateString() : 'N/A'}
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
                              <DropdownMenuItem onClick={() => { setSelectedPastor(pastor); setIsViewOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedPastor(pastor); setEditForm({ first_name: pastor.first_name || '', last_name: pastor.last_name || '', email: pastor.email || '', phone_number: pastor.phone_number || '' }); setIsEditOpen(true); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Pastor
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

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pastor Details</DialogTitle>
            <DialogDescription>Basic information</DialogDescription>
          </DialogHeader>
          {selectedPastor && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {(selectedPastor.first_name || '') + ' ' + (selectedPastor.last_name || '')}</div>
              <div><span className="font-medium">Email:</span> {selectedPastor.email}</div>
              <div><span className="font-medium">Phone:</span> {selectedPastor.phone_number || 'N/A'}</div>
              <div><span className="font-medium">Status:</span> {(selectedPastor.account_status || '').toLowerCase()}</div>
              <div><span className="font-medium">Verified:</span> {selectedPastor.is_verified ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Created:</span> {selectedPastor.created_at ? new Date(selectedPastor.created_at).toLocaleString() : 'N/A'}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Pastor Dialog */}
      
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Pastor
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new pastor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={addForm.first_name}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, first_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={addForm.last_name}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, last_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={addForm.phone_number}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, phone_number: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={addForm.gender}
                  onValueChange={(val) =>
                    setAddForm((v) => ({ ...v, gender: val as "MALE" | "FEMALE" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={addForm.date_of_birth}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, date_of_birth: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Address & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={addForm.address}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, address: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Highest Degree</Label>
                <Select
                  value={addForm.highest_degree || ""}
                  onValueChange={(val) =>
                    setAddForm((v) => ({ ...v, highest_degree: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_OPTIONS.map((deg) => (
                      <SelectItem key={deg} value={deg}>
                        {deg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Church Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Baptism Date *</Label>
                <Input
                  type="date"
                  value={addForm.baptism_date}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, baptism_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Choir (Optional)</Label>
                <Input
                  value={addForm.choir}
                  onChange={(e) =>
                    setAddForm((v) => ({ ...v, choir: e.target.value }))
                  }
                  placeholder="Enter choir if applicable"
                />
              </div>
              <div className="space-y-2">
                <Label>Marital Status *</Label>
                <Select
                  value={addForm.marital_status}
                  onValueChange={(val) =>
                    setAddForm(
                      (v) =>
                        ({
                          ...v,
                          marital_status: val as
                            | "SINGLE"
                            | "MARRIED"
                            | "DIVORCED"
                            | "WIDOWED",
                        } as typeof v)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marital Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="MARRIED">Married</SelectItem>
                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {addForm.marital_status === "MARRIED" && (
                <>
                  <div className="space-y-2">
                    <Label>Married in Church</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        checked={addForm.is_married_in_church}
                        onCheckedChange={(val) =>
                          setAddForm((v) => ({
                            ...v,
                            is_married_in_church: Boolean(val),
                          }))
                        }
                      />
                      <span className="text-sm text-muted-foreground">Yes</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Marriage Date</Label>
                    <Input
                      type="date"
                      value={addForm.marriage_date}
                      onChange={(e) =>
                        setAddForm((v) => ({ ...v, marriage_date: e.target.value }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={isCreatingPastor}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsCreatingPastor(true);
                  const payload: any = {
                    ...addForm,
                    role: "PASTOR",
                    account_status: "ACTIVE",
                  };
                  payload.gender = String(payload.gender || "MALE").toUpperCase();
                  payload.marital_status = String(
                    payload.marital_status || "SINGLE"
                  ).toUpperCase();
                  if (!payload.zone_id) delete payload.zone_id;
                  if (!payload.is_married_in_church) delete payload.marriage_date;
                  if (!payload.choir) delete payload.choir;
                  if (!payload.profile_photo_url) delete payload.profile_photo_url;
                  Object.keys(payload).forEach((k) => {
                    if (payload[k] === "") delete payload[k];
                  });

                  const res = await MemberService.createUser(payload);
                  if (res.success) {
                    setIsAddOpen(false);
                    await fetchAllPastors?.();
                    toast({
                      title: "Pastor added",
                      description: "New pastor created successfully.",
                      variant: "success",
                    });
                  } else {
                    toast({
                      title: "Failed",
                      description: res.error?.message || "Unable to create pastor",
                      variant: "error",
                    });
                  }
                } catch (e) {
                  toast({
                    title: "Failed",
                    description: "Unable to create pastor",
                    variant: "error",
                  });
                } finally {
                  setIsCreatingPastor(false);
                }
              }}
              disabled={isCreatingPastor}
            >
              {isCreatingPastor ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Creating...
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pastor</DialogTitle>
            <DialogDescription>Update basic fields</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name</Label>
                <Input value={editForm.first_name} onChange={e => setEditForm(v => ({ ...v, first_name: e.target.value }))} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={editForm.last_name} onChange={e => setEditForm(v => ({ ...v, last_name: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={editForm.email} onChange={e => setEditForm(v => ({ ...v, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone_number} onChange={e => setEditForm(v => ({ ...v, phone_number: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!selectedPastor?.auth_id) {
                  toast({ title: 'Error', description: 'Missing user identifier.', variant: 'error' })
                  return
                }
                try {
                  setIsUpdatingPastor(true)
                  const payload: UpdateUserPayload = {}
                  if (editForm.first_name && editForm.first_name.trim() !== '') payload.first_name = editForm.first_name.trim()
                  if (editForm.last_name && editForm.last_name.trim() !== '') payload.last_name = editForm.last_name.trim()
                  if (editForm.phone_number && editForm.phone_number.trim() !== '') payload.phone_number = editForm.phone_number.trim()
                  // We don't update email via this endpoint per current payload type

                  const res = await MemberService.updateUser(selectedPastor.auth_id, payload)
                  if (res.success) {
                    toast({ title: 'Updated', description: 'Pastor information updated.', variant: 'success' })
                    setIsEditOpen(false)
                    setSelectedPastor(null)
                    await fetchAllPastors?.()
                  } else {
                    toast({ title: 'Error', description: res.error?.message || 'Failed to update pastor.', variant: 'error' })
                  }
                } catch (e) {
                  toast({ title: 'Error', description: 'Failed to update pastor.', variant: 'error' })
                } finally {
                  setIsUpdatingPastor(false)
                }
              }}
              disabled={isUpdatingPastor}
            >
              {isUpdatingPastor ? (
                <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</span>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirm Dialog */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Pastor</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="text-sm">Are you sure you want to remove {selectedPastor ? (selectedPastor.first_name + ' ' + selectedPastor.last_name) : 'this pastor'}?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setIsRemoveOpen(false); toast({ title: 'Removed', description: 'Pastor removed (placeholder).', variant: 'success' }) }}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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




