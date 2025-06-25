'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { OTPInput } from '@/components/ui/otp-input';
import { authApi, useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useTranslation } from '@/lib/useTranslation';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const otpSchema = z.object({
  otp: z.string().min(4, 'OTP is required'),
});

const registrationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required').optional(),
  last_name: z.string().optional(),
});

type OTPFormData = z.infer<typeof otpSchema>;
type RegistrationFormData = z.infer<typeof registrationSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'phone' | 'otp' | 'registration'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const { setAuth } = useAuth();

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const resetModal = () => {
    setStep('phone');
    setIsLoading(false);
    setPhoneNumber('');
    setPhoneValue('');
    setPhoneError('');
    setOtpValue('');
    setSessionToken('');
    otpForm.reset();
    registrationForm.reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (!phoneValue) {
      setPhoneError('Please enter a phone number');
      return;
    }

    // Validate phone number using libphonenumber-js
    if (!isValidPhoneNumber(phoneValue)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Parse phone number using libphonenumber-js
      const parsedPhone = parsePhoneNumber(phoneValue);

      if (!parsedPhone) {
        setPhoneError('Invalid phone number format');
        setIsLoading(false);
        return;
      }

      // Format exactly as backend expects
      const country_code = String(parsedPhone.countryCallingCode); // "966", "973", etc.
      const phone = String(parsedPhone.nationalNumber); // "50708824", etc.

      console.log('Phone data being sent:', {
        country_code,
        phone,
        original: phoneValue,
        debug: {
          countryCallingCode: parsedPhone.countryCallingCode,
          nationalNumber: parsedPhone.nationalNumber,
          country: parsedPhone.country
        }
      });

      const response = await authApi.initiateAuth('phone', { country_code, phone });

      const sessionTokenValue = response.session_token;

      setSessionToken(sessionTokenValue);
      setPhoneNumber(phoneValue);
      setStep('otp');
      toast.success(t('verification_code_sent'));
    } catch (error: any) {
      console.error('Phone submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification code';

      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes('phone') || errorMessage.toLowerCase().includes('number')) {
        setPhoneError(errorMessage);
      }
    }
    setIsLoading(false);
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {

      if (!sessionToken) {
        toast.error('Session token is missing. Please restart authentication.');
        return;
      }

      const response = await authApi.verifyOTP(data.otp, sessionToken);

      if (response.type === 'new' && response.requires_registration) {
        setSessionToken(response.session_token || sessionToken);
        setStep('registration');
        toast.info('Please complete your registration');
      } else if (response.type === 'authenticated' && response.token && response.customer) {
        setAuth(response.token, response.customer);

        setTimeout(() => {
          const authState = useAuth.getState();
        }, 50);

        toast.success(t('login_successful'));
        handleClose();
        onSuccess?.();
      } else {
        toast.error('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    }
    setIsLoading(false);
  };

  const handleOtpComplete = async (otp: string) => {
    setOtpValue(otp);
    if (otp.length === 4) {
      await onOTPSubmit({ otp });
    }
  };

  const onRegistrationSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.completeRegistration(data as any, sessionToken);
      if (response.token && response.customer) {
        setAuth(response.token, response.customer);
        toast.success(t('registration_successful'));
        handleClose();
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
    setIsLoading(false);
  };

  const resendOTP = async () => {
    if (!sessionToken) {
      toast.error('Session token is missing. Please restart authentication.');
      return;
    }

    try {
      await authApi.resendOTP(sessionToken);
      toast.success('Verification code resent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtpValue('');
    otpForm.reset();
  };

  // Real-time phone validation
  const handlePhoneChange = (value: string) => {
    setPhoneValue(value || '');
    setPhoneError(''); // Clear error when user starts typing
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Force LTR direction for the entire modal */}
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card/90 backdrop-blur-md border border-border/50 p-6 text-left align-middle shadow-xl transition-all" dir="ltr">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-foreground">
                    {step === 'phone' && t('login_or_register')}
                    {step === 'otp' && t('enter_verification_code')}
                    {step === 'registration' && t('complete_registration')}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {step === 'phone' && (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('phone_number')}
                      </label>
                      <PhoneInput
                        international
                        countryCallingCodeEditable={false}
                        defaultCountry="SA"
                        value={phoneValue}
                        onChange={handlePhoneChange}
                        className="phone-input w-full"
                        style={{
                          '--PhoneInputCountryFlag-height': '1.2em',
                          '--PhoneInputCountrySelectArrow-color': 'currentColor',
                          '--PhoneInput-color--focus': 'hsl(var(--ring))',
                        } as React.CSSProperties}
                        placeholder="Enter phone number"
                      />
                      {phoneError && (
                        <p className="text-destructive text-sm mt-1">{phoneError}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-primary/90 hover:bg-primary backdrop-blur-sm" disabled={isLoading}>
                      {isLoading ? t('sending') : t('send_verification_code')}
                    </Button>
                  </form>
                )}

                {step === 'otp' && (
                  <div>
                    <p className="text-muted-foreground text-center mb-6">
                      {t('verification_code_sent')} <br />
                      <span className="font-medium text-foreground">{phoneNumber}</span>
                    </p>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-4 text-center">
                          {t('enter_code_label')}
                        </label>
                        <OTPInput
                          length={4}
                          value={otpValue}
                          onChange={setOtpValue}
                          onComplete={handleOtpComplete}
                          autoFocus
                          disabled={isLoading}
                          className="mb-4"
                        />
                        {otpForm.formState.errors.otp && (
                          <p className="text-destructive text-sm mt-2 text-center">{otpForm.formState.errors.otp.message}</p>
                        )}
                      </div>

                      <Button
                        onClick={() => handleOtpComplete(otpValue)}
                        className="w-full bg-primary/90 hover:bg-primary backdrop-blur-sm"
                        disabled={isLoading || otpValue.length !== 4}
                      >
                        {isLoading ? t('verifying') : t('verify_code')}
                      </Button>

                      <div className="flex justify-between text-sm">
                        <button
                          type="button"
                          onClick={goBackToPhone}
                          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                        >
                          ← {t('change_number')}
                        </button>
                        <button
                          type="button"
                          onClick={resendOTP}
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          {t('resend_code')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 'registration' && (
                  <div>
                    <p className="text-muted-foreground text-center mb-6">
                      {t('complete_profile')}
                    </p>
                    <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          {t('email_address')}
                        </label>
                        <input
                          type="email"
                          {...registrationForm.register('email')}
                          className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                          placeholder="your@email.com"
                        />
                        {registrationForm.formState.errors.email && (
                          <p className="text-destructive text-sm mt-1">{registrationForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            {t('first_name')}
                          </label>
                          <input
                            type="text"
                            {...registrationForm.register('name')}
                            className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                            placeholder="John"
                          />
                          {registrationForm.formState.errors.name && (
                            <p className="text-destructive text-sm mt-1">{registrationForm.formState.errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            {t('last_name')}
                          </label>
                          <input
                            type="text"
                            {...registrationForm.register('last_name')}
                            className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                            placeholder="Doe"
                          />
                          {registrationForm.formState.errors.last_name && (
                            <p className="text-destructive text-sm mt-1">{registrationForm.formState.errors.last_name.message}</p>
                          )}
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-primary/90 hover:bg-primary backdrop-blur-sm" disabled={isLoading}>
                        {isLoading ? t('creating_account') : t('complete_registration_button')}
                      </Button>
                    </form>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
