'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { sdk } from '@/lib/sdk';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBagIcon, EyeIcon } from '@heroicons/react/24/outline';
import AuthModal from '@/components/auth/AuthModal';
import AccountLayout from '@/components/layout/AccountLayout';
import { useLanguage } from '@/components/LanguageProvider';

export default function OrdersPage() {
  const { isAuthenticated, customer } = useAuth();
  const { locale } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => sdk.orders.getAll(),
    enabled: isAuthenticated,
  });



  if (isLoading) {
    return (
      <AccountLayout>
        <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccountLayout>
    );
  }

  if (error) {
    return (
      <AccountLayout>
        <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {locale === 'ar' ? 'خطأ' : 'Error'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'خطأ في الخادم' : 'Server Error'}
            </p>
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ShoppingBagIcon className={`h-8 w-8 text-primary ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
            <h1 className="text-3xl font-bold text-foreground">
              {locale === 'ar' ? 'الطلبات' : 'Orders'} ({orders?.data?.length || 0})
            </h1>
          </div>
        </div>

        {!orders?.data || orders.data.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">
              {locale === 'ar' ? 'لا توجد طلبات' : 'No Orders Found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {locale === 'ar' ? 'لم تقم بتقديم أي طلبات بعد' : 'You haven\'t placed any orders yet'}
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.data.map((order: any) => (
              <div key={order.id} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {locale === 'ar' ? 'طلب #' : 'Order #'}{order.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'تم الطلب في ' : 'Placed on '}{new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:text-right gap-2">
                       <div className="text-lg font-bold text-foreground">
                         {order.human_format?.total_formatted?.replace('$', '').replace('USD', '').replace('ر.س', '').trim()
                          ? 'ر.س' + order.human_format.total_formatted.replace('$', '').replace('USD', '').replace('ر.س', '').trim()
                          : (typeof order.total === 'object' ?
                            'ر.س' + (order.total.formatted as string).replace('$', '').replace('USD', '').replace('ر.س', '').trim() :
                            `ر.س${(order.total as number).toFixed(2)}`)}
                       </div>
                       <div className="flex items-center justify-start sm:justify-end">
                         <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                           order.status.name === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                           order.status.name === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                           order.status.name === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                           'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                         }`}>
                           {order.status.human_format?.text || order.status.name}
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {order.items.slice(0, 3).map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 flex-shrink-0 bg-muted/30 rounded-lg p-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                               {item.product?.image?.full_link ? (
                                 <img
                                   src={item.product.image.full_link}
                                   alt={item.product_name || item.name || ''}
                                   className="w-full h-full object-cover"
                                 />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                   📦
                                 </div>
                               )}
                             </div>
                            <div className="text-sm min-w-0">
                               <div className="font-medium text-foreground truncate max-w-28 sm:max-w-32">
                                 {item.product_name || item.name}
                               </div>
                              <div className="text-muted-foreground text-xs">
                                {locale === 'ar' ? 'الكمية: ' : 'Quantity: '}{item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-muted-foreground flex-shrink-0 bg-muted/20 rounded-lg px-3 py-2">
                            +{order.items.length - 3} {locale === 'ar' ? 'أكثر' : 'more'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {order.items?.length || 0} {locale === 'ar' ? 
                        (order.items?.length === 1 ? 'منتج' : 'منتجات') : 
                        (order.items?.length === 1 ? 'item' : 'items')
                      }
                    </div>
                    <Link href={`/order/${order.id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <EyeIcon className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
