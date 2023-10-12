import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Share } from '@capacitor/share';
import { SafeArea, SafeAreaInsets } from 'capacitor-plugin-safe-area';

const applySafeAreaVariables = (insets: SafeAreaInsets) => {
  for (const [key, value] of Object.entries(insets.insets)) {
    document.documentElement.style.setProperty(`--safe-area-${key}`, `${value}px`);
  }
};

async function initializeSafeArea() {
  // initial safe area
  const insets = await SafeArea.getSafeAreaInsets();

  applySafeAreaVariables(insets);

  // listen for changes
  await SafeArea.addListener('safeAreaChanged', async ({ insets }) => {
    // this event is triggered to soon and the insets still reflect the before rotation values
    // so, we wait for a bit
    await new Promise((resolve) => setTimeout(resolve, 200));

    let i = 5;
    while (i--) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newInsets = await SafeArea.getSafeAreaInsets();

      if (newInsets.insets.top !== insets.top) {
        applySafeAreaVariables(newInsets);
        break;
      }
    }
  });
}

async function bootstrap() {
  console.log('Bootstrap capacitor app');

  await StatusBar.setStyle({ style: Style.Dark });

  if (Capacitor.getPlatform() === 'android') {
    await StatusBar.setOverlaysWebView({ overlay: true });
  }

  await initializeSafeArea();

  const canShare = await Share.canShare();

  // proxy share method
  // @ts-ignore
  navigator.share = canShare ? Share.share : undefined;
}

bootstrap();
