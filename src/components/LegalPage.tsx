import React, { useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

export type LegalDoc = 'privacy' | 'terms';

interface LegalPageProps {
  doc: LegalDoc;
  onBack: () => void;
  onGetStarted: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

const UPDATED = 'August 13, 2026';

export const LegalPage: React.FC<LegalPageProps> = ({
  doc,
  onBack,
  onGetStarted,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [doc]);

  const title = doc === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <div className="landing-root min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 bg-[#070b12]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg trust-gradient flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </span>
            <span className="landing-display font-bold text-white text-sm sm:text-base">Wallet &amp; Card</span>
          </div>
          <button
            type="button"
            onClick={onGetStarted}
            className="text-sm font-bold text-blue-300 hover:text-blue-200 transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-extrabold uppercase tracking-widest text-blue-300 mb-3">Legal</p>
        <h1 className="landing-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: {UPDATED}</p>

        <article className="legal-prose space-y-8 text-sm sm:text-[15px] text-slate-300 leading-relaxed">
          {doc === 'privacy' ? <PrivacyBody /> : <TermsBody />}
        </article>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm">
          <button type="button" onClick={onOpenPrivacy} className="font-bold text-blue-300 hover:text-blue-200">
            Privacy Policy
          </button>
          <button type="button" onClick={onOpenTerms} className="font-bold text-blue-300 hover:text-blue-200">
            Terms &amp; Conditions
          </button>
          <button type="button" onClick={onGetStarted} className="font-bold text-white hover:text-blue-200">
            Get Started
          </button>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Wallet &amp; Card. All rights reserved.
      </footer>
    </div>
  );
};

function PrivacyBody() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Who we are</h2>
        <p>
          This Privacy Policy explains how Wallet &amp; Card (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, shares, and protects information when you visit our website, create an account, or use our crypto card and wallet portal (the &quot;Services&quot;).
        </p>
        <p>
          This policy is intended to help you understand our practices in a manner consistent with common expectations for online services, advertising platforms, and analytics tools (including standards commonly referenced by Google and Meta for privacy transparency, consent, and data use).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Information we collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-slate-100">Account information:</strong> full name, email address, password (stored in hashed or protected form on our systems where applicable), and profile details you provide.
          </li>
          <li>
            <strong className="text-slate-100">Service usage data:</strong> card settings, deposit/receive activity you submit (such as transaction hashes), support tickets, messages, and optional screenshots you upload.
          </li>
          <li>
            <strong className="text-slate-100">Technical &amp; device data:</strong> IP address, browser type, device identifiers, pages viewed, referring URLs, and approximate location derived from IP.
          </li>
          <li>
            <strong className="text-slate-100">Communications:</strong> messages you send through support forms or similar channels.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Cookies, pixels &amp; analytics</h2>
        <p>
          We may use cookies, local storage, and similar technologies to operate the site, remember preferences, measure performance, and understand how visitors use the Services.
        </p>
        <p>
          We may use analytics tools such as Microsoft Clarity (or similar) to collect session insights, heatmaps, and usage metrics. Advertising or measurement partners (including Google or Meta technologies, if enabled) may also set cookies or receive events to measure campaigns, reduce fraud, and improve relevance — subject to your browser settings and applicable consent requirements.
        </p>
        <p>
          You can control cookies through your browser settings. Blocking some cookies may affect site functionality.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">4. How we use information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide, secure, and improve the Services (accounts, vaults, card controls, support)</li>
          <li>Verify deposits and maintain activity records you request</li>
          <li>Communicate about your account, security, and support tickets</li>
          <li>Detect, prevent, and investigate fraud, abuse, or security incidents</li>
          <li>Comply with law and enforce our Terms</li>
          <li>Analyze product usage and marketing effectiveness (where permitted)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">5. Legal bases (where applicable)</h2>
        <p>
          Depending on your location, we process personal data based on: performance of a contract (providing the Services), legitimate interests (security, product improvement), consent (certain cookies/marketing), and legal obligations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">6. Sharing of information</h2>
        <p>We do not sell your personal information. We may share data with:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Service providers that host, analyze, or support the Services (under confidentiality obligations)</li>
          <li>Payment, blockchain network, or infrastructure partners as needed to process transfers you initiate</li>
          <li>Authorities when required by law or to protect rights, safety, and security</li>
          <li>Successors in connection with a merger, acquisition, or asset transfer</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">7. Data retention</h2>
        <p>
          We retain account and service data for as long as your account is active and as needed for security, dispute resolution, legal compliance, and legitimate business purposes. Support tickets and related attachments may be retained to provide continuity of service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">8. Security</h2>
        <p>
          We use administrative, technical, and organizational measures designed to protect personal information. No method of transmission or storage is 100% secure; you are responsible for keeping your password confidential and for activity under your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">9. Your rights &amp; choices</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, delete, or export personal data, object to or restrict certain processing, and withdraw consent. You may also opt out of non-essential cookies where a consent mechanism is presented.
        </p>
        <p>
          To exercise rights, contact us through the in-app Support Center after signing in, or via the contact method published on our site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">10. Children</h2>
        <p>
          The Services are not directed to children under 16 (or the minimum age required in your country). We do not knowingly collect personal information from children. If you believe a child has provided data, contact us to request deletion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">11. International transfers</h2>
        <p>
          Information may be processed in countries other than your own. Where required, we use appropriate safeguards for cross-border transfers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">12. Third-party links &amp; platforms</h2>
        <p>
          Our Services may link to third-party sites or integrate third-party tools. Their privacy practices are governed by their own policies. We encourage you to review Google, Meta, Microsoft, and other partner privacy statements when those tools are used.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">13. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the updated version with a revised &quot;Last updated&quot; date. Continued use of the Services after changes means you accept the updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">14. Contact</h2>
        <p>
          Questions about privacy: use Support inside your Wallet &amp; Card account, or contact the site operator using the official channels listed on the website.
        </p>
      </section>
    </>
  );
}

