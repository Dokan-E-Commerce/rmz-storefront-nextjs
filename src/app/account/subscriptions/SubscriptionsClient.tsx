'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/store-api';
import { useTranslation } from '@/lib/useTranslation';
import AccountLayout from '@/components/layout/AccountLayout';
import { useCurrency } from '@/lib/currency';
import { useRouter } from 'next/navigation';

export default function SubscriptionsClient() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  function getSubscriptionLabel(subscription, locale) {
    const duration = subscription.duration;
    
    if (locale === 'ar') {
      if (duration === 'monthly' || duration === 30) return 'شهر واحد';
      if (duration === 'quarterly' || duration === 90) return '3 أشهر';
      if (duration === 'semiAnnual' || duration === 180) return '6 أشهر';
      if (duration === 'annual' || duration === 365) return 'سنة واحدة';
      if (duration === 60) return 'شهران';
      if (duration === 120) return '4 أشهر';
      if (duration === 240) return '8 أشهر';
      
      // Handle string durations
      if (duration === 'semiAnnual') return '6 أشهر';
      if (duration === 'monthly') return 'شهر واحد';
      if (duration === 'quarterly') return '3 أشهر';
      if (duration === 'annual') return 'سنة واحدة';
      
      return typeof duration === 'number' ? `${duration} يوم` : duration;
    } else {
      if (duration === 'monthly' || duration === 30) return '1 month';
      if (duration === 'quarterly' || duration === 90) return '3 months';
      if (duration === 'semiAnnual' || duration === 180) return '6 months';
      if (duration === 'annual' || duration === 365) return '1 year';
      if (duration === 60) return '2 months';
      if (duration === 120) return '4 months';
      if (duration === 240) return '8 months';
      
      // Handle string durations
      if (duration === 'semiAnnual') return '6 months';
      if (duration === 'monthly') return '1 month';
      if (duration === 'quarterly') return '3 months';
      if (duration === 'annual') return '1 year';
      
      return typeof duration === 'number' ? `${duration} days` : duration;
    }
  }

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const response = await ordersApi.getSubscriptions();
      return response.data || response;
    },
  });

  const locale = typeof window !== 'undefined' && window.localStorage.getItem('preferred-language') === 'ar' ? 'ar' : 'en';

  return (
    <AccountLayout>
      <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
        <h3 className="text-2xl font-semibold text-foreground mb-6">
          {locale === 'ar' ? 'اشتراكاتي' : 'My Subscriptions'}
        </h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-border rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : subscriptions?.length ? (
          <div className="space-y-4">
            {subscriptions.map((subscription: any) => (
              <div key={subscription.id} className="border border-border rounded-xl p-6 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {subscription.product?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ar' ? `الاشتراك رقم: #${subscription.id}` : `Subscription ID: #${subscription.id}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    subscription.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {subscription.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">{locale === 'ar' ? 'المدة' : 'Duration'}</span>
                    <p className="font-medium text-foreground">
                      {getSubscriptionLabel(subscription, locale)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{locale === 'ar' ? 'تاريخ البداية' : 'Start Date'}</span>
                    <p className="font-medium text-foreground">
                      {subscription.start_date ? new Date(subscription.start_date).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{locale === 'ar' ? 'تاريخ النهاية' : 'End Date'}</span>
                    <p className="font-medium text-foreground">
                      {subscription.end_date ? new Date(subscription.end_date).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{locale === 'ar' ? 'طلب الإشتراك' : 'Order'}</span>
                    {subscription.order_id ? (
                      <button 
                        onClick={() => router.push(`/order/${subscription.order_id}`)}
                        className="font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer block"
                      >
                        #{subscription.order_id}
                      </button>
                    ) : (
                      <p className="font-medium text-foreground">-</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {locale === 'ar' ? 'لا يوجد اشتراكات نشطة' : 'No Active Subscriptions'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {locale === 'ar' ? 'ليس لديك أي اشتراكات نشطة' : "You don't have any active subscriptions"}
            </p>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
