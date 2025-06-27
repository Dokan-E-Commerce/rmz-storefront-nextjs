'use client';

import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleVariants } from '@/lib/animations';

interface Feature {
  id?: number;
  title: string;
  description: string;
  icon: string;
  sort_order?: number;
}

interface FeaturesComponentProps {
  component: {
    id: number;
    type: string;
    name: string;
    data: {
      features: Feature[];
      settings: any;
    };
  };
}

export default function FeaturesComponent({ component }: FeaturesComponentProps) {
  const { t, locale } = useTranslation();
  const features = component.data.features || [];

  if (!features || features.length === 0) {
    return null;
  }

  const isRTL = locale === 'ar';

  return (
    <motion.section 
      className="py-16 bg-gradient-to-br from-primary/5 to-primary/10"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-12"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t('storeFeatures')}
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t('storeFeaturesDescription')}
          </motion.p>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 shadow-xl"
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center place-items-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id || index}
                className={`flex flex-col items-center justify-center text-center space-y-3 group max-w-xs w-full`}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* Icon */}
                <motion.div 
                  className="flex-shrink-0 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-white/30"
                  whileHover={{ 
                    scale: 1.15,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  animate={{
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    scale: { type: "spring", stiffness: 300, damping: 10 },
                    rotate: { type: "tween", duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {feature.icon ? (
                    <motion.i 
                      className={`${feature.icon} text-2xl text-white transition-all duration-300`}
                      whileHover={{ scale: 1.2 }}
                    />
                  ) : (
                    <motion.div 
                      className="w-8 h-8 bg-white/30 rounded-full" 
                      whileHover={{ scale: 1.2 }}
                    />
                  )}
                </motion.div>

                {/* Content */}
                <div className="text-center">
                  <motion.h3 
                    className="text-lg font-semibold text-white mb-2 group-hover:text-white/95 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
