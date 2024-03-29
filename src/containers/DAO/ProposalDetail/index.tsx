import Skeleton from '@components/Skeleton';
import React, { useEffect, useState } from 'react';
import s from './styles.module.scss';
import MarkdownPreview from '@components/MarkdownPreview';
import { Proposal, Vote } from '@interfaces/dao';
import { useRouter } from 'next/router';
import { getProposalByOnChainID, getVoteList } from '@services/dao';
import { ROUTE_PATH } from '@constants/route-path';
import CurrentResultSkeleton from './CurrentResultSkeleton';
import CurrentResult from './CurrentResult';
import dayjs from 'dayjs';
import { formatLongAddress } from '@utils/format';
import DiscordShare from '@components/DiscordShare';
import LinkShare from '@components/LinkShare';
import TwitterShare from '@components/TwitterShare';
import Link from 'next/link';
import SvgInset from '@components/SvgInset';
import { CDN_URL } from '@constants/config';
import { ProposalState } from '@enums/dao';
import cs from 'classnames';

const ProposalDetail: React.FC = (): React.ReactElement => {
  const router = useRouter();
  const { proposalID } = router.query;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [votes, setVotes] = useState<Array<Vote>>([]);

  const fetchProposal = async (): Promise<void> => {
    try {
      const res = await getProposalByOnChainID(proposalID as string);
      setProposal(res);
    } catch (err: unknown) {
      router.push(ROUTE_PATH.DAO);
    }
  };

  const fetchVotes = async (): Promise<void> => {
    try {
      const { result } = await getVoteList({
        proposalID: proposalID as string,
      });
      setVotes(result);
    } catch (err: unknown) {
      router.push(ROUTE_PATH.DAO);
    }
  };

  const fetchData = async (): Promise<void> => {
    await fetchProposal();
    await fetchVotes();
  };

  useEffect(() => {
    if (!router.isReady) return;

    fetchData();
    const intervalID = setInterval(fetchData, 60000);

    return () => {
      clearInterval(intervalID);
    };
  }, [router]);

  return (
    <div className={s.proposalPreview}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <Link className={s.backLink} href={ROUTE_PATH.DAO}>
              <SvgInset
                className={s.arrowIcon}
                size={18}
                svgUrl={`${CDN_URL}/icons/ic-arrow-left-18x18.svg`}
              />
              All proposals
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-8">
            <div className={s.proposalInfoWrapper}>
              {proposal?.title ? (
                <>
                  <h1 className={s.title}>
                    <span>{proposal?.title}</span>
                    <span
                      className={cs(s.state, {
                        [`${s.active}`]:
                          proposal.state === ProposalState.Active,
                        [`${s.pending}`]:
                          proposal.state === ProposalState.Pending,
                      })}
                    >
                      {ProposalState[proposal?.state]}
                    </span>
                  </h1>
                </>
              ) : (
                <div className={s.titleSkeleton}>
                  <Skeleton fill />
                </div>
              )}
              {proposal?.description ? (
                <div className={s.description}>
                  <p className={s.descriptionLabel}>Description</p>
                  <MarkdownPreview source={proposal?.description} />
                </div>
              ) : (
                <>
                  <div className={s.descriptionLabelSkeleton}>
                    <Skeleton fill />
                  </div>
                  <div className={s.descriptionSkeleton}>
                    <Skeleton fill />
                  </div>
                </>
              )}
              <div className={s.proposerInfoWrapper}>
                {proposal?.proposer ? (
                  <p
                    className={s.proposerInfo}
                  >{`Proposer : ${formatLongAddress(proposal.proposer)}`}</p>
                ) : (
                  <div className={s.proposerInfoSkeleton}>
                    <Skeleton fill />
                  </div>
                )}
                {proposal?.proposer ? (
                  <p className={s.proposerInfo}>{`Proposed on: ${dayjs(
                    proposal.createdAt
                  ).format('MMM DD, YYYY')}`}</p>
                ) : (
                  <div className={s.proposerInfoSkeleton}>
                    <Skeleton fill />
                  </div>
                )}
              </div>
              {proposal ? (
                <div className={s.socialWrapper}>
                  <LinkShare url={location.href} />
                  <DiscordShare />
                  <TwitterShare
                    url={location.href}
                    title={proposal.title}
                    hashtags={['generative.xyz', 'DAO']}
                  />
                </div>
              ) : (
                <div className={s.socialSkeleton}>
                  <Skeleton fill />
                </div>
              )}
            </div>
          </div>
          <div className="col-xl-3 offset-xl-1">
            {!proposal && <CurrentResultSkeleton />}
            {proposal && (
              <CurrentResult
                updateProposal={fetchData}
                votes={votes}
                proposal={proposal}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
