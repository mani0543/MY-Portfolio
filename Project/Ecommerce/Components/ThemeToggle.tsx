
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Toggle 
      pressed={isDark}
      onPressedChange={toggleTheme}
      aria-label="Toggle dark mode"
      className={`${isDark ? 'bg-background border-border' : 'bg-primary text-primary-foreground'} border rounded-md p-2 h-9 w-9`}
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Toggle>
  );
}
