import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '../atoms/button';
import { QuantityStepper } from '../molecules/quantity-stepper';
import type { CartLineItem, Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

export type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartLineItem[];
  products: Record<string, Product>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  subtotal: number;
  onCheckout: () => void;
};

export function CartDrawer({
  isOpen,
  onClose,
  items,
  products,
  onUpdateQuantity,
  onRemove,
  subtotal,
  onCheckout,
}: CartDrawerProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md bg-slate-950 shadow-xl shadow-brand/20">
                  <div className="flex h-full flex-col overflow-y-auto border-l border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                      <Dialog.Title className="text-lg font-semibold text-slate-100">
                        Cart ({items.reduce((acc, item) => acc + item.quantity, 0)})
                      </Dialog.Title>
                      <Button variant="ghost" onClick={onClose}>
                        Close
                      </Button>
                    </div>
                    <div className="flex-1 space-y-6 px-6 py-4">
                      {items.length === 0 ? (
                        <p className="text-sm text-slate-400">
                          Your cart is empty. Add items from the catalog to get started.
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {items.map((item) => {
                            const product = products[item.productId];
                            if (!product) return null;
                            return (
                              <li key={item.productId} className="flex gap-4 rounded-xl border border-slate-800 p-3">
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="h-20 w-20 rounded-lg object-cover"
                                />
                                <div className="flex flex-1 flex-col gap-2">
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-100">{product.title}</h4>
                                    <p className="text-xs text-slate-400">{formatCurrency(product.price)}</p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <QuantityStepper
                                      quantity={item.quantity}
                                      min={1}
                                      max={product.stockQty}
                                      onChange={(value) => onUpdateQuantity(product.id, value)}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onRemove(product.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    <div className="border-t border-slate-800 px-6 py-4">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Subtotal</span>
                        <span className="text-lg font-semibold text-slate-100">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <Button
                        className="mt-4 w-full"
                        size="lg"
                        onClick={onCheckout}
                        disabled={items.length === 0}
                      >
                        Go to Checkout
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
