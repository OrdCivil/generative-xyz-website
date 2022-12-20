import React, { useContext, useEffect, useRef } from 'react';
import { TransactionReceipt } from 'web3-eth';
import { WalletContext } from '@contexts/wallet-context';
import useContractOperation from '@hooks/useContractOperation';
import { PARAM_CONTROL_CONTRACT } from '@constants/contract-address';
import MintGenerativeProjectOperation from '@services/contract-operations/generative-project/mint-generative-project';
import { IMintGenerativeProjectParams } from '@interfaces/contract-operations/mint-generative-project';
import { NETWORK_CHAIN_ID } from '@constants/config';
import GetParamControlOperation from '@services/contract-operations/parameter-control/get-parameter-control';
import { IGetParameterControlParams } from '@interfaces/contract-operations/get-parameter-control';
import { ParameterControlKey } from '@enums/parameter-key';

const Profile: React.FC = (): React.ReactElement => {
  const walletCtx = useContext(WalletContext);
  const mintFee = useRef(0);
  const { call } = useContractOperation<
    IMintGenerativeProjectParams,
    TransactionReceipt
  >(MintGenerativeProjectOperation);
  const {
    call: getParamControl,
    data: mintProjectFee,
    params,
  } = useContractOperation<IGetParameterControlParams, number>(
    GetParamControlOperation
  );

  const handleConnectWallet = async () => {
    await walletCtx.connect();
  };

  const handleTest = () => {
    if (!walletCtx.connectedAddress) {
      return;
    }

    call({
      chainID: NETWORK_CHAIN_ID,
      contractAddress: PARAM_CONTROL_CONTRACT,
      maxSupply: 100,
      limitSupply: 95,
      mintPrice: '0.002',
      name: 'Test',
      creatorName: 'dev team',
      creatorAddress: walletCtx.connectedAddress,
      description: 'ABCDE',
      thumbnail: 'ipfs://QmZha95v86iME98rpxrJWbHerK3JjEHKkiGpdS4NgZKjdb',
      thirdPartyScripts: ['p5js@1.5.0', 'tonejs@14.8.49'],
      scripts: [
        `<script type="text/javascript">const rand=mathRand();function T1(n){return n>.5}window.$generativeTraits={T1:T1(rand)},console.log(window.$generativeTraits);const container=document.createElement("div");container.innerHTML="<span>tokenId: "+tokenId+"</span><br><span>tokenMintNumber: "+tokenMintNumber+"</span><br><span>project: "+projectNumber+"</span><br><span>seed: "+seed+"</span><br>",document.body.prepend(container);</script>`,
      ],
      reservationList: [],
      mintFee: mintFee.current,
      fromWalletAddress: walletCtx.connectedAddress,
    });
  };

  useEffect(() => {
    if (walletCtx.walletManager) {
      getParamControl({
        key: ParameterControlKey.CREATE_PROJECT_FEE,
        chainID: NETWORK_CHAIN_ID,
        contractAddress: PARAM_CONTROL_CONTRACT,
      });
    }
  }, [walletCtx]);

  return (
    <section>
      <p>{mintProjectFee}</p>
      <p>{params?.key}</p>
      <button onClick={handleConnectWallet}>connect wallet</button>
      <button onClick={handleTest}>Test</button>
    </section>
  );
};

export default Profile;
