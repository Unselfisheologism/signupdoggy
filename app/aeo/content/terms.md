# SignupDoggy — Terms of Service

> These terms govern your use of SignupDoggy ("the Service"). By accessing or using the Service you agree to be bound by them. If you do not agree, do not use the Service.

**Last updated: 2026**

<!-- aeo:source=app/src/pages/Terms.tsx -->

## 1. Acceptance

By creating an account, generating an API key, or submitting a request to the SignupDoggy API, you confirm that you have read, understood, and agree to these Terms. If you are accepting on behalf of an organization, you represent that you have authority to bind that organization.

## 2. Service Description

SignupDoggy is a fraud-prevention API. The Service evaluates email addresses, IP addresses, and phone numbers provided by you in your signup traffic and returns risk scores, signals (disposable email, VPN, proxy, Tor, virtual phone), and a recommendation (`allow` / `review` / `block`).

The Service is provided "as is" and is intended to **assist — not replace** — your own fraud-detection processes. You remain solely responsible for decisions you make based on the Service's output.

## 3. Accounts & Eligibility

You must provide a valid email address and a secure password to create an account. You are responsible for maintaining the confidentiality of your credentials and your API keys. You must be at least 16 years old (or the age of digital consent in your jurisdiction, whichever is higher) to use the Service.

## 4. API Keys & Acceptable Use

API keys are personal to your account. Do not share, resell, or distribute your keys. You must **not**:

- Use the Service to violate any applicable law or regulation.
- Submit personal data of third parties without a lawful basis under GDPR, CCPA, or equivalent privacy law.
- Attempt to reverse-engineer, scrape, or mass-download our detection databases.
- Resell or sublicense the Service or its output in competition with SignupDoggy.
- Interfere with or disrupt the integrity or performance of the Service.
- Use the Service to stalk, harass, or harm any individual.

## 5. Fees & Payment

SignupDoggy is a pay-as-you-go service. Every API call costs $0.01 deducted from your pre-paid credit balance, processed by Dodo Payments. Credits never expire. No monthly fee, no subscription, no sales call. All fees are non-refundable except where required by law.

We may change pricing with 30 days' notice. Continued use after the effective date of a price change constitutes acceptance of the new pricing.

## 6. Intellectual Property

The Service, including its detection databases, algorithms, branding, and source code, is owned by SignupDoggy and protected by intellectual property law. These Terms grant you a limited, non-exclusive, non-transferable license to use the Service via the public API only. You retain all rights to data you submit to the API.

## 7. Termination

You may close your account at any time from the dashboard. We may suspend or terminate your access if you breach these Terms, abuse the Service, or if we are required to do so by law. Upon termination, your right to use the Service ceases immediately.

## 8. Disclaimers & Liability

To the maximum extent permitted by law, the Service is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or that every fraudulent signup will be detected.

In no event shall SignupDoggy's total liability for all claims arising out of or relating to the Service exceed the greater of (a) the fees you paid us in the 12 months preceding the claim, or (b) USD $100. We shall not be liable for indirect, incidental, special, consequential, or punitive damages.

## 9. Governing Law

These Terms are governed by the laws of India, without regard to its conflict-of-law rules. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Kerala, India.

## 10. Changes & Contact

We may update these Terms from time to time. Material changes will be announced by email and in-app notice at least 14 days before they take effect. The "Last updated" date at the top of this page reflects the current version.

Questions about these Terms? Email [legal@signupdoggy.dev](mailto:legal@signupdoggy.dev).

---

## About SignupDoggy

SignupDoggy is a serverless fraud-prevention API for indie hackers, side-project SaaS founders, and AI-native product teams. We catch disposable email addresses, VPN exit nodes, Tor exit nodes, role-based addresses, and bot patterns in a single POST. The service returns a 0–1 risk score with discrete signals and a recommendation in under 50 ms. The founder is Jeffrin James, an indie hacker based in Mumbai, India. The service runs on Cloudflare Workers; payments are processed by Dodo Payments; accounts are managed via Supabase. There is no KYC, no device fingerprinting, no dashboard to log into, and no sales call.
