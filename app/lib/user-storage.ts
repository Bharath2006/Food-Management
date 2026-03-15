import { User } from '@/app/types';

export interface StoredUser extends User {
  password: string; // Hashed password in real app
  activities: UserActivity[];
}

export interface UserActivity {
  id: string;
  type: 'donation' | 'pickup' | 'delivery' | 'login' | 'signup';
  description: string;
  timestamp: Date;
  metadata?: any;
}

const isServer = typeof window === 'undefined';

class UserStorageService {
  private readonly STORAGE_KEY = 'zeroFoodHero_users';
  private readonly CURRENT_USER_KEY = 'zeroFoodHero_currentUser';

  private getStorage() {
    if (isServer) {
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      };
    }
    return localStorage;
  }

  // Get all stored users
  private getStoredUsers(): StoredUser[] {
    if (isServer) return [];
    const usersJson = this.getStorage().getItem(this.STORAGE_KEY);
    if (!usersJson) return [];
    
    try {
      const users = JSON.parse(usersJson);
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        activities: (user.activities || []).map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error parsing stored users:', error);
      return [];
    }
  }

  // Save all users to storage
  private saveUsers(users: StoredUser[]): void {
    if (isServer) return;
    this.getStorage().setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  // Check if email already exists
  public isEmailRegistered(email: string): boolean {
    const users = this.getStoredUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Create new user
  public createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): User {
    const users = this.getStoredUsers();
    
    // Check if email already exists
    if (this.isEmailRegistered(userData.email)) {
      throw new Error('Email already registered. Please use a different email or sign in.');
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email.toLowerCase(),
      name: `${userData.firstName} ${userData.lastName}`,
      role: 'donor',
      phone: '',
      address: '',
      createdAt: new Date(),
      profileImage: undefined,
      password: userData.password, // In real app, this should be hashed
      activities: [{
        id: `activity-${Date.now()}`,
        type: 'signup',
        description: 'Account created',
        timestamp: new Date()
      }]
    };

    users.push(newUser);
    this.saveUsers(users);

    // Return user without password
    const { password, activities, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Authenticate user
  public authenticateUser(email: string, password: string): User {
    const users = this.getStoredUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    }

    // Add login activity
    user.activities.push({
      id: `activity-${Date.now()}`,
      type: 'login',
      description: 'User signed in',
      timestamp: new Date()
    });

    this.saveUsers(users);

    // Return user without password
    const { password: _, activities, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get current user from session
  public getCurrentUser(): StoredUser | null {
    if (isServer) return null;
    const userJson = this.getStorage().getItem(this.CURRENT_USER_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing current user:', error);
      return null;
    }
  }

  // Set current user in session
  public setCurrentUser(user: User): void {
    if (isServer) return;
    this.getStorage().setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  // Clear current user session
  public clearCurrentUser(): void {
    if (isServer) return;
    this.getStorage().removeItem(this.CURRENT_USER_KEY);
  }

  // Update user data
  public updateUser(updatedUser: User): void {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        ...updatedUser,
        createdAt: users[userIndex].createdAt // Preserve original creation date
      };
      this.saveUsers(users);
    }
  }

  // Add user activity
  public addUserActivity(userId: string, activity: Omit<UserActivity, 'id' | 'timestamp'>): void {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const newActivity: UserActivity = {
        ...activity,
        id: `activity-${Date.now()}`,
        timestamp: new Date()
      };
      
      users[userIndex].activities.push(newActivity);
      this.saveUsers(users);
    }
  }

  // Get user activities
  public getUserActivities(userId: string): UserActivity[] {
    const users = this.getStoredUsers();
    const user = users.find(u => u.id === userId);
    return user?.activities || [];
  }

  // Validate email format
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  public validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get all users (for admin)
  public getAllUsers(): User[] {
    const users = this.getStoredUsers();
    // Return users without passwords
    return users.map(({ password, activities, ...user }) => ({
      ...user,
      createdAt: new Date(user.createdAt)
    }));
  }

  // Delete user (for admin)
  public deleteUser(userId: string): void {
    const users = this.getStoredUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);
  }
}

export const userStorage = new UserStorageService(); 