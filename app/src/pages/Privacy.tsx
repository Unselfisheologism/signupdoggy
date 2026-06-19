import AppLayout from '../components/AppLayout';
import { SEO } from '../components/SEO';
import { ROUTES as SEO_ROUTES } from '../lib/seoConfig';

export default function Privacy() {
  return (
    <AppLayout>
      <SEO config={SEO_ROUTES.privacy} />
      <div className="page-content">
        <div className="term-banner">
          <span className="banner-prompt">$</span> ./privacy --read
          <span className="banner-status">● LEGAL</span>
        </div>

        <h1 className="docs-h1">PRIVACY POLICY</h1>
        <p className="docs-lead">
          THIS POLICY EXPLAINS WHAT DATA SIGNUPDOGGY COLLECTS, HOW WE USE IT, AND
          WHAT CHOICES YOU HAVE. WE COLLECT THE MINIMUM NECESSARY TO OPERATE THE
          FRAUD-DETECTION SERVICE AND KEEP YOUR ACCOUNT WORKING.
        </p>
        <p className="docs-p" style={{ opacity: 0.7 }}>
          LAST UPDATED: 2026
        </p>

        <h2 className="docs-h2"># 1. WHAT WE COLLECT</h2>
        <p className="docs-p">
          WE COLLECT THREE CATEGORIES OF DATA:
        </p>
        <ul className="docs-p" style={{ paddingLeft: '1.5em', listStyle: 'none' }}>
          <li>▸ <strong>ACCOUNT DATA</strong> — EMAIL ADDRESS AND PASSWORD HASH YOU PROVIDE AT SIGNUP. THE PASSWORD IS HASHED WITH BCRYPT; WE CANNOT READ IT.</li>
          <li>▸ <strong>VERIFICATION INPUT</strong> — THE EMAIL ADDRESSES, IP ADDRESSES, AND PHONE NUMBERS YOUR APPLICATION SENDS TO OUR API FOR FRAUD SCORING. THESE ARE DERIVED FROM YOUR END-USERS' SIGNUP ATTEMPTS, NOT OUR END-USERS.</li>
          <li>▸ <strong>USAGE METADATA</strong> — REQUEST TIMESTAMPS, API KEY ID, RESPONSE CODES, AND AGGREGATED LATENCY. USED FOR BILLING, ABUSE PREVENTION, AND PERFORMANCE.</li>
        </ul>
        <p className="docs-p">
          WE DO NOT COLLECT NAMES, POSTAL ADDRESSES, GOVERNMENT IDS, OR BROWSING
          HISTORY. WE DO NOT PLACE TRACKING COOKIES OR THIRD-PARTY ANALYTICS
          PIXELS ON THE SIGNUPDOGGY DASHBOARD.
        </p>

        <h2 className="docs-h2"># 2. HOW WE USE DATA</h2>
        <p className="docs-p">
          WE USE THE DATA WE COLLECT TO:
        </p>
        <ul className="docs-p" style={{ paddingLeft: '1.5em', listStyle: 'none' }}>
          <li>▸ AUTHENTICATE YOU AND PROTECT YOUR ACCOUNT</li>
          <li>▸ EXECUTE FRAUD-DETECTION LOOKUPS YOU REQUEST</li>
          <li>▸ ENFORCE RATE LIMITS AND DETECT API ABUSE</li>
          <li>▸ INVOICE USAGE AND PROCESS PAYMENTS</li>
          <li>▸ RESPOND TO SUPPORT REQUESTS</li>
          <li>▸ COMPLY WITH LEGAL OBLIGATIONS</li>
        </ul>
        <p className="docs-p">
          WE DO NOT SELL YOUR DATA. WE DO NOT SHARE IT WITH ADVERTISERS. WE DO
          NOT USE YOUR CUSTOMERS' VERIFICATION INPUTS TO TRAIN MODELS WITHOUT
          YOUR EXPLICIT OPT-IN.
        </p>

        <h2 className="docs-h2"># 3. COOKIES & LOCAL STORAGE</h2>
        <p className="docs-p">
          THE DASHBOARD USES A SINGLE FIRST-PARTY SESSION COOKIE ISSUED BY
          SUPABASE AUTH TO KEEP YOU SIGNED IN. WE ALSO USE <code>localStorage</code>
          {' '}FOR NON-ESSENTIAL PREFERENCES SUCH AS THE LAST-SELECTED CODE TAB
          ON THE DOCS PAGE. NO THIRD-PARTY COOKIES, NO ADVERTISING COOKIES, NO
          CROSS-SITE TRACKING.
        </p>

        <h2 className="docs-h2"># 4. THIRD-PARTY PROCESSORS</h2>
        <p className="docs-p">
          WE SHARE DATA ONLY WITH THE VENDORS NEEDED TO OPERATE THE SERVICE.
          EACH IS BOUND BY A DATA-PROCESSING AGREEMENT:
        </p>
        <ul className="docs-p" style={{ paddingLeft: '1.5em', listStyle: 'none' }}>
          <li>▸ <strong>CLOUDFLARE</strong> — HOSTS THE API AND THE DASHBOARD (DATA MAY BE PROCESSED AT THE CLOUDFLARE EDGE LOCATION NEAREST THE REQUEST)</li>
          <li>▸ <strong>SUPABASE</strong> — STORES ACCOUNT DATA, API KEYS, AND USAGE RECORDS (POSTGRES DATABASE)</li>
          <li>▸ <strong>DODO PAYMENTS</strong> — PROCESSES YOUR ONE-TIME CREDIT PURCHASES. NO SUBSCRIPTION, NO RECURRING BILLING. DODO RECEIVES BILLING METADATA ONLY.</li>
          <li>▸ <strong>RESEND</strong> — DELIVERS TRANSACTIONAL EMAIL (VERIFICATION, BILLING ALERTS)</li>
        </ul>

        <h2 className="docs-h2"># 5. DATA RETENTION</h2>
        <p className="docs-p">
          ACCOUNT DATA IS RETAINED FOR THE LIFETIME OF YOUR ACCOUNT. VERIFICATION
          INPUTS (EMAIL / IP / PHONE) ARE RETAINED FOR UP TO 30 DAYS FOR DEBUGGING
          AND FALSE-POSITIVE REVIEW, THEN AGGREGATED INTO ANONYMIZED STATISTICS.
          USAGE RECORDS FOR BILLING ARE RETAINED FOR 7 YEARS PER TAX LAW.
        </p>
        <p className="docs-p">
          YOU CAN REQUEST IMMEDIATE DELETION OF YOUR ACCOUNT DATA AT ANY TIME
          FROM THE DASHBOARD OR BY EMAILING{' '}
          <a href="mailto:privacy@signupdoggy.dev" style={{ color: 'var(--accent)' }}>
            privacy@signupdoggy.dev
          </a>
          . DELETION IS COMPLETED WITHIN 30 DAYS.
        </p>

        <h2 className="docs-h2"># 6. YOUR RIGHTS</h2>
        <p className="docs-p">
          DEPENDING ON YOUR JURISDICTION, YOU MAY HAVE THE RIGHT TO:
        </p>
        <ul className="docs-p" style={{ paddingLeft: '1.5em', listStyle: 'none' }}>
          <li>▸ ACCESS THE PERSONAL DATA WE HOLD ABOUT YOU</li>
          <li>▸ CORRECT INACCURATE DATA</li>
          <li>▸ REQUEST DELETION ("RIGHT TO BE FORGOTTEN")</li>
          <li>▸ OBJECT TO OR RESTRICT PROCESSING</li>
          <li>▸ EXPORT YOUR DATA IN A MACHINE-READABLE FORMAT</li>
          <li>▸ LODGE A COMPLAINT WITH YOUR DATA PROTECTION AUTHORITY</li>
        </ul>
        <p className="docs-p">
          IF YOU ARE A CALIFORNIA RESIDENT, THE CCPA GRANTS YOU THE ADDITIONAL
          RIGHT TO KNOW WHAT CATEGORIES OF PERSONAL INFORMATION WE COLLECT AND
          TO OPT OUT OF ANY "SALE" — NOTE THAT WE DO NOT SELL PERSONAL
          INFORMATION.
        </p>
        <p className="docs-p">
          IF YOU ARE AN EU/EEA RESIDENT, SIGNUPDOGGY IS THE DATA CONTROLLER FOR
          ACCOUNT DATA. FOR VERIFICATION INPUTS, YOU (OUR CUSTOMER) ARE THE
          DATA CONTROLLER AND WE ARE YOUR DATA PROCESSOR. OUR DPA IS AVAILABLE
          ON REQUEST.
        </p>

        <h2 className="docs-h2"># 7. SECURITY</h2>
        <p className="docs-p">
          WE USE INDUSTRY-STANDARD MEASURES: TLS 1.3 IN TRANSIT, AT-REST
          ENCRYPTION FOR STORED DATA, BCRYPT-HASHED PASSWORDS, RATE LIMITING,
          AND PRINCIPLE-OF-LEAST-PRIVILEGE ACCESS FOR STAFF. NO SYSTEM IS
          PERFECT, BUT WE NOTIFY AFFECTED USERS WITHOUT UNDUE DELAY IF A
          BREACH OCCURS.
        </p>

        <h2 className="docs-h2"># 8. CHILDREN'S PRIVACY</h2>
        <p className="docs-p">
          THE SERVICE IS NOT DIRECTED AT CHILDREN UNDER 16. WE DO NOT KNOWINGLY
          COLLECT DATA FROM CHILDREN. IF YOU BELIEVE A CHILD HAS PROVIDED US
          DATA, CONTACT{' '}
          <a href="mailto:privacy@signupdoggy.dev" style={{ color: 'var(--accent)' }}>
            privacy@signupdoggy.dev
          </a>
          {' '}AND WE WILL DELETE IT.
        </p>

        <h2 className="docs-h2"># 9. INTERNATIONAL TRANSFERS</h2>
        <p className="docs-p">
          SIGNUPDOGGY OPERATES PRIMARILY FROM INDIA AND THE UNITED STATES. IF YOU
          ARE LOCATED IN THE EU/EEA, UK, OR SWITZERLAND, YOUR DATA MAY BE
          TRANSFERRED TO COUNTRIES WITH DIFFERENT DATA-PROTECTION STANDARDS. WE
          RELY ON STANDARD CONTRACTUAL CLAUSES (EU COMMISSION 2021/914) FOR
          SUCH TRANSFERS.
        </p>

        <h2 className="docs-h2"># 10. CHANGES & CONTACT</h2>
        <p className="docs-p">
          WE MAY UPDATE THIS POLICY. MATERIAL CHANGES WILL BE ANNOUNCED BY EMAIL
          AND IN-APP NOTICE AT LEAST 14 DAYS BEFORE THEY TAKE EFFECT. THE "LAST
          UPDATED" DATE REFLECTS THE CURRENT VERSION.
        </p>
        <p className="docs-p">
          QUESTIONS OR REQUESTS? EMAIL{' '}
          <a href="mailto:privacy@signupdoggy.dev" style={{ color: 'var(--accent)' }}>
            privacy@signupdoggy.dev
          </a>
          .
        </p>
      </div>
    </AppLayout>
  );
}