function TermsBody() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Agreement to terms</h2>
        <p>
          By accessing or using Wallet &amp; Card websites, applications, and related services (the &quot;Services&quot;), you agree to these Terms &amp; Conditions (&quot;Terms&quot;). If you do not agree, do not use the Services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Eligibility</h2>
        <p>
          You must be legally able to enter a binding agreement in your jurisdiction and meet any minimum age requirements. You are responsible for complying with local laws related to crypto assets, cards, and online services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. The Services</h2>
        <p>
          Wallet &amp; Card provides a portal to manage a crypto-linked card experience, including account access, vault balances, card controls, activity history, and support. Features may change, be limited by region, or require additional verification depending on risk, compliance, or operational needs.
        </p>
        <p>
          References to &quot;no KYC&quot; describe a streamlined onboarding experience for accessing the product interface and initiating use; we may still request information, freeze accounts, or restrict features to protect users, prevent abuse, or meet legal obligations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">4. Accounts &amp; security</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>You must provide accurate registration information and keep it updated.</li>
          <li>You are responsible for safeguarding credentials and for all activity under your account.</li>
          <li>Notify us promptly via Support if you suspect unauthorized access.</li>
          <li>We may suspend or terminate accounts that violate these Terms or pose security/compliance risk.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">5. Crypto deposits, balances &amp; card use</h2>
        <p>
          Crypto transfers are irreversible once confirmed on a blockchain. You are solely responsible for sending supported assets to the correct network and address shown in the portal. We are not liable for funds sent to wrong addresses, unsupported tokens, or incorrect networks.
        </p>
        <p>
          Displayed balances, card status, and transaction history depend on verified activity and system processing. Card spending availability depends on funding, network conditions, merchant acceptance, and your enabled controls.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">6. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use the Services for unlawful, fraudulent, or abusive purposes</li>
          <li>Attempt to hack, scrape, reverse engineer, or disrupt the Services</li>
          <li>Misrepresent identity or deposit proofs</li>
          <li>Interfere with other users or our infrastructure</li>
          <li>Violate sanctions, export controls, or applicable financial regulations</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">7. Fees</h2>
        <p>
          Network fees, third-party fees, or service fees may apply. Where fees are charged by us, we will describe them in the product interface or related notices. Blockchain gas/network fees are outside our control.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">8. Intellectual property</h2>
        <p>
          The Services, branding, UI, and content are owned by Wallet &amp; Card or its licensors. You receive a limited, non-exclusive, non-transferable license to use the Services for personal or internal lawful purposes in accordance with these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">9. Third-party services &amp; advertising compliance</h2>
        <p>
          The Services may use or link to third parties (hosting, analytics, advertising, blockchain networks). Your use of those services may be subject to their terms and policies. If we run ads or measurement with Google, Meta, or similar platforms, you acknowledge that those platforms have their own rules, privacy policies, and advertising standards which we aim to respect.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">10. Disclaimers</h2>
        <p>
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Crypto markets and blockchain networks are volatile and may be interrupted; we do not guarantee uninterrupted or error-free operation, merchant acceptance, or specific financial outcomes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">11. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WALLET &amp; CARD AND ITS OPERATORS SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR CRYPTO ASSETS, ARISING FROM YOUR USE OF THE SERVICES. OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE FEES YOU PAID TO US FOR THE SERVICES IN THE THREE MONTHS PRECEDING THE CLAIM (OR USD $50 IF NO FEES WERE PAID).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">12. Indemnity</h2>
        <p>
          You agree to indemnify and hold harmless Wallet &amp; Card and its operators from claims, damages, losses, and expenses (including reasonable legal fees) arising from your use of the Services, your deposits/transfers, or your violation of these Terms or applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">13. Suspension &amp; termination</h2>
        <p>
          We may suspend or terminate access immediately if we believe you violated these Terms, pose risk, or if required by law. You may stop using the Services at any time. Provisions that should survive termination will survive.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">14. Changes to the Terms</h2>
        <p>
          We may update these Terms by posting a revised version with a new &quot;Last updated&quot; date. Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">15. Governing law</h2>
        <p>
          These Terms are governed by the laws applicable to the operator of the Services, without regard to conflict-of-law principles, unless mandatory consumer protections in your country provide otherwise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">16. Contact</h2>
        <p>
          For questions about these Terms, use the Support Center after signing in, or contact us through official channels published on the Wallet &amp; Card website.
        </p>
      </section>
    </>
  );
}
