'use client';

import { useTranslation } from '@/lib/useTranslation';

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
    <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('storeFeatures')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('storeFeaturesDescription')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {features.map((feature, index) => (
              <div
                key={feature.id || index}
                className={`flex flex-col items-center text-center space-y-3 group max-w-xs w-full`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                  {feature.icon ? (
                    <i className={`${feature.icon} text-2xl text-white transition-all duration-300 group-hover:scale-110`} />
                  ) : (
                    <div className="w-8 h-8 bg-white/30 rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white/95 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
