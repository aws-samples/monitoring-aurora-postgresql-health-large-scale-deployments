import TopNavigation from '@cloudscape-design/components/top-navigation';
import logo from '../../logo/awslogo.svg';


function TopNavbar() {
	return (
		<TopNavigation
			identity={{
				href: '#',
				title: 'Aurora Cloud Watch Visualizer',
				logo: {
					src: logo,
					alt: 'Service',
				},
			}}
			utilities={[
				{
					type: 'button',
					text: 'Link',
					href: 'https://example.com/',
					external: true,
					externalIconAriaLabel: ' (opens in a new tab)',
				},
				{
					type: 'button',
					iconName: 'notification',
					title: 'Notifications',
					ariaLabel: 'Notifications (unread)',
					badge: true,
					disableUtilityCollapse: false,
				},
				{
					type: "menu-dropdown",
					text: "Customer Name",
					description: "email@example.com",
					iconName: "user-profile",
					items: [
						{ id: "profile", text: "Profile" },
						{ id: "preferences", text: "Preferences" },
						{ id: "security", text: "Security" },
						{
							id: "support-group",
							text: "Support",
							items: [
								{
									id: "documentation",
									text: "Documentation",
									href: "#",
									external: true,
									externalIconAriaLabel:
										" (opens in new tab)"
								},
								{ id: "support", text: "Support" },
								{
									id: "feedback",
									text: "Feedback",
									href: "#",
									external: true,
									externalIconAriaLabel:
										" (opens in new tab)"
								}
							]
						},
						{ id: "signout", text: "Sign out" }
					]
				}
			]}
			i18nStrings={{
				searchIconAriaLabel: 'Search',
				searchDismissIconAriaLabel: 'Close search',
				overflowMenuTriggerText: 'More',
				overflowMenuTitleText: 'All',
				overflowMenuBackIconAriaLabel: 'Back',
				overflowMenuDismissIconAriaLabel: 'Close menu',
			}}
		/>
	);
}

export default TopNavbar;
