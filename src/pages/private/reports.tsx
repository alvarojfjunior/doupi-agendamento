import { Box, Stack, Input, Flex, Text, Button } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/contexts/app';
import Page from '@/components/Page';
import { AxiosInstance } from 'axios';
import { getAxiosInstance } from '@/services/api';
import { withIronSessionSsr } from 'iron-session/next';
import moment from 'moment';
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export const getServerSideProps = withIronSessionSsr(
  async ({ req, res }) => {
    if (!('user' in req.session))
      return {
        redirect: {
          destination: '/signin',
          permanent: false,
        },
      };

    const user = req.session.user;
    return {
      props: {
        user: user,
      },
    };
  },
  {
    cookieName: 'doupi_cookie',
    //@ts-ignore
    password: process.env.SESSION_SECRET,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  }
);

let api: AxiosInstance;
export default function Clients({ user }: any) {
  const appContext = useContext(AppContext);
  const [dtBegin, setDtBegin] = useState(moment().format('YYYY-MM-DD'));
  const [dtEnd, setDtEnd] = useState(moment().format('YYYY-MM-DD'));
  const [cashierChartSet, setCashierChartSet] = useState<any>();
  const [schedulesChartSet, setSchedulesChartSet] = useState<any>();

  useEffect(() => {
    api = getAxiosInstance(user);
    handleSearch();
  }, []);

  const handleSearch = async () => {
    await getCashierData();
    await getScheduleData();
  };

  const getCashierData = async () => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.get(
        `/api/reports/cashiers?companyId=${user.companyId}&dtBegin=${dtBegin}&dtEnd=${dtEnd}`
      );

      const options = {
        chart: {
          width: '100%',
          height: 380,
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        title: {
          text: 'Caixa por dia',
          align: 'center',
        },
        xaxis: {
          categories: data.map((r: any) =>
            moment(r._id, 'YYYY-MM-DD').format('DD/MM/YYYY')
          ),
        },
      };

      const series = [
        {
          name: 'Total',
          data: data.map((r: any) => r.total),
        },
      ];

      setCashierChartSet({
        options,
        series,
      });

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);

      appContext.onCloseLoading();
    }
  };

  const getScheduleData = async () => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.get(
        `/api/reports/schedules?companyId=${user.companyId}&dtBegin=${dtBegin}&dtEnd=${dtEnd}`
      );

      const options = {
        chart: {
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        title: {
          text: 'Atendimentos por dia',
          align: 'center',
        },
        xaxis: {
          categories: data.map((r: any) => r._id),
        },
      };

      const series = [
        {
          name: 'Total',
          data: data.map((r: any) => r.total),
        },
      ];

      setSchedulesChartSet({
        options,
        series,
      });

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);

      appContext.onCloseLoading();
    }
  };

  return (
    <Page
      path='/reports'
      title='Doupi - Relatórios'
      description='App para genciamento e agendamentos'
    >
      <Stack m={5}>
        <Box
          w={400}
          border={'1px solid #ccc'}
          margin={'auto'}
          borderRadius={10}
          p={5}
          textAlign={'center'}
        >
          <Text fontWeight={'bold'} textAlign={'center'} mb={2}>
            Resultados no período de
          </Text>
          <Flex justifyContent={'center'} alignItems={'center'} gap={2}>
            <Input
              value={dtBegin}
              onChange={(e: any) => setDtBegin(e.target.value)}
              type='date'
            />
            <Text fontWeight={'semibold'} textAlign={'center'}>
              {' '}
              à{' '}
            </Text>
            <Input
              value={dtEnd}
              onChange={(e: any) => setDtEnd(e.target.value)}
              type='date'
            />
          </Flex>

          <Button mt={5} w={'100%'} onClick={handleSearch}>
            {' '}
            Consultar{' '}
          </Button>
        </Box>

        <Flex w={'full'} gap={10} wrap={'wrap'} justifyContent={'center'}>
          {cashierChartSet && (
            <ReactApexChart
              options={cashierChartSet.options}
              series={cashierChartSet.series}
              type='line'
              height={350}
            />
          )}
          {schedulesChartSet && (
            <ReactApexChart
              options={schedulesChartSet.options}
              series={schedulesChartSet.series}
              type='bar'
              height={350}
            />
          )}
        </Flex>
      </Stack>
    </Page>
  );
}
