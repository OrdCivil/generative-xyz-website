import Text from '@components/Text';
import { Proposal } from '@interfaces/dao';
import s from './styles.module.scss';
import VoteProgress from '@components/VoteProgress';
import cs from 'classnames';

type TProposalItem = {
  data: Proposal;
};

const ProposalItem = ({ data }: TProposalItem) => {
  return (
    <div className={s.wrapper}>
      <Text size="18" className={cs(s.desc, 'line-clamp-3')}>
        {data?.description ||
          'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iusto itaque repellendus, distinctio ipsa beatae deserunt nam. Odio eaque minus facilis vitae inventore? Odit illo rerum quam nulla accusamus praesentium. Maiores.'}
      </Text>
      <VoteProgress stats={data.vote} />
    </div>
  );
};

export default ProposalItem;
