import TopNavigation from '@cloudscape-design/components/top-navigation';
import { APP_NAME } from '../../constant';
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
				title: APP_NAME
			}}
		/>
	);
}

export default TopNavbar;
