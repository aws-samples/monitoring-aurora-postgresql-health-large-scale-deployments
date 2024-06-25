import {
    AppLayout,
    SplitPanel
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


const Layout = () => {

    const [splitPanelOpen, setSplitPanelOpen] = useState<string>();


    return (
        <I18nProvider locale={LOCALE} messages={[messages]}>
            <QueryClientProvider client={queryClient}>
            <TopNavbar />
            <AppLayout
                content={
                    <CloudWatcher setSidePanel={setSplitPanelOpen} />
                }
                headerSelector="#h"
                ariaLabels={appLayoutLabels}
                splitPanelPreferences={{ position: 'side' }}
                splitPanelOpen={splitPanelOpen ? true : false}
                onSplitPanelToggle={() => setSplitPanelOpen(undefined)}
                splitPanelSize={360}
                toolsHide={true}
                navigationHide={true}
                splitPanel={
                    <SplitPanel header="Info" closeBehavior="hide" hidePreferencesButton={true}>
                        <>{splitPanelOpen}</>
                    </SplitPanel>
                }

            />
            </QueryClientProvider>
        </I18nProvider>
    );
}

export default Layout;
