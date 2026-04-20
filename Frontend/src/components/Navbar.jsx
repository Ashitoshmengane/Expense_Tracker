// import React,{useRef, useState} from 'react'
// import { navbarStyles } from '../assets/dummyStyles'
// import img1 from '../assets/logo.png'
// import { ChevronDown } from 'lucide-react';
// import { useNavigate } from 'react-router-dom'


// const Navbar = ({user: propUser, onLogout}) => {

//     const navigate = useNavigate();

//     const menuRef = useRef()
//     const [menuOpen, setMenuOpen] = useState(false)

//         const  user = propUser || {
//             name : "",
//             email : ""
//         }

//         const toggleMenu = () => {
//             setMenuOpen((prev)=> !prev);
//         };
//   return (
//     <header className={navbarStyles.header}>
//         <div className={navbarStyles.container}>
//             {/* logo */}
//             <div onClick={()=> navigate("/") } className={navbarStyles.logoContainer}>
//                 <div className={navbarStyles.logoImage}>
//                     <img src={img1} alt="logo" />
//                 </div>
//                 <span className={navbarStyles.logoText}> Expense Tracker </span>
//             </div>
//             {/* if the user is present  */}
//            {user && (
//             <div className={navbarStyles.userContainer} ref={menuRef}>
//                 <button onClick={toggleMenu} className={navbarStyles.userButton}>

//                     <div className='relative'>
//                         <div className={navbarStyles.userAvatar}>
//                             {user?.name?.[0]?.toUpperCase() || "U"}
//                         </div>
//                         <div className={navbarStyles.statusIndicator}>
//                         </div>
//                         <div className={navbarStyles.userTextContainer}>
//                             <p className={navbarStyles.userName}>
//                                 {user?.name || "User"}
//                             </p>

//                             <p className={navbarStyles.userEmail}>
//                                 {user?.email || "user@expensetracker.com"}

//                             </p>

//                         </div>
//                     </div>
//                     <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
//                     {/* <ChevronDown className={`${navbarStyles.ChevronIcon} ${menuOpen ? 'rotate-180' : ''}`} /> */}
//                 </button>

//                 {/* drop down menu  */}

//                 {menuOpen && (
//                     <div className={navbarStyles.dropdownMenu}> 
//                     <div className={navbarStyles.dropdownHeader}>
//                         <div className='flex items-center gap-3'>
//                             <div className={navbarStyles.dropdownAvatar}>
//                                 {user?.name?.[0].toUpperCase() || 'U'}

//                             </div>
//                             <div className={navbarStyles.dropdownName}>
//                                 {user?.name || 'user'}
//                             </div>
//                             <div className={navbarStyles.dropdownEmail}>
//                                 {user?.email || 'user@expensetracker.com'}
//                             </div>

//                         </div>

//                     </div>
//                     <div className={navbarStyles.menuItemContainer}>
//                         <button onClick={()=>{
//                             setMenuOpen(false);
//                             navigate("/profile");

//                         }} className={navbarStyles.menuItem}>
//                                 <User className=' w-4 h-4' />
//                         </button>

//                     </div>

//                     </div>
//                 )}

//             </div>         
//             )}
//         </div>

//     </header>
//   )
// }

// export default Navbar


import React, { useEffect, useRef, useState } from 'react'
import { navbarStyles } from '../assets/dummyStyles'
import img1 from '../assets/logo.png'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BASE_URL = 'http://localhost:4000/api'

const Navbar = ({ user: propUser, onLogout }) => {

    const navigate = useNavigate();
    const menuRef = useRef()
    const [menuOpen, setMenuOpen] = useState(false)
    const [fetchedUser, setFetchedUser] = useState(null)

    const user = propUser || fetchedUser || {
        name: "",
        email: ""
    }

    // to fetch the user profile data 
    useEffect(()=>{
        const fetchUserData  = async () =>{
            try {
                const token = localStorage.getItem("token")
                if(!token) return;
                const response = await axios.get(`${BASE_URL}/user/me`, {
                    headers : {Authorization : `Bearer ${token}`},
                })

                const userData = response.data.user || response.data;
                setFetchedUser(userData)
            } catch (error) {
                console.error('Failed to load Profile : ',error)
                
            }
        };
        if(!propUser){
            fetchUserData();
        }
    },[propUser])

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleLogout = () =>{
        setMenuOpen(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        onLogout?.();
        navigate("/login")
    }

    // close the menu if click out side the box
    useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const handleProfileClick = () => {
        setMenuOpen(false);        // Close dropdown
        navigate("/profile");      // Go to profile page
    };

    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/* Logo */}
                <div 
                    onClick={() => navigate("/")} 
                    className={navbarStyles.logoContainer}
                >
                    <div className={navbarStyles.logoImage}>
                        <img src={img1} alt="logo" />
                    </div>
                    <span className={navbarStyles.logoText}> Expense Tracker </span>
                </div>

                {/* User Section */}
                {user && (
                    <div className={navbarStyles.userContainer} ref={menuRef}>
                        <button onClick={toggleMenu} className={navbarStyles.userButton}>

                            <div className='relative flex items-center gap-3'>
                                <div className={navbarStyles.userAvatar}>
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>

                                <div className={navbarStyles.userTextContainer}>
                                    <p className={navbarStyles.userName}>
                                        {user?.name || "User"}
                                    </p>
                                    <p className={navbarStyles.userEmail}>
                                        {user?.email || "user@expensetracker.com"}
                                    </p>
                                </div>

                                <ChevronDown 
                                    className={`${navbarStyles.ChevronIcon} ${menuOpen ? 'rotate-180' : ''}`} 
                                />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {menuOpen && (
                            <div className={navbarStyles.dropdownMenu}> 
                                <div className={navbarStyles.dropdownHeader}>
                                    <div className='flex items-center gap-3'>
                                        <div className={navbarStyles.dropdownAvatar}>
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className={navbarStyles.dropdownName}>
                                                {user?.name || 'User'}
                                            </div>
                                            <div className={navbarStyles.dropdownEmail}>
                                                {user?.email || 'user@expensetracker.com'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={navbarStyles.menuItemContainer}>
                                    <button 
                                        onClick={handleProfileClick}
                                        className={navbarStyles.menuItem}
                                    >
                                        <User className='w-4 h-4 mr-2' />
                                        Profile
                                    </button>
                                    </div>
                                    <div className={navbarStyles.menuItemBorder}>
                                        <button onClick={handleLogout} className={navbarStyles.logoutButton}>
                                            <LogOut className=' w-4 h-4'/>
                                            <span>Log Out</span>
                                        </button>


                                    </div>


                                    {/* You can add Logout button here later */}
                                    {onLogout && (
                                        <button 
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onLogout();
                                            }} 
                                            className={navbarStyles.menuItem}
                                        >
                                            Logout
                                        </button>
                                    )}
                            
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}

export default Navbar
