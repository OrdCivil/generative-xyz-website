import { NextPage } from 'next';
import MarketplaceLayout from '@layouts/Marketplace';
import { CDN_URL } from '@constants/config';
import CreateProposal from '@containers/DAO/CreateProposal';

const DAOCreateProposalPage: NextPage = () => {
  return (
    <MarketplaceLayout>
      <CreateProposal />
    </MarketplaceLayout>
  );
};

export default DAOCreateProposalPage;

export async function getServerSideProps() {
  return {
    props: {
      seoInfo: {
        title: 'Generative | Create Proposal',
        description: 'Generative | Create Proposal',
        image: `${CDN_URL}/images/collect.jpg`,
      },
    },
  };
}
