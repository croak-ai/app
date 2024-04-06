import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const defaultTheme = "dark"; // Define your default theme
const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({ theme: defaultTheme, setTheme: () => {} });

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || defaultTheme,
  );

  useEffect(() => {
    console.log("ASDASD");
    // Check if the current theme is 'dark'
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    // Optionally, if using multiple themes, handle them with more conditions or a switch statement

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
