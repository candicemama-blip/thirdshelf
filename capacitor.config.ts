import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thirdshelf.app',
  appName: 'Third Shelf',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Remove this block for production builds
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#F5F0E8',
  },
  android: {
    backgroundColor: '#F5F0E8',
  },
};

export default config;
