'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  BarChart3, 
  MessageSquare, 
  FileText,
  Settings,
  Home,
  ShieldCheck,
  Bell
} from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getMenuItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', icon: Home },
    ];

    switch (user.role) {
      case 'front-desk':
        return [
          ...baseItems,
          { href: '/', label: 'Patient Intake', icon: FileText },
          { href: '/satisfaction', label: 'Satisfaction Survey', icon: MessageSquare },
        ];
      case 'marketing':
        return [
          ...baseItems,
          { href: '/dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
          { href: '/satisfaction', label: 'Satisfaction Survey', icon: MessageSquare },
        ];
      case 'provider':
        return [
          ...baseItems,
          { href: '/dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
          { href: '/satisfaction', label: 'My Satisfaction Scores', icon: MessageSquare },
        ];
      case 'admin':
        return [
          ...baseItems,
          { href: '/dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
          { href: '/satisfaction', label: 'Satisfaction Survey', icon: MessageSquare },
          { href: '/notifications', label: 'Notifications', icon: Bell },
          { href: '/security', label: 'Security & Compliance', icon: ShieldCheck },
          { href: '/settings', label: 'Settings', icon: Settings },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                GoTo Optical
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex md:items-center">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 