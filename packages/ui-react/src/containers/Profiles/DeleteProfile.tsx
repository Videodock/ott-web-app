import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { removeQueryParam } from '@jwp/ott-common/src/utils/location';
import useQueryParam from '@jwp/ott-hooks-react/src/useQueryParam';
import { useDeleteProfile } from '@jwp/ott-hooks-react/src/useProfiles';

import Button from '../../components/Button/Button';
import Dialog from '../../components/Dialog/Dialog';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

import styles from './Profiles.module.scss';

const DeleteProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const { t } = useTranslation('user');

  const viewParam = useQueryParam('action');
  const [view, setView] = useState(viewParam);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const closeHandler = () => {
    navigate(removeQueryParam(location, 'action'));
  };

  const deleteProfile = useDeleteProfile({
    onMutate: () => {
      closeHandler();
    },
    onError: () => {
      setIsDeleting(false);
    },
  });

  const deleteHandler = async () => id && deleteProfile.mutate({ id });

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  if (!id) {
    return <Navigate to="/u/profiles" />;
  }

  if (view !== 'delete-profile') return null;
  return (
    <div>
      <Dialog open={!!viewParam} onClose={closeHandler} role="dialog" aria-labbeledby="delete-profile-heading">
        {isDeleting && <LoadingOverlay />}
        <div className={styles.deleteModal}>
          <div>
            <h2 id="delete-profile-heading">{t('profile.delete')}</h2>
            <p>{t('profile.delete_confirmation')}</p>
          </div>
          <div className={styles.deleteButtons}>
            <Button label={t('account.delete')} color="delete" variant="contained" onClick={deleteHandler} />
            <Button label={t('account.cancel')} variant="outlined" onClick={closeHandler} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteProfile;
