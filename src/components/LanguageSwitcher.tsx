'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const languageNames = {
  en: 'English',
  ar: 'العربية'
};

const languageFlags = {
  en: '🇺🇸',
  ar: '🇸🇦'
};

const supportedLocales = ['en', 'ar'];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const switchLocale = (newLocale: string) => {
    setLocale(newLocale);
  };

    return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-9 px-3"
            aria-label="Switch Language"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", type: "tween" }}
            >
              <Globe className="h-4 w-4" />
            </motion.div>
            <motion.span 
              className="hidden sm:inline-block"
              key={`text-${locale}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {languageNames[locale as keyof typeof languageNames]}
            </motion.span>
            <motion.span 
              className="sm:hidden text-base"
              key={`flag-${locale}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {languageFlags[locale as keyof typeof languageFlags]}
            </motion.span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {supportedLocales.map((lng: string, index) => (
            <motion.div
              key={lng}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <DropdownMenuItem
                onClick={() => switchLocale(lng)}
                className={`flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${
                  locale === lng ? 'bg-accent' : ''
                }`}
              >
                <motion.span 
                  className="text-base"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {languageFlags[lng as keyof typeof languageFlags]}
                </motion.span>
                <span className="font-medium">
                  {languageNames[lng as keyof typeof languageNames]}
                </span>
                <AnimatePresence>
                  {locale === lng && (
                    <motion.span 
                      className="ml-auto text-xs text-muted-foreground"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </DropdownMenuItem>
            </motion.div>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
