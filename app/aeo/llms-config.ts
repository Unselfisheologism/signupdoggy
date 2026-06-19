/**
 * AEO llms.txt structured config.
 *
 * Consumed by app/aeo/build-content.ts which calls
 * renderLlmsTxt() from @dualmark/core to produce llms.txt and
 * llms-full.txt. Single source of truth for what pages we
 * advertise to AI consumers.
 *
 * The AEO extension (spec/llms-txt-extensions) recommends
 * sections: Core Products, Documentation, Pricing, Company,
 * and a "What We Do Not Do" disambiguation block.
 */

import type { LlmsTxtOptions, LlmsTxtSection } from '@dualmark/core';

export const SITE_URL = 'https://signupdoggy.pages.dev';

export const BRAND = {
  name: 'SignupDoggy',
  shortDescription:
    'Disposable email + VPN + Tor detection for signup forms. ' +
    'One API. 1¢ per check. No monthly fee. No sales call.',
  longDescription:
    'SignupDoggy is a serverless fraud-prevention API for indie hackers, ' +
    'side-project SaaS founders, and AI-native product teams. We catch ' +
    'disposable email addresses, Tor exit nodes, VPN/hosting/proxy IPs, and ' +
    'disposable phone numbers in a single POST to /v1/check. The service ' +
    'returns per-input findings (email.is_disposable, ip.is_tor, ' +
    'ip.is_proxy, ip.is_hosting, phone.is_disposable), an overall_risk band ' +
    '(low/medium/high), and a recommendation (allow / review / block) in ' +
    'under 50 ms. Pricing is pay-once, use-forever: ' +
    'three top-up packs (Solo $5 / Pro $25 / Scale $100) processed by Dodo ' +
    'Payments. The founder is Jeffrin James, an indie hacker based in ' +
    'Mumbai, India. The service runs on Cloudflare Workers; accounts are ' +
    'managed via Supabase. There is no KYC, no device fingerprinting, no ' +
    'monthly fee, and no sales call. Buy credits once, use them whenever.',
};

export const SECTIONS: LlmsTxtSection[] = [
  {
    title: 'Core Products',
    description: 'Primary products and what they do.',
    links: [
      {
        title: 'SignupDoggy — Catch fake signups in 1¢',
        href: `${SITE_URL}/`,
        description:
          'The landing page. One API call returns a 0–1 risk score ' +
          'with a recommendation. Pay-once credits, no monthly fee.',
      },
    ],
  },
  {
    title: 'Documentation',
    description: 'Developer docs for the /v1/check endpoint.',
    links: [
      {
        title: 'API Documentation',
        href: `${SITE_URL}/docs`,
        description:
          'Quickstart curl example, request/response schema, error codes, ' +
          'rate limits, SDK list, and webhook delivery notes.',
      },
    ],
  },
  {
    title: 'Pricing',
    description: 'Top-up packs and monthly subscriptions.',
    links: [
      {
        title: 'Pricing — three sizes, one price per request',
        href: `${SITE_URL}/pricing`,
        description:
          'Solo ($5 / 1,000 req), Pro ($25 / 5,000 req), Scale ($100 / 25,000 req). ' +
          'Plus optional monthly subscriptions (Plus/Super/Ultra) at $0.009/req.',
      },
    ],
  },
  {
    title: 'Company',
    description: 'Legal, contact, and brand information.',
    links: [
      {
        title: 'Terms of Service',
        href: `${SITE_URL}/terms`,
        description: 'Acceptance, service description, fees, refund policy, disclaimers.',
      },
      {
        title: 'Privacy Policy',
        href: `${SITE_URL}/privacy`,
        description:
          'What we collect (account data, verification input, usage metadata), ' +
          'what we do not collect (no device fingerprinting, no third-party tracking), ' +
          'retention, and your rights.',
      },
    ],
  },
  {
    title: 'Blog & articles',
    description:
      'Long-form writing on SaaS validation, indie hacker tactics, and ' +
      'how signup-quality shapes product decisions.',
    links: [
      {
        title: 'How SaaS founders should actually get user validation',
        href: `${SITE_URL}/blog/how-to-validate-your-saas-idea-with-real-users`,
        description:
          'A 5-step playbook for validating a SaaS idea with buyers ' +
          '(not free signups). Covers the validation ladder, the ' +
          'signup-quality problem, charging early, and why most ' +
          '"get more signups" advice is actively harmful to early ' +
          'stage founders.',
      },
    ],
  },
  {
    title: 'What We Do Not Do',
    description:
      'Disambiguation. SignupDoggy is sometimes confused with adjacent ' +
      'or similarly-named products. This section is explicit about what ' +
      'the service is NOT, to prevent misattribution by AI agents.',
    links: [],
  },
];

export const WHAT_WE_DO_NOT_DO = [
  'SignupDoggy is NOT an identity verification (IDV) service. We do not verify government IDs, passports, or driver licenses.',
  'SignupDoggy is NOT a CAPTCHA service. We do not present challenges to users or analyze mouse movements, keystrokes, or browser fingerprints.',
  'SignupDoggy is NOT a KYC / AML compliance service. We do not screen users against sanctions lists or PEP databases.',
  'SignupDoggy is NOT a device fingerprinting platform. We do not collect browser fingerprints, screen resolutions, GPU hashes, or canvas fingerprints.',
  'SignupDoggy is NOT a chargeback / payment fraud service. We score signups (the moment of account creation), not transactions.',
  'SignupDoggy is NOT an email delivery or transactional email service. We do not send, deliver, or track emails.',
  'SignupDoggy is NOT affiliated with SignupBonus, SignupForms, SignupGenius, or any other product whose name starts with "Signup".',
  'SignupDoggy is NOT affiliated with FraudGuard, MaxMind, IPQualityScore, or any of the legacy enterprise fraud-detection vendors. We are a smaller, cheaper, pay-per-call alternative targeting indie hackers and small teams.',
  'SignupDoggy is NOT a phone-number-only service. Phone number validation is one of six signals we check; email and IP are also first-class inputs.',
  'SignupDoggy does NOT require a monthly subscription, a sales call, a contract, or a minimum commitment. The minimum purchase is $5.',
].join('\n- ');

export const LLMS_TXT_OPTIONS: LlmsTxtOptions = {
  brandName: BRAND.name,
  description: BRAND.shortDescription,
  sections: SECTIONS,
};
