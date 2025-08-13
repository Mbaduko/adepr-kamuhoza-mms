"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { getUserPermissions, mockMembers } from "@/data/mockData"
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
  SortDesc
} from "lucide-react"

// Mock pastors data - in real app this would come from backend
const mockPastors = [
  {
    id: "pastor-1",
    name: "Rev. Michael Brown",
    email: "michael.brown@church.com",
    phone: "+250 788 123 456",
    zone: "North Zone",
    status: "active",
    joinDate: "2020-03-15",
    specialization: "Youth Ministry",
    assignedMembers: 45,
    approvedRequests: 23,
    pendingRequests: 5,
    performance: 92,
    experience: "5 years",
    education: "Master of Divinity",
    languages: ["English", "Kinyarwanda"],
    availability: "Full-time",
    lastActive: "2024-02-15"
  },
  {
    id: "pastor-2", 
    name: "Rev. Sarah Johnson",
    email: "sarah.johnson@church.com",
    phone: "+250 789 234 567",
    zone: "South Zone",
    status: "active",
    joinDate: "2019-08-22",
    specialization: "Family Counseling",
    assignedMembers: 38,
    approvedRequests: 31,
    pendingRequests: 3,
    performance: 88,
    experience: "6 years",
    education: "Master of Theology",
    languages: ["English", "Kinyarwanda", "French"],
    availability: "Full-time",
    lastActive: "2024-02-14"
  },
  {
    id: "pastor-3",
    name: "Rev. David Wilson",
    email: "david.wilson@church.com", 
    phone: "+250 787 345 678",
    zone: "East Zone",
    status: "inactive",
    joinDate: "2021-01-10",
    specialization: "Community Outreach",
    assignedMembers: 52,
    approvedRequests: 28,
    pendingRequests: 0,
    performance: 75,
    experience: "3 years",
    education: "Bachelor of Theology",
    languages: ["English", "Kinyarwanda"],
    availability: "Part-time",
    lastActive: "2024-01-20"
  },
  {
    id: "pastor-4",
    name: "Rev. Lisa Anderson",
    email: "lisa.anderson@church.com",
    phone: "+250 786 456 789",
    zone: "West Zone", 
    status: "active",
    joinDate: "2022-06-05",
    specialization: "Children's Ministry",
    assignedMembers: 41,
    approvedRequests: 19,
    pendingRequests: 7,
    performance: 85,
    experience: "4 years",
    education: "Master of Divinity",
    languages: ["English", "Kinyarwanda"],
    availability: "Full-time",
    lastActive: "2024-02-15"
  },
  {
    id: "pastor-5",
    name: "Rev. Robert Taylor",
    email: "robert.taylor@church.com",
    phone: "+250 785 567 890",
    zone: "Central Zone",
    status: "active", 
    joinDate: "2018-11-12",
    specialization: "Elderly Care",
    assignedMembers: 35,
    approvedRequests: 42,
    pendingRequests: 2,
    performance: 95,
    experience: "8 years",
    education: "Doctor of Ministry",
    languages: ["English", "Kinyarwanda", "French"],
    availability: "Full-time",
    lastActive: "2024-02-15"
  },
  {
    id: "pastor-6",
    name: "Rev. Grace Mukamana",
    email: "grace.mukamana@church.com",
    phone: "+250 784 678 901",
    zone: "North Zone",
    status: "active",
    joinDate: "2023-02-18",
    specialization: "Women's Ministry",
    assignedMembers: 28,
    approvedRequests: 15,
    pendingRequests: 4,
    performance: 82,
    experience: "2 years",
    education: "Bachelor of Theology",
    languages: ["Kinyarwanda", "English"],
    availability: "Part-time",
    lastActive: "2024-02-13"
  },
  {
    id: "pastor-7",
    name: "Rev. Emmanuel Niyonsaba",
    email: "emmanuel.niyonsaba@church.com",
    phone: "+250 783 789 012",
    zone: "South Zone",
    status: "active",
    joinDate: "2020-09-30",
    specialization: "Men's Ministry",
    assignedMembers: 33,
    approvedRequests: 26,
    pendingRequests: 1,
    performance: 89,
    experience: "4 years",
    education: "Master of Divinity",
    languages: ["Kinyarwanda", "English"],
    availability: "Full-time",
    lastActive: "2024-02-15"
  }
]

