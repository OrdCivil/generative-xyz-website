import Accordion from '@components/Accordion';
import ButtonIcon from '@components/ButtonIcon';
import Heading from '@components/Heading';
import Stats from '@components/Stats';
import Text from '@components/Text';
import ThumbnailPreview from '@components/ThumbnailPreview';
import { GENERATIVE_PROJECT_CONTRACT } from '@constants/contract-address';
import { ROUTE_PATH } from '@constants/route-path';
import {
  GenerativeTokenDetailContext,
  GenerativeTokenDetailProvider,
} from '@contexts/generative-token-detail-context';
import { LogLevel } from '@enums/log-level';
import { getUserSelector } from '@redux/user/selector';
import { getTokenUri } from '@services/token-uri';
import { getChainName, getScanUrl } from '@utils/chain';
import { formatAddress, formatTokenId } from '@utils/format';
import log from '@utils/logger';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { v4 } from 'uuid';
import MoreItemsSection from './MoreItemsSection';
import ListingTokenModal from './ListingTokenModal';
import s from './styles.module.scss';
import { getMakeOffers } from '@services/marketplace';
import { Loading } from '@components/Loading';
import { TokenOffer } from '@interfaces/token';

const LOG_PREFIX = 'GenerativeTokenDetail';

const GenerativeTokenDetail: React.FC = (): React.ReactElement => {
  const router = useRouter();
  const [tokenOffers, setTokenOffers] = useState<Array<TokenOffer>>([]);
  const { tokenData, setTokenData, openListingModal, handlePurchaseToken } =
    useContext(GenerativeTokenDetailContext);
  const user = useSelector(getUserSelector);
  const { tokenID } = router.query as {
    projectID: string;
    tokenID: string;
  };
  const scanURL = getScanUrl();
  const mintedDate = dayjs(tokenData?.mintedTime).format('MMM DD, YYYY');
  const tokenInfos = [
    {
      id: 'contract-address',
      info: 'Contract Address',
      value: formatAddress(tokenData?.project.genNFTAddr || ''),
      link: `${scanURL}/token/${tokenData?.project.genNFTAddr}`,
    },
    {
      id: 'token-id',
      info: 'Token ID',
      value: formatTokenId(tokenID),
      link: `${scanURL}/token/${tokenData?.project.genNFTAddr}?a=${tokenID}`,
    },
    {
      id: 'token-standard',
      info: 'Token Standard',
      value: 'ERC-721',
      link: '',
    },
    {
      id: 'blockchain',
      info: 'Blockchain',
      value: getChainName() || '',
      link: '',
    },
  ];

  const checkOwnership = useCallback(
    (address: string) => {
      if (!address) return false;
      return address === user?.walletAddress;
    },
    [user.walletAddress]
  );

  const fetchTokenOffers = async () => {
    try {
      if (tokenData && tokenData.genNFTAddr && tokenID) {
        const { result } = await getMakeOffers({
          genNFTAddr: tokenData.genNFTAddr,
          tokenId: tokenID,
          closed: false,
        });
        if (result) {
          setTokenOffers(result);
        }
      }
    } catch (e) {
      log('can not fetch offers', LogLevel.Error, LOG_PREFIX);
    }
  };
  const handleOpenListingTokenModal = (): void => {
    openListingModal();
  };

  const featuresList = () => {
    if (tokenData?.attributes && tokenData.attributes?.length > 0) {
      return tokenData.attributes.map(attr => {
        return {
          id: `attr-${v4()}`,
          info: attr.trait_type,
          value: attr.value.toString(),
          link: '',
        };
      });
    }
    return null;
  };

  const tokenDescription =
    tokenData?.description || tokenData?.project?.desc || '';

  const fetchTokenData = async (): Promise<void> => {
    try {
      if (tokenID) {
        const res = await getTokenUri({
          contractAddress: GENERATIVE_PROJECT_CONTRACT,
          tokenID,
        });
        setTokenData(res);
      }
    } catch (err: unknown) {
      log('failed to fetch item detail', LogLevel.Error, LOG_PREFIX);
    }
  };

  const handleLinkProfile = () => {
    router.push(`${ROUTE_PATH.PROFILE}`);
  };

  const handleBuyToken = () => {
    handlePurchaseToken(tokenOffers[0]);
  };

  useEffect(() => {
    fetchTokenData();
  }, [tokenID]);

  useEffect(() => {
    fetchTokenOffers();
  }, [tokenData]);

  return (
    <>
      <Container>
        <div className={s.wrapper} style={{ marginBottom: '100px' }}>
          <div className={s.itemInfo}>
            <Loading isLoaded={!!tokenData} className={s.loading_token} />
            <Heading as="h4" fontWeight="bold">
              {tokenData?.project?.name} #
              {formatTokenId(tokenData?.tokenID || '')}
            </Heading>
            <div className={s.prices}>
              {/* TODO: Remove when API ready  */}
              {/* <div>
              <Text size="12" fontWeight="bold">
                Price
              </Text>
              <Heading as="h5" fontWeight="bold">
                0.01 ETH
              </Heading>
            </div>
            <div>
              <Text size="12" fontWeight="bold">
                highest offer
              </Text>
              <Heading as="h5" fontWeight="bold">
                0.2 ETH
              </Heading>
            </div> */}
              <div>
                <Text size="12" fontWeight="bold">
                  Royalty
                </Text>
                <Heading as="h4" fontWeight="bold">
                  {(tokenData?.project?.royalty || 0) / 100}%
                </Heading>
              </div>
            </div>
            <div className={s.CTA_btn}>
              {/* Due to owner and status of this token to render appropriate action */}
              <ButtonIcon
                disabled={!tokenData}
                onClick={handleOpenListingTokenModal}
              >
                List for sale
              </ButtonIcon>
              <ButtonIcon disabled={!tokenData} variants="outline">
                Transfer
              </ButtonIcon>
              <ButtonIcon
                disabled={!tokenOffers.length}
                onClick={handleBuyToken}
              >
                Buy
              </ButtonIcon>
              <ButtonIcon disabled={!tokenData} variants="outline">
                Make offer
              </ButtonIcon>
            </div>
            <div className={s.accordions}>
              {!!tokenDescription && (
                <Accordion
                  header={'DESCRIPTION'}
                  content={tokenDescription}
                ></Accordion>
              )}
              {tokenData?.attributes && tokenData.attributes?.length > 0 && (
                <Accordion
                  header={'Features'}
                  content={<Stats data={featuresList()} />}
                ></Accordion>
              )}
              {mintedDate && (
                <Accordion
                  header={'Minted on'}
                  content={
                    <Text size="18" fontWeight="semibold">
                      {mintedDate}
                    </Text>
                  }
                ></Accordion>
              )}
              <Accordion
                header={'Owner'}
                content={
                  <Text
                    size="18"
                    fontWeight="medium"
                    className={s.walletAddress}
                    onClick={handleLinkProfile}
                  >
                    {tokenData?.owner?.displayName ||
                      formatAddress(
                        tokenData?.ownerAddr ||
                          tokenData?.owner?.walletAddress ||
                          ''
                      )}
                    {checkOwnership(tokenData?.ownerAddr || '') && ' (by you)'}
                  </Text>
                }
              ></Accordion>
              <Accordion
                header={'Creator'}
                content={
                  <Text
                    size="18"
                    fontWeight="medium"
                    className={s.walletAddress}
                    onClick={handleLinkProfile}
                  >
                    {tokenData?.creator?.displayName ||
                      formatAddress(tokenData?.creator?.walletAddress || '')}
                    {checkOwnership(tokenData?.creator?.walletAddress || '') &&
                      ' (by you)'}
                  </Text>
                }
              ></Accordion>

              <Accordion
                header={'Token Info'}
                content={<Stats data={tokenInfos} />}
              ></Accordion>
            </div>
          </div>
          <div className="h-divider"></div>
          <div>
            <ThumbnailPreview data={tokenData} previewToken />
          </div>
        </div>
        <div className="h-divider"></div>
        <div></div>
        <div style={{ display: 'none' }}>
          {tokenOffers &&
            tokenOffers.length > 0 &&
            tokenOffers.map((item, i) => (
              <div key={`item_listing_token_${i}`}>
                {item.offeringID}, {item.token ? item.token.image : ''}
              </div>
            ))}
        </div>
        <div></div>
        {tokenData?.project.genNFTAddr && (
          <MoreItemsSection genNFTAddr={tokenData.project.genNFTAddr} />
        )}
      </Container>
      <ListingTokenModal />
    </>
  );
};

const GenerativeTokenDetailWrapper: React.FC = (): React.ReactElement => {
  return (
    <GenerativeTokenDetailProvider>
      <GenerativeTokenDetail />
    </GenerativeTokenDetailProvider>
  );
};

export default GenerativeTokenDetailWrapper;
