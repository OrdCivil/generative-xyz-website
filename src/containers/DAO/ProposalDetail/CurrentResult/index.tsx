import s from './styles.module.scss';
import Button from '@components/ButtonIcon';
import {
  CDN_URL,
  NETWORK_CHAIN_ID,
  SECONDS_PER_BLOCK,
} from '@constants/config';
import { GEN_TOKEN_ADDRESS } from '@constants/contract-address';
import { EXTERNAL_LINK } from '@constants/external-link';
import { WalletContext } from '@contexts/wallet-context';
import { LogLevel } from '@enums/log-level';
import useContractOperation from '@hooks/useContractOperation';
import { Proposal, Vote } from '@interfaces/dao';
import { getUserSelector } from '@redux/user/selector';
import GetTokenBalanceOperation from '@services/contract-operations/erc20/get-token-balance';
import ExecuteProposalOperation from '@services/contract-operations/gen-dao/execute-proposal';
import CastVoteProposalOperation from '@services/contract-operations/gen-dao/cast-vote-proposal';
import log from '@utils/logger';
import { useRouter } from 'next/router';
import React, { useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import useAsyncEffect from 'use-async-effect';
import SvgInset from '@components/SvgInset';
import { ProposalState, VoteType } from '@enums/dao';
import cs from 'classnames';
import { toast } from 'react-hot-toast';
import CastVoteModal from '../CastVoteModal';
import { ErrorMessage } from '@enums/error-message';
import VoteProgress from '@components/VoteProgress';
import dayjs from 'dayjs';
import Web3 from 'web3';

const LOG_PREFIX = 'CurrentResult';

interface IProps {
  proposal: Proposal | null;
  votes: Array<Vote>;
  updateProposal: () => Promise<void>;
}

const CurrentResult: React.FC<IProps> = (props: IProps): React.ReactElement => {
  const { proposal, votes, updateProposal } = props;
  const router = useRouter();
  const { connect } = useContext(WalletContext);
  const user = useSelector(getUserSelector);
  const [showCastVoteModal, setShowCastVoteModal] = useState(false);
  const [support, setSupport] = useState(VoteType.FOR);
  const [genBalance, setGenBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { call: getTokenBalance } = useContractOperation(
    GetTokenBalanceOperation,
    false
  );
  const { call: castVote } = useContractOperation(
    CastVoteProposalOperation,
    true
  );
  const { call: executeProposal } = useContractOperation(
    ExecuteProposalOperation,
    true
  );

  const handleCastVote = async (): Promise<void> => {
    if (!proposal) {
      toast.error('Proposal not found.');
      return;
    }

    try {
      setIsVoting(true);
      const tx = await castVote({
        chainID: NETWORK_CHAIN_ID,
        proposalId: proposal.proposalID,
        support,
      });
      if (tx) {
        toast.success('Your vote has been recorded.');
        setShowCastVoteModal(false);
        updateProposal();
      } else {
        toast.error(ErrorMessage.DEFAULT);
      }
    } catch (err: unknown) {
      log(err as Error, LogLevel.ERROR, LOG_PREFIX);
      toast.error(ErrorMessage.DEFAULT);
    } finally {
      setIsVoting(false);
    }
  };

  const handleExecuteProposal = async (): Promise<void> => {
    if (!proposal) {
      toast.error('Proposal not found.');
      return;
    }

    try {
      setIsExecuting(true);
      const tx = await executeProposal({
        chainID: NETWORK_CHAIN_ID,
        proposalId: proposal.proposalID,
      });
      if (tx) {
        toast.success('Proposal has been executed.');
      } else {
        toast.error(ErrorMessage.DEFAULT);
      }
    } catch (err: unknown) {
      log(err as Error, LogLevel.ERROR, LOG_PREFIX);
      toast.error(ErrorMessage.DEFAULT);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCloseVoteModal = (): void => {
    setShowCastVoteModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleOpenVoteModal = (): void => {
    setShowCastVoteModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleConnectWallet = async (): Promise<void> => {
    try {
      setIsConnecting(true);
      await connect();
    } catch (err: unknown) {
      log(err as Error, LogLevel.DEBUG, LOG_PREFIX);
    } finally {
      setIsConnecting(false);
    }
  };

  const navigateToDocsPage = (): void => {
    router.push(EXTERNAL_LINK.PROOF_OF_ART_DOCS);
  };

  const handleChooseSupport = (vote: VoteType): void => {
    setSupport(vote);
  };

  useAsyncEffect(async () => {
    const balance = await getTokenBalance({
      chainID: NETWORK_CHAIN_ID,
      erc20TokenAddress: GEN_TOKEN_ADDRESS,
    });
    if (balance !== null) {
      setGenBalance(
        parseFloat(Web3.utils.fromWei(balance.toString(), 'ether'))
      );
    }
  }, [user]);

  const proposalTime = useMemo((): string | null => {
    if (!proposal) {
      return null;
    }

    const { currentBlock, startBlock, endBlock } = proposal;

    if (proposal.state === ProposalState.Pending) {
      const seconds = (startBlock - currentBlock) * SECONDS_PER_BLOCK;
      const startAt = dayjs(proposal.createdAt).add(seconds, 'seconds');
      return `Start voting period at ${startAt.format('MMM DD YYYY HH:mm')}`;
    } else if (proposal.state === ProposalState.Active) {
      const seconds = (endBlock - currentBlock) * SECONDS_PER_BLOCK;
      const endAt = dayjs(proposal.createdAt).add(seconds, 'seconds');
      return `End voting period at ${endAt.format('MMM DD, YYYY HH:mm')}`;
    } else {
      return 'Voting period ended';
    }
  }, [proposal]);

  const currentUserVote = useMemo((): Vote | undefined => {
    if (!user) return undefined;
    return votes.find((vote: Vote) => vote.voter === user.walletAddress);
  }, [votes, user]);

  if (!proposal) {
    return <></>;
  }

  return (
    <div className={s.currentResult}>
      <h2 className={s.sectionTitle}>Current results</h2>

      {!user && proposal.state === ProposalState.Pending && (
        <>
          {proposalTime && <p className={s.startDate}>{proposalTime}</p>}
          <Button
            disabled={isConnecting}
            onClick={handleConnectWallet}
            className={s.connectBtn}
          >
            {isConnecting ? 'Connecting...' : 'Connect wallet to vote'}
          </Button>
        </>
      )}

      <div className={s.currentVotingResultWrapper}>
        {proposal.state > ProposalState.Pending && (
          <div className={s.votingProgressWrapper}>
            <VoteProgress stats={proposal?.vote} />
          </div>
        )}
        {proposalTime && <p className={s.startDate}>{proposalTime}</p>}
        {user && (
          <>
            {currentUserVote && (
              <p className={s.voteInfo}>
                <span>You voted:</span>
                <span
                  className={cs(s.voteType, {
                    [`${s.voteType__yes}`]: support === VoteType.FOR,
                    [`${s.voteType__no}`]: support === VoteType.AGAINST,
                  })}
                >
                  {VoteType[currentUserVote.support]}
                </span>
              </p>
            )}
            {genBalance > 0 &&
              proposal.state === ProposalState.Active &&
              !currentUserVote && (
                <>
                  <div className={s.choiceList}>
                    <div
                      onClick={() => handleChooseSupport(VoteType.FOR)}
                      className={cs(s.choiceItem, {
                        [`${s.choiceItem__active}`]: support === VoteType.FOR,
                      })}
                    >
                      Yes
                      <span className={s.checkmark}></span>
                    </div>
                    <div
                      onClick={() => handleChooseSupport(VoteType.AGAINST)}
                      className={cs(s.choiceItem, {
                        [`${s.choiceItem__active}`]:
                          support === VoteType.AGAINST,
                      })}
                    >
                      No
                      <span className={s.checkmark}></span>
                    </div>
                  </div>
                  <Button
                    onClick={handleOpenVoteModal}
                    className={s.connectBtn}
                  >
                    Cast your vote
                  </Button>
                </>
              )}
            {genBalance === 0 && !currentUserVote && (
              <>
                <Button onClick={navigateToDocsPage} className={s.connectBtn}>
                  Earn GEN
                </Button>
                <div className={s.insufficientBalanceWrapper}>
                  <SvgInset
                    size={18}
                    svgUrl={`${CDN_URL}/icons/ic-wallet-24x24.svg`}
                  />
                  <span>Not enough GEN to vote</span>
                </div>
              </>
            )}
            {proposal.state === ProposalState.Succeeded && (
              <Button
                disabled={isExecuting}
                onClick={handleExecuteProposal}
                className={s.connectBtn}
              >
                {isExecuting ? 'Executing...' : 'Execute this proposal'}
              </Button>
            )}
          </>
        )}
      </div>

      <CastVoteModal
        support={support}
        genBalance={genBalance}
        isShow={showCastVoteModal}
        isVoting={isVoting}
        handleClose={handleCloseVoteModal}
        handleVote={handleCastVote}
      />
    </div>
  );
};

export default CurrentResult;
