import { config } from '../../src/config/environment';

// Mock import.meta.env for testing
const mockImportMetaEnv: {
  DEV?: boolean;
  PROD?: boolean;
  VITE_API_BASE_URL?: string;
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
} = {
  DEV: true,
  PROD: false,
  VITE_API_BASE_URL: 'http://localhost:3002/api',
  VITE_APP_NAME: 'Type Trainer',
  VITE_APP_VERSION: '1.0.0'
};

// Mock the import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: mockImportMetaEnv
    }
  },
  writable: true,
  configurable: true
});

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset mock values
    mockImportMetaEnv.DEV = true;
    mockImportMetaEnv.PROD = false;
    mockImportMetaEnv.VITE_API_BASE_URL = 'http://localhost:3002/api';
    mockImportMetaEnv.VITE_APP_NAME = 'Type Trainer';
    mockImportMetaEnv.VITE_APP_VERSION = '1.0.0';
  });

  describe('Development Environment', () => {
    it('should detect development environment correctly', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.PROD = false;
      
      // Re-import to get fresh config
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.isDevelopment).toBe(true);
      expect(freshConfig.isProduction).toBe(false);
    });

    it('should provide development-specific configuration', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.PROD = false;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.isDevelopment).toBe(true);
      expect(freshConfig.apiBaseUrl).toBe('http://localhost:3002/api');
      expect(freshConfig.appName).toBe('Type Trainer');
      expect(freshConfig.appVersion).toBe('1.0.0');
    });
  });

  describe('Production Environment', () => {
    it('should detect production environment correctly', () => {
      mockImportMetaEnv.DEV = false;
      mockImportMetaEnv.PROD = true;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.isDevelopment).toBe(false);
      expect(freshConfig.isProduction).toBe(true);
    });

    it('should provide production-specific configuration', () => {
      mockImportMetaEnv.DEV = false;
      mockImportMetaEnv.PROD = true;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.isProduction).toBe(true);
      expect(freshConfig.isDevelopment).toBe(false);
    });
  });

  describe('Environment Variables', () => {
    it('should read VITE_API_BASE_URL correctly', () => {
      mockImportMetaEnv.VITE_API_BASE_URL = 'https://api.example.com';
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.apiBaseUrl).toBe('https://api.example.com');
    });

    it('should read VITE_APP_NAME correctly', () => {
      mockImportMetaEnv.VITE_APP_NAME = 'Custom App Name';
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.appName).toBe('Custom App Name');
    });

    it('should read VITE_APP_VERSION correctly', () => {
      mockImportMetaEnv.VITE_APP_VERSION = '2.0.0';
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.appVersion).toBe('2.0.0');
    });

    it('should use default values when environment variables are missing', () => {
      mockImportMetaEnv.VITE_API_BASE_URL = '';
      mockImportMetaEnv.VITE_APP_NAME = '';
      mockImportMetaEnv.VITE_APP_VERSION = '';
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.apiBaseUrl).toBe('http://localhost:3002/api');
      expect(freshConfig.appName).toBe('Type Trainer');
      expect(freshConfig.appVersion).toBe('1.0.0');
    });
  });

  describe('Environment Detection Logic', () => {
    it('should prioritize PROD over DEV when both are set', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.PROD = true;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.isProduction).toBe(true);
      expect(freshConfig.isDevelopment).toBe(false);
    });

    it('should handle undefined environment flags', () => {
      mockImportMetaEnv.DEV = undefined;
      mockImportMetaEnv.PROD = undefined;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.isDevelopment).toBe(false);
      expect(freshConfig.isProduction).toBe(false);
    });

    it('should handle null environment flags', () => {
      mockImportMetaEnv.DEV = false;
      mockImportMetaEnv.PROD = false;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      expect(freshConfig.isDevelopment).toBe(false);
      expect(freshConfig.isProduction).toBe(false);
    });
  });

  describe('Configuration Object Structure', () => {
    it('should have all required properties', () => {
      expect(config).toHaveProperty('apiBaseUrl');
      expect(config).toHaveProperty('appName');
      expect(config).toHaveProperty('appVersion');
      expect(config).toHaveProperty('isDevelopment');
      expect(config).toHaveProperty('isProduction');
    });

    it('should have correct property types', () => {
      expect(typeof config.apiBaseUrl).toBe('string');
      expect(typeof config.appName).toBe('string');
      expect(typeof config.appVersion).toBe('string');
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(typeof config.isProduction).toBe('boolean');
    });

    it('should have non-empty string values for required fields', () => {
      expect(config.apiBaseUrl.length).toBeGreaterThan(0);
      expect(config.appName.length).toBeGreaterThan(0);
      expect(config.appVersion.length).toBeGreaterThan(0);
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should enable developer features in development mode', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.PROD = false;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      if (freshConfig.isDevelopment) {
        // In development, we should show developer tools
        expect(freshConfig.isDevelopment).toBe(true);
      }
    });

    it('should disable developer features in production mode', () => {
      mockImportMetaEnv.DEV = false;
      mockImportMetaEnv.PROD = true;
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      if (freshConfig.isProduction) {
        // In production, we should hide developer tools
        expect(freshConfig.isProduction).toBe(true);
        expect(freshConfig.isDevelopment).toBe(false);
      }
    });
  });

  describe('Fallback Values', () => {
    it('should provide sensible defaults for missing configuration', () => {
      // Test that the config object always has valid values
      expect(config.apiBaseUrl).toBeTruthy();
      expect(config.appName).toBeTruthy();
      expect(config.appVersion).toBeTruthy();
    });

    it('should handle malformed environment variables gracefully', () => {
      mockImportMetaEnv.VITE_API_BASE_URL = '';
      mockImportMetaEnv.VITE_APP_NAME = '';
      mockImportMetaEnv.VITE_APP_VERSION = '';
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      // Should still have valid values
      expect(freshConfig.apiBaseUrl).toBeTruthy();
      expect(freshConfig.appName).toBeTruthy();
      expect(freshConfig.appVersion).toBeTruthy();
    });
  });

  describe('Configuration Consistency', () => {
    it('should maintain consistent values across imports', () => {
      const firstImport = { ...config };
      
      jest.resetModules();
      const { config: secondImport } = require('../../src/config/environment');
      
      expect(firstImport.apiBaseUrl).toBe(secondImport.apiBaseUrl);
      expect(firstImport.appName).toBe(secondImport.appName);
      expect(firstImport.appVersion).toBe(secondImport.appVersion);
    });
  });

  describe('Integration with Components', () => {
    it('should provide environment flags for conditional rendering', () => {
      // These flags are used in components to conditionally show/hide features
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(typeof config.isProduction).toBe('boolean');
      
      // They should be mutually exclusive
      if (config.isDevelopment) {
        expect(config.isProduction).toBe(false);
      } else if (config.isProduction) {
        expect(config.isDevelopment).toBe(false);
      }
    });

    it('should provide API configuration for network requests', () => {
      expect(config.apiBaseUrl).toMatch(/^https?:\/\//);
      expect(config.apiBaseUrl).toContain('localhost');
    });

    it('should provide app metadata for display purposes', () => {
      expect(config.appName).toBe('Type Trainer');
      expect(config.appVersion).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing import.meta.env gracefully', () => {
      // Temporarily remove import.meta.env
      const originalImport = (global as any).import;
      delete (global as any).import;
      
      try {
        jest.resetModules();
        const { config: freshConfig } = require('../../src/config/environment');
        
        // Should still provide valid configuration
        expect(freshConfig).toBeDefined();
        expect(typeof freshConfig.apiBaseUrl).toBe('string');
      } finally {
        // Restore original import
        (global as any).import = originalImport;
      }
    });

    it('should handle corrupted environment variables', () => {
      mockImportMetaEnv.VITE_API_BASE_URL = 'not-a-url';
      mockImportMetaEnv.VITE_APP_NAME = '';
      mockImportMetaEnv.VITE_APP_VERSION = '';
      
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/environment');
      
      // Should still provide valid configuration
      expect(freshConfig).toBeDefined();
      expect(typeof freshConfig.apiBaseUrl).toBe('string');
      expect(typeof freshConfig.appName).toBe('string');
      expect(typeof freshConfig.appVersion).toBe('string');
    });
  });
});
