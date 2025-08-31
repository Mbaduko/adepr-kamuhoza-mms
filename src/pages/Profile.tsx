import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Crown,
  UserCheck
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
    phone: state.user?.phone || '',
    address: state.user?.address || '',
    bio: state.user?.bio || ''
  });

  if (!state.user) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Here you would typically call an API to update user profile
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
      variant: "success",
    });
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: state.user?.name || '',
      email: state.user?.email || '',
      phone: state.user?.phone || '',
      address: state.user?.address || '',
      bio: state.user?.bio || ''
    });
    setIsEditing(false);
    toast({
      title: "Changes Cancelled",
      description: "Your changes have been discarded.",
      variant: "info",
    });
  };

  const getRoleIcon = () => {
    switch (state.user.role) {
      case 'member': return <User className="h-5 w-5" />;
      case 'zone-leader': return <UserCheck className="h-5 w-5" />;
      case 'pastor': return <Crown className="h-5 w-5" />;
      case 'parish-pastor': return <Shield className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getRoleBadgeVariant = () => {
    switch (state.user.role) {
      case 'member': return 'secondary' as const;
      case 'zone-leader': return 'default' as const;
      case 'pastor': return 'default' as const;
      case 'parish-pastor': return 'default' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and account settings
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl">{state.user.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                {getRoleIcon()}
                <Badge variant={getRoleBadgeVariant()}>
                  {state.user.role.replace('-', ' ').toUpperCase()}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{state.user.email}</span>
              </div>
              {state.user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{state.user.phone}</span>
                </div>
              )}
              {state.user.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{state.user.address}</span>
                </div>
              )}
              {state.user.choir && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Choir: {state.user.choir}</span>
                </div>
              )}
              {state.user.gender && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Gender: {state.user.gender}</span>
                </div>
              )}
              {state.user.maritalStatus && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Status: {state.user.maritalStatus}</span>
                </div>
              )}
              {state.user.highestDegree && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Education: {state.user.highestDegree}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Member since {new Date(state.user.joinDate || Date.now()).getFullYear()}</span>
              </div>
              {state.user.zoneId && (
                <div className="pt-4">
                  <Separator className="mb-4" />
                  <div className="text-sm">
                    <span className="font-medium">Zone: </span>
                    <span className="text-muted-foreground">Zone {state.user.zoneId}</span>
                  </div>
                </div>
              )}
              
              {/* Account Status */}
              <div className="pt-4">
                <Separator className="mb-4" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Account Status:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {state.user.accountStatus || 'Active'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Email Verified:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {state.user.isVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Church and personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {state.user.firstName && (
                  <div>
                    <Label>First Name</Label>
                    <Input value={state.user.firstName} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.lastName && (
                  <div>
                    <Label>Last Name</Label>
                    <Input value={state.user.lastName} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.phoneNumber && (
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={state.user.phoneNumber} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.gender && (
                  <div>
                    <Label>Gender</Label>
                    <Input value={state.user.gender} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.dateOfBirth && (
                  <div>
                    <Label>Date of Birth</Label>
                    <Input value={state.user.dateOfBirth} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.choir && (
                  <div>
                    <Label>Choir</Label>
                    <Input value={state.user.choir} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.highestDegree && (
                  <div>
                    <Label>Highest Degree</Label>
                    <Input value={state.user.highestDegree} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.maritalStatus && (
                  <div>
                    <Label>Marital Status</Label>
                    <Input value={state.user.maritalStatus} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.marriageDate && (
                  <div>
                    <Label>Marriage Date</Label>
                    <Input value={state.user.marriageDate} disabled className="bg-muted" />
                  </div>
                )}
                {state.user.baptismDate && (
                  <div>
                    <Label>Baptism Date</Label>
                    <Input value={state.user.baptismDate} disabled className="bg-muted" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
