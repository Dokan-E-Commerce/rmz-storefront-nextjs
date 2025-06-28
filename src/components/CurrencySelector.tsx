'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCurrency, Currency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleVariants, backdropVariants } from '@/lib/animations';

export default function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedCurrency,
    availableCurrencies,
    isLoading,
    setCurrency,
    resetToDefault,
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

  const handleResetToDefault = async () => {
    try {
      await resetToDefault();
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm border-border/50"
        >
          <span className="text-sm font-medium">ر.س</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => availableCurrencies.length > 1 ? setIsOpen(!isOpen) : null}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50"
        >
          <motion.span
            className="text-sm font-medium"
            key={selectedCurrency?.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {selectedCurrency?.symbol || 'ر.س'}
          </motion.span>
          {availableCurrencies.length > 1 && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="h-3 w-3" />
            </motion.div>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && availableCurrencies.length > 1 && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-10"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-20 overflow-hidden"
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className="py-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Return to SAR option */}
                {selectedCurrency?.code !== 'SAR' && selectedCurrency?.code !== 'ر.س' && (
                  <motion.div
                    variants={fadeInUp}
                    transition={{ delay: 0 }}
                  >
                                         <motion.button
                       onClick={handleResetToDefault}
                       disabled={isLoading}
                       className="w-full px-4 py-2 text-sm transition-colors hover:bg-muted/50 flex items-center justify-between text-foreground border-b border-border/30 mb-1"
                       whileHover={{ scale: 1.02, x: 2 }}
                       whileTap={{ scale: 0.98 }}
                     >
                       <div className="flex-1 text-center">
                         <div className="font-medium text-primary">
                           🇸🇦 ر.س
                         </div>
                         <div className="text-xs text-muted-foreground">
                           العودة للريال السعودي
                         </div>
                       </div>
                     </motion.button>
                  </motion.div>
                )}
                
                {availableCurrencies.map((currency, index) => (
                  <motion.div
                    key={currency.code}
                    variants={fadeInUp}
                    transition={{ delay: (index + 1) * 0.05 }}
                  >
                    <motion.button
                      onClick={() => handleCurrencyChange(currency)}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 text-sm transition-colors hover:bg-muted/50 flex items-center justify-between ${
                        selectedCurrency.code === currency.code ? 'bg-primary/10 text-primary' : 'text-foreground'
                      } disabled:opacity-50`}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-1 text-center">
                        <div className="font-medium">
                          {currency.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {currency.name}
                        </div>
                      </div>
                      <AnimatePresence>
                        {selectedCurrency.code === currency.code && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <CheckIcon className="h-4 w-4 text-primary" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
