'use client';

import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '@/lib/store-api';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleVariants } from '@/lib/animations';
import PageTransition from '@/components/ui/PageTransition';

export default function ClientPagesPage() {
  const { t } = useTranslation();
  
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: pagesApi.getAll,
  });

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="h-8 bg-muted/50 rounded w-1/3"
              variants={fadeInUp}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 1.5, repeat: Infinity }}
            />
            <motion.div 
              className="space-y-6"
              variants={staggerContainer}
            >
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i} 
                  className="bg-card/30 backdrop-blur-md border border-border/50 p-6 rounded-xl"
                  variants={fadeInUp}
                  transition={{ delay: i * 0.1 }}
                >
                  <motion.div 
                    className="h-6 bg-muted/50 rounded w-3/4 mb-3"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="h-4 bg-muted/50 rounded w-full mb-2"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                  <motion.div 
                    className="h-4 bg-muted/50 rounded w-2/3"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl font-bold text-foreground mb-4"
            variants={fadeInUp}
          >
            {t('pages')}
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            variants={fadeInUp}
          >
            {t('browse_all_pages')}
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {pages && pages.length > 0 ? (
            <motion.div 
              className="space-y-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {pages.map((page: any, index: number) => (
                <motion.div
                  key={page.id}
                  className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <motion.div 
                        className="flex items-center mb-3"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <DocumentTextIcon className="h-6 w-6 text-primary mr-3" />
                        </motion.div>
                        <Link
                          href={`/pages/${page.slug}`}
                          className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {page.title}
                        </Link>
                      </motion.div>
                      
                      <AnimatePresence>
                        {page.description && (
                          <motion.p 
                            className="text-muted-foreground mb-4 leading-relaxed"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {page.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      
                      <AnimatePresence>
                        {page.created_at && (
                          <motion.div 
                            className="flex items-center text-sm text-muted-foreground"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>
                              {new Date(page.created_at).toLocaleDateString()}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={`/pages/${page.slug}`}
                        className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {t('read_more')}
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  type: 'tween',
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <DocumentTextIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <motion.h2 
                className="text-xl font-medium text-foreground mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('no_pages_available')}
              </motion.h2>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('check_back_later_for_new_pages')}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}