import { StatusBar, Style} from '@capacitor/status-bar';
import { Share} from '@capacitor/share';

async function bootstrap() {
  console.log('Bootstrap capacitor app');

  await StatusBar.setStyle({ style: Style.Dark });

  const canShare = await Share.canShare();

  // proxy share method
  // @ts-ignore
  navigator.share = canShare ? Share.share : undefined;
}


bootstrap();
