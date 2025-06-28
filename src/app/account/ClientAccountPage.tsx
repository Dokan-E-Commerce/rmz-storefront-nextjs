'use client';

import { useState, useEffect } from 'react';
import { useAuth, authApi } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/lib/useTranslation';
import AccountLayout from '@/components/layout/AccountLayout';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);

  const { customer, updateCustomer, isAuthenticated, isLoading: authLoading } = useAuth();

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: customer?.first_name || '',
      lastName: customer?.last_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    },
  });

  // Reset form when customer data changes
  useEffect(() => {
    if (customer) {
      profileForm.reset({
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
    }
  }, [customer, profileForm]);

  // Redirect if not authenticated (but not while loading)
  useEffect(() => {
    if (!authLoading && !isAuthenticated && typeof window !== 'undefined') {
      // Redirect to home page or show login modal
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    
    try {
      const updatedCustomer = await authApi.updateProfile(data);
      updateCustomer(updatedCustomer);
      toast.success(t('profile_updated_successfully'));
    } catch (error: any) {
      // Try to get the error message from different possible locations
      let errorMessage = t('error_updating_profile');
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for direct message
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Check for errors object with field-specific errors
        else if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        }
      }
      // Fallback to error message if available
      else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const isValid = await profileForm.trigger();
    if (!isValid) {
      return;
    }
    
    // Get form data
    const data = profileForm.getValues();
    await onProfileSubmit(data);
  };



  // Show loading state if auth is loading or customer data is not loaded
  if (authLoading || (!isAuthenticated && authLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading_account_information')}</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, redirect will happen in useEffect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">{t('personal_info')}</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('first_name')}
              </label>
              <input
                type="text"
                {...profileForm.register('firstName')}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {profileForm.formState.errors.firstName && (
                <p className="text-destructive text-sm mt-1">{profileForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('last_name')}
              </label>
              <input
                type="text"
                {...profileForm.register('lastName')}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {profileForm.formState.errors.lastName && (
                <p className="text-destructive text-sm mt-1">{profileForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              {...profileForm.register('email')}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {profileForm.formState.errors.email && (
              <p className="text-destructive text-sm mt-1">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('phone')}
            </label>
            <input
              type="text"
              value={customer?.phone && customer?.country_code ? `+${customer.country_code}${customer.phone}` : ''}
              disabled
              className="w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground phone-adaptive"
              dir="ltr"
            />
            <p className="text-sm text-muted-foreground mt-1">{t('phone_number_cannot_be_changed')}</p>
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? t('updating') : t('update_profile')}
          </Button>
        </form>
      </div>
    </AccountLayout>
  );
}
