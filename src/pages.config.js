import BrickExchange from './pages/BrickExchange';
import CardExchange from './pages/CardExchange';
import CollectibleExchange from './pages/CollectibleExchange';
import DiecastExchange from './pages/DiecastExchange';
import Favorites from './pages/Favorites';
import FigureExchange from './pages/FigureExchange';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Messages from './pages/Messages';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BrickExchange": BrickExchange,
    "CardExchange": CardExchange,
    "CollectibleExchange": CollectibleExchange,
    "DiecastExchange": DiecastExchange,
    "Favorites": Favorites,
    "FigureExchange": FigureExchange,
    "Home": Home,
    "Landing": Landing,
    "Messages": Messages,
    "MyListings": MyListings,
    "Profile": Profile,
    "AdminDashboard": AdminDashboard,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};