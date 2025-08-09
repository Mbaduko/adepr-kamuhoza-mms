import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { state } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  return null;
};

export default Index;
