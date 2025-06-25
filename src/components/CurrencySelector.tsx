'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCurrency, Currency } from '@/lib/currency';
import { Button } from '@/components/ui/button';

export default function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedCurrency,
    availableCurrencies,
    isLoading,
    setCurrency,
    loadCurrencies
  } = useCurrency();

  useEffect(() => {
    // Always try to load currencies on mount
    loadCurrencies();
  }, [loadCurrencies]);



  const handleCurrencyChange = async (currency: Currency) => {
    try {
      await setCurrency(currency);
      setIsOpen(false);
    } catch (error) {
    }
  };

  // Always show currency switcher, even with one currency for consistency
  if (isLoading) {
    return (
      <div className="w-16 h-8 bg-muted animate-pulse rounded"></div>
    );
  }

  // If no currencies are available, show default
  if (!selectedCurrency || !availableCurrencies || availableCurrencies.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm border-border/50"
      >
        <span className="text-sm font-medium">ر.س</span>
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => availableCurrencies.length > 1 ? setIsOpen(!isOpen) : null}
        disabled={isLoading}
        className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50"
      >
        <span className="text-sm font-medium">
          {selectedCurrency?.symbol || 'ر.س'}
        </span>
        {availableCurrencies.length > 1 && (
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </Button>

      {isOpen && availableCurrencies.length > 1 && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="py-2">
              {availableCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency)}
                  disabled={isLoading}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted/50 flex items-center justify-between ${
                    selectedCurrency.code === currency.code ? 'bg-primary/10 text-primary' : 'text-foreground'
                  } disabled:opacity-50`}
                >
                  <div>
                    <div className="font-medium">
                      {currency.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currency.name}
                    </div>
                  </div>
                  {selectedCurrency.code === currency.code && (
                    <CheckIcon className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
