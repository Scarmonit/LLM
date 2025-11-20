#!/usr/bin/env node
/**
 * Docker Registry Login Helper
 * Auto-discovered by Layer 4, usable by all 9 layers
 * Integrates with Enhanced Autonomous Framework
 */

import 'dotenv/config';
import { execSync } from 'child_process';

const { DOCKER_REGISTRY, DOCKER_USER, DOCKER_PAT } = process.env;

console.log('🐳 Docker Registry Login Helper\n');

// Validate credentials
if (!DOCKER_REGISTRY || !DOCKER_USER || !DOCKER_PAT) {
  console.error('❗ Docker credentials missing in .env');
  console.error('   Required: DOCKER_REGISTRY, DOCKER_USER, DOCKER_PAT');
  process.exit(1);
}

console.log(`Registry: ${DOCKER_REGISTRY}`);
console.log(`User: ${DOCKER_USER}`);
console.log('PAT: ****' + DOCKER_PAT.slice(-4));

try {
  console.log('\n🔐 Authenticating...');

  execSync(
    `echo "${DOCKER_PAT}" | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} --password-stdin`,
    { stdio: 'inherit' }
  );

  console.log('\n✅ Docker login succeeded');
  console.log('   All layers can now access private registry\n');

} catch (err) {
  console.error('\n❌ Docker login failed');
  console.error('   Check credentials in .env');
  process.exit(err.status || 1);
}

