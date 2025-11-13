/**
 * Environment validation for production builds
 * This file runs during build time and ensures all required variables are set
 */

function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

  // Variables that should always be present
  const requiredVars = ['DATABASE_URL'];

  // Variables that should be present in production
  const productionVars = isProduction || isCI ? [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ] : [];

  const allRequired = [...requiredVars, ...productionVars];

  const missing: string[] = [];
  const envVars: Record<string, string> = {};

  allRequired.forEach((variable) => {
    const value = process.env[variable];
    if (!value) {
      missing.push(variable);
    } else {
      envVars[variable] = `${variable}=${value.substring(0, 20)}***`;
    }
  });

  if (missing.length > 0) {
    console.error('\n❌ ERRO: Variáveis de ambiente ausentes:');
    missing.forEach(v => {
      console.error(`   - ${v}`);
    });
    console.error('\n📝 Configure essas variáveis antes de fazer build:');
    console.error('   export ' + missing.map(v => `${v}=<seu_valor>`).join('\n   export '));

    // Em CI/CD ou produção, isso é crítico
    if (isProduction || isCI) {
      throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
    }
  }

  if (Object.keys(envVars).length > 0) {
    console.log('\n✅ Variáveis de ambiente configuradas:');
    Object.values(envVars).forEach(v => console.log(`   ${v}`));
  }

  return {
    isValid: missing.length === 0,
    missing,
    configured: Object.keys(envVars),
  };
}

// Run validation
try {
  const result = validateEnvironment();

  if (!result.isValid && (process.env.NODE_ENV === 'production' || process.env.CI === 'true')) {
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erro ao validar ambiente:', error);
  process.exit(1);
}

export {};
