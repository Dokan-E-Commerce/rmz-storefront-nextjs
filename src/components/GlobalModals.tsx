'use client';

import AuthModal from '@/components/auth/AuthModal';
import { useModal } from '@/lib/modal';

export default function GlobalModals() {
  const { isAuthModalOpen, closeAuthModal } = useModal();

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      onSuccess={closeAuthModal}
    />
  );
}