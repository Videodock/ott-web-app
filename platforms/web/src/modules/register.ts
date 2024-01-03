import '@jwp/ott-common/src/modules/register';
import { container } from '@jwp/ott-common/src/modules/container';
import StorageService from '@jwp/ott-common/src/services/StorageService';

import { LocalStorageService } from '#src/services/LocalStorageService';

container.bind(StorageService).to(LocalStorageService);
