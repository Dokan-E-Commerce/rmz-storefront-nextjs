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
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 h-9 px-3"
          aria-label="Switch Language"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {languageNames[locale as keyof typeof languageNames]}
          </span>
          <span className="sm:hidden text-base">
            {languageFlags[locale as keyof typeof languageFlags]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {supportedLocales.map((lng: string) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => switchLocale(lng)}
            className={`flex items-center gap-2 cursor-pointer ${
              locale === lng ? 'bg-accent' : ''
            }`}
          >
            <span className="text-base">{languageFlags[lng as keyof typeof languageFlags]}</span>
            <span className="font-medium">
              {languageNames[lng as keyof typeof languageNames]}
            </span>
            {locale === lng && (
              <span className="ml-auto text-xs text-muted-foreground">
                ✓
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
