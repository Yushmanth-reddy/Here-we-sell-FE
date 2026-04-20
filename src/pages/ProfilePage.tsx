import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Save,
  Loader2,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/store/authStore';
import { useMe, useUpdateProfile } from '@/lib/hooks/useAuth';
import {
  updateBioSchema,
  type UpdateBioFormValues,
} from '@/lib/utils/validators';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const { data: profileResponse, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const profile = profileResponse?.data;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateBioFormValues>({
    resolver: zodResolver(updateBioSchema),
    values: { bio: (profile as any)?.bio ?? '' },
  });

  const bioValue = watch('bio') ?? '';

  const onSaveBio = (data: UpdateBioFormValues) => {
    updateProfile.mutate(
      { bio: data.bio },
      {
        onSuccess: () => {
          toast.success('Profile updated!');
          setIsEditing(false);
        },
        onError: () => {
          toast.error('Failed to update profile.');
        },
      }
    );
  };

  const initials = authUser
    ? `${authUser.first_name?.[0] ?? ''}${authUser.last_name?.[0] ?? ''}`
    : '';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          My Profile
        </h1>
      </div>

      {/* Profile Card */}
      <Card className="mb-6 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={authUser?.avatar_url ?? ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-foreground">
                {authUser?.first_name} {authUser?.last_name}
              </h2>
              <div className="mt-2 flex flex-wrap justify-center gap-3 sm:justify-start">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {authUser?.email}
                </span>
                <Badge variant="secondary" className="gap-1 capitalize">
                  <Package className="h-3 w-3" />
                  {authUser?.role}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
                <Calendar className="h-3 w-3" />
                Member since IIITM Gwalior
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">About Me</CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSaveBio)} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  placeholder="Tell others about yourself..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('bio')}
                />
                <div className="mt-1 flex justify-between">
                  {errors.bio && (
                    <p className="text-xs text-destructive">
                      {errors.bio.message}
                    </p>
                  )}
                  <p
                    className={`ml-auto text-xs ${
                      bioValue.length > 500
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {bioValue.length}/500
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {(profile as any)?.bio || 'No bio yet. Click Edit to add one!'}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
