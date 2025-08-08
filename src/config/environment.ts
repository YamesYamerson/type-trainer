/**
 * Environment configuration for Type Trainer
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  appName: string;
  appVersion: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  return import.meta.env[key] || fallback;
};

export const config: EnvironmentConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  appName: getEnvVar('VITE_APP_NAME', 'Type Trainer'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = ['apiBaseUrl'];
  const missing = requiredVars.filter(key => !config[key as keyof EnvironmentConfig]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
};

// Validate on import
validateConfig();

export default config;
