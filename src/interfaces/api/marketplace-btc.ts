import { IMAGE_TYPE } from '@components/NFTDisplayBox/constant';

export interface IGetMarketplaceBtcListParams {
  limit: number;
  offset: number;
  'buyable-only': boolean;
}
export interface IGetMarketplaceBtcListItem {
  inscriptionID: string;
  price: string;
  name: string;
  description: string;
  image: string;
  orderID: string;
  buyable: boolean;
  isCompleted: boolean;
  inscriptionNumber: string;
  contentType: IMAGE_TYPE;
  contentLength: string;
  paymentListingInfo?: {
    btc: {
      paymentAddress: string;
      price: string;
    };
    eth?: {
      paymentAddress: string;
      price: string;
    };
  };
}

export interface IPostMarketplaceBtcListNFTForms {
  receiveAddress: string;
  receiveOrdAddress: string;
  receiveETHAddress: string;
  inscriptionID: string;
  name: string;
  description: string;
  price: string;
}

export interface IPostMarketplaceBtcListNFTParams {
  ordWalletAddress: string;
  payType: { btc: string; eth?: string };
  inscriptionID: string;
  name: string;
  description: string;
  price: string;
}
export interface IPostMarketplaceBtcListNFTResponse {
  receiveAddress: string;
  timeoutAt: string;
}

export interface IGetMarketplaceBtcNFTDetail {
  inscriptionID: string;
  price: string;
  name: string;
  description: string;
  orderID: string;
  buyable: boolean;
  isCompleted: boolean;
  inscriptionNumber: string;
  contentType: IMAGE_TYPE;
  contentLength: string;
  paymentListingInfo: {
    btc: {
      paymentAddress: string;
      price: string;
    };
    eth?: {
      paymentAddress: string;
      price: string;
    };
  };
}

export interface ISubmitBTCAddressResponse {
  receiveAddress: string;
  timeoutAt: string;
  price?: string;
}

export interface ISubmitBTCAddressPayload {
  walletAddress: string;
  inscriptionID: string;
  orderID: string;
  payType: string;
}

export interface IListingFeePayload {
  inscriptionID: string;
}

export interface IListingFee {
  serviceFee: number;
  royaltyFee: number;
}

export interface IListingordinals {
  inscriptions: string[];
  prev: number;
  next: number;
  data: IGetMarketplaceBtcListItem[];
}

export interface IInscriptionDetailResp {
  content_type: IMAGE_TYPE;
  inscription_id: string;
  number: number;
}

export interface ICollectionFloorPricePayload {
  projectID: string;
}

export interface ICollectionFloorPriceResp {
  floor_price: number;
}
