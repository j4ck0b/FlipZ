import AdminDashboard from './pages/AdminDashboard';
import BrickExchange from './pages/BrickExchange';
import CardExchange from './pages/CardExchange';
import CollectibleExchange from './pages/CollectibleExchange';
import DiecastExchange from './pages/DiecastExchange';
import Favorites from './pages/Favorites';
import FigureExchange from './pages/FigureExchange';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import Login from './pages/Login';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Home": Home,
    "Landing": Landing,
    "Login": Login,
    "AdminDashboard": AdminDashboard,
    "BrickExchange": BrickExchange,
    "CardExchange": CardExchange,
    "CollectibleExchange": CollectibleExchange,
    "DiecastExchange": DiecastExchange,
    "Favorites": Favorites,
    "FigureExchange": FigureExchange,
    "Messages": Messages,
    "Profile": Profile,
    "Subscription": Subscription,
    "SubscriptionSuccess": SubscriptionSuccess,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};
