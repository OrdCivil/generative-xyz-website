import { NextPage } from 'next';
import MarketplaceLayout from '@layouts/Marketplace';
import { CDN_URL } from '@constants/config';
import ProposalList from '@containers/DAO/ProposalList';

const MarketplacePage: NextPage = () => {
  return (
    <MarketplaceLayout>
      <ProposalList />
    </MarketplaceLayout>
  );
};

export default MarketplacePage;

export async function getServerSideProps() {
  return {
    props: {
      seoInfo: {
        title: 'Generative | DAO',
        description: 'Generative | DAO',
        image: `${CDN_URL}/images/collect.jpg`,
      },
    },
  };
}
