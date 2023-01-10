import { NETWORK_CHAIN_ID } from '@constants/config';
import {
  GENERATIVE_MARKETPLACE_CONTRACT,
  GENERATIVE_PROJECT_CONTRACT,
  WETH_ADDRESS,
} from '@constants/contract-address';
import { ListingStep } from '@enums/listing-generative';
import { LogLevel } from '@enums/log-level';
import useContractOperation from '@hooks/useContractOperation';
import { MarketplaceStats } from '@interfaces/marketplace';
import { Token, TokenOffer } from '@interfaces/token';
import { getUserSelector } from '@redux/user/selector';
import IncreaseAllowanceOperation from '@services/contract-operations/erc20/increase-allowance';
import ListingToSaleTokenOperation from '@services/contract-operations/generative-marketplace/list-to-sale-token';
import MakeTokenOfferOperation from '@services/contract-operations/generative-marketplace/make-token-offer';
import PurchaseTokenOperation from '@services/contract-operations/generative-marketplace/purchase-token';
import IsApprrovedForAllOperation from '@services/contract-operations/generative-nft/is-approved-for-all';
import SetApprrovalForAllOperation from '@services/contract-operations/generative-nft/set-approval-for-all';
import { getMakeOffers, getMarketplaceStats } from '@services/marketplace';
import { getTokenUri } from '@services/token-uri';
import log from '@utils/logger';
import { useRouter } from 'next/router';
import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const LOG_PREFIX = 'GenerativeTokenDetailContext';

export interface IGenerativeTokenDetailContext {
  tokenData: Token | null;
  setTokenData: Dispatch<SetStateAction<Token | null>>;
  showListingModal: boolean;
  openListingModal: () => void;
  hideListingModal: () => void;
  handleListingToken: (_: string) => Promise<void>;
  marketplaceStats: MarketplaceStats | null;
  setMarketplaceStats: Dispatch<SetStateAction<MarketplaceStats | null>>;
  errorMessage: string | null;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  listingStep: ListingStep;
  setListingStep: Dispatch<SetStateAction<ListingStep>>;
  listingPrice: number;
  setListingPrice: Dispatch<SetStateAction<number>>;
  txHash: string | null;
  setTxHash: Dispatch<SetStateAction<string | null>>;
  handlePurchaseToken: (_: TokenOffer) => Promise<void>;
  tokenID: string;
  tokenOffers: Array<TokenOffer>;
  isTokenOwner: boolean;
  isTokenListing: boolean;
  showMakeOfferModal: boolean;
  openMakeOfferModal: () => void;
  hideMakeOffergModal: () => void;
  handleMakeTokenOffer: (_p: string, _d: number) => Promise<void>;
}

const initialValue: IGenerativeTokenDetailContext = {
  tokenData: null,
  setTokenData: _ => {
    return;
  },
  showListingModal: false,
  openListingModal: () => {
    return;
  },
  hideListingModal: () => {
    return;
  },
  handleListingToken: _ => new Promise(r => r()),
  listingStep: ListingStep.InputInfo,
  setListingStep: _ => {
    return;
  },
  marketplaceStats: null,
  setMarketplaceStats: () => {
    return;
  },
  listingPrice: 0,
  setListingPrice: _ => {
    return;
  },
  errorMessage: null,
  setErrorMessage: _ => {
    return;
  },
  txHash: null,
  setTxHash: _ => {
    return;
  },
  handlePurchaseToken: _ => new Promise(r => r()),
  tokenID: '',
  tokenOffers: [],
  isTokenOwner: false,
  isTokenListing: false,
  showMakeOfferModal: false,
  openMakeOfferModal: () => {
    return;
  },
  hideMakeOffergModal: () => {
    return;
  },
  handleMakeTokenOffer: (_p: string, _d: number) => new Promise(r => r()),
};

export const GenerativeTokenDetailContext =
  createContext<IGenerativeTokenDetailContext>(initialValue);

