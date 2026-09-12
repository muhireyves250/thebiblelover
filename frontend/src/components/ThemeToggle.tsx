import React from 'react';
import { Moon } from 'lucide-react';

// Placeholder only - dark mode itself isn't implemented yet (coming back
// after light mode is finished). No state, no localStorage, no toggling
// behavior - just the icon sitting in its header spot.
const ThemeToggle: React.FC = () => {
    return (
        <button
            className="p-2 rounded-md border border-gray-300 bg-gray-50 transition-all duration-300 group"
            aria-label="Dark mode (coming soon)"
            disabled
        >
            <Moon className="w-5 h-5 text-gray-600" />
        </button>
    );
};

export default ThemeToggle;
