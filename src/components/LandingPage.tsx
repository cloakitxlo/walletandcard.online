import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Lock, CreditCard, Zap, Globe2, Wifi } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-root min-h-screen text-slate-100">
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#070b12]/90 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 sm:h-[4.5rem] flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl trust-gradient flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </span>
            <span className="landing-display text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
              Wallet &amp; Card
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#how" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
            <a href="#kyc" className="hover:text-white transition-colors">
              No KYC
            </a>
          </nav>

          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-sm font-bold transition-all active:scale-[0.98]"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section id="top" className="landing-hero relative min-h-[100svh] overflow-x-hidden">
        <div className="landing-hero-plane absolute inset-0" aria-hidden="true" />
        <div className="landing-hero-sheen absolute inset-0" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-14 sm:py-28 min-h-[100svh] flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10">
          <motion.div
            className="landing-hero-card-wrap pointer-events-none order-1 lg:order-2"
            aria-hidden="true"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <div className="landing-hero-card-face">
              <div className="landing-hero-card-shine" />
              <div className="landing-hero-card-top">
                <div className="landing-hero-card-brand">
                  <span className="landing-hero-card-brand-mark">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>Wallet &amp; Card</span>
                </div>
                <div className="landing-hero-contactless" title="Contactless">
                  <Wifi className="w-5 h-5 rotate-90" />
                </div>
              </div>

              <div className="landing-hero-chip-row">
                <div className="landing-hero-chip">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="landing-hero-pan">4890  ••••  ••••  9042</div>

              <div className="landing-hero-card-bottom">
                <div>
                  <p className="landing-hero-label">Card holder</p>
                  <p className="landing-hero-value">ALEX MEMBER</p>
                </div>
                <div>
                  <p className="landing-hero-label">Expires</p>
                  <p className="landing-hero-value">12/28</p>
                </div>
                <div className="landing-hero-network" aria-hidden="true">
                  <span className="landing-hero-network-o landing-hero-network-o--a" />
                  <span className="landing-hero-network-o landing-hero-network-o--b" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-6 order-2 lg:order-1 relative z-10"
          >
            <p className="landing-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Wallet &amp; Card
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-100 leading-snug">
              Spend your crypto like cash — no KYC required.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Load USDT into your vault, activate your card, and pay with confidence. Built for people who want crypto utility without the paperwork maze.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-sm font-extrabold transition-all active:scale-[0.98]"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-100 text-sm font-bold transition-all"
              >
                See how it works
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how" className="relative py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="max-w-xl mb-12 sm:mb-16"
          >
            <h2 className="landing-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Three steps to real-world crypto spending
            </h2>
            <p className="mt-3 text-slate-400 text-base leading-relaxed">
              No bank waitlists. Create an account, fund your vault, and your card is ready when your deposit clears.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                icon: Zap,
                title: 'Create your account',
                text: 'Sign up in minutes with your name and email. Jump straight into your Wallet & Card portal.',
              },
              {
                icon: Globe2,
                title: 'Load crypto to your vault',
                text: 'Deposit USDT via supported networks. Your balance updates after a verified transfer.',
              },
              {
                icon: CreditCard,
                title: 'Use your card freely',
                text: 'Once funded, your card activates for everyday spend — crypto that moves with you.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="space-y-3"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/25 text-blue-300 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12">
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-sm font-extrabold transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section id="kyc" className="relative py-20 sm:py-28 border-t border-white/5 landing-band">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="space-y-4"
          >
            <h2 className="landing-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Use crypto on a card — without KYC friction
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Wallet &amp; Card is built for speed and privacy-minded access. Start with your account, deposit crypto, and spend — without uploading endless identity documents to get moving.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              You stay in control of your funds flow: deposit, track balances, manage card controls, and reach support when you need help.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-sm font-extrabold transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="space-y-4"
          >
            {[
              'No lengthy identity queue to explore the product',
              'Deposit crypto and activate spending after verification of your transfer',
              'Card controls you can tune — contactless, online, ATM preferences',
              'Support tickets with real replies inside your account',
            ].map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm text-slate-200 leading-relaxed border-l-2 border-blue-500/50 pl-4"
              >
                {line}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      <section id="security" className="relative py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl mb-12"
          >
            <div className="inline-flex items-center gap-2 text-blue-300 mb-3">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-widest">Safe &amp; secure</span>
            </div>
            <h2 className="landing-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Designed so your crypto feels protected — and usable
            </h2>
            <p className="mt-3 text-slate-400 text-base leading-relaxed">
              Encrypted account access, vault-style balances, freeze controls, and clear activity history. Spend with less anxiety and more clarity.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Account authentication',
                text: 'Email and password protected sessions so only you enter your Wallet & Card portal.',
              },
              {
                title: 'Deposit verification',
                text: 'Transfers are checked before balances update — so credits map to real on-chain activity.',
              },
              {
                title: 'Card safety controls',
                text: 'Freeze your card, manage channels, and keep spending settings under your command.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-5 sm:px-8 text-center space-y-6"
        >
          <h2 className="landing-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Ready to put crypto in your everyday life?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Open your account, fund your vault, and start using Wallet &amp; Card — simple, secure, and built without KYC bottlenecks.
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-base font-extrabold transition-all active:scale-[0.98]"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 bg-[#05070c]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg trust-gradient flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </span>
              <span className="landing-display font-bold text-white">Wallet &amp; Card</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A modern crypto card experience — load digital assets, spend with ease, and manage everything from one secure portal.
            </p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Product</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#how" className="hover:text-white transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
              <li>
                <button type="button" onClick={onGetStarted} className="hover:text-white transition-colors">
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button type="button" onClick={onOpenPrivacy} className="hover:text-white transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenTerms} className="hover:text-white transition-colors text-left">
                  Terms &amp; Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Wallet &amp; Card. All rights reserved.</p>
            <p>By using this site you agree to our Terms and acknowledge our Privacy Policy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
