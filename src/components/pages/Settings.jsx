import { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'purple',
    notifications: true,
    language: 'English',
    emailReports: 'Weekly'
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('leadconnect-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever settings change
  const handleSave = () => {
    localStorage.setItem('leadconnect-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Settings
      </h1>
      <p className="text-gray-500 mb-6">Configure your LeadConnect Pro preferences</p>

      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl">
        {/* Theme */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="font-semibold text-gray-700 mb-2">Theme</h3>
          <p className="text-sm text-gray-500 mb-2">Choose your preferred theme</p>
          <div className="flex flex-wrap gap-3">
            {['purple', 'blue', 'green', 'red', 'orange'].map((color) => (
              <button
                key={color}
                onClick={() => setSettings({ ...settings, theme: color })}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  settings.theme === color
                    ? `bg-${color}-600 text-white`
                    : `bg-${color}-200 text-gray-700 hover:bg-${color}-300`
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="font-semibold text-gray-700 mb-2">Notifications</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className="w-5 h-5 accent-purple-600"
            />
            <span className="text-sm">Enable email notifications</span>
          </label>
        </div>

        {/* Language */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="font-semibold text-gray-700 mb-2">Language</h3>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="border rounded-lg p-2 w-full max-w-xs"
          >
            <option value="English">English</option>
            <option value="Urdu">Urdu</option>
            <option value="Arabic">Arabic</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        {/* Email Reports */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="font-semibold text-gray-700 mb-2">Email Reports</h3>
          <select
            value={settings.emailReports}
            onChange={(e) => setSettings({ ...settings, emailReports: e.target.value })}
            className="border rounded-lg p-2 w-full max-w-xs"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Never">Never</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
