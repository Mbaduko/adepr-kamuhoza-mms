import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
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
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="Enter your phone number"
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
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio / About Me</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  placeholder="Tell us a little about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details and membership status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Member ID</Label>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {state.user.id}
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="text-sm p-2">
                    <Badge variant={getRoleBadgeVariant()} className="text-xs">
                      {state.user.role.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Join Date</Label>
                  <div className="text-sm p-2">
                    {new Date(state.user.joinDate || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                {state.user.zoneId && (
                  <div>
                    <Label>Zone Assignment</Label>
                    <div className="text-sm p-2">
                      Zone {state.user.zoneId}
                    </div>
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
