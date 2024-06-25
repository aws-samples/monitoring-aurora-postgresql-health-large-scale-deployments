import TopNavigation from '@cloudscape-design/components/top-navigation';
import { APP_NAME } from '../../constant';
import logo from '../../logo/logo.svg';
const i18nStrings = {
	searchIconAriaLabel: 'Search',
	searchDismissIconAriaLabel: 'Close search',
	overflowMenuTriggerText: 'More',
	overflowMenuTitleText: 'All',
	overflowMenuBackIconAriaLabel: 'Back',
	overflowMenuDismissIconAriaLabel: 'Close menu',
};

const TopNavbar = () => {
	return (
		<TopNavigation
			i18nStrings={i18nStrings}
			identity={{
				href: '#',
				title: APP_NAME,
				logo: {
					src: logo,
					alt: APP_NAME,
				},
			}}
		/>
	);
}

export default TopNavbar;
