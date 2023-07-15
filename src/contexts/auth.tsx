import { IUser } from '@/types/api/User';
import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';

interface AuthContextProps {
  children: React.ReactNode;
}

interface IAuthContextData {
  isAuth: boolean;
  users: any;
}

export const AuthContext = createContext<IAuthContextData>(
  {} as IAuthContextData
);

let user: IUser;

export const AuthProvider: React.FC<AuthContextProps> = ({ children }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let auth = false;
    if (typeof window !== 'undefined') {
      const hasUser = Boolean(localStorage.getItem('user'));
      //@ts-ignore
      user = JSON.parse(localStorage.getItem('user'));

      if (!hasUser || !user) auth = false;
      else {
        auth = true;
      }
    }

    const isAuthRoute = router.pathname.indexOf('private') > -1;

    if (!auth && isAuthRoute) {
      router.push('signin');
    } else if (auth && !isAuthRoute) {
      router.push('private');
    }

    setIsAuth(auth);
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuth, users }}>
      {children}
    </AuthContext.Provider>
  );
};
