import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Marketplace": Marketplace,
    "MyListings": MyListings,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Marketplace",
    Pages: PAGES,
    Layout: __Layout,
};