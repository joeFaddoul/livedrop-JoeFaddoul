import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import { SupportAssistant } from '@/components/SupportAssistant';
import { Button } from '../atoms/button';

export type SupportPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SupportPanel({ isOpen, onClose }: SupportPanelProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
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
                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg bg-slate-950 shadow-xl shadow-brand/20">
                  <div className="flex h-full flex-col border-l border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                      <Dialog.Title className="text-lg font-semibold text-slate-100">
                        Ask Support
                      </Dialog.Title>
                      <Button variant="ghost" onClick={onClose}>
                        Close
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden px-6 py-4">
                      <SupportAssistant />
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
