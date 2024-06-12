import {
    AppLayout,
    ContentLayout,
    Header,
    Link
} from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import SideNavigation from '@cloudscape-design/components/side-navigation';
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

interface ILayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: ILayoutProps) => {
    return (
        <I18nProvider locale={LOCALE} messages={[messages]}>
            <TopNavbar />
            <AppLayout
                content={
                    <ContentLayout
                        header={
                            <Header variant="h1" info={<Link variant="info">Info</Link>}>
                                Aurora Cloud Watch Visualizer
                            </Header>
                        }
                    >
                        {children}
                        {/* <Container
                            header={
                                <Header variant="h2" description="Container description">
                                    Container header
                                </Header>
                            }
                        >
                        </Container> */}
                    </ContentLayout>
                }
                headerSelector="#h"
                navigation={
                    <SideNavigation items={[
                        { type: 'link', text: 'Dashboard', href: '/' }
                    ]} activeHref='#/' />
                }
                ariaLabels={appLayoutLabels}
                toolsHide
            />
        </I18nProvider>
    );
}

export default Layout;
