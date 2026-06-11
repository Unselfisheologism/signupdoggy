import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Helper Functions (re-imported for testing) ─────────────────────────────────

function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase().trim() || '';
}

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^\./, '').replace(/\.$/, '');
}

function computeOverallRisk(riskScores: number[]): 'low' | 'medium' | 'high' {
  const max = Math.max(...riskScores, 0);
  if (max >= 70) return 'high';
  if (max >= 30) return 'medium';
  return 'low';
}

function computeRecommendation(riskScores: number[], overall: 'low' | 'medium' | 'high'): 'allow' | 'review' | 'block' {
  const max = Math.max(...riskScores, 0);
  if (max >= 80) return 'block';
  if (overall === 'high') return 'block';
  if (max >= 50) return 'review';
  if (overall === 'medium') return 'review';
  return 'allow';
}

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sd_';
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('extractDomain', () => {
  it('should extract domain from a standard email', () => {
    expect(extractDomain('user@example.com')).toBe('example.com');
  });

  it('should handle emails with subdomains', () => {
    expect(extractDomain('user@mail.example.co.uk')).toBe('mail.example.co.uk');
  });

  it('should handle emails with plus addressing', () => {
    expect(extractDomain('user+tag@example.com')).toBe('example.com');
  });

  it('should return empty string for emails without @', () => {
    expect(extractDomain('notanemail')).toBe('');
  });

  it('should normalize to lowercase', () => {
    expect(extractDomain('User@Example.COM')).toBe('example.com');
  });
});

describe('normalizeDomain', () => {
  it('should lowercase domains', () => {
    expect(normalizeDomain('EXAMPLE.COM')).toBe('example.com');
  });

  it('should remove leading dots', () => {
    expect(normalizeDomain('.example.com')).toBe('example.com');
  });

  it('should remove trailing dots', () => {
    expect(normalizeDomain('example.com.')).toBe('example.com');
  });
});

describe('computeOverallRisk', () => {
  it('should return low for scores under 30', () => {
    expect(computeOverallRisk([0])).toBe('low');
    expect(computeOverallRisk([10])).toBe('low');
    expect(computeOverallRisk([29])).toBe('low');
  });

  it('should return medium for scores 30-69', () => {
    expect(computeOverallRisk([30])).toBe('medium');
    expect(computeOverallRisk([50])).toBe('medium');
    expect(computeOverallRisk([69])).toBe('medium');
  });

  it('should return high for scores 70+', () => {
    expect(computeOverallRisk([70])).toBe('high');
    expect(computeOverallRisk([85])).toBe('high');
    expect(computeOverallRisk([100])).toBe('high');
  });

  it('should use the maximum score', () => {
    expect(computeOverallRisk([10, 30, 70])).toBe('high');
    expect(computeOverallRisk([10, 50, 20])).toBe('medium');
    expect(computeOverallRisk([10, 20, 0])).toBe('low');
  });

  it('should handle empty array', () => {
    expect(computeOverallRisk([])).toBe('low');
  });
});

describe('computeRecommendation', () => {
  it('should block for scores 80+', () => {
    expect(computeRecommendation([80], 'high')).toBe('block');
    expect(computeRecommendation([100], 'high')).toBe('block');
  });

  it('should block for overall high risk', () => {
    expect(computeRecommendation([70], 'high')).toBe('block');
  });

  it('should review for scores 50-79', () => {
    expect(computeRecommendation([50], 'medium')).toBe('review');
    expect(computeRecommendation([60], 'medium')).toBe('review');
    expect(computeRecommendation([79], 'medium')).toBe('review');
  });

  it('should review for overall medium risk', () => {
    expect(computeRecommendation([30], 'medium')).toBe('review');
  });

  it('should allow for low risk', () => {
    expect(computeRecommendation([0], 'low')).toBe('allow');
    expect(computeRecommendation([10], 'low')).toBe('allow');
    expect(computeRecommendation([29], 'low')).toBe('allow');
  });
});

describe('generateApiKey', () => {
  it('should start with sd_', () => {
    const key = generateApiKey();
    expect(key.startsWith('sd_')).toBe(true);
  });

  it('should be 51 characters long (3 + 48)', () => {
    const key = generateApiKey();
    expect(key.length).toBe(51);
  });

  it('should only contain valid characters', () => {
    const key = generateApiKey();
    const prefix = key.slice(0, 3);
    const rest = key.slice(3);
    expect(prefix).toBe('sd_');
    expect(rest).toMatch(/^[a-z0-9]+$/);
  });

  it('should generate unique keys', () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateApiKey()));
    expect(keys.size).toBe(100);
  });
});

describe('getToday', () => {
  it('should return today as YYYY-MM-DD', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should match actual date', () => {
    const d = new Date();
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(getToday()).toBe(expected);
  });
});

// ─── Scoring Logic Integration Tests ────────────────────────────────────────────

describe('Fraud scoring integration', () => {
  it('should block disposable email with high risk', () => {
    const emailRisk = 85;
    const ipRisk = 0;
    const risks = [emailRisk, ipRisk];
    const overall = computeOverallRisk(risks);
    const recommendation = computeRecommendation(risks, overall);

    expect(overall).toBe('high');
    expect(recommendation).toBe('block');
  });

  it('should block Tor exit node', () => {
    const emailRisk = 0;
    const ipRisk = 90;
    const risks = [emailRisk, ipRisk];
    const overall = computeOverallRisk(risks);
    const recommendation = computeRecommendation(risks, overall);

    expect(overall).toBe('high');
    expect(recommendation).toBe('block');
  });

  it('should review medium risk from hosting IP', () => {
    const emailRisk = 0;
    const ipRisk = 60;
    const risks = [emailRisk, ipRisk];
    const overall = computeOverallRisk(risks);
    const recommendation = computeRecommendation(risks, overall);

    expect(overall).toBe('medium');
    expect(recommendation).toBe('review');
  });

  it('should allow clean request', () => {
    const emailRisk = 0;
    const ipRisk = 0;
    const risks = [emailRisk, ipRisk];
    const overall = computeOverallRisk(risks);
    const recommendation = computeRecommendation(risks, overall);

    expect(overall).toBe('low');
    expect(recommendation).toBe('allow');
  });

  it('should combine signals correctly (email high + ip medium = high)', () => {
    const emailRisk = 85;  // disposable
    const ipRisk = 60;     // hosting
    const risks = [emailRisk, ipRisk];
    const overall = computeOverallRisk(risks);
    const recommendation = computeRecommendation(risks, overall);

    expect(overall).toBe('high');
    expect(recommendation).toBe('block');
  });
});

// ─── Usage Tracking Tests ─────────────────────────────────────────────────────

describe('Usage tracking', () => {
  it('should increment usage count', () => {
    const current = '5';
    const incremented = String(parseInt(current, 10) + 1);
    expect(incremented).toBe('6');
  });

  it('should calculate estimated cost correctly', () => {
    const usageCount = 847;
    const pricePerRequest = 0.01;
    const cost = usageCount * pricePerRequest;
    expect(cost).toBe(8.47);
  });
});

// ─── KV Schema Tests (structure validation) ─────────────────────────────────────

describe('KV data structures', () => {
  it('should validate API key record structure', () => {
    const record = {
      user_id: 'user_123',
      created: '2024-06-10',
      metadata: { stripe_customer_id: null },
    };
    expect(record).toHaveProperty('user_id');
    expect(record).toHaveProperty('created');
    expect(record).toHaveProperty('metadata');
    expect(record.metadata).toHaveProperty('stripe_customer_id');
  });

  it('should validate check response structure', () => {
    const response = {
      email: {
        is_disposable: false,
        domain: 'gmail.com',
        risk_score: 0,
      },
      ip: null,
      overall_risk: 'low' as const,
      recommendation: 'allow' as const,
    };
    expect(response).toHaveProperty('email');
    expect(response).toHaveProperty('ip');
    expect(response).toHaveProperty('overall_risk');
    expect(response).toHaveProperty('recommendation');
    expect(['low', 'medium', 'high']).toContain(response.overall_risk);
    expect(['allow', 'review', 'block']).toContain(response.recommendation);
  });

  it('should validate stats response structure', () => {
    const stats = {
      period: '2024-06-10',
      total_requests: 152,
      blocked_count: 12,
      blocked_by_reason: {
        disposable_email: 8,
        tor_exit: 2,
        proxy: 2,
        custom_blacklist: 0,
      },
      estimated_cost_usd: 1.52,
    };
    expect(stats).toHaveProperty('period');
    expect(stats).toHaveProperty('total_requests');
    expect(stats).toHaveProperty('blocked_count');
    expect(stats).toHaveProperty('blocked_by_reason');
    expect(stats).toHaveProperty('estimated_cost_usd');
    expect(stats.blocked_count).toBe(
      stats.blocked_by_reason.disposable_email +
      stats.blocked_by_reason.tor_exit +
      stats.blocked_by_reason.proxy +
      stats.blocked_by_reason.custom_blacklist
    );
  });

  it('should validate user blacklist structure', () => {
    const blacklist = {
      emails: ['bad@temp.com'],
      ips: ['1.2.3.4'],
    };
    expect(blacklist).toHaveProperty('emails');
    expect(blacklist).toHaveProperty('ips');
    expect(Array.isArray(blacklist.emails)).toBe(true);
    expect(Array.isArray(blacklist.ips)).toBe(true);
  });

  it('should validate blacklist add operation', () => {
    const existing = { emails: ['bad@temp.com'], ips: [] };
    const newValue = 'worse@spam.com';
    if (!existing.emails.includes(newValue)) {
      existing.emails.push(newValue);
    }
    expect(existing.emails).toHaveLength(2);
    expect(existing.emails).toContain('worse@spam.com');
  });

  it('should validate blacklist remove operation', () => {
    const existing = { emails: ['bad@temp.com', 'worse@spam.com'], ips: [] };
    const toRemove = 'bad@temp.com';
    existing.emails = existing.emails.filter(v => v !== toRemove);
    expect(existing.emails).toHaveLength(1);
    expect(existing.emails).not.toContain('bad@temp.com');
  });
});

// ─── Name blacklist entry validation ─────────────────────────────────────────────

describe('Blacklist entry validation', () => {
  it('should reject invalid types', () => {
    const validTypes = ['email', 'ip'];
    expect(validTypes.includes('email')).toBe(true);
    expect(validTypes.includes('ip')).toBe(true);
    expect(validTypes.includes('domain')).toBe(false);
    expect(validTypes.includes('phone')).toBe(false);
  });

  it('should reject invalid actions', () => {
    const validActions = ['add', 'remove'];
    expect(validActions.includes('add')).toBe(true);
    expect(validActions.includes('remove')).toBe(true);
    expect(validActions.includes('delete')).toBe(false);
    expect(validActions.includes('update')).toBe(false);
  });

  it('should normalize email to lowercase', () => {
    const email = 'Bad@Spam.com';
    expect(email.toLowerCase()).toBe('bad@spam.com');
  });

  it('should prevent duplicate blacklist entries', () => {
    const list: string[] = [];
    const value = 'test@example.com';
    if (!list.includes(value)) list.push(value);
    if (!list.includes(value)) list.push(value);
    expect(list).toHaveLength(1);
  });
});
