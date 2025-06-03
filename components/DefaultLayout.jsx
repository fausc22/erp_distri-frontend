import AppHeader from './AppHeader';
import AppFooter from './AppFooter';


const DefaultLayout = ({ children }) => {
	return (
		<>
			
			<AppHeader />
			<div>{children}</div>
			
		</>
	);
};

export default DefaultLayout;
