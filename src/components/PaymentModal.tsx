import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogPortal, DialogOverlay } from './ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog@1.1.6';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Lock,
  ArrowRight,
  Shield,
  CheckCircle2,
  X
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { processPayment } from '../utils/api';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export function PaymentModal({ isOpen, onClose, onNavigate }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [upiId, setUpiId] = useState('');

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const user = await getCurrentUser();
      if (!user?.access_token) {
        toast.error('Please login to continue');
        return;
      }

      // Validate inputs based on payment method
      if (paymentMethod === 'card') {
        if (!cardNumber || !cardExpiry || !cardCVV) {
          toast.error('Please fill all card details');
          setProcessing(false);
          return;
        }
      } else if (paymentMethod === 'upi') {
        if (!upiId) {
          toast.error('Please enter UPI ID');
          setProcessing(false);
          return;
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a demo payment ID
      const paymentId = `razorpay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Process payment through backend
      await processPayment(user.access_token, {
        plan: 'pro',
        amount: 299,
        payment_method: paymentMethod,
        payment_id: paymentId,
      });

      toast.success('Payment successful!');
      
      // Close modal and navigate to success page
      onClose();
      onNavigate?.('payment-success');
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 w-full max-w-[520px] translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#1E1E2E] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header with gradient strip and lock icon */}
            <div className="relative">
              <div className="h-1.5 bg-gradient-to-r from-[#6C63FF] via-[#9F7BFF] to-[#6C63FF]" />
              <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl">Secure Payment</h2>
                </div>
                <DialogPrimitive.Close className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </DialogPrimitive.Close>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="space-y-6">
                {/* Payment Summary */}
                <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg">Pro Plan</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Billing</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₹299</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">/month</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Includes all premium features
                  </div>
                </Card>

                {/* Payment Method Selection */}
                <div>
                  <Label className="text-base mb-3 block">Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <div className="grid gap-3">
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Label
                          htmlFor="card"
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === 'card'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <RadioGroupItem value="card" id="card" />
                          <CreditCard className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <p>Credit / Debit Card</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, RuPay</p>
                          </div>
                        </Label>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Label
                          htmlFor="upi"
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === 'upi'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <RadioGroupItem value="upi" id="upi" />
                          <Smartphone className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <p>UPI</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Google Pay, PhonePe, Paytm</p>
                          </div>
                        </Label>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Label
                          htmlFor="wallet"
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === 'wallet'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <RadioGroupItem value="wallet" id="wallet" />
                          <Wallet className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <p>Wallet</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Paytm, PhonePe, Amazon Pay</p>
                          </div>
                        </Label>
                      </motion.div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Details Form */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            if (formatted.length <= 19) setCardNumber(formatted);
                          }}
                          maxLength={19}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => {
                              const formatted = formatExpiry(e.target.value);
                              if (formatted.length <= 5) setCardExpiry(formatted);
                            }}
                            maxLength={5}
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            placeholder="123"
                            value={cardCVV}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 3) setCardCVV(value);
                            }}
                            maxLength={3}
                            className="mt-1 rounded-xl"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'upi' && (
                    <motion.div
                      key="upi"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="mt-1 rounded-xl"
                      />
                    </motion.div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <motion.div
                      key="wallet"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <Wallet className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You will be redirected to your wallet provider to complete the payment
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Security Notice */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-900 dark:text-blue-300 mb-1">Secure Payment</p>
                      <p className="text-blue-700 dark:text-blue-400 text-xs">
                        Your payment information is encrypted and secure. We use industry-standard security measures.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={processing}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {processing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
