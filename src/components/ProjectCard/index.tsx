import { useEffect, useMemo, useState } from 'react';

import s from './ProjectCard.module.scss';
import Heading from '@components/Heading';
import Link from '@components/Link';
import ProgressBar from '@components/ProgressBar';
import Text from '@components/Text';
import { LOGO_MARKETPLACE_URL } from '@constants/common';
import { ROUTE_PATH } from '@constants/route-path';
import useWindowSize from '@hooks/useWindowSize';
import { Project } from '@interfaces/project';
import { User } from '@interfaces/user';
import {
  formatAddress,
  formatBTCPrice,
  formatLongAddress,
} from '@utils/format';
import { convertIpfsToHttp } from '@utils/image';
import cs from 'classnames';

interface IPros {
  project: Project;
  className?: string;
}

export const ProjectCard = ({ project, className }: IPros): JSX.Element => {
  const [creator, setCreator] = useState<User | null>(null);
  const { mobileScreen } = useWindowSize();
  const [thumb, setThumb] = useState<string>(project.image);

  const onThumbError = () => {
    setThumb(LOGO_MARKETPLACE_URL);
  };

  useEffect(() => {
    if (project.creatorProfile) {
      setCreator(project.creatorProfile);
    }
  }, [project]);

  const creatorMemo = useMemo((): User | null => {
    return creator;
  }, [creator]);

  const isLimitMinted = useMemo((): boolean => {
    if (!project) return false;
    return project?.mintingInfo?.index < project?.maxSupply;
  }, [project]);

  return (
    <Link
      href={`${ROUTE_PATH.GENERATIVE}/${project.tokenID}`}
      className={`${s.projectCard} ${className}`}
    >
      <div className={s.projectCard_inner}>
        <div
          className={`${s.projectCard_thumb} ${
            thumb === LOGO_MARKETPLACE_URL ? s.isDefault : ''
          }`}
        >
          <div className={s.projectCard_thumb_inner}>
            <img
              onError={onThumbError}
              src={convertIpfsToHttp(thumb)}
              alt={project.name}
              loading={'lazy'}
            />
          </div>
        </div>
        <div className={s.projectCard_inner_info}>
          {mobileScreen ? (
            <div className={cs(s.projectCard_info, s.mobile)}>
              {creator && (
                <Text size="11" fontWeight="medium">
                  {creator.displayName || formatAddress(creator.walletAddress)}
                </Text>
              )}
              <div className={s.projectCard_info_title}>
                <Text size="14" fontWeight="semibold">
                  {project.name}
                </Text>
              </div>

              <ProgressBar
                size={'small'}
                current={
                  project.mintingInfo.index + project.mintingInfo.indexReserve
                }
                total={project.maxSupply || project.limit}
              />
            </div>
          ) : (
            <div className={cs(s.projectCard_info, s.desktop)}>
              {creator && (
                <div className={s.projectCard_creator}>
                  <Text size={'20'} fontWeight="medium">
                    {creatorMemo?.displayName ||
                      formatLongAddress(creatorMemo?.walletAddress)}
                  </Text>
                </div>
              )}
              <div className={s.projectCard_info_title}>
                <Heading as={'h6'} fontWeight="medium" color="black-40">
                  <span title={project.name}>{project.name}</span>
                </Heading>
              </div>
              <div className={s.projectCard_info_price}>
                {isLimitMinted && (
                  <>
                    <div className={s.projectCard_info_price_price}>
                      <Text size={'16'} fontWeight="medium" color="black-40">
                        {Number(project.mintPrice)
                          ? `${formatBTCPrice(Number(project.mintPrice))} BTC`
                          : 'Free'}
                      </Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
