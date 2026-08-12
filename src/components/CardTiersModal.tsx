import React, { useState } from 'react';
import { CardTier } from '../types';
import { CARD_TIERS } from '../data/mockData';
import { Check, Award, Truck, CheckCircle2 } from 'lucide-react';

interface CardTiersModalProps {
  currentTier: CardTier;
  onClose: () => void;
  onSelectTier: (tierId: CardTier) => void;
}

export const CardTiersModal: React.FC<CardTiersModalProps> = ({
  currentTier,
  onClose,
  onSelectTier,
}) => {
  const [selectedTier, setSelectedTier] = useState<CardTier>(currentTier);
  const [step, setStep] = useState<'tiers' | 'address' | 'success'>('tiers');
  const [shippingAddress, setShippingAddress] = useState({
    street: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    country: 'United States',
  });

  const selectedTierInfo = CARD_TIERS.find((t) => t.id === selectedTier) || CARD_TIERS[1];

  const handleConfirmOrder = () => {
    onSelectTier(selectedTier);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card border border-white/10 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100">Wallet & Card Tier Selection</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Unlock up to 8.0% instant cashback, metal cards, and airport lounge access.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-white/10 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {step === 'tiers' && (
          <>
            {/* Grid of Card Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CARD_TIERS.map((tier) => {
                const isCurrent = currentTier === tier.id;
                const isSelected = selectedTier === tier.id;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-950/80 border-blue-500 shadow-xl shadow-blue-600/15 ring-2 ring-blue-500/30'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 trust-gradient text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                        Most Popular
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Mini Card Preview */}
                      <div className={`w-full aspect-[1.58/1] rounded-xl p-3 flex flex-col justify-between ${tier.cardImageBg} shadow-md`}>
                        <div className="flex justify-between items-center text-white/90">
                          <span className="font-mono text-xs font-bold">CARD</span>
                          <span className="text-[8px] font-mono uppercase bg-white/10 px-1.5 py-0.5 rounded">
                            {tier.name.split(' ')[0]}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-white/80">
                          •••• •••• •••• {tier.id === 'black' ? '8888' : '4532'}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-sm text-slate-100">{tier.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-extrabold text-blue-400 font-mono">
                            {tier.cashbackPercent}%
                          </span>
                          <span className="text-xs text-slate-400 font-bold">Cashback</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400">
                        {tier.perks.map((perk, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-tight text-slate-200 font-medium">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-slate-400 text-[11px] font-medium">APEX Stake:</span>
                        <span className="font-mono font-extrabold text-slate-100">
                          {tier.stakingRequired === 0 ? 'Free' : `${tier.stakingRequired.toLocaleString()} APEX`}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTier(tier.id);
                          setStep('address');
                        }}
                        className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                          isCurrent
                            ? 'bg-slate-900 text-slate-500 cursor-default border border-white/5'
                            : isSelected
                            ? 'trust-gradient text-white shadow-md shadow-blue-600/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10'
                        }`}
                      >
                        {isCurrent ? 'Current Active Tier' : 'Select & Order Card'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 'address' && (
          <div className="max-w-lg mx-auto space-y-5 bg-slate-950/80 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">Card Physical Delivery Address</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Ordering {selectedTierInfo.name} with tracked courier shipping.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setStep('tiers')}
                className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-extrabold transition-all border border-white/10"
              >
                Back
              </button>
              <button
                onClick={handleConfirmOrder}
                className="w-2/3 py-3 rounded-xl trust-gradient text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-600/25"
              >
                Confirm & Issue Card
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="max-w-md mx-auto text-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-100">
              {selectedTierInfo.name} Activated!
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Your virtual card is immediately active for online purchases. Your physical metal card is being crafted and will ship via DHL Express.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs transition-all border border-white/10"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
