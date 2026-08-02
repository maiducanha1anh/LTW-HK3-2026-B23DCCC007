import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchCurrentUser, setInitialized } from './features/auth/authSlice';
import AppRoutes from './routes/AppRoutes';
import Loading from './components/common/Loading';

function AppContent() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(setInitialized(true));
    }
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <Loading />
      </div>
    );
  }

  return <AppRoutes />;
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
