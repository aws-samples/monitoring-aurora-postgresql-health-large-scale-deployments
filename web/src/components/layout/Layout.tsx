import {
    AppLayout,
    Header,
    HelpPanel
} from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { queryClient } from '../../api/query-client';
import CloudWatcher from '../../pages/CloudWatcher';
import TopNavbar from '../topNavbar/TopNavbar';

const LOCALE = 'en';

const appLayoutLabels = {
    navigation: "Side navigation",
    navigationToggle: "Open side navigation",
    navigationClose: "Close side navigation",
    notifications: "Notifications",
    tools: "Help panel",
    toolsToggle: "Open help panel",
    toolsClose: "Close help panel",
};

export type helpPanelType = {
    header: string | JSX.Element
    text: string | JSX.Element
}


const Layout = () => {

    const [helpPanel, setHelpPanel] = useState<helpPanelType>();


    return (
        <I18nProvider locale={LOCALE} messages={[messages]}>
            <QueryClientProvider client={queryClient}>
            <TopNavbar />
            <AppLayout
                content={
                        <CloudWatcher setHelpPanel={setHelpPanel} />
                }
                    ariaLabels={appLayoutLabels}
                    navigationHide={true}
                    onToolsChange={() => setHelpPanel(undefined)}
                    toolsOpen={helpPanel ? true : false}
                    toolsHide={helpPanel ? false : true}
                    tools={<HelpPanel header={
                        <Header variant="h2">{helpPanel?.header}</Header>
                    }>{helpPanel?.text}</HelpPanel>}
                    toolsWidth={360}

            />
            </QueryClientProvider>
        </I18nProvider>
    );
}

export default Layout;
