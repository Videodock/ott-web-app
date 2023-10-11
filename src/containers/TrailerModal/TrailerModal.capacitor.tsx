import React from 'react';

import type { PlaylistItem } from '#types/playlist';
import Player from '#components/Player/Player';
import { useSettingsStore } from '#src/stores/SettingsStore';

type Props = {
  item?: PlaylistItem | null;
  title: string;
  open: boolean;
  onClose: () => void;
};

const TrailerModal: React.FC<Props> = ({ item, open, onClose }) => {
  const { playerId, playerLicenseKey } = useSettingsStore((s) => s);

  if (!item || !open) return null;

  return <Player item={item} playerId={playerId} playerLicenseKey={playerLicenseKey} onComplete={onClose} onClose={onClose} autostart />;
};

export default TrailerModal;