const mockZones = [
  { id: "zone-1", name: "North Zone" },
  { id: "zone-2", name: "South Zone" },
  { id: "zone-3", name: "East Zone" },
  { id: "zone-4", name: "West Zone" },
  { id: "zone-5", name: "Central Zone" }
]

const specializations = [
  "Youth Ministry",
  "Family Counseling", 
  "Community Outreach",
  "Children's Ministry",
  "Elderly Care",
  "Marriage Counseling",
  "Bible Study",
  "Worship Ministry",
  "Administration",
  "Evangelism"
]

export const Pastors: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = state.user!
  const permissions = getUserPermissions(user.role)

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

  const [pastors, setPastors] = React.useState(mockPastors)
  const [filteredPastors, setFilteredPastors] = React.useState(mockPastors)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [zoneFilter, setZoneFilter] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("name")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")
  const [selectedPastors, setSelectedPastors] = React.useState<string[]>([])
  
  // Dialog states
  const [openCreate, setOpenCreate] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [openView, setOpenView] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [selectedPastor, setSelectedPastor] = React.useState<any>(null)

  // Form states
  const [createForm, setCreateForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    zone: "",
    specialization: "",
    joinDate: "",
    education: "",
    experience: "",
    languages: [] as string[],
    availability: "Full-time"
  })

  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    zone: "",
    specialization: "",
    status: "active",
    education: "",
    experience: "",
    languages: [] as string[],
    availability: "Full-time"
  })

  // Filter and sort pastors
  React.useEffect(() => {
    let filtered = pastors

    if (searchTerm) {
      filtered = filtered.filter(pastor =>
        pastor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(pastor => pastor.status === statusFilter)
    }

    if (zoneFilter !== "all") {
      filtered = filtered.filter(pastor => pastor.zone === zoneFilter)
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

    setFilteredPastors(filtered)
  }, [pastors, searchTerm, statusFilter, zoneFilter, sortBy, sortOrder])

  const handleCreate = () => {
    if (!createForm.name.trim() || !createForm.email.trim()) {
      toast({ title: "Required Fields", description: "Name and email are required.", variant: "destructive" })
      return
    }

    const newPastor = {
      id: `pastor-${Date.now()}`,
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      phone: createForm.phone.trim(),
      zone: createForm.zone,
      status: "active",
      joinDate: createForm.joinDate || new Date().toISOString().split('T')[0],
      specialization: createForm.specialization,
      assignedMembers: 0,
      approvedRequests: 0,
      pendingRequests: 0,
      performance: 80,
      experience: createForm.experience,
      education: createForm.education,
      languages: createForm.languages,
      availability: createForm.availability,
      lastActive: new Date().toISOString().split('T')[0]
    }

    setPastors([...pastors, newPastor])
    setOpenCreate(false)
    setCreateForm({ name: "", email: "", phone: "", zone: "", specialization: "", joinDate: "", education: "", experience: "", languages: [], availability: "Full-time" })
    toast({ title: "Pastor Added", description: "New pastor has been added successfully." })
  }

  const handleEdit = (pastor: any) => {
    setSelectedPastor(pastor)
    setEditForm({
      name: pastor.name,
      email: pastor.email,
      phone: pastor.phone,
      zone: pastor.zone,
      specialization: pastor.specialization,
      status: pastor.status,
      education: pastor.education || "",
      experience: pastor.experience || "",
      languages: pastor.languages || [],
      availability: pastor.availability || "Full-time"
    })
    setOpenEdit(true)
  }

  const handleSaveEdit = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast({ title: "Required Fields", description: "Name and email are required.", variant: "destructive" })
      return
    }

    const updatedPastors = pastors.map(pastor =>
      pastor.id === selectedPastor.id
        ? { ...pastor, ...editForm }
        : pastor
    )

    setPastors(updatedPastors)
    setOpenEdit(false)
    setSelectedPastor(null)
    toast({ title: "Pastor Updated", description: "Pastor information has been updated successfully." })
  }

  const handleDelete = (pastor: any) => {
    setSelectedPastor(pastor)
    setOpenDelete(true)
  }

  const confirmDelete = () => {
    const updatedPastors = pastors.filter(pastor => pastor.id !== selectedPastor.id)
    setPastors(updatedPastors)
    setOpenDelete(false)
    setSelectedPastor(null)
    toast({ title: "Pastor Removed", description: "Pastor has been removed from the system." })
  }

  const handleView = (pastor: any) => {
    setSelectedPastor(pastor)
    setOpenView(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-blue-600"
    if (performance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
    if (performance >= 80) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
    if (performance >= 70) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>
  }

  const handleBulkAction = (action: string) => {
    if (selectedPastors.length === 0) {
      toast({ title: "No Selection", description: "Please select pastors to perform bulk actions.", variant: "destructive" })
      return
    }

    switch (action) {
      case "activate":
        setPastors(pastors.map(p => selectedPastors.includes(p.id) ? { ...p, status: "active" } : p))
        toast({ title: "Bulk Update", description: `${selectedPastors.length} pastors activated.` })
        break
      case "deactivate":
        setPastors(pastors.map(p => selectedPastors.includes(p.id) ? { ...p, status: "inactive" } : p))
        toast({ title: "Bulk Update", description: `${selectedPastors.length} pastors deactivated.` })
        break
      case "delete":
        setPastors(pastors.filter(p => !selectedPastors.includes(p.id)))
        toast({ title: "Bulk Delete", description: `${selectedPastors.length} pastors removed.` })
        break
    }
    setSelectedPastors([])
  }

  const handleSelectAll = () => {
    if (selectedPastors.length === filteredPastors.length) {
      setSelectedPastors([])
    } else {
      setSelectedPastors(filteredPastors.map(p => p.id))
    }
  }

  const handleSelectPastor = (pastorId: string) => {
    setSelectedPastors(prev => 
      prev.includes(pastorId) 
        ? prev.filter(id => id !== pastorId)
        : [...prev, pastorId]
    )
  }

  const stats = {
    total: pastors.length,
    active: pastors.filter(p => p.status === "active").length,
    inactive: pastors.filter(p => p.status === "inactive").length,
    totalMembers: pastors.reduce((sum, p) => sum + p.assignedMembers, 0),
    totalApproved: pastors.reduce((sum, p) => sum + p.approvedRequests, 0),
    totalPending: pastors.reduce((sum, p) => sum + p.pendingRequests, 0),
    avgPerformance: Math.round(pastors.reduce((sum, p) => sum + p.performance, 0) / pastors.length),
    fullTime: pastors.filter(p => p.availability === "Full-time").length,
    partTime: pastors.filter(p => p.availability === "Part-time").length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pastors Management</h1>
          <p className="text-muted-foreground mt-2">Manage all pastors in the parish</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Pastor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pastors</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In the parish</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently serving</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Not active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Under care</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApproved}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.avgPerformance)}`}>{stats.avgPerformance}%</div>
            <p className="text-xs text-muted-foreground">Overall score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full-time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fullTime}</div>
            <p className="text-xs text-muted-foreground">Dedicated staff</p>
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
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pastors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {mockZones.map(zone => (
                  <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="joinDate">Join Date</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="assignedMembers">Members</SelectItem>
                <SelectItem value="approvedRequests">Approved Requests</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="gap-2"
            >
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setZoneFilter("all")
              setSortBy("name")
              setSortOrder("asc")
            }}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPastors.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedPastors.length} pastor{selectedPastors.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("activate")}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("deactivate")}
                  className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("delete")}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pastors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Pastors ({filteredPastors.length})</CardTitle>
              <CardDescription>Manage and view all pastors in the parish</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="gap-2"
              >
                {selectedPastors.length === filteredPastors.length ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedPastors.length === filteredPastors.length && filteredPastors.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPastors.map((pastor) => (
                <TableRow key={pastor.id} className={selectedPastors.includes(pastor.id) ? "bg-blue-50" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPastors.includes(pastor.id)}
                      onChange={() => handleSelectPastor(pastor.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pastor.name}</div>
                      <div className="text-sm text-muted-foreground">Joined {new Date(pastor.joinDate).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{pastor.experience} experience</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {pastor.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {pastor.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {pastor.zone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pastor.specialization}</div>
                      <div className="text-xs text-muted-foreground">{pastor.education}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`font-medium ${getPerformanceColor(pastor.performance)}`}>
                        {pastor.performance}%
                      </div>
                      {getPerformanceBadge(pastor.performance)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(pastor.status)}</TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{pastor.assignedMembers}</div>
                      <div className="text-xs text-muted-foreground">members</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {pastor.approvedRequests} approved
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        {pastor.pendingRequests} pending
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleView(pastor)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(pastor)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(pastor)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Pastor Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Pastor</DialogTitle>
            <DialogDescription>Add a new pastor to the parish system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter pastor's full name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zone">Assigned Zone</Label>
              <Select value={createForm.zone} onValueChange={(value) => setCreateForm({ ...createForm, zone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {mockZones.map(zone => (
                    <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select value={createForm.specialization} onValueChange={(value) => setCreateForm({ ...createForm, specialization: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                type="date"
                value={createForm.joinDate}
                onChange={(e) => setCreateForm({ ...createForm, joinDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                placeholder="e.g., Master of Divinity"
                value={createForm.education}
                onChange={(e) => setCreateForm({ ...createForm, education: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                placeholder="e.g., 5 years"
                value={createForm.experience}
                onChange={(e) => setCreateForm({ ...createForm, experience: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="availability">Availability</Label>
              <Select value={createForm.availability} onValueChange={(value) => setCreateForm({ ...createForm, availability: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add Pastor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pastor Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pastor</DialogTitle>
            <DialogDescription>Update pastor information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter pastor's full name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                placeholder="Enter phone number"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-zone">Assigned Zone</Label>
              <Select value={editForm.zone} onValueChange={(value) => setEditForm({ ...editForm, zone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {mockZones.map(zone => (
                    <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Select value={editForm.specialization} onValueChange={(value) => setEditForm({ ...editForm, specialization: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-education">Education</Label>
              <Input
                id="edit-education"
                placeholder="e.g., Master of Divinity"
                value={editForm.education}
                onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-experience">Experience</Label>
              <Input
                id="edit-experience"
                placeholder="e.g., 5 years"
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-availability">Availability</Label>
              <Select value={editForm.availability} onValueChange={(value) => setEditForm({ ...editForm, availability: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Pastor Dialog */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pastor Details</DialogTitle>
            <DialogDescription>Complete information about the pastor</DialogDescription>
          </DialogHeader>
          {selectedPastor && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Full Name</Label>
                  <div className="text-sm font-medium">{selectedPastor.name}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="text-sm">{selectedPastor.email}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="text-sm">{selectedPastor.phone}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Zone</Label>
                  <div className="text-sm">{selectedPastor.zone}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Specialization</Label>
                  <div className="text-sm">{selectedPastor.specialization}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div>{getStatusBadge(selectedPastor.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Join Date</Label>
                  <div className="text-sm">{new Date(selectedPastor.joinDate).toLocaleDateString()}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Experience</Label>
                  <div className="text-sm">{selectedPastor.experience}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Education</Label>
                  <div className="text-sm">{selectedPastor.education}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Availability</Label>
                  <div className="text-sm">{selectedPastor.availability}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Languages</Label>
                  <div className="text-sm">{selectedPastor.languages?.join(", ") || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last Active</Label>
                  <div className="text-sm">{new Date(selectedPastor.lastActive).toLocaleDateString()}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assigned Members</Label>
                  <div className="text-sm">{selectedPastor.assignedMembers}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Performance Summary</h4>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{selectedPastor.approvedRequests}</div>
                      <div className="text-sm text-muted-foreground">Approved Requests</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-amber-500">{selectedPastor.pendingRequests}</div>
                      <div className="text-sm text-muted-foreground">Pending Requests</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{selectedPastor.assignedMembers}</div>
                      <div className="text-sm text-muted-foreground">Assigned Members</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className={`text-2xl font-bold ${getPerformanceColor(selectedPastor.performance)}`}>
                        {selectedPastor.performance}%
                      </div>
                      <div className="text-sm text-muted-foreground">Performance Score</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenView(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Pastor</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedPastor?.name} from the system? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove Pastor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

