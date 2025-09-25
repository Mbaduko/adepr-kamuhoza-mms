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
import { MemberService, CreateUserData, UpdateUserPayload, Member } from '@/services/memberService';
import { useState } from "react"

export const Members: React.FC = () => {
  const { state } = useAuth()
  const { toast } = useToast()
  const user = state.user!

  // Use stores
  const { 
    members, 
    zones,
    totalMembers,
    loading: membersLoading, 
    error: membersError,
    isInitialized: membersInitialized,
    fetchAllMembers, // <-- Add this line to get the fetch function
  } = useMembersStore()
  
  const { 
    zones: allZones, 
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
  // Edit Member Dialog State
  const [openEditUser, setOpenEditUser] = React.useState(false);
  const [memberBeingEdited, setMemberBeingEdited] = React.useState<Member | null>(null);
  const [editForm, setEditForm] = React.useState<UpdateUserPayload>({});
  // View Member Dialog State
  const [openViewUser, setOpenViewUser] = React.useState(false);
  const [memberBeingViewed, setMemberBeingViewed] = React.useState<Member | null>(null);

  // Get default role based on current user's role
  const getDefaultRole = React.useCallback(() => {
    const currentUserRole = user?.role;
    
    switch (currentUserRole) {
      case 'parish-pastor':
        return 'PASTOR'; // Parish pastors can create pastors by default
      case 'pastor':
        return 'MEMBER'; // Pastors create members by default
      case 'zone-leader':
        return 'MEMBER'; // Zone leaders can only create members
      default:
        return 'MEMBER'; // Everyone else creates members by default
    }
  }, [user?.role]);

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    const currentUserRole = user?.role;
    
    switch (currentUserRole) {
      case 'parish-pastor':
        return [
          { value: 'MEMBER', label: 'Member' },
          { value: 'PASTOR', label: 'Pastor' },
          { value: 'ZONE_LEADER', label: 'Zone Leader' }
        ];
      case 'pastor':
        return [
          { value: 'MEMBER', label: 'Member' },
          { value: 'ZONE_LEADER', label: 'Zone Leader' }
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
  const [formData, setFormData] = useState<CreateUserData>({
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
    choir: "", // Optional - can be empty
    zone_id: user?.role === 'zone-leader' ? user.zoneId || "" : "",
    email: "",
    role: getDefaultRole(),
    account_status: "ACTIVE",
  });
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user's zone from members data
  const getCurrentUserZone = React.useCallback(() => {
    if (user?.role === 'zone-leader') {
      // Find the current user in the members array to get their zone
      const currentUserMember = members.find(member => 
        member.authId === user.id || member.email === user.email
      );
      return currentUserMember?.zoneId || "";
    }
    return "";
  }, [members, user?.email, user?.id, user?.role]);

  // Reset form when dialog opens to ensure zone leaders get their zone pre-populated
  React.useEffect(() => {
    if (openNewUser) {
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
        choir: "", // Optional - can be empty
        zone_id: getCurrentUserZone(),
        email: "",
        role: getDefaultRole(),
        account_status: "ACTIVE",
      });
      setValidationErrors({});
      setTouchedFields({});
      setIsSubmitting(false);
    }
  }, [openNewUser, user?.role, members, getCurrentUserZone, getDefaultRole]);

  // Real-time validation
  const validateField = (field: string, value: string | boolean): string => {
    switch (field) {
      case 'phone_number':
        if (!value) return '';
        if (typeof value === "string" && !validatePhoneNumber(value)) {
          return 'Phone number must be exactly 10 digits';
        }
        break;
      case 'email':
        if (!value) return '';
        if (typeof value === "string" && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'date_of_birth':
        if (!value) return '';
        if (typeof value === "string" && !validateDateOfBirth(value)) {
          return 'Please enter a valid date of birth (person must be between 1 and 120 years old)';
        }
        break;
      case 'marital_status':
        // No validation needed since "married in church" is only shown for non-single statuses
        break;
      case 'is_married_in_church':
        if (value && !formData.marriage_date) {
          return 'Marriage date is required when marked as married in church';
        }
        break;
      case 'marriage_date':
        if (value && formData.date_of_birth) {
          if (typeof value === "string") {
            const marriageDate = new Date(value);
            const birthDate = new Date(formData.date_of_birth);
            if (marriageDate <= birthDate) {
              return 'Marriage date cannot be before or on the same day as date of birth';
            }
          }
        }
        break;
      case 'choir':
        // Choir is now optional - no validation needed
        break;
      case 'zone_id':
        if ((formData.role === 'MEMBER' || formData.role === 'ZONE_LEADER') && (!value || value === 'none')) {
          return 'Zone assignment is required for members and zone leaders';
        }
        // For current user who is zone leader, ensure auto-assigned zone is present
        if (user?.role === 'zone-leader' && (!value || value === 'none')) {
          return 'Zone assignment is required for zone leaders';
        }
        break;
    }
    return '';
  };

  // Phone number formatting helper
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    } else {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
  };

  // Enhanced input change handler with validation
  const handleInputChangeWithValidation = (
    field: keyof CreateUserData,
    value: string | boolean
  ) => {
    // Special handling for marital status to prevent contradictory states
    if (field === 'marital_status') {
      // If changing to non-married status, automatically clear married in church data
      if (value !== 'MARRIED') {
        setFormData(prev => ({ 
          ...prev, 
          [field]: value as "MARRIED" | "SINGLE" | "DIVORCED" | "WIDOWED",
          is_married_in_church: false,
          marriage_date: ""
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Validate field
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
    
    // Cross-field validation for marital status
    if (field === 'marital_status' || field === 'is_married_in_church' || field === 'marriage_date') {
      const maritalError = validateMaritalStatusLogic(
        field === 'marital_status' ? String(value) : formData.marital_status,
        field === 'is_married_in_church' ? Boolean(value) : formData.is_married_in_church,
        field === 'marriage_date' ? String(value) : formData.marriage_date
      );
      
      setValidationErrors(prev => ({
        ...prev,
        marital_status: maritalError,
        is_married_in_church: maritalError,
        marriage_date: maritalError
      }));
    }

    // Cross-field validation for role and zone
    if (field === 'role' || field === 'zone_id') {
      const zoneError = validateField('zone_id', field === 'zone_id' ? value : formData.zone_id);
      setValidationErrors(prev => ({
        ...prev,
        zone_id: zoneError
      }));
    }
    
    // Auto-reset "married in church" when marital status changes to any non-married status
    if (field === 'marital_status' && value !== 'MARRIED') {
      setFormData(prev => ({ 
        ...prev, 
        is_married_in_church: false,
        marriage_date: ""
      }));
      setValidationErrors(prev => ({
        ...prev,
        is_married_in_church: '',
        marriage_date: ''
      }));
    }
  };

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters and check if it's exactly 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDateOfBirth = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return false;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // Check if person is between 1 and 120 years old
    return age >= 1 && age <= 120 && birthDate <= today;
  };

  const validateMaritalStatusLogic = (maritalStatus: string, isMarriedInChurch: boolean, marriageDate: string): string => {
    // If marital status is SINGLE, married in church should be false
    if (maritalStatus === 'SINGLE' && isMarriedInChurch) {
      return 'Single people cannot be married in church';
    }
    
    // If marital status is WIDOWED, married in church should be false
    if (maritalStatus === 'WIDOWED' && isMarriedInChurch) {
      return 'Widowed people cannot be marked as married in church';
    }
    
    // If marital status is DIVORCED, married in church should be false
    if (maritalStatus === 'DIVORCED' && isMarriedInChurch) {
      return 'Divorced people cannot be marked as married in church';
    }
    
    // If married in church is true, marital status should be MARRIED
    if (isMarriedInChurch && maritalStatus !== 'MARRIED') {
      return 'Only married people can be marked as married in church';
    }
    
    // If married in church is true, marriage date is required
    if (isMarriedInChurch && !marriageDate) {
      return 'Marriage date is required when marked as married in church';
    }
    
    return '';
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields validation
    if (!formData.first_name?.trim()) {
      errors.push("First name is required");
    }
    if (!formData.last_name?.trim()) {
      errors.push("Last name is required");
    }
    if (!formData.email?.trim()) {
      errors.push("Email is required");
    }
    if (!formData.phone_number?.trim()) {
      errors.push("Phone number is required");
    }
    if (!formData.date_of_birth) {
      errors.push("Date of birth is required");
    }
    // Choir is now optional - no validation needed

    // Phone number validation
    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      errors.push("Phone number must be exactly 10 digits");
    }

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    // Date of birth validation
    if (formData.date_of_birth && !validateDateOfBirth(formData.date_of_birth)) {
      errors.push("Please enter a valid date of birth (person must be between 1 and 120 years old)");
    }

    // Marital status logic validation
    const maritalStatusError = validateMaritalStatusLogic(formData.marital_status, formData.is_married_in_church, formData.marriage_date);
    if (maritalStatusError) {
      errors.push(maritalStatusError);
    }

    // Marriage date validation (if married in church)
    if (formData.is_married_in_church && !formData.marriage_date) {
      errors.push("Marriage date is required when marked as married in church");
    }

    // Marriage date validation (if provided)
    if (formData.marriage_date && formData.marriage_date.trim() !== '') {
      const marriageDate = new Date(formData.marriage_date);
      const birthDate = new Date(formData.date_of_birth);
      
      if (marriageDate <= birthDate) {
        errors.push("Marriage date cannot be before or on the same day as date of birth");
      }
    }

    // Zone validation for members
    if ((formData.role === 'MEMBER' || formData.role === 'ZONE_LEADER') && (!formData.zone_id || formData.zone_id === 'none')) {
      errors.push("Zone assignment is required for members and zone leaders");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Form handlers
  const handleInputChange = (field: keyof CreateUserData, value: string | boolean) => {
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
      zone_id: getCurrentUserZone(),
      email: "",
      role: getDefaultRole(),
      account_status: "ACTIVE",
    });
    setValidationErrors({});
    setTouchedFields({});
    setIsSubmitting(false);
    setOpenNewUser(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Pre-submission logical consistency check
    const submissionData = {
      ...formData,
      // Ensure married_in_church is only true for MARRIED status
      is_married_in_church: formData.marital_status === 'MARRIED' ? formData.is_married_in_church : false,
      // Clear marriage_date if not married in church or if empty
      marriage_date: (formData.marital_status === 'MARRIED' && formData.is_married_in_church && formData.marriage_date) ? formData.marriage_date : undefined,
      // Include zone_id if selected (for now, still exclude until backend is ready)
      // zone_id: formData.zone_id && formData.zone_id !== 'none' ? formData.zone_id : undefined,
    };
    
    // Clean up undefined values to prevent API errors
    Object.keys(submissionData).forEach(key => {
      if (submissionData[key] === undefined || submissionData[key] === "") {
        delete submissionData[key];
      }
      // Special handling for date fields - don't send empty strings
      if (key.includes('date') && (submissionData[key] === "" || submissionData[key] === null)) {
        delete submissionData[key];
      }
    });

    setIsSubmitting(true);
    try {
      const response = await MemberService.createUser(submissionData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Member created successfully!",
          variant: "default",
        });
        handleCancel();
        // Refresh members list
        await fetchAllMembers();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create member",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
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
      toast({
        title: "Error",
        description: "Failed to fetch members data.",
        variant: "destructive"
      })
      }
    }

    loadData()
  }, [fetchAllMembers, fetchAllZones, toast])



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
        description: "Failed to refresh members data.",
        variant: "destructive"
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
      total: totalMembers || members.length,
      active: members.filter(m => m.accountStatus === "ACTIVE").length,
      inactive: members.filter(m => m.accountStatus === "INACTIVE").length,
      byZone: zones.length
    }
  }, [members, zones, totalMembers])

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
    const key = (status || '').toLowerCase() as keyof typeof variants
    return (
      <Badge className={variants[key] || variants.inactive}>
        {status}
      </Badge>
    )
  }

  const formatRole = (role?: string) => {
    if (!role) return 'Member'
    const r = role.toString().toUpperCase()
    switch (r) {
      case 'ZONE_LEADER':
        return 'Zone Leader'
      case 'PASTOR':
        return 'Pastor'
      case 'PARISH_PASTOR':
        return 'Parish Pastor'
      case 'MEMBER':
        return 'Member'
      default: {
        const cleaned = role.replace(/[_-]+/g, ' ').toLowerCase()
        return cleaned.replace(/\b\w/g, c => c.toUpperCase())
      }
    }
  }

  const getRoleBadge = (role?: string) => {
    const r = (role || 'MEMBER').toString().toUpperCase()
    const variants: Record<string, string> = {
      MEMBER: 'bg-gray-100 text-gray-800',
      ZONE_LEADER: 'bg-yellow-100 text-yellow-800',
      PASTOR: 'bg-blue-100 text-blue-800',
      PARISH_PASTOR: 'bg-indigo-100 text-indigo-800',
    }
    const cls = variants[r] || 'bg-slate-100 text-slate-800'
    return (
      <Badge className={cls}>{formatRole(role)}</Badge>
    )
  }

  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId)
    return zone?.name || "Unknown Zone"
  }

  const openViewMember = (m: Member) => {
    setMemberBeingViewed(m)
    setOpenViewUser(true)
  }

  const openEditMember = (m: Member) => {
    setMemberBeingEdited(m)
    const nameParts = (m.name || '').trim().split(/\s+/)
    const firstName = nameParts.shift() || ''
    const lastName = nameParts.join(' ')
    const normalizedGender = m.gender ? String(m.gender).toUpperCase() as 'MALE' | 'FEMALE' : undefined
    setEditForm({
      first_name: firstName,
      last_name: lastName,
      phone_number: m.phone || '',
      gender: normalizedGender,
      date_of_birth: m.dateOfBirth || '',
      address: m.address || '',
      highest_degree: m.highestDegree || '',
      marital_status: (m.maritalStatus as ('single' | 'married' | 'divorced' | 'widowed')) || undefined,
      baptism_date: m.sacraments?.baptism?.date || '',
      marriage_date: m.sacraments?.marriage?.date || '',
      choir: m.choir || '',
    })
    setOpenEditUser(true)
  }

  const handleEditInput = <K extends keyof UpdateUserPayload>(field: K, value: UpdateUserPayload[K]) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const submitEditMember = async () => {
    if (!memberBeingEdited?.authId) {
      toast({ title: 'Error', description: 'Missing user identifier.', variant: 'error' })
      return
    }
    try {
      setIsSubmitting(true)
      const payload: UpdateUserPayload = { ...editForm }
      if (payload.gender) {
        payload.gender = String(payload.gender).toUpperCase() as 'MALE' | 'FEMALE'
      }
      // Clean empty strings to avoid overwriting with blanks
      Object.keys(payload).forEach((k) => {
        const key = k as keyof UpdateUserPayload
        if (payload[key] === '') delete payload[key]
      })
      const res = await MemberService.updateUser(memberBeingEdited.authId, payload)
      if (res.success) {
        toast({ title: 'Updated', description: 'Member information updated.', variant: 'success' })
        setOpenEditUser(false)
        setMemberBeingEdited(null)
        await fetchAllMembers()
      } else {
        toast({ title: 'Error', description: res.error?.message || 'Failed to update user.', variant: 'error' })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update user.', variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage and view church members with zone information.
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
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
                          <div className="mt-0.5">{getRoleBadge(member.role)}</div>
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
                            <DropdownMenuItem onClick={() => openViewMember(member)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditMember(member)}>
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

      {/* View Member Dialog */}
      <Dialog open={openViewUser} onOpenChange={setOpenViewUser}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Member Details
            </DialogTitle>
            <DialogDescription>
              Read-only overview of the selected member.
            </DialogDescription>
          </DialogHeader>

          {memberBeingViewed && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={memberBeingViewed.profileImage} />
                  <AvatarFallback>{getInitials(memberBeingViewed.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold leading-tight">{memberBeingViewed.name}</p>
                  <div className="mt-1">{getRoleBadge(memberBeingViewed.role)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {memberBeingViewed.email || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {memberBeingViewed.phone || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Zone</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {getZoneName(memberBeingViewed.zoneId || '')}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Account Status</Label>
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusBadge(memberBeingViewed.accountStatus)}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {memberBeingViewed.dateOfBirth ? new Date(memberBeingViewed.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Choir</Label>
                  <div className="text-sm">{memberBeingViewed.choir || 'N/A'}</div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <div className="text-sm">{memberBeingViewed.address || 'N/A'}</div>
                </div>
              </div>

              {memberBeingViewed.sacraments?.baptism?.date && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Baptism Date</Label>
                    <div className="text-sm">{new Date(memberBeingViewed.sacraments.baptism.date).toLocaleDateString()}</div>
                  </div>
                  {memberBeingViewed.sacraments?.marriage?.date && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Marriage Date</Label>
                      <div className="text-sm">{new Date(memberBeingViewed.sacraments.marriage.date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpenViewUser(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={openEditUser} onOpenChange={setOpenEditUser}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Edit Member
            </DialogTitle>
            <DialogDescription>
              Update member information. Only provided fields will be changed.
            </DialogDescription>
          </DialogHeader>

          {memberBeingEdited && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name</Label>
                  <Input id="edit_first_name" value={editForm.first_name || ''} onChange={e => handleEditInput('first_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name</Label>
                  <Input id="edit_last_name" value={editForm.last_name || ''} onChange={e => handleEditInput('last_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Phone Number</Label>
                  <Input id="edit_phone" value={editForm.phone_number || ''} onChange={e => handleEditInput('phone_number', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_gender">Gender</Label>
                  <Select value={editForm.gender || ''} onValueChange={(v) => handleEditInput('gender', v as ('MALE' | 'FEMALE'))}>
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
                  <Label htmlFor="edit_dob">Date of Birth</Label>
                  <Input id="edit_dob" type="date" value={editForm.date_of_birth || ''} onChange={e => handleEditInput('date_of_birth', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_address">Address</Label>
                  <Input id="edit_address" value={editForm.address || ''} onChange={e => handleEditInput('address', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_degree">Highest Degree</Label>
                  <Select
                    value={editForm.highest_degree || undefined}
                    onValueChange={(v) => handleEditInput("highest_degree", v as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                      <SelectItem value="Doctoral Degree">Doctoral Degree</SelectItem>
                      <SelectItem value="Professional Degree">Professional Degree</SelectItem>
                      <SelectItem value="Honorary Degree">Honorary Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_marital">Marital Status</Label>
                  <Select value={editForm.marital_status || ''} onValueChange={(v) => handleEditInput('marital_status', v as ('single' | 'married' | 'divorced' | 'widowed'))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_baptism">Baptism Date</Label>
                  <Input id="edit_baptism" type="date" value={editForm.baptism_date || ''} onChange={e => handleEditInput('baptism_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_marriage">Marriage Date</Label>
                  <Input id="edit_marriage" type="date" value={editForm.marriage_date || ''} onChange={e => handleEditInput('marriage_date', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit_choir">Choir</Label>
                  <Input id="edit_choir" value={editForm.choir || ''} onChange={e => handleEditInput('choir', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpenEditUser(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditMember} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                    onChange={(e) => handleInputChangeWithValidation("first_name", e.target.value)}
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
                    onChange={(e) => handleInputChangeWithValidation("last_name", e.target.value)}
                    placeholder="Enter last name"
                    required
               />
             </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
               <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChangeWithValidation("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                    autoComplete="off"
                    className={touchedFields.email && validationErrors.email ? "border-red-500" : ""}
                  />
                  {touchedFields.email && validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A password will be generated and sent to this email address
                  </p>
             </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-sm font-medium">
                    Phone Number *
                  </Label>
               <Input
                    id="phone_number"
                    value={formatPhoneNumber(formData.phone_number)}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      if (digitsOnly.length <= 10) {
                        handleInputChangeWithValidation("phone_number", digitsOnly);
                      }
                    }}
                    placeholder="Enter phone number (10 digits)"
                    className={touchedFields.phone_number && validationErrors.phone_number ? "border-red-500" : ""}
                  />
                  {touchedFields.phone_number && validationErrors.phone_number && (
                    <p className="text-sm text-red-500">{validationErrors.phone_number}</p>
                  )}
             </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <Select value={formData.gender} onValueChange={value => handleInputChangeWithValidation("gender", value as "MALE" | "FEMALE")}>
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
                    Date of Birth *
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChangeWithValidation("date_of_birth", e.target.value)}
                    className={touchedFields.date_of_birth && validationErrors.date_of_birth ? "border-red-500" : ""}
                  />
                  {touchedFields.date_of_birth && validationErrors.date_of_birth && (
                    <p className="text-sm text-red-500">{validationErrors.date_of_birth}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status" className="text-sm font-medium">
                    Marital Status
                  </Label>
                  <Select value={formData.marital_status} onValueChange={value => handleInputChangeWithValidation("marital_status", value as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED")}>
                    <SelectTrigger className={touchedFields.marital_status && validationErrors.marital_status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select marital status" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="DIVORCED">Divorced</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                   </SelectContent>
                 </Select>
                  {touchedFields.marital_status && validationErrors.marital_status && (
                    <p className="text-sm text-red-500">{validationErrors.marital_status}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Note: Only "Married" status allows "Married in Church" option
                  </p>
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
                    onChange={(e) => handleInputChangeWithValidation("address", e.target.value)}
                    placeholder="Enter full address"
                    rows={3}
               />
             </div>
                <div className="space-y-2">
                  <Label htmlFor="highest_degree" className="text-sm font-medium">
                    Highest Degree
                  </Label>
                  <Select
                    value={formData.highest_degree || undefined}
                    onValueChange={(value) =>
                      handleInputChangeWithValidation("highest_degree", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                      <SelectItem value="Doctoral Degree">Doctoral Degree</SelectItem>
                      <SelectItem value="Professional Degree">Professional Degree</SelectItem>
                      <SelectItem value="Honorary Degree">Honorary Degree</SelectItem>
                    </SelectContent>
                  </Select>
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
                    onChange={(e) => handleInputChangeWithValidation("baptism_date", e.target.value)}
              />
            </div>
                <div className="space-y-2">
                  <Label htmlFor="choir" className="text-sm font-medium">
                    Choir (Optional)
                  </Label>
              <Input
                    id="choir"
                    value={formData.choir}
                    onChange={(e) => handleInputChangeWithValidation("choir", e.target.value)}
                    placeholder="e.g., Youth Choir, Adult Choir (optional)"
                    className={touchedFields.choir && validationErrors.choir ? "border-red-500" : ""}
                  />
                  {touchedFields.choir && validationErrors.choir && (
                    <p className="text-sm text-red-500">{validationErrors.choir}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter the choir the member belongs to (optional)
                  </p>
            </div>
                <div className="space-y-2">
                  <Label htmlFor="zone_id" className="text-sm font-medium">
                    Zone Assignment {(formData.role === "MEMBER" || formData.role === "ZONE_LEADER") ? "(Required for Members & Zone Leaders)" : "(Optional)"}
                  </Label>
                  <Select 
                    value={formData.zone_id || "none"} 
                    onValueChange={value => handleInputChangeWithValidation("zone_id", value === "none" ? "" : value)} 
                    disabled={!(formData.role === "MEMBER" || formData.role === "ZONE_LEADER")}
                  >
                    <SelectTrigger className={touchedFields.zone_id && validationErrors.zone_id ? "border-red-500" : ""}>
                      <SelectValue placeholder={
                        user?.role === 'zone-leader' 
                          ? "Your zone (pre-selected)" 
                          : (formData.role === "MEMBER" || formData.role === "ZONE_LEADER")
                            ? "Select a zone (required)" 
                            : "Select a zone (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Zone Assignment</SelectItem>
                      {allZones.length > 0 ? (
                        (() => {
                          // Filter zones based on user role
                          const filteredZones = allZones.filter(zone => {
                            // If user is zone leader, only show their zone
                            if (user?.role === 'zone-leader') {
                              const currentUserZone = getCurrentUserZone();
                              return zone.id === currentUserZone;
                            }
                            // Otherwise show all zones
                            return true;
                          });

                          // If no zones match for zone leader, show their zone anyway if we have the zoneId
                          if (user?.role === 'zone-leader' && filteredZones.length === 0) {
                            const currentUserZone = getCurrentUserZone();
                            if (currentUserZone) {
                              return (
                                <SelectItem key={currentUserZone} value={currentUserZone}>
                                  {allZones.find(z => z.id === currentUserZone)?.name || `Zone ${currentUserZone}`}
                                </SelectItem>
                              );
                            }
                          }

                          return filteredZones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name}
                            </SelectItem>
                          ));
                        })()
                      ) : (
                        <SelectItem value="no-zones" disabled>
                          No zones available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {user?.role === 'zone-leader' && formData.zone_id && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>
                        Auto-assigned to your zone: {allZones.find(z => z.id === formData.zone_id)?.name || `Zone ${formData.zone_id}`}
                      </span>
                    </div>
                  )}
                  {touchedFields.zone_id && validationErrors.zone_id && (
                    <p className="text-sm text-red-500">{validationErrors.zone_id}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {zonesLoading ? "Loading zones..." :
                      user?.role === 'zone-leader'
                        ? `Zone automatically set to your assigned zone - you can only assign members to your zone (Your zone: ${getCurrentUserZone()})`
                        : (formData.role === "MEMBER" || formData.role === "ZONE_LEADER")
                          ? `Zone assignment is required (${allZones.length} zones available)`
                          : "Zone assignment will be available once backend database is updated"}
                  </p>
                </div>
                {/* Only show "Married in Church" section for MARRIED status */}
                {formData.marital_status === "MARRIED" && (
                  <div className="space-y-2">
                    <Label htmlFor="is_married_in_church" className="text-sm font-medium">
                      Married in Church
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_married_in_church"
                        checked={formData.is_married_in_church}
                        onCheckedChange={(checked) => handleInputChangeWithValidation("is_married_in_church", checked)}
                      />
                      <Label htmlFor="is_married_in_church" className="text-sm">
                        Yes, married in church
                      </Label>
            </div>
                    {touchedFields.is_married_in_church && validationErrors.is_married_in_church && (
                      <p className="text-sm text-red-500">{validationErrors.is_married_in_church}</p>
                    )}
                  </div>
                )}
                {formData.is_married_in_church && (
                  <div className="space-y-2">
                    <Label htmlFor="marriage_date" className="text-sm font-medium">
                      Marriage Date *
                    </Label>
              <Input
                      id="marriage_date"
                type="date"
                      value={formData.marriage_date}
                      onChange={(e) => handleInputChangeWithValidation("marriage_date", e.target.value)}
                      className={touchedFields.marriage_date && validationErrors.marriage_date ? "border-red-500" : ""}
              />
                    {touchedFields.marriage_date && validationErrors.marriage_date && (
                      <p className="text-sm text-red-500">{validationErrors.marriage_date}</p>
                    )}
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
                <Select value={formData.role} onValueChange={value => handleInputChangeWithValidation("role", value as "MEMBER" | "PASTOR" | "ZONE_LEADER")}>
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
