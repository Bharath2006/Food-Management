'use client';

import { ReactNode } from 'react';
import NotificationSystem from './NotificationSystem';

interface NotificationWrapperProps {
  children: ReactNode;
}

export default function NotificationWrapper({ children }: NotificationWrapperProps) {
  return (
    <>
      {children}
      <NotificationSystem />
    </>
  );
} 