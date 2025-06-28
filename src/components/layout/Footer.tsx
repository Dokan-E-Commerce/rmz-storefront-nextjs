'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { useStore } from '@/components/StoreProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function Footer() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { store } = useStore();

  // Social media icons
  const getSocialIcon = (platform: string) => {
    const iconClass = "h-6 w-6";
    switch (platform?.toLowerCase() || '') {
      case 'facebook':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.5 13.559 3.5 12.017c0-1.542.698-2.878 1.626-3.674.928-.796 2.079-1.297 3.323-1.297 1.297 0 2.448.501 3.323 1.297.875.796 1.626 2.132 1.626 3.674 0 1.542-.751 2.878-1.626 3.674-.875.807-2.026 1.297-3.323 1.297zm7.83 0c-1.297 0-2.448-.49-3.323-1.297-.875-.796-1.626-2.132-1.626-3.674 0-1.542.751-2.878 1.626-3.674.875-.796 2.026-1.297 3.323-1.297 1.297 0 2.448.501 3.323 1.297.875.796 1.626 2.132 1.626 3.674 0 1.542-.751 2.878-1.626 3.674-.875.807-2.026 1.297-3.323 1.297z" clipRule="evenodd" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
          </svg>
        );
      case 'maroof':
        return (
          <img src="https://cdn.rmz.gg/maroof.png" alt="Maroof" className="h-6 w-6" />
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Payment method icons
  const getPaymentIcon = (method: string) => {
    const iconClass = "h-6 w-6";
    switch (method?.toLowerCase()) {
      case 'visa':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#1a1f71"/>
            <path d="M8.5 8L7 16h2l.75-4h1.5L12 16h2L12.5 8H8.5z" fill="white"/>
            <path d="M14 8l-1.5 8h2l1.5-8H14z" fill="white"/>
          </svg>
        );
      case 'mastercard':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#eb001b"/>
            <circle cx="9" cy="12" r="6" fill="#eb001b"/>
            <circle cx="15" cy="12" r="6" fill="#ff5f00"/>
            <circle cx="12" cy="12" r="6" fill="#f79e1b"/>
          </svg>
        );
      case 'applepay':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
            <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
          </svg>
        );
      case 'stcpay':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#662d91"/>
            <path d="M6 8h12v2H6V8zm0 3h12v2H6v-2zm0 3h8v2H6v-2z" fill="white"/>
            <circle cx="18" cy="15" r="2" fill="#00d4aa"/>
          </svg>
        );
      case 'paypal':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="#0070ba">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.288-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106h4.608c.458 0 .844-.334.919-.788l.038-.207.732-4.63.047-.257c.075-.454.461-.788.919-.788h.577c3.746 0 6.676-1.522 7.53-5.922.356-1.831.174-3.36-.744-4.458z"/>
          </svg>
        );
      case 'coinbase':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="#0052ff">
            <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm-1.04-17.76c-.04-.24-.04-.52-.04-.8 0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4h-.36c-1.88 0-3.44-1.36-3.76-3.2zm-2.96 8.8c.24.04.52.04.8.04 2.2 0 4-1.8 4-4s-1.8-4-4-4h-.04c-1.96 0-3.6 1.44-3.92 3.36-.04.24-.04.52-.04.8 0 2.2 1.8 4 4 4h.04c.08 0 .12 0 .16-.04z"/>
          </svg>
        );
      case 'bank':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L3 7v2h18V7l-9-5zM4 20v-9H2v11h20V11h-2v9H4zm3-7v5h2v-5H7zm4 0v5h2v-5h-2zm4 0v5h2v-5h-2z"/>
          </svg>
        );
      default:
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
          </svg>
        );
    }
  };

  // SBC Badge Icon
  const getSBCIcon = () => (
    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2ZM21 16V10.05L12 16L3 10.05V16L12 22L21 16Z"/>
    </svg>
  );

  return (
    <footer className="bg-muted/30 backdrop-blur-md border-t border-border/50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Store Info Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              {(store as any)?.logo ? (
                <img
                  src={(store as any).logo}
                  alt={(store as any).name}
                  className="h-8 w-auto mr-3"
                />
              ) : null}
              <h3 className="text-lg font-semibold text-foreground">{(store as any)?.name || (locale === 'ar' ? 'عن المتجر' : 'About Store')}</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              {(store as any)?.description || (locale === 'ar' ? 'اكتشف منتجاتنا المميزة' : 'Discover our featured products')}
            </p>

            {/* Social Media Links */}
            {(store as any)?.social_links && Array.isArray((store as any).social_links) && (store as any).social_links.length > 0 && (
              <div className="flex space-x-4 mb-4">
                {(store as any).social_links.map((social: any, index: number) => {
                  if (!social.link || !social.method) return null;
                  return (
                    <a
                      key={`${social.method}-${index}`}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={`Follow us on ${social.method.charAt(0).toUpperCase() + social.method.slice(1)}`}
                    >
                      <span className="sr-only">{social.method}</span>
                      {getSocialIcon(social.method)}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Contact Info */}
            {(store as any)?.contact_info && (
              <div className="space-y-2">
                {(store as any).contact_info.email && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</span> {(store as any).contact_info.email}
                  </p>
                )}
                {(store as any).contact_info.phone && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{locale === 'ar' ? 'الهاتف:' : 'Phone:'}</span> <span className="phone-adaptive" dir="ltr">{(store as any).contact_info.phone}</span>
                  </p>
                )}
                {(store as any).contact_info.address && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{locale === 'ar' ? 'العنوان:' : 'Address:'}</span> {(store as any).contact_info.address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              {locale === 'ar' ? 'المتجر' : 'Store'}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  {locale === 'ar' ? 'الرئيسية' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  {locale === 'ar' ? 'جميع المنتجات' : 'All Products'}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link href="/featured" className="text-muted-foreground hover:text-foreground transition-colors">
                  {locale === 'ar' ? 'المنتجات المميزة' : 'Featured Products'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Pages */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              {locale === 'ar' ? 'الصفحات' : 'Pages'}
            </h3>
            <ul className="space-y-4">
              {(store as any)?.pages && (store as any).pages.length > 0 ? (
                // Show custom store pages if available
                (store as any).pages.slice(0, 4).map((page: any) => (
                  <li key={page.id}>
                    <Link
                      href={`/pages/${page.url}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback to default customer service links
                <>
                  <li>
                    <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                      {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                      {locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">
                      {locale === 'ar' ? 'التسليم الفوري' : 'Instant Delivery'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                      {locale === 'ar' ? 'الدعم 24/7' : 'Support 24/7'}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className={`text-center ${locale === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} {(store as any)?.name || 'Digital Store'}. {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                {locale === 'ar' ? (
                  <>
                    صُنع بحب ❤️ على منصة{' '}
                    <a 
                      href="https://rmz.gg" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      رمز
                    </a>
                  </>
                ) : (
                  <>
                    Made with ❤️ by{' '}
                    <a 
                      href="https://rmz.gg" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      RMZ.GG
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* Payment Methods & Trust Badges */}
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
              {/* SBC Badge */}
              {(store as any)?.sbc_id && (
                <a
                  href={`https://eauthenticate.saudibusiness.gov.sa/certificate-details/${(store as any).sbc_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  {getSBCIcon()}
                  <div className="text-xs">
                    <div className="font-semibold text-green-700 dark:text-green-300">
                      {locale === 'ar' ? 'موثق من السجل التجاري' : 'SBC Verified'}
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-mono">{(store as any).sbc_id}</div>
                  </div>
                </a>
              )}

              {/* Payment Methods */}
              {(store as any)?.payment_methods && (store as any).payment_methods.filter((pm: any) => pm.is_enabled).length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {(store as any).payment_methods.filter((pm: any) => pm.is_enabled).map((method: any) => {
                    const methodName = method.method;

                    if (methodName === 'card') {
                      // Show multiple card icons for card payment
                      return [
                        <div key="visa" className="p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          {getPaymentIcon('visa')}
                        </div>,
                        <div key="mastercard" className="p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          {getPaymentIcon('mastercard')}
                        </div>,
                        <div key="applepay" className="p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          {getPaymentIcon('applepay')}
                        </div>,
                        <div key="stcpay" className="p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          {getPaymentIcon('stcpay')}
                        </div>
                      ];
                    } else {
                      // Show single icon for other payment methods
                      return (
                        <div
                          key={method.id}
                          className="p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                          title={method.nickname || methodName}
                        >
                          {getPaymentIcon(methodName)}
                        </div>
                      );
                    }
                  }).flat()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
