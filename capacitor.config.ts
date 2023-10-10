import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.videodock.ott',
  appName: 'OTT App',
  webDir: 'build/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
