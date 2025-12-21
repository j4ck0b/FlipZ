import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Home from './pages/Home';
import CardExchange from './pages/CardExchange';
import BrickExchange from './pages/BrickExchange';
import FigureExchange from './pages/FigureExchange';
import DiecastExchange from './pages/DiecastExchange';
import CollectibleExchange from './pages/CollectibleExchange';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Marketplace": Marketplace,
    "MyListings": MyListings,
    "Profile": Profile,
    "Landing": Landing,
    "Home": Home,
    "CardExchange": CardExchange,
    "BrickExchange": BrickExchange,
    "FigureExchange": FigureExchange,
    "DiecastExchange": DiecastExchange,
    "CollectibleExchange": CollectibleExchange,
}

export const pagesConfig = {
    mainPage: "Marketplace",
    Pages: PAGES,
    Layout: __Layout,
};