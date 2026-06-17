import Sidebar from '../common/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
};
export default Layout;
