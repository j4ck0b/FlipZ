import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Marketplace": Marketplace,
    "MyListings": MyListings,
}

export const pagesConfig = {
    mainPage: "Marketplace",
    Pages: PAGES,
    Layout: __Layout,
};