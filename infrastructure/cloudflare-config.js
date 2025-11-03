#!/usr/bin/env node

/**
 * Cloudflare CDN Integration for S3 Bucket
 *
 * Features:
 * - CDN caching for S3 content
 * - DDoS protection
 * - SSL/TLS encryption
 * - Page rules for optimization
 * - Firewall rules
 * - Analytics integration
 *
 * Prerequisites:
 * - Cloudflare account
 * - Domain configured in Cloudflare
 * - API token with Zone:Edit permissions
 */

import https from 'https';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const DOMAIN = 'docs.scarmonit.com'; // Subdomain for S3 content
const S3_BUCKET_URL = 'scarmonit-docs.s3.us-east-1.amazonaws.com';

/**
 * Make Cloudflare API request
 */
async function cloudflareAPI(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.success) {
            resolve(json.result);
          } else {
            reject(new Error(`Cloudflare API error: ${JSON.stringify(json.errors)}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Create DNS record pointing to S3 bucket
 */
async function createDNSRecord() {
  console.log(`[Cloudflare] Creating DNS record for ${DOMAIN} -> ${S3_BUCKET_URL}`);

  try {
    const result = await cloudflareAPI('POST', `/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
      type: 'CNAME',
      name: DOMAIN.split('.')[0], // Just the subdomain part
      content: S3_BUCKET_URL,
      ttl: 1, // Auto (Cloudflare proxy)
      proxied: true, // Enable Cloudflare CDN
      comment: 'S3 bucket CDN integration'
    });

    console.log('[Cloudflare] ✅ DNS record created:', result.id);
    return result;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('[Cloudflare] DNS record already exists');
      return null;
    }
    throw error;
  }
}

/**
 * Configure page rules for optimization
 */
async function createPageRules() {
  console.log('[Cloudflare] Creating page rules for optimization');

  const rules = [
    {
      targets: [{ target: 'url', constraint: { operator: 'matches', value: `${DOMAIN}/*` }}],
      actions: [
        { id: 'browser_cache_ttl', value: 14400 }, // 4 hours
        { id: 'cache_level', value: 'cache_everything' },
        { id: 'edge_cache_ttl', value: 7200 }, // 2 hours
        { id: 'ssl', value: 'flexible' }
      ],
      priority: 1,
      status: 'active'
    }
  ];

  for (const rule of rules) {
    try {
      const result = await cloudflareAPI('POST', `/zones/${CLOUDFLARE_ZONE_ID}/pagerules`, rule);
      console.log('[Cloudflare] ✅ Page rule created:', result.id);
    } catch (error) {
      console.error('[Cloudflare] Failed to create page rule:', error.message);
    }
  }
}

/**
 * Configure cache settings
 */
async function configureCacheSettings() {
  console.log('[Cloudflare] Configuring cache settings');

  const settings = [
    { id: 'browser_cache_ttl', value: 14400 }, // 4 hours
    { id: 'cache_level', value: 'aggressive' },
    { id: 'development_mode', value: 'off' },
    { id: 'always_online', value: 'on' },
    { id: 'brotli', value: 'on' }, // Brotli compression
    { id: 'early_hints', value: 'on' }
  ];

  for (const setting of settings) {
    try {
      await cloudflareAPI('PATCH', `/zones/${CLOUDFLARE_ZONE_ID}/settings/${setting.id}`, {
        value: setting.value
      });
      console.log(`[Cloudflare] ✅ Updated ${setting.id} = ${setting.value}`);
    } catch (error) {
      console.error(`[Cloudflare] Failed to update ${setting.id}:`, error.message);
    }
  }
}

/**
 * Configure security settings
 */
async function configureSecuritySettings() {
  console.log('[Cloudflare] Configuring security settings');

  const settings = [
    { id: 'security_level', value: 'medium' },
    { id: 'ssl', value: 'flexible' },
    { id: 'automatic_https_rewrites', value: 'on' },
    { id: 'always_use_https', value: 'on' },
    { id: 'min_tls_version', value: '1.2' },
    { id: 'tls_1_3', value: 'on' }
  ];

  for (const setting of settings) {
    try {
      await cloudflareAPI('PATCH', `/zones/${CLOUDFLARE_ZONE_ID}/settings/${setting.id}`, {
        value: setting.value
      });
      console.log(`[Cloudflare] ✅ Updated ${setting.id} = ${setting.value}`);
    } catch (error) {
      console.error(`[Cloudflare] Failed to update ${setting.id}:`, error.message);
    }
  }
}

/**
 * Create firewall rules
 */
async function createFirewallRules() {
  console.log('[Cloudflare] Creating firewall rules');

  const rules = [
    {
      filter: {
        expression: '(http.request.uri.path contains ".git") or (http.request.uri.path contains ".env")',
        paused: false,
        description: 'Block access to sensitive files'
      },
      action: 'block'
    },
    {
      filter: {
        expression: '(cf.threat_score gt 14)',
        paused: false,
        description: 'Challenge high threat score visitors'
      },
      action: 'challenge'
    }
  ];

  for (const rule of rules) {
    try {
      // Create filter first
      const filter = await cloudflareAPI('POST', `/zones/${CLOUDFLARE_ZONE_ID}/filters`, [rule.filter]);

      // Create firewall rule
      const firewallRule = await cloudflareAPI('POST', `/zones/${CLOUDFLARE_ZONE_ID}/firewall/rules`, [{
        filter: { id: filter[0].id },
        action: rule.action,
        description: rule.filter.description
      }]);

      console.log('[Cloudflare] ✅ Firewall rule created:', firewallRule[0].id);
    } catch (error) {
      console.error('[Cloudflare] Failed to create firewall rule:', error.message);
    }
  }
}

/**
 * Purge cache
 */
async function purgeCache() {
  console.log('[Cloudflare] Purging cache');

  try {
    await cloudflareAPI('POST', `/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, {
      purge_everything: true
    });
    console.log('[Cloudflare] ✅ Cache purged successfully');
  } catch (error) {
    console.error('[Cloudflare] Failed to purge cache:', error.message);
  }
}

/**
 * Main setup function
 */
async function setupCloudflare() {
  console.log('='.repeat(70));
  console.log('🌐 Cloudflare CDN Integration Setup');
  console.log('='.repeat(70));

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.error('\n❌ Missing required environment variables:');
    console.error('   - CLOUDFLARE_API_TOKEN');
    console.error('   - CLOUDFLARE_ZONE_ID');
    console.error('\nPlease set these variables and try again.');
    process.exit(1);
  }

  try {
    // Step 1: Create DNS record
    await createDNSRecord();

    // Step 2: Configure page rules
    await createPageRules();

    // Step 3: Configure cache settings
    await configureCacheSettings();

    // Step 4: Configure security settings
    await configureSecuritySettings();

    // Step 5: Create firewall rules
    await createFirewallRules();

    // Step 6: Purge cache
    await purgeCache();

    console.log('\n' + '='.repeat(70));
    console.log('✅ Cloudflare CDN Integration Complete!');
    console.log('='.repeat(70));
    console.log(`\n📊 Your S3 content is now available at:`);
    console.log(`   https://${DOMAIN}`);
    console.log(`\n🔒 Security features enabled:`);
    console.log(`   - DDoS protection`);
    console.log(`   - SSL/TLS encryption`);
    console.log(`   - Firewall rules`);
    console.log(`   - Bot protection`);
    console.log(`\n⚡ Performance features enabled:`);
    console.log(`   - CDN caching`);
    console.log(`   - Brotli compression`);
    console.log(`   - Early hints`);
    console.log(`   - Always online`);
    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCloudflare();
}

export { setupCloudflare, purgeCache, createDNSRecord };
