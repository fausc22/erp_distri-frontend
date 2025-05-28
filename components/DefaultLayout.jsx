import AppHeader from './AppHeader';
import AppFooter from './AppFooter';


const DefaultLayout = ({ children }) => {
	return (
		<>
			
			<AppHeader />
			<div>{children}</div>
			<AppFooter />
		</>
	);
};

export default DefaultLayout;
