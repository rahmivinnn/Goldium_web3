import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  txSignature?: string;
  solscanUrl?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  solscanUrl,
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-defi-secondary border-defi-accent">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-6">
          {solscanUrl && (
            <Button
              className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 font-medium"
              onClick={() => window.open(solscanUrl, '_blank')}
            >
              View on Solscan
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full bg-defi-accent hover:bg-defi-accent/80 border-defi-accent py-3 font-medium"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export function LoadingModal({
  isOpen,
  title = 'Processing Transaction',
  description = 'Please wait while your transaction is being processed...',
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-defi-secondary border-defi-accent">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-primary animate-spin" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title,
  description,
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-defi-secondary border-defi-accent">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full bg-defi-accent hover:bg-defi-accent/80 border-defi-accent py-3 font-medium"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