export const GenerativeTokenDetailProvider: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren): React.ReactElement => {
  const [tokenData, setTokenData] = useState<Token | null>(null);
  const [tokenOffers, setTokenOffers] = useState<Array<TokenOffer>>([]);
  const [showListingModal, setShowListingModal] = useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [listingStep, setListingStep] = useState(ListingStep.InputInfo);
  const [listingPrice, setListingPrice] = useState(0);
  const [marketplaceStats, setMarketplaceStats] =
    useState<MarketplaceStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [txHash, setTxHash] = useState<string | null>(null);
  const user = useSelector(getUserSelector);
  const { call: listToken } = useContractOperation(
    ListingToSaleTokenOperation,
    true
  );
  const { call: checkTokenIsApproved } = useContractOperation(
    IsApprrovedForAllOperation,
    false
  );
  const { call: setApprovalForAll } = useContractOperation(
    SetApprrovalForAllOperation,
    true
  );
  const { call: purchaseToken } = useContractOperation(
    PurchaseTokenOperation,
    true
  );
  const { call: makeTokenOffer } = useContractOperation(
    MakeTokenOfferOperation,
    true
  );
  const { call: increaseAllowance } = useContractOperation(
    IncreaseAllowanceOperation,
    true
  );
  const router = useRouter();
  const { tokenID } = router.query as {
    tokenID: string;
  };

  const openListingModal = () => {
    setShowListingModal(true);
    document.body.style.overflow = 'hidden';
  };

  const hideListingModal = () => {
    // Reset state
    setShowListingModal(false);
    setListingStep(ListingStep.InputInfo);
    setTxHash(null);
    setListingPrice(0);

    // Recover scroll behavior
    document.body.style.overflow = 'auto';
  };

  const openMakeOfferModal = () => {
    setShowMakeOfferModal(true);
    document.body.style.overflow = 'hidden';
  };

  const hideMakeOffergModal = () => {
    // Reset state
    setShowMakeOfferModal(false);
    setTxHash(null);

    // Recover scroll behavior
    document.body.style.overflow = 'auto';
  };

  const handleListingToken = async (price: string): Promise<void> => {
    setErrorMessage(null);

    if (!tokenData) {
      return;
    }

    // Check if token's already been approved
    const isTokenApproved = await checkTokenIsApproved({
      marketplaceAddress: GENERATIVE_MARKETPLACE_CONTRACT,
      chainID: NETWORK_CHAIN_ID,
      collectionAddress: tokenData.genNFTAddr,
    });
    if (isTokenApproved === null) {
      setErrorMessage('Transaction rejected.');
      log('listing token transaction error.', LogLevel.Error, LOG_PREFIX);
      return;
    }
    if (!isTokenApproved) {
      const status = await setApprovalForAll({
        marketplaceAddress: GENERATIVE_MARKETPLACE_CONTRACT,
        chainID: NETWORK_CHAIN_ID,
        collectionAddress: tokenData.genNFTAddr,
      });
      if (!status) {
        setErrorMessage('Transaction rejected.');
        log('listing token transaction error.', LogLevel.Error, LOG_PREFIX);
        return;
      }
    }

    const tx = await listToken({
      collectionAddress: tokenData.genNFTAddr,
      tokenID: tokenData.tokenID,
      durationTime: 0,
      price: price,
      chainID: NETWORK_CHAIN_ID,
    });

    if (!tx) {
      setErrorMessage('Oops. Something went wrong. Please try again later.');
      log('listing token transaction error.', LogLevel.Error, LOG_PREFIX);
      return;
    } else {
      setListingStep(ListingStep.Success);
      setTxHash(tx.transactionHash);
    }
  };

  const handlePurchaseToken = async (offer: TokenOffer): Promise<void> => {
    if (!offer.offeringID || !offer.price) {
      return;
    }

    const tx = await purchaseToken({
      offerId: offer.offeringID,
      price: offer.price,
      chainID: NETWORK_CHAIN_ID,
    });
    if (!tx) {
      toast.error('Oops. Something went wrong. Please try again later.');
      log('purchase token transaction error.', LogLevel.Error, LOG_PREFIX);
    } else {
      toast.success('You has bought this art successfully');
    }
  };

  const handleMakeTokenOffer = async (price: string, durationTime: number) => {
    if (!tokenData) {
      return;
    }

    await increaseAllowance({
      contractAddress: WETH_ADDRESS,
      chainID: NETWORK_CHAIN_ID,
      consumerAddress: GENERATIVE_MARKETPLACE_CONTRACT,
      amount: price,
    });

    const tx = await makeTokenOffer({
      collectionAddress: tokenData.genNFTAddr,
      tokenID: tokenData.tokenID,
      durationTime: durationTime,
      price: price,
      erc20Token: WETH_ADDRESS,
      chainID: NETWORK_CHAIN_ID,
    });

    if (!tx) {
      log('Make token offer transaction error.', LogLevel.Error, LOG_PREFIX);
      throw Error('Oops. Something went wrong. Please try again');
    }
  };

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

  const handleFetchMarketplaceStats = async () => {
    try {
      if (tokenData && tokenData?.genNFTAddr) {
        const res = await getMarketplaceStats({
          collectionAddr: tokenData?.genNFTAddr,
        });
        if (res) setMarketplaceStats(res?.stats);
      }
    } catch (e) {
      log('can not fetch price', LogLevel.Error, '');
    }
  };

  const isTokenOwner = useMemo(() => {
    if (!user.walletAddress || !tokenData?.ownerAddr) return false;
    return user.walletAddress === tokenData?.ownerAddr;
  }, [tokenData, user]);

  const isTokenListing = useMemo(() => {
    if (!user.walletAddress || !tokenOffers.length) return false;
    return tokenOffers.some(
      (offer: TokenOffer) => offer.seller === user.walletAddress
    );
  }, [user, tokenOffers]);

  useEffect(() => {
    fetchTokenData();
  }, [tokenID]);

  useEffect(() => {
    fetchTokenOffers();
    handleFetchMarketplaceStats();
  }, [tokenData]);

  const contextValues = useMemo((): IGenerativeTokenDetailContext => {
    return {
      tokenData,
      setTokenData,
      showListingModal,
      handleListingToken,
      marketplaceStats,
      setMarketplaceStats,
      listingStep,
      setListingStep,
      listingPrice,
      setListingPrice,
      openListingModal,
      hideListingModal,
      errorMessage,
      setErrorMessage,
      txHash,
      setTxHash,
      handlePurchaseToken,
      tokenID,
      tokenOffers,
      isTokenOwner,
      isTokenListing,
      showMakeOfferModal,
      openMakeOfferModal,
      hideMakeOffergModal,
      handleMakeTokenOffer,
    };
  }, [
    tokenData,
    setTokenData,
    showListingModal,
    handleListingToken,
    marketplaceStats,
    setMarketplaceStats,
    listingStep,
    setListingStep,
    listingPrice,
    setListingPrice,
    openListingModal,
    hideListingModal,
    errorMessage,
    setErrorMessage,
    txHash,
    setTxHash,
    handlePurchaseToken,
    tokenID,
    tokenOffers,
    isTokenOwner,
    isTokenListing,
    showMakeOfferModal,
    openMakeOfferModal,
    hideMakeOffergModal,
    handleMakeTokenOffer,
  ]);

  return (
    <GenerativeTokenDetailContext.Provider value={contextValues}>
      {children}
    </GenerativeTokenDetailContext.Provider>
  );
};
