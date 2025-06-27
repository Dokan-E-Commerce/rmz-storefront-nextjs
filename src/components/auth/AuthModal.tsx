'use client';

import { Fragment, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { OTPInput } from '@/components/ui/otp-input';
import { authApi, useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';
import { devLog, devWarn } from '@/lib/console-branding';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useTranslation } from '@/lib/useTranslation';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { modalVariants, backdropVariants, scaleVariants } from '@/lib/animations';

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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
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

  // Countdown timer effect for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Countdown timer effect for verification attempts
  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => {
        setVerificationCooldown(verificationCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  const resetModal = () => {
    setStep('phone');
    setIsLoading(false);
    setPhoneNumber('');
    setPhoneValue('');
    setPhoneError('');
    setOtpValue('');
    setSessionToken('');
    setResendCooldown(0);
    setVerificationAttempts(0);
    setOtpSentTime(null);
    setVerificationCooldown(0);
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
      setPhoneError(t('please_enter_phone_number'));
      return;
    }

    // Validate phone number using libphonenumber-js
    if (!isValidPhoneNumber(phoneValue)) {
      setPhoneError(t('please_enter_phone_number'));
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

      devLog('Phone data being sent:', {
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
      setResendCooldown(30); // Start cooldown when OTP is sent
      setOtpSentTime(Date.now()); // Track when OTP was sent
      setVerificationAttempts(0); // Reset attempts for new OTP
      toast.success(
        <div style={{ direction: 'rtl' }}>
          {t('verification_code_sent')}{' '}
          <span style={{ direction: 'ltr', display: 'inline-block' }}>{phoneValue}</span>
        </div>
      );
    } catch (error: any) {
      devWarn('Phone submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification code';

      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes('phone') || errorMessage.toLowerCase().includes('number')) {
        setPhoneError(errorMessage);
      }
    }
    setIsLoading(false);
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    // Check if OTP has expired (5 minutes)
    if (otpSentTime && Date.now() - otpSentTime > 5 * 60 * 1000) {
      toast.error('Verification code has expired. Please request a new one.');
      return;
    }

    // Check if too many verification attempts
    if (verificationAttempts >= 3) {
      toast.error('Too many failed attempts. Please request a new code.');
      return;
    }

    // Check verification cooldown
    if (verificationCooldown > 0) {
      toast.error(`Please wait ${verificationCooldown} seconds before trying again.`);
      return;
    }

    setIsLoading(true);
    try {

      if (!sessionToken) {
        toast.error('Session token is missing. Please restart authentication.');
        setIsLoading(false);
        return;
      }

      // Ensure cart token is synced before authentication
      const { syncCartToken } = useCart.getState();
      syncCartToken();

      const response = await authApi.verifyOTP(data.otp, sessionToken);

      if (response.type === 'new' && response.requires_registration) {
        setSessionToken(response.session_token || sessionToken);
        setStep('registration');
        toast.info('Please complete your registration');
      } else if (response.type === 'authenticated' && response.token && response.customer) {
        devLog('🔐 AuthModal: Authentication successful, cart_token:', response.cart_token?.substring(0, 10) + '...');
        setAuth(response.token, response.customer);

        // Handle cart after authentication - preserve guest cart
        const { cart_token: guestCartToken, fetchCart } = useCart.getState();
        devLog('🔐 AuthModal: Guest cart token before auth:', guestCartToken?.substring(0, 10) + '...');
        devLog('🔐 AuthModal: Auth response cart token:', response.cart_token?.substring(0, 10) + '...');
        
        // Keep using the guest cart token - the backend should merge carts server-side
        // Don't overwrite the guest cart token with the auth response token
        if (guestCartToken) {
          devLog('🔐 AuthModal: Preserving guest cart token and fetching updated cart');
          // Just fetch the cart - the backend should have merged it with the user's account
          fetchCart().catch(devWarn);
        } else if (response.cart_token) {
          // Only set the auth cart token if we don't have a guest cart
          const { setCartToken } = useCart.getState();
          devLog('🔐 AuthModal: No guest cart, using auth response cart token');
          setCartToken(response.cart_token);
          fetchCart().catch(devWarn);
        }

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
      // Increment attempts and set cooldown
      const newAttempts = verificationAttempts + 1;
      setVerificationAttempts(newAttempts);
      
      // Set progressive cooldown based on attempts
      if (newAttempts === 1) {
        setVerificationCooldown(5); // 5 seconds after first failure
      } else if (newAttempts === 2) {
        setVerificationCooldown(10); // 10 seconds after second failure
      } else if (newAttempts >= 3) {
        setVerificationCooldown(30); // 30 seconds after third failure
      }
      
      toast.error(error.response?.data?.message || t('invalid_verification_code'));
    }
    setIsLoading(false);
  };

  const handleOtpComplete = async (otp: string) => {
    setOtpValue(otp);
    if (otp.length === 4 && verificationCooldown === 0) {
      await onOTPSubmit({ otp });
    }
  };

  const onRegistrationSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      // Ensure cart token is synced before registration
      const { syncCartToken } = useCart.getState();
      syncCartToken();
      
      const response = await authApi.completeRegistration(data as any, sessionToken);
      if (response.token && response.customer) {
        devLog('🔐 AuthModal: Registration successful, cart_token:', response.cart_token?.substring(0, 10) + '...');
        setAuth(response.token, response.customer);
        
        // Handle cart after registration - preserve guest cart
        const { cart_token: guestCartToken, fetchCart } = useCart.getState();
        devLog('🔐 AuthModal: Guest cart token before registration:', guestCartToken?.substring(0, 10) + '...');
        devLog('🔐 AuthModal: Registration response cart token:', response.cart_token?.substring(0, 10) + '...');
        
        // Keep using the guest cart token - the backend should merge carts server-side
        if (guestCartToken) {
          devLog('🔐 AuthModal: Preserving guest cart token and fetching updated cart');
          fetchCart().catch(devWarn);
        } else if (response.cart_token) {
          // Only set the registration cart token if we don't have a guest cart
          const { setCartToken } = useCart.getState();
          devLog('🔐 AuthModal: No guest cart, using registration response cart token');
          setCartToken(response.cart_token);
          fetchCart().catch(devWarn);
        }
        
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

    if (resendCooldown > 0) {
      return; // Prevent resend during cooldown
    }

    try {
      await authApi.resendOTP(sessionToken);
      
      // Clear OTP input when new code is sent
      setOtpValue('');
      otpForm.setValue('otp', '');
      
      // Reset verification attempts and update OTP sent time
      setVerificationAttempts(0);
      setVerificationCooldown(0);
      setOtpSentTime(Date.now());
      
      toast.success(t('verification_code_resent'));
      setResendCooldown(30); // Set 30 second cooldown
    } catch (error: any) {
      // If we get 429 error, still set cooldown
      if (error.response?.status === 429) {
        setResendCooldown(30);
      }
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
    <AnimatePresence>
      {isOpen && (
        <div className="relative z-50">
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <motion.div
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card/90 backdrop-blur-md border border-border/50 p-6 text-left align-middle shadow-xl"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                dir="ltr"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium leading-6 text-foreground">
                    {step === 'phone' && t('login_or_register')}
                    {step === 'otp' && t('enter_verification_code')}
                    {step === 'registration' && t('complete_registration')}
                  </h3>
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
                        countries={[
                          // GCC Countries (First)
                          'SA', // Saudi Arabia
                          'AE', // United Arab Emirates
                          'KW', // Kuwait
                          'QA', // Qatar
                          'BH', // Bahrain
                          'OM', // Oman
                          // Other Arab Countries
                          'EG', // Egypt
                          'JO', // Jordan
                          'LB', // Lebanon
                          'IQ', // Iraq
                          'YE', // Yemen
                          'SY', // Syria
                          'PS', // Palestine
                          'MA', // Morocco
                          'DZ', // Algeria
                          'TN', // Tunisia
                          'LY', // Libya
                          'SD', // Sudan
                          'MR', // Mauritania
                          'DJ', // Djibouti
                          'SO', // Somalia
                          'KM', // Comoros
                        ]}
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
                      <span className="font-medium text-foreground">{phoneNumber || phoneValue || 'No phone number found'}</span>
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
                          disabled={isLoading || verificationCooldown > 0}
                          className="mb-4"
                        />
                        {otpForm.formState.errors.otp && (
                          <p className="text-destructive text-sm mt-2 text-center">{otpForm.formState.errors.otp.message}</p>
                        )}
                      </div>

                      <Button
                        onClick={() => handleOtpComplete(otpValue)}
                        className="w-full bg-primary/90 hover:bg-primary backdrop-blur-sm"
                        disabled={isLoading || otpValue.length !== 4 || verificationCooldown > 0}
                      >
                        {isLoading ? t('verifying') : 
                         verificationCooldown > 0 ? `${t('verify_code')} (${verificationCooldown}s)` :
                         t('verify_code')}
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
                          disabled={resendCooldown > 0}
                          className={`font-medium transition-colors ${
                            resendCooldown > 0 
                              ? 'text-muted-foreground cursor-not-allowed' 
                              : 'text-primary hover:text-primary/80 cursor-pointer'
                          }`}
                        >
                          {resendCooldown > 0 
                            ? `${t('resend_code')} (${resendCooldown}s)` 
                            : t('resend_code')
                          }
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
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
