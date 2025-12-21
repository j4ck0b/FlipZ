import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Marketplace": Marketplace,
    "MyListings": MyListings,
    "Profile": Profile,
    "Landing": Landing,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Marketplace",
    Pages: PAGES,
    Layout: __Layout,
};