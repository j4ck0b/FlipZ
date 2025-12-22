import BrickExchange from './pages/BrickExchange';
import CardExchange from './pages/CardExchange';
import CollectibleExchange from './pages/CollectibleExchange';
import DiecastExchange from './pages/DiecastExchange';
import FigureExchange from './pages/FigureExchange';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BrickExchange": BrickExchange,
    "CardExchange": CardExchange,
    "CollectibleExchange": CollectibleExchange,
    "DiecastExchange": DiecastExchange,
    "FigureExchange": FigureExchange,
    "Home": Home,
    "Landing": Landing,
    "Marketplace": Marketplace,
    "MyListings": MyListings,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Marketplace",
    Pages: PAGES,
    Layout: __Layout,
};