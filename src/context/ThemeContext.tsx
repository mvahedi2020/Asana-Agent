import { createContext, useContext, useState, ReactNode } from 'react';
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);
