
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { Children, useEffect, useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import axios from 'axios';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Profile from './pages/Profile';

const API_URL = "http://localhost:4000"
// to get transaction from localStorage
const getTransactionsFromStorage = () => {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
}


// to protect the routes 
const ProtectedRoutes = ({ user, children }) => {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");
  const hasToken = localToken || sessionToken;

  if (!user || !hasToken) {
    return <Navigate to='/login' replace />
  }
  return children;
}

// to scroll to top when page gets reload or new page is visited
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);
  return null;

}



function App() {
  const [user, setUser] = useState(null);
  const [, setToken] = useState(null)
  const [transaction, setTransaction] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();

  // to save the token ins side the locla storage 
  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) localStorage.setItem("token", tokenStr);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) sessionStorage.setItem("token", tokenStr);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj || null);
      setToken(tokenStr || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };


  const clearAuth = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("token")

    }
    catch (err) {
      console.error("clearauth error : ", err)

    }
    setUser(null);
    setToken(null);
  };

  // to update user data both in state and storage 
  const updateUserData = (updateUser) => {
    setUser(updateUser);

    const localToken = localStorage.getItem("token")
    const sessionToken = sessionStorage.getItem("token")

    if (localToken) {
      localStorage.setItem('user', JSON.stringify(updateUser));
    }
    else if (sessionToken) {
      sessionStorage.setItem('user', JSON.stringify(updateUser));
    }

  };
  // try to load user with token when user mounted
  useEffect(() => {
    (async () => {
      try {
        const localUserRaw = localStorage.getItem('user');
        const sessionUserRaw = sessionStorage.getItem('user');

        const localToken = localStorage.getItem('token')
        const sessionToken = sessionStorage.getItem('token')

        const storedUser = localUserRaw ? JSON.parse(localUserRaw) :
          sessionUserRaw ? JSON.parse(sessionUserRaw) : null;

        const storedToken = localToken || sessionToken || null;
        const tokenFromLocal = !!localToken;


        if (storedUser) {
          setUser(storedUser);
          setToken(storedToken);
        }

        if (storedToken) {
          try {
            const res = await axios.get(`${API_URL}/api/user/me`, {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            const profile = res.data.user || res.data;
            persistAuth(profile, storedToken, tokenFromLocal);


          } catch (fetcherr) {
            console.warn("Could not fetch profile with the stored token : ", fetcherr);
            clearAuth();

          }
        }

      } catch (err) {
        console.error("error bootstrapping auth : ", err)
      } finally {
        setIsLoading(false);

        try {
          setTransaction(getTransactionsFromStorage());

        } catch (txErr) {
          console.error("Error loading transactions : ", txErr)


        }
      }
    })();
  }, []);

  useEffect(() => {
    try {

      localStorage.setItem("transactions", JSON.stringify(transaction))

    } catch (err) {
      console.error('error saving transactions : ', err)


    }
  }, [transaction])

  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember)
    navigate("/")

  }

  const handleSignup = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember)
    navigate("/")

  }

  const handleLogout = () => {
    clearAuth();
    navigate("/login");

  }


  // transaction helpers
  const addTransaction = (newTransaction) =>
    setTransaction((p) => [newTransaction, ...p]);
  const editTransaction = (id, updatedTransaction) =>
    setTransaction((p) =>
      p.map((t) => (t.id === id ? { ...updatedTransaction, id } : t)),
    );
  const deleteTransaction = (id) =>
    setTransaction((p) => p.filter((t) => t.id !== id));
  const refreshTransactions = () =>
    setTransaction(getTransactionsFromStorage());


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <>

      <ScrollToTop />
      {/* <Routes>

        <Route path='/login' element={<Login onLogin={handleLogin} />} />
        <Route path='/signup' element={<Signup onSignup={handleSignup}
          transaction={transaction}
          addTransaction={addTransaction}
          editTransaction={editTransaction}
          deleteTransaction={deleteTransaction}
          refreshTransactions={refreshTransactions}
        />} />


        <Route element={<ProtectedRoutes user={user}>
          <Layout user={user} onLogout={handleLogout} />
        </ProtectedRoutes>}>
          <Route path="/"
            element={<Dashboard />}
            transaction={transaction}
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}

          />
        </Route>
      
      <Route 
      path='/income'
      element={
        <Income
         transaction={transaction}
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}
            />
      }
      />

      
      </Routes> */}
      <Routes>
    {/* Public Routes */}
    <Route path='/login' element={<Login onLogin={handleLogin} />} />
    <Route path='/signup' element={<Signup onSignup={handleSignup} />} />

    {/* Protected Routes with Layout (Navbar + Sidebar) */}
    <Route element={
        <ProtectedRoutes user={user}>
            <Layout user={user} onLogout={handleLogout} />
        </ProtectedRoutes>
    }>
        <Route path="/" element={<Dashboard />} />
        
        {/* Income Route - Now inside Layout */}
        <Route 
            path="/income" 
            element={
                <Income 
                    transaction={transaction}
                    addTransaction={addTransaction}
                    editTransaction={editTransaction}
                    deleteTransaction={deleteTransaction}
                    refreshTransactions={refreshTransactions}
                />
            } 
        />
        <Route  path="/expense" 
            element={
                <Expense 
                    transaction={transaction}
                    addTransaction={addTransaction}
                    editTransaction={editTransaction}
                    deleteTransaction={deleteTransaction}
                    refreshTransactions={refreshTransactions}
                />
            } 
        />

        <Route path='/profile' element={<Profile  user={user}
        onUpdateProfile={updateUserData} onLogout={handleLogout}
        />}
        />

        {/* You can add more routes here later */}
        {/* <Route path="/expense" element={<Expense />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}

    </Route>



    {/* 404 Route */}
    <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace /> } />
    

</Routes>
    </>
  );
}

export default App;
