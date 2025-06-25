'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'sonner';
import { sdk } from '@/lib/sdk';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'product' | 'store' | 'order';
  productId?: number;
  orderId?: number;
  productName?: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  type,
  productId,
  orderId,
  productName,
  onSuccess
}: ReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('pleaseSelectRating'));
      return;
    }

    if (!comment.trim()) {
      toast.error(t('pleaseWriteComment'));
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        rating,
        ...(type === 'product' && productId && { product_id: productId }),
        ...(type === 'order' && orderId && { order_id: orderId }),
        ...(type === 'store' && { type: 'store' })
      };

      // Submit review using SDK
      if (productId && type === 'product') {
        await sdk.reviews.submit(productId, {
          rating,
          comment
        });
      } else {
        throw new Error('Review submission for store type not yet implemented');
      }

      toast.success(t('reviewSubmitted'));
      setRating(0);
      setComment('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'product':
        return `Review ${productName || 'Product'}`;
      case 'store':
        return 'Review Store';
      case 'order':
        return 'Review Order';
      default:
        return 'Write Review';
    }
  };

  const getModalDescription = () => {
    switch (type) {
      case 'product':
        return 'Share your experience with this product';
      case 'store':
        return 'How was your overall shopping experience?';
      case 'order':
        return 'How was your order experience?';
      default:
        return 'Share your feedback';
    }
  };

  if (!isOpen) return null;

    return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card/95 backdrop-blur-xl border border-border/30 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border/20 p-6 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-xl font-bold text-foreground">{getModalTitle()}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {getModalDescription()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/50 rounded-full transition-colors ml-4"
            >
              <XMarkIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6">

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Stars */}
          <div className="text-center">
            <div className="mb-4">
              <div className="flex justify-center space-x-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-all duration-200 transform hover:scale-110"
                  >
                    {star <= rating ? (
                      <StarSolidIcon className="h-10 w-10 text-yellow-400 hover:text-yellow-500 drop-shadow-lg" />
                    ) : (
                      <StarIcon className="h-10 w-10 text-gray-300 hover:text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-foreground">
                {rating === 0 && t('selectRating')}
                {rating === 1 && t('poor')}
                {rating === 2 && t('fair')}
                {rating === 3 && t('good')}
                {rating === 4 && t('veryGood')}
                {rating === 5 && t('excellent')}
              </p>
              {rating === 0 && (
                <p className="text-xs text-destructive mt-1">* {t('selectRating')}</p>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3 text-right">
              {t('writeReview')} *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-border/30 rounded-lg bg-background/50 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none text-right"
              placeholder={t('writeReview') + '...'}
              required
              maxLength={500}
              dir="auto"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {comment.length}/500
              </p>
              {!comment.trim() && (
                <p className="text-xs text-destructive">* {t('pleaseWriteComment')}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-lg border-border/30 hover:bg-muted/50"
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
            >
              {isSubmitting ? t('loading') : t('submitReview')}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
