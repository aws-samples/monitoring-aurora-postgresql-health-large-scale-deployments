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
		/>
	);
}

export default TopNavbar;
