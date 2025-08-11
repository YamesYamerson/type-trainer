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

// Smart port detection utility
const detectBackendPort = async (): Promise<string> => {
  const basePorts = [3001, 3002, 3003, 3004, 3005];
  
  for (const port of basePorts) {
    try {
      const response = await fetch(`http://localhost:${port}/api/db-info`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000) // 1 second timeout
      });
      if (response.ok) {
        return port.toString();
      }
    } catch (error) {
      // Port not available or server not responding, try next
      continue;
    }
  }
  
  // Fallback to default
  return '3001';
};

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  return import.meta.env[key] || fallback;
};

// Create dynamic API base URL
const createApiBaseUrl = async (): Promise<string> => {
  const envUrl = getEnvVar('VITE_API_BASE_URL', '');
  if (envUrl) {
    return envUrl;
  }
  
  // Auto-detect backend port
  const detectedPort = await detectBackendPort();
  return `http://localhost:${detectedPort}/api`;
};

export const config: EnvironmentConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'), // Fallback default
  appName: getEnvVar('VITE_APP_NAME', 'Type Trainer'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// Dynamic API base URL getter
export const getApiBaseUrl = async (): Promise<string> => {
  return await createApiBaseUrl();
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
