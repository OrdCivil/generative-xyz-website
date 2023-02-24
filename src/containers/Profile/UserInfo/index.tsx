import ButtonIcon from '@components/ButtonIcon';
import Heading from '@components/Heading';
import SvgInset from '@components/SvgInset';
import Text from '@components/Text';
import { CDN_URL } from '@constants/config';
import { ROUTE_PATH } from '@constants/route-path';
import { ProfileContext } from '@contexts/profile-context';
import { useAppSelector } from '@redux';
import { getUserSelector } from '@redux/user/selector';
import { ellipsisCenter, formatAddress, formatWebDomain } from '@utils/format';
import copy from 'copy-to-clipboard';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useMemo } from 'react';
import s from './UserInfo.module.scss';
import { toast } from 'react-hot-toast';
import { SocialVerify } from '@components/SocialVerify';
import { SOCIALS } from '@constants/common';
import { DEFAULT_USER_AVATAR } from '@constants/common';
import { IconVerified } from '@components/IconVerified';

export const UserInfo = (): JSX.Element => {
  const user = useAppSelector(getUserSelector);
  const { currentUser } = useContext(ProfileContext);
  const router = useRouter();

  const isTwVerified = useMemo(() => {
    return currentUser?.profileSocial?.twitterVerified || false;
  }, [currentUser?.profileSocial]);

  return (
    <div className={s.userInfo}>
      <div className={s.userInfo_content}>
        <div className={s.userInfo_content_avatar}>
          <Image
            src={currentUser?.avatar ? currentUser.avatar : DEFAULT_USER_AVATAR}
            alt={currentUser?.displayName || ''}
            width={100}
            height={100}
          />
        </div>
        {
          <div className={s.userInfo_content_wrapper}>
            <div className={s.userInfo_content_wrapper_info}>
              <div className={s.userInfo_content_wrapper_info_inner}>
                <Heading
                  as={'h4'}
                  title={
                    currentUser?.displayName ||
                    formatAddress(currentUser?.walletAddress)
                  }
                  className={s.userInfo_content_wrapper_info_name}
                >
                  {currentUser?.displayName ||
                    formatAddress(currentUser?.walletAddress)}
                </Heading>
                {isTwVerified ? (
                  <IconVerified />
                ) : (
                  <SocialVerify link={SOCIALS.twitter} />
                )}
              </div>
            </div>

            <div className={s.creator_social}>
              {currentUser?.profileSocial?.twitter && (
                <div className={`${s.creator_social_item}`}>
                  <div className={s.creator_social_item_inner}>
                    <SvgInset
                      className={`${s.creator_social_twitter}`}
                      size={24}
                      svgUrl={`${CDN_URL}/icons/Twitter.svg`}
                    />
                    <Text size={'18'}>
                      <Link
                        href={currentUser?.profileSocial?.twitter || ''}
                        target="_blank"
                      >
                        @{currentUser?.profileSocial?.twitter.split('/').pop()}
                      </Link>
                    </Text>
                  </div>
                </div>
              )}
              {currentUser?.profileSocial?.web && (
                <>
                  <span className={s.creator_divider}></span>
                  <div className={`${s.creator_social_item}`}>
                    <div className={s.creator_social_item_inner}>
                      <SvgInset
                        className={`${s.creator_social_twitter}`}
                        size={24}
                        svgUrl={`${CDN_URL}/icons/link-copy.svg`}
                      />
                      <Text size={'18'}>
                        <Link
                          href={currentUser?.profileSocial?.web || ''}
                          target="_blank"
                        >
                          {formatWebDomain(
                            currentUser?.profileSocial?.web || ''
                          )}
                        </Link>
                      </Text>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={s.userInfo_content_address}>
              {currentUser?.walletAddressBtcTaproot && (
                <div
                  className={`${s.userInfo_content_btcWallet} ${s.userInfo_content_wallet}`}
                >
                  <SvgInset
                    size={20}
                    svgUrl={`${CDN_URL}/icons/Bitcoin%20(BTC).svg`}
                  />
                  <Text size={'18'} color={'black-06'} fontWeight={'semibold'}>
                    {ellipsisCenter({
                      str: currentUser?.walletAddressBtcTaproot || '',
                      limit: 10,
                    })}
                  </Text>
                  <SvgInset
                    onClick={() => {
                      copy(currentUser?.walletAddressBtcTaproot || '');
                      toast.remove();
                      toast.success('Copied');
                    }}
                    className={s.iconCopy}
                    size={20}
                    svgUrl={`${CDN_URL}/icons/ic-copy.svg`}
                  />
                </div>
              )}
              <div
                className={`${s.userInfo_content_evmWallet} ${s.userInfo_content_wallet}`}
              >
                <SvgInset
                  size={20}
                  svgUrl={`${CDN_URL}/icons/Ethereum%20(ETH).svg`}
                />
                <Text size={'18'} color={'black-06'} fontWeight={'semibold'}>
                  {ellipsisCenter({
                    str: currentUser?.walletAddress || '',
                    limit: 10,
                  })}
                </Text>
                <SvgInset
                  onClick={() => {
                    copy(currentUser?.walletAddress || '');
                    toast.remove();
                    toast.success('Copied');
                  }}
                  className={s.iconCopy}
                  size={20}
                  svgUrl={`${CDN_URL}/icons/ic-copy.svg`}
                />
              </div>
            </div>
            {currentUser?.id === user?.id && (
              <div className={s.editProfile}>
                <ButtonIcon
                  sizes="medium"
                  variants={'outline'}
                  onClick={() => router.push(ROUTE_PATH.EDIT_PROFILE)}
                >
                  <Text fontWeight="medium" as="span">
                    Edit Profile
                  </Text>
                </ButtonIcon>
              </div>
            )}

            {currentUser?.bio && (
              <Text size={'18'} fontWeight="regular" className={s.bio}>
                “{currentUser?.bio}”
              </Text>
            )}
          </div>
        }
      </div>
    </div>
  );
};
