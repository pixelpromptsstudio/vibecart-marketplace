import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbSchema, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Learn how ${SITE_NAME} collects, protects, and uses customer and seller data across payments, delivery, and marketplace accounts.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' },
        ])}
      />
      <div className="legal-hero">
        <div className="container">
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#D4FF00', letterSpacing: '0.1em', marginBottom: '8px' }}>
            TRUST &amp; GOVERNANCE
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, marginBottom: '10px' }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '15px', maxWidth: '620px' }}>
            Transparency around your account data, shipping details, order telemetry, and privacy controls on {SITE_NAME}.
          </p>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: '64px' }}>
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        <div className="legal-card legal-article">
          <h2>1. Information We Collect</h2>
          <p>
            When you create an account, place an order, or register as an independent vendor on {SITE_NAME}, we collect only the information necessary to fulfill your purchases, verify store identities, and secure platform transactions: your name, email address, phone number, delivery addresses, and hashed credentials.
          </p>

          <h2>2. How We Use &amp; Protect Your Data</h2>
          <ul>
            <li>Order orchestration, real-time fulfillment tracking, and verified buyer-seller support.</li>
            <li>Fraud screening, role-based access enforcement, and audit logging on sensitive administrative actions.</li>
            <li>Passwords are salted and hashed with bcrypt; session tokens use signed JSON Web Tokens.</li>
          </ul>

          <h2>3. Payment &amp; Cookie Security</h2>
          <p>
            We never store raw payment card numbers or CVV codes on marketplace servers. Essential browser storage is used strictly to preserve your authenticated session and delivery pin code preferences.
          </p>

          <h2>4. Contact &amp; Data Requests</h2>
          <p>
            To request data export, correction, or account deletion, email{' '}
            <a href="mailto:support@vibecart.com" style={{ color: '#4F46E5', fontWeight: 700 }}>
              support@vibecart.com
            </a>{' '}
            or manage your saved addresses directly in your <Link href="/profile" style={{ color: '#4F46E5', fontWeight: 700 }}>Profile Settings</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
