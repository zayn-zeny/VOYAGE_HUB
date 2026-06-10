import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, changePasswordSchema } from '@/lib/validations';
import useAuth from '@/hooks/useAuth';
import { useDeleteLocation } from '@/hooks/useMaps';
import api from '@/lib/api';
import { 
  User, 
  Lock, 
  Settings, 
  MapPin, 
  Trash2, 
  Sparkles,
  Loader2,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

const interestOptions = [
  'sightseeing', 'food', 'shopping', 'nature', 
  'history', 'museums', 'nightlife', 'adventure', 
  'beaches', 'culture', 'relaxation'
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const deleteLocationMutation = useDeleteLocation();

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // Form: Profile General
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  // Form: Change Password
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onUpdateProfile = async (data) => {
    setIsLoadingProfile(true);
    try {
      const res = await api.put('/users/profile', {
        name: data.name,
        bio: data.bio,
      });
      updateUser(res.data.user);
      toast.success('Profile details updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsLoadingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleRemoveSavedLocation = async (id) => {
    try {
      await deleteLocationMutation.mutateAsync(id);
    } catch (err) {
      toast.error('Failed to remove location');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('CAUTION: Are you sure you want to delete your account? This will permanently erase all your trips and saved locations. This action cannot be undone.')) {
      setIsLoadingDelete(true);
      try {
        await api.delete('/users/account');
        toast.success('Your account has been deleted.');
        logout();
        navigate('/');
      } catch (err) {
        toast.error('Failed to delete account');
      } finally {
        setIsLoadingDelete(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your account profile, travel styles, and security options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General settings */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>General Profile</CardTitle>
              <CardDescription>Update your public travel details and biography</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profName">Full Name</Label>
                    <Input id="profName" type="text" {...registerProfile('name')} />
                    {errorsProfile.name && (
                      <p className="text-xs font-semibold text-destructive">{errorsProfile.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profEmail">Email Address</Label>
                    <Input id="profEmail" type="email" value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profBio">Bio / Traveler Description</Label>
                  <Textarea id="profBio" placeholder="Tell us about your travel dreams..." {...registerProfile('bio')} />
                  {errorsProfile.bio && (
                    <p className="text-xs font-semibold text-destructive">{errorsProfile.bio.message}</p>
                  )}
                </div>
                <Button type="submit" size="sm" variant="gradient" disabled={isLoadingProfile}>
                  {isLoadingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Save Profile Details
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Keep your password up-to-date and secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currPass">Current Password</Label>
                    <Input id="currPass" type="password" {...registerPassword('currentPassword')} />
                    {errorsPassword.currentPassword && (
                      <p className="text-xs font-semibold text-destructive">{errorsPassword.currentPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPass">New Password</Label>
                    <Input id="newPass" type="password" {...registerPassword('newPassword')} />
                    {errorsPassword.newPassword && (
                      <p className="text-xs font-semibold text-destructive">{errorsPassword.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confPass">Confirm New Password</Label>
                    <Input id="confPass" type="password" {...registerPassword('confirmNewPassword')} />
                    {errorsPassword.confirmNewPassword && (
                      <p className="text-xs font-semibold text-destructive">{errorsPassword.confirmNewPassword.message}</p>
                    )}
                  </div>
                </div>
                <Button type="submit" size="sm" variant="outline" disabled={isLoadingPassword} className="border-border/80 font-semibold">
                  {isLoadingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-500/20 bg-red-500/5 dark:bg-red-950/5">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertTriangle size={18} /> Danger Zone
              </CardTitle>
              <CardDescription>Permanently erase all details associated with this account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-normal mb-4 font-semibold">
                Deleting your account is immediate and irreversible. It will wipe your travel logs, notes, itinerary files, and credentials completely.
              </p>
              <Button onClick={handleDeleteAccount} variant="destructive" size="sm" disabled={isLoadingDelete}>
                {isLoadingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Permanently Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Saved locations */}
        <div className="space-y-6">
          <Card className="border-border/60 flex flex-col max-h-[500px]">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle>Saved Locations</CardTitle>
              <CardDescription>Landmarks bookmarked from explore search</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-0">
              {!user?.savedLocations || user.savedLocations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-10 h-10 text-muted-foreground/35 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No saved locations found</p>
                  <Button variant="link" size="sm" onClick={() => navigate('/explore')} className="text-xs font-semibold">
                    Go explore places
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {user.savedLocations.map((loc) => (
                    <div
                      key={loc._id}
                      className="p-3 rounded-lg border border-border/40 hover:bg-slate-50 dark:hover:bg-slate-900/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold truncate text-foreground/90">{loc.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-semibold mt-0.5">
                          {loc.coordinates?.lat.toFixed(4)}, {loc.coordinates?.lng.toFixed(4)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemoveSavedLocation(loc._id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
