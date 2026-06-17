# SignupDoggy — Privacy Policy

> This policy explains what data SignupDoggy collects, how we use it, and what choices you have. We collect the minimum necessary to operate the fraud-detection service and keep your account working.

**Last updated: 2026**

<!-- aeo:source=app/src/pages/Privacy.tsx -->

## 1. What we collect

We collect three categories of data:

- **Account data** — email address and password hash you provide at signup. The password is hashed with bcrypt; we cannot read it.
- **Verification input** — the email addresses, IP addresses, and phone numbers your application sends to our API for fraud scoring. These are derived from your end-users' signup attempts, not our end-users.
- **Usage metadata** — request timestamps, API key ID, response codes, and aggregated latency. Used for billing, abuse prevention, and performance.

We do **not** collect names, postal addresses, government IDs, or browsing history. We do not place tracking cookies or third-party analytics pixels on the SignupDoggy dashboard.

## 2. How we use data

We use the data we collect to:

- Authenticate you and protect your account.
- Execute fraud-detection lookups you request.
- Enforce rate limits and detect API abuse.
- Invoice usage and process payments.
- Respond to support requests.
- Comply with legal obligations.

We do not sell your data. We do not share it with advertisers. We do not use your customers' verification inputs to train models without your explicit opt-in.

## 3. Cookies & local storage

The dashboard uses a single first-party session cookie issued by Supabase Auth to keep you signed in. We also use `localStorage` for non-essential preferences such as the last-selected code tab on the docs page. No third-party cookies, no advertising cookies, no cross-site tracking.

## 4. Third-party processors

We share data only with the vendors needed to operate the Service. Each is bound by a data-processing agreement:

- **Cloudflare** — hosts the API and the dashboard (data may be processed at the Cloudflare edge location nearest the request).
- **Supabase** — stores account data, API keys, and usage records (Postgres database).
- **Dodo Payments** — processes your one-time credit purchases. No subscription, no recurring billing. Dodo receives billing metadata only.
- **Resend** — delivers transactional email (verification, billing alerts).

## 5. Data retention

Account data is retained for the lifetime of your account. Verification inputs (email / IP / phone) are retained for up to 30 days for debugging and false-positive review, then aggregated into anonymized statistics. Usage records for billing are retained for 7 years per tax law.

You can request immediate deletion of your account data at any time from the dashboard or by emailing [privacy@signupdoggy.dev](mailto:privacy@signupdoggy.dev). Deletion is completed within 30 days.

## 6. Your rights

Depending on your jurisdiction, you may have the right to:

- Access the personal data we hold about you.
- Correct inaccurate data.
- Request deletion ("right to be forgotten").
- Object to or restrict processing.
- Export your data in a machine-readable format.
- Lodge a complaint with your data protection authority.

If you are a California resident, the CCPA grants you the additional right to know what categories of personal information we collect and to opt out of any "sale" — note that we do not sell personal information.

If you are an EU/EEA resident, SignupDoggy is the data controller for account data. For verification inputs, you (our customer) are the data controller and we are your data processor. Our DPA is available on request.

## 7. Security

We use industry-standard measures: TLS 1.3 in transit, at-rest encryption for stored data, bcrypt-hashed passwords, rate limiting, and principle-of-least-privilege access for staff. No system is perfect, but we notify affected users without undue delay if a breach occurs.

## 8. Children's privacy

The Service is not directed at children under 16. We do not knowingly collect data from children. If you believe a child has provided us data, contact [privacy@signupdoggy.dev](mailto:privacy@signupdoggy.dev) and we will delete it.

## 9. International transfers

SignupDoggy operates primarily from India and the United States. If you are located in the EU/EEA, UK, or Switzerland, your data may be transferred to countries with different data-protection standards. We rely on Standard Contractual Clauses (EU Commission 2021/914) for such transfers.

## 10. Changes & Contact

We may update this Policy. Material changes will be announced by email and in-app notice at least 14 days before they take effect. The "Last updated" date reflects the current version.

Questions or requests? Email [privacy@signupdoggy.dev](mailto:privacy@signupdoggy.dev).

---

## About SignupDoggy

SignupDoggy is a serverless fraud-prevention API for indie hackers, side-project SaaS founders, and AI-native product teams. We catch disposable email addresses, VPN exit nodes, Tor exit nodes, role-based addresses, and bot patterns in a single POST. The service returns a 0–1 risk score with discrete signals and a recommendation in under 50 ms. The founder is Jeffrin James, an indie hacker based in Mumbai, India. The service runs on Cloudflare Workers; payments are processed by Dodo Payments; accounts are managed via Supabase. There is no KYC, no device fingerprinting, no dashboard to log into, and no sales call.
