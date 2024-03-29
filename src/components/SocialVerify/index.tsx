import React from 'react';
import { CDN_URL } from '@constants/config';
import s from './styles.module.scss';
import Text from '@components/Text';
import { IconVerified } from '@components/IconVerified';
import Image from 'next/image';

export const SocialVerify: React.FC<{
  link: string;
  isTwVerified: boolean;
}> = ({ link = '#', isTwVerified = false }) => {
  return (
    <div className={s.whiteList_icon}>
      {isTwVerified ? (
        <IconVerified />
      ) : (
        <>
          <Image
            width={34}
            height={34}
            src={`${CDN_URL}/icons/badge-question.svg`}
            alt={'badge-question'}
          />
          <div className={`whiteList_content ${s.whiteList_content} tooltip`}>
            <div className={`${s.whiteList_content_inner}`}>
              <div className={'tooltip-arrow'} />
              <div className={'tooltip-inner'}>
                <Text size="14" fontWeight="semibold" color="primary-333">
                  Want to get verified? Ping us at{' '}
                  <a href={link} target="_blank" rel="noreferrer">
                    @generative_xyz.
                  </a>
                </Text>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
