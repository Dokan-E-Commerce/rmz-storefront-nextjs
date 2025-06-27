'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/useTranslation';
import { sdk } from '@/lib/sdk';
import BannerComponent from './BannerComponent';
import ReviewsComponent from './ReviewsComponent';
import ProductListComponent from './ProductListComponent';
import FeaturesComponent from './FeaturesComponent';
import Link from 'next/link';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, fadeInUp, scaleVariants } from '@/lib/animations';
import PageTransition from '@/components/ui/PageTransition';

interface Component {
  id: number;
  type: string;
  name: string;
  data: any;
  sort_order: number;
  settings: any;
}

export default function DynamicHomepage() {
  const { t } = useTranslation();

  const { data: components = [], isLoading, error } = useQuery<Component[]>({
    queryKey: ['components'],
    queryFn: async () => {
      const result = await sdk.components.getAll();
      return result || [];
    },
  });

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen bg-background">
        {/* Loading skeleton with smooth animations */}
        <motion.div 
          className="space-y-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              variants={fadeInUp}
              className="animate-pulse"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div 
                  className="h-8 bg-muted/50 rounded w-48 mb-6"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 1.5, repeat: Infinity }}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <motion.div 
                      key={j} 
                      className="bg-muted/50 rounded-2xl h-64"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ 
                        type: 'tween',
                        ease: 'easeInOut',
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: j * 0.1 
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center"
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-red-500 mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              type: 'tween',
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </motion.div>
          <motion.h3 
            className="text-lg font-medium text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('errorLoadingComponents')}
          </motion.h3>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t('pleaseRefreshPage')}
          </motion.p>
        </motion.div>
      </PageTransition>
    );
  }

  const renderComponent = (component: Component) => {
    // Map the component type from the API to the correct component type
    const componentType = component.type;
    
    // Debug log to see what components are being returned
    if (process.env.NODE_ENV === 'development') {
      // Component debug info available in development
    }
    
    switch (componentType) {
      case 'banner':
      case 'single_banner':
      case 'moving_group':
        return <BannerComponent key={component.id} component={component} />;
      
      case 'reviews':
        return <ReviewsComponent key={component.id} component={component} />;
      
      case 'product-list':
      case 'product_list':
        return <ProductListComponent key={component.id} component={component} />;
      
      case 'feature':
      case 'features':
        return <FeaturesComponent key={component.id} component={component} />;
      
      case 'custom':
      default:
        // Custom component or unknown type - show debug info
        return (
          <section key={component.id} className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-card p-6 rounded-2xl border-2 border-dashed border-border">
                <div className="text-center">
                  <CogIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {component.name || t('customComponent')}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {t('componentType')}: {componentType}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-left">
                      <summary className="cursor-pointer text-sm font-medium text-primary mb-2">
                        Debug Info (Development Only)
                      </summary>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(component, null, 2)}
                      </pre>
                    </details>
                  )}
                  {component.data.content && (
                    <div className="mt-4 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: component.data.content }} />
                  )}
                </div>
              </div>
            </div>
          </section>
        );
    }
  };

  if (!components || components.length === 0) {
    return (
      <PageTransition className="min-h-screen bg-background">
        {/* Default components when no API components are available */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ReviewsComponent />
        </motion.div>
        
        {/* Store Setup Message */}
        <motion.div 
          className="py-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="max-w-md mx-auto px-4 text-center">
            <motion.div 
              className="text-gray-400 mb-6"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                type: 'tween',
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </motion.div>
            <motion.h1 
              className="text-2xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {t('noContent')}
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {t('noContentDescription')}
            </motion.p>
            
            {/* Store Management Link */}
            <motion.div 
              className="bg-muted/50 rounded-2xl p-6"
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  type: 'tween',
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <PlusIcon className="h-8 w-8 text-primary mx-auto mb-3" />
              </motion.div>
              <h3 className="font-semibold text-foreground mb-2">
                {t('storeOwner')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('addComponentsInstructions')}
              </p>
              <Link
                href="https://app.rmz.gg"
                className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <CogIcon className="h-4 w-4" />
                <span>{t('manageStore')}</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </PageTransition>
    );
  }

  // Sort components by sort_order
  const sortedComponents = [...components].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  
  // Check if reviews component exists in the components
  const hasReviewsComponent = sortedComponents.some(component => component.type === 'reviews');

  return (
    <PageTransition className="min-h-screen bg-background">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {sortedComponents.map((component, index) => (
          <motion.div
            key={component.id}
            variants={fadeInUp}
            transition={{ delay: index * 0.1 }}
          >
            {renderComponent(component)}
          </motion.div>
        ))}
        
        {/* Always include reviews component if not already present */}
        {!hasReviewsComponent && (
          <motion.div
            variants={fadeInUp}
            transition={{ delay: sortedComponents.length * 0.1 }}
          >
            <ReviewsComponent />
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}