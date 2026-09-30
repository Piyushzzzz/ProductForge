import React from 'react';
import { AuthCard } from '../components/AuthCard.js';

export const LoginPage: React.FC = () => {
  return <AuthCard initialMode="login" />;
};

export default LoginPage;
