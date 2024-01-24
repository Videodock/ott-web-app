import { PropsWithChildren, createContext, useCallback, useContext, useState } from 'react';

import FormFeedback from '../../components/FormFeedback/FormFeedback';

export type AriaAnnouncerVariant = 'success' | 'error' | 'warning' | 'info';
type Announcement = { message: string; variant: AriaAnnouncerVariant };
type AnnounceFn = (message: string, variant: AriaAnnouncerVariant, duration?: number) => void;
type ContextValue = { announce: AnnounceFn };

const AriaAnnouncerContext = createContext<ContextValue | undefined>(undefined);

export const useAriaAnnouncer = () => {
  const announcer = useContext(AriaAnnouncerContext);

  if (!announcer) throw new Error('Announcer context is not defined');

  return announcer.announce;
};

export const AriaAnnouncerProvider = ({ children }: PropsWithChildren) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  const announce = useCallback((message: string, variant: AriaAnnouncerVariant, duration = 1000) => {
    setAnnouncement({ message, variant });

    setTimeout(() => {
      setAnnouncement(null);
    }, duration);
  }, []);

  return (
    <AriaAnnouncerContext.Provider value={{ announce }}>
      {announcement && (
        <FormFeedback variant={announcement.variant} visible={true}>
          {announcement.message}
        </FormFeedback>
      )}
      {children}
    </AriaAnnouncerContext.Provider>
  );
};
