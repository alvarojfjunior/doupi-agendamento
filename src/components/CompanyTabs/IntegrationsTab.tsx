import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import WhatsappTab from './WhatsappTab';
import StripeTab from './StripeTab';

interface IntegrationsTabProps {
  formik: any;
  isWhatsappApiConnected: boolean | undefined;
  whatsappQrCode: string | undefined;
  handleTestWhatsappConnection: () => Promise<void>;
  handleReconnectWhatsappConnection: () => Promise<void>;
}

const IntegrationsTab = ({
  formik,
  isWhatsappApiConnected,
  whatsappQrCode,
  handleTestWhatsappConnection,
  handleReconnectWhatsappConnection,
}: IntegrationsTabProps) => {
  return (
    <Tabs>
      <TabList>
        <Tab>Whatsapp</Tab>
        <Tab>Stripe</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <WhatsappTab
            formik={formik}
            isWhatsappApiConnected={isWhatsappApiConnected}
            whatsappQrCode={whatsappQrCode}
            handleTestWhatsappConnection={handleTestWhatsappConnection}
            handleReconnectWhatsappConnection={handleReconnectWhatsappConnection}
          />
        </TabPanel>
        <TabPanel>
          <StripeTab formik={formik} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default IntegrationsTab;