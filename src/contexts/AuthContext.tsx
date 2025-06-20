
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'customer' | 'developer' | 'manager' | 'owner' | 'root';
  createdAt: string;
  banned?: boolean;
  discordId?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, discordId: string) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (userId: string, newRole: string) => void;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  adminChangePassword: (userId: string, newPassword: string) => void;
  adminChangeUserInfo: (userId: string, username: string, email: string) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  getAllUsers: () => any[];
  logAction: (action: string, performedBy: string) => void;
  getActionLogs: () => any[];
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const defaultOwners = [
  { username: 'Emanuele', password: 'raccu123' },
  { username: 'Salisphere', password: 'toto123' }
];

const rootAccount = {
  username: 'root',
  password: 'ninniannavincenzoalessia29102009'
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('botforge_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Initialize default accounts if not exists
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    if (users.length === 0) {
      const initialUsers = [
        // Root account
        {
          id: 'root-0',
          username: rootAccount.username,
          email: 'root@botforge.com',
          password: rootAccount.password,
          role: 'root' as const,
          createdAt: new Date().toISOString(),
          discordId: 'root_discord_id'
        },
        // Default owners
        ...defaultOwners.map((owner, index) => ({
          id: `owner-${index + 1}`,
          username: owner.username,
          email: `${owner.username.toLowerCase()}@botforge.com`,
          password: owner.password,
          role: 'owner' as const,
          createdAt: new Date().toISOString(),
          discordId: `${owner.username.toLowerCase()}_discord_id`
        }))
      ];
      localStorage.setItem('botforge_users', JSON.stringify(initialUsers));
    } else {
      // Add root account if it doesn't exist
      const rootExists = users.find((u: any) => u.username === 'root');
      if (!rootExists) {
        users.unshift({
          id: 'root-0',
          username: rootAccount.username,
          email: 'root@botforge.com',
          password: rootAccount.password,
          role: 'root' as const,
          createdAt: new Date().toISOString(),
          discordId: 'root_discord_id'
        });
        localStorage.setItem('botforge_users', JSON.stringify(users));
      }
    }

    // Initialize action logs if not exists
    const logs = localStorage.getItem('botforge_action_logs');
    if (!logs) {
      localStorage.setItem('botforge_action_logs', JSON.stringify([]));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const foundUser = users.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser && !foundUser.banned) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('email', foundUser.email)
        .single();
      
      if (dbUser) {
        foundUser.avatar_url = dbUser.avatar_url;
      }

      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('botforge_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string, discordId: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    
    if (users.find((u: any) => u.username === username || u.email === email)) {
      return false;
    }

    // Discord ID is now required
    if (!discordId || discordId.trim() === '') {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
      discordId: discordId.trim()
    };

    users.push(newUser);
    localStorage.setItem('botforge_users', JSON.stringify(users));
    
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setUser(userWithoutPassword);
    localStorage.setItem('botforge_user', JSON.stringify(userWithoutPassword));
    
    logAction(`New user registered: ${username}`, 'System');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('botforge_user');
  };


  const updateUserRole = (userId: string, newRole: string) => {
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      // Prevent changing root role or owners changing each other
      if (users[userIndex].role === 'root') return;
      if (user?.role === 'owner' && users[userIndex].role === 'owner' && users[userIndex].id !== user.id) return;
      
      const oldRole = users[userIndex].role;
      users[userIndex].role = newRole;
      localStorage.setItem('botforge_users', JSON.stringify(users));
      
      logAction(`Role changed for ${users[userIndex].username}: ${oldRole} → ${newRole}`, user?.username || 'Unknown');
      
      if (user && user.id === userId) {
        const updatedUser = { ...user, role: newRole as any };
        setUser(updatedUser);
        localStorage.setItem('botforge_user', JSON.stringify(updatedUser));
      }
    }
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('email', user.email);

    if (error) {
      console.error('Error updating avatar url:', error);
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);

    if (userIndex !== -1) {
      users[userIndex].avatar_url = avatarUrl;
      localStorage.setItem('botforge_users', JSON.stringify(users));

      const updatedUser = { ...user, avatar_url: avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('botforge_user', JSON.stringify(updatedUser));
      
      logAction(`Avatar updated for ${user.username}`, user.username);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1 && users[userIndex].password === currentPassword) {
      // Root password cannot be changed
      if (users[userIndex].role === 'root') return false;
      
      users[userIndex].password = newPassword;
      localStorage.setItem('botforge_users', JSON.stringify(users));
      logAction(`Password changed for ${user.username}`, user.username);
      return true;
    }
    return false;
  };

  const adminChangePassword = (userId: string, newPassword: string) => {
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      // Root password cannot be changed
      if (users[userIndex].role === 'root') return;
      
      users[userIndex].password = newPassword;
      localStorage.setItem('botforge_users', JSON.stringify(users));
      logAction(`Password reset for ${users[userIndex].username}`, user?.username || 'Admin');
    }
  };

  const adminChangeUserInfo = (userId: string, username: string, email: string) => {
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      // Root info cannot be changed
      if (users[userIndex].role === 'root') return;
      
      const oldUsername = users[userIndex].username;
      users[userIndex].username = username;
      users[userIndex].email = email;
      localStorage.setItem('botforge_users', JSON.stringify(users));
      
      logAction(`User info changed for ${oldUsername} → ${username}`, user?.username || 'Admin');
      
      if (user && user.id === userId) {
        const updatedUser = { ...user, username, email };
        setUser(updatedUser);
        localStorage.setItem('botforge_user', JSON.stringify(updatedUser));
      }
    }
  };

  const banUser = (userId: string) => {
    if (user?.role !== 'root') return;
    
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1 && users[userIndex].role !== 'root') {
      users[userIndex].banned = true;
      localStorage.setItem('botforge_users', JSON.stringify(users));
      logAction(`User banned: ${users[userIndex].username}`, user.username);
    }
  };

  const unbanUser = (userId: string) => {
    if (user?.role !== 'root' && user?.role !== 'owner') return;
    
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1 && users[userIndex].role !== 'root') {
      users[userIndex].banned = false;
      localStorage.setItem('botforge_users', JSON.stringify(users));
      logAction(`User unbanned: ${users[userIndex].username}`, user?.username || 'Admin');
    }
  };

  const deleteUser = (userId: string) => {
    if (user?.role !== 'root') return;
    
    const users = JSON.parse(localStorage.getItem('botforge_users') || '[]');
    const userToDelete = users.find((u: any) => u.id === userId);
    const filteredUsers = users.filter((u: any) => u.id !== userId || u.role === 'root');
    localStorage.setItem('botforge_users', JSON.stringify(filteredUsers));
    
    if (userToDelete) {
      logAction(`User deleted: ${userToDelete.username}`, user.username);
    }
  };

  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem('botforge_users') || '[]');
  };

  const logAction = (action: string, performedBy: string) => {
    const logs = JSON.parse(localStorage.getItem('botforge_action_logs') || '[]');
    const newLog = {
      id: Date.now().toString(),
      action,
      performedBy,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(100);
    }
    localStorage.setItem('botforge_action_logs', JSON.stringify(logs));
  };

  const getActionLogs = () => {
    return JSON.parse(localStorage.getItem('botforge_action_logs') || '[]');
  };


  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateUserRole,
      updateUserAvatar,
      changePassword,
      adminChangePassword,
      adminChangeUserInfo,
      banUser,
      unbanUser,
      deleteUser,
      getAllUsers,
      logAction,
      getActionLogs
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
