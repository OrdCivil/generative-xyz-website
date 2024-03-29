import NotFound from '@components/NotFound';
import SvgInset from '@components/SvgInset';
import Table from '@components/Table';
import { CDN_URL } from '@constants/config';
import { GenerativeTokenDetailContext } from '@contexts/generative-token-detail-context';
import { useContext } from 'react';
import s from './styles.module.scss';
import dayjs from 'dayjs';
import { formatAddress } from '@utils/format';
import { convertToETH } from '@utils/currency';
import { getScanUrl } from '@utils/chain';
import { Stack } from 'react-bootstrap';
import Link from 'next/link';

const TABLE_ACTIVITIES_HEADING = ['Event', 'Price', 'From', 'To', 'Date'];

const TableActivities = () => {
  const { tokenActivities } = useContext(GenerativeTokenDetailContext);
  const scanURL = getScanUrl();

  if (!tokenActivities?.items) return <NotFound infoText="No activity yet" />;

  const activityDatas = tokenActivities?.items[0]?.nft_transactions?.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (transaction: any, index, transactionList) => {
      const updatedAt = dayjs(transaction?.block_signed_at).format(
        'MMM DD, YYYY'
      );

      const logEvent = transaction.log_events.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (evt: any) => evt.decoded?.name === 'Transfer'
      )[0];

      const fromAddress = logEvent.decoded?.params[0].value;
      const toAddress = logEvent.decoded?.params[1].value;

      if (index + 1 === transactionList.length) {
        // Last transaction is first "Mint"
        return {
          id: transaction.tx_hash,
          render: {
            event: (
              <div className={s.event}>
                <SvgInset svgUrl={`${CDN_URL}/icons/ic-stars.svg`} />
                Mint
              </div>
            ),
            price:
              transaction.value === '0' ? '-' : convertToETH(transaction.value),
            form_address: formatAddress(fromAddress),
            to_address: formatAddress(toAddress),
            updated_at: (
              <Stack direction="horizontal" gap={3}>
                {updatedAt}
                <Link
                  href={`${scanURL}/tx/${transaction.tx_hash}`}
                  target="_blank"
                >
                  <SvgInset svgUrl={`${CDN_URL}/icons/ic-link.svg`} />
                </Link>
              </Stack>
            ),
          },
        };
      }
      return {
        id: transaction.tx_hash,
        render: {
          event: (
            <div className={s.event}>
              <SvgInset
                svgUrl={`${CDN_URL}/icons/ic-arrow-switch-vertical-24x24.svg`}
              />
              Transfer
            </div>
          ),
          price:
            transaction.value === '0' ? '-' : convertToETH(transaction.value),
          form_address: formatAddress(fromAddress),
          to_address: formatAddress(toAddress),
          updated_at: (
            <Stack direction="horizontal" gap={3}>
              {updatedAt}
              <Link
                href={`${scanURL}/tx/${transaction.tx_hash}`}
                target="_blank"
              >
                <SvgInset svgUrl={`${CDN_URL}/icons/ic-link.svg`} />
              </Link>
            </Stack>
          ),
        },
      };
    }
  );

  return (
    <Table tableHead={TABLE_ACTIVITIES_HEADING} data={activityDatas}></Table>
  );
};

export default TableActivities;
