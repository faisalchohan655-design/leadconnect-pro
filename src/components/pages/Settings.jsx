import { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'purple',
    notifications: true,
    language: 'English',
    emailReports: 'Weekly'
  });

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
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Purple (Default)</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg opacity-50">Blue</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg opacity-50">Green</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg opacity-50">Red</button>
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

        {/* Save Button */}
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
