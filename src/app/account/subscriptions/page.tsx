'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/store-api';
import { useTranslation } from '@/lib/useTranslation';
import AccountLayout from '@/components/layout/AccountLayout';

export default function SubscriptionsPage() {
  const { t } = useTranslation();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      // Placeholder until subscriptions API is implemented
      return [];
    },
  });

  return (
    <AccountLayout>
      <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
        <h3 className="text-2xl font-semibold text-foreground mb-6">My Subscriptions</h3>
        
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
                  <h4 className="text-lg font-semibold text-foreground">
                    {subscription.product?.name}
                  </h4>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    subscription.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {subscription.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Price</span>
                    <p className="font-medium text-foreground">
                      ر.س{(subscription.price?.formatted as string)?.replace('$', '').replace('USD', '').replace('ر.س', '').trim() || '0.00'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Expires</span>
                    <p className="font-medium text-foreground">
                      {new Date(subscription.ends_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <p className="font-medium text-foreground">
                      {subscription.duration} days
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Subscriptions</h3>
            <p className="text-muted-foreground mb-6">You don't have any active subscriptions</p>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}