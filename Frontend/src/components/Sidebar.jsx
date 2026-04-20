import React, { useRef, useState, useEffect } from 'react'
import { sidebarStyles, cn } from '../assets/dummyStyles'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { ArrowDown, ArrowUp, HelpCircle, Home, LogOut, User } from 'lucide-react';
import { ArrowDown, ArrowUp, HelpCircle, Home, LogOut, User, Menu, X } from 'lucide-react';

const MENU_ITEMS = [
    { text: "Dashboard", path: "/", icon: <Home size={20} /> },
    { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
    { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
    { text: "Profile", path: "/profile", icon: <User size={20} /> },
];



const Sidebar = ({ user, onLogout, isCollapsed, setIsCollapsed }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const [mobileOpen, setMobileOpen] = useState(false)
    const [activeHover, setActiveHover] = useState(null)

    const { name: username = "User", email = "user@example.com" } = user || {};
    const initial = username.charAt(0).toUpperCase();

    // to check for overflow in mobile 
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "auto";
        return () => { document.body.style.overflow = "auto" };
    }, [mobileOpen]);

    // click outside close 
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileOpen]);


    // to logout 
    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        onLogout?.();
        navigate("/login");
    }

    const toggleSidebar = () => setIsCollapsed((c) => !c);

    // a small component
    const renderMenuItem = ({ text, path, icon }) => {
        const isActive = pathname === path;
        return (
            <Motion.li key={text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                    to={path}
                    className={cn(
                        sidebarStyles.menuItem.base,
                        isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
                        isCollapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded
                    )}
                    onMouseEnter={() => setActiveHover(text)}
                    onMouseLeave={() => setActiveHover(null)}
                >
                    <span className={isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
                        {icon}
                    </span>
                    {!isCollapsed && (
                        <Motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            {text}
                        </Motion.span>
                    )}
                    {activeHover === text && !isActive && !isCollapsed && (
                        <span className={sidebarStyles.activeIndicator}></span>
                    )}
                </Link>
            </Motion.li>
        );
    };


    return (
        <>
            <Motion.div ref={sidebarRef} className={sidebarStyles.sidebarContainer.base}
                initial={{ x: -100, opacity: 0 }}
                animate={{
                    x: 0,
                    opacity: 1,
                    width: isCollapsed ? 80 : 256
                }} transition={{ type: "spring", demping: 25 }}
            >
                <div className={sidebarStyles.sidebarInner.base}>
                    <button onClick={toggleSidebar} className={sidebarStyles.toggleButton.base}>
                        <Motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isCollapsed ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points={isCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}></polyline>
                            </svg>
                        </Motion.div>

                    </button>
                    <div className={cn(
                        sidebarStyles.userProfileContainer.base,
                        isCollapsed
                            ? sidebarStyles.userProfileContainer.collapsed
                            : sidebarStyles.userProfileContainer.expanded,
                    )}>
                        <div className='flex items-center'>

                            <div className={sidebarStyles.userInitials.base}> {initial}</div>
                            {!isCollapsed && (
                                <Motion.div
                                    className="ml-3 overflow-hidden"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <h2 className='text-sm font-bold text-gray-800 truncate'>
                                        {username}
                                    </h2>
                                    <p className='text-xs text-gray-500 truncate'>
                                        {email}
                                    </p>

                                </Motion.div>
                            )}
                        </div>

                    </div>
                    <div className='flex-1 overflow-y-auto py-4 custom-scrollbar'>
                        <ul className={sidebarStyles.menuList.base}>
                            {MENU_ITEMS.map(renderMenuItem)}

                        </ul>
                    </div>
                    <div className={cn(
                        sidebarStyles.footerContainer.base,
                        isCollapsed
                            ? sidebarStyles.footerContainer.collapsed
                            : sidebarStyles.footerContainer.expanded,
                    )}>
                        <Link className={cn(
                            sidebarStyles.footerLink.base,
                            isCollapsed && sidebarStyles.footerLink.collapsed
                        )} to="https://www.hexagondigitalservices.com/contact">
                            <HelpCircle size={20} className='text-gray-500' />
                            {!isCollapsed && <span>Support</span>}
                        </Link>

                        <button onClick={handleLogout} className={cn(
                            sidebarStyles.logoutButton.base,
                            isCollapsed && sidebarStyles.logoutButton.collapsed
                        )}>
                            <LogOut size={20} className='text-gray-500' />
                            {!isCollapsed && <span>Logout</span>}

                        </button>

                    </div>

                </div>

            </Motion.div>

            <Motion.button
                onClick={() => setMobileOpen((prev) => !prev)}
                className={sidebarStyles.mobileMenuButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </Motion.button>



            {/* <AnimatePresence>
                {mobileOpen && (

                    <Motion.div
                        className={sidebarStyles.mobileOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Motion.div
                            className={sidebarStyles.mobileBackdrop}
                            onClick={() => setMobileOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <Motion.div
                            ref={sidebarRef}
                            className={sidebarStyles.mobileSidebar.base}
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <div className='relative h-full flex flex-col'>
                    <div className={sidebarStyles.mobileUserContainer}>

                    <div className={sidebarStyles.userInitials.base}>
                        {initial}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            {username}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {email}
                        </p>
                    </div>
                    </div>
                    <button onClick={()=>setMobileOpen(false)}
                        
                        className={sidebarStyles.mobileCloseButton}>
                            <X size={24} className="text-gray-600"/>


                    </button>

                </div>

                
                          
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence> */}

                        <AnimatePresence>
                {mobileOpen && (
                    <Motion.div
                        className={sidebarStyles.mobileOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Motion.div 
                            className={sidebarStyles.mobileBackdrop}
                            onClick={() => setMobileOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <Motion.div
                            ref={sidebarRef}
                            className={sidebarStyles.mobileSidebar.base}
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Header with Close Button on Top */}
                            <div className="relative px-4 pt-4 pb-2 border-b border-gray-100">
                                <button 
                                    onClick={() => setMobileOpen(false)}
                                    className="absolute top-4 right-4 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-50"
                                >
                                    <X size={28} />
                                </button>

                                {/* User Info - Below Close Button */}
                                <div className={sidebarStyles.mobileUserContainer} style={{ marginTop: '30px' }}>
                                    <div className={sidebarStyles.userInitials.base}>
                                        {initial}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">
                                            {username}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                                <ul className={sidebarStyles.menuList.base}>
                                    {MENU_ITEMS.map(renderMenuItem)}
                                </ul>
                            </div>

                            {/* Footer */}
                            <div className={cn(
                                sidebarStyles.footerContainer.base,
                                isCollapsed ? sidebarStyles.footerContainer.collapsed : sidebarStyles.footerContainer.expanded,
                            )}>
                                <Link className={cn(
                                    sidebarStyles.footerLink.base,
                                    isCollapsed && sidebarStyles.footerLink.collapsed
                                )} to="https://www.hexagondigitalservices.com/contact">
                                    <HelpCircle size={20} className='text-gray-500'/>
                                    {!isCollapsed && <span>Support</span>}
                                </Link>

                                <button onClick={handleLogout} className={cn(
                                    sidebarStyles.logoutButton.base,
                                    isCollapsed && sidebarStyles.logoutButton.collapsed
                                )}>
                                    <LogOut size={20} className='text-gray-500'/>
                                    {!isCollapsed && <span>Logout</span>}
                                </button>
                              
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Sidebar
