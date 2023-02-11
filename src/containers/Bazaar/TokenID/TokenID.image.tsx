import React, { useState } from 'react';
import { LOGO_MARKETPLACE_URL } from '@constants/common';
import { convertIpfsToHttp } from '@utils/image';
import s from './TokenID.module.scss';
import Skeleton from '@components/Skeleton';

interface IProps {
  image: string;
  name: string;
}

const TokenIDImage = React.memo((props: IProps) => {
  const [thumb, setThumb] = useState<string>(
    props.image || LOGO_MARKETPLACE_URL
  );
  const onThumbError = () => {
    setThumb(LOGO_MARKETPLACE_URL);
  };
  return (
    <div className={s.img_inner}>
      <div className={s.img_wrapper}>
        <Skeleton fill isLoaded={!!props.name} />
        {thumb !== LOGO_MARKETPLACE_URL ? (
          <iframe
            sandbox="allow-scripts"
            scrolling="no"
            loading="lazy"
            src={'https://node1-staging.incognito.org/'}
          />
        ) : (
          <img
            onError={onThumbError}
            src={convertIpfsToHttp(thumb)}
            alt={props.name}
            loading={'lazy'}
          />
        )}
      </div>
    </div>
  );
});

TokenIDImage.displayName = 'TokenIDImage';

export default TokenIDImage;
