'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  value?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 4,
  onComplete,
  onChange,
  value = '',
  className,
  disabled = false,
  autoFocus = false,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(
    value.split('').concat(Array(length - value.length).fill(''))
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value !== otp.join('')) {
      setOtp(value.split('').concat(Array(length - value.length).fill('')));
    }
  }, [value, length]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange?.(otpString);

    // Auto focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all fields are filled
    if (otpString.length === length && !otpString.includes('')) {
      onComplete?.(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      } else if (index > 0) {
        // Focus previous field and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const numericData = pastedData.replace(/\D/g, '').slice(0, length);
    
    const newOtp = numericData.split('').concat(
      Array(length - numericData.length).fill('')
    );
    setOtp(newOtp);
    onChange?.(newOtp.join(''));

    // Focus the next empty field or the last field
    const nextIndex = Math.min(numericData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (numericData.length === length) {
      onComplete?.(numericData);
    }
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold',
            'bg-background border-2 border-border rounded-lg text-foreground',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:bg-muted disabled:cursor-not-allowed',
            'transition-colors duration-200 backdrop-blur-sm',
            otp[index] && 'border-primary bg-primary/5',
            className
          )}
        />
      ))}
    </div>
  );
}