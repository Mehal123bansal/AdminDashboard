// // components/Sidebar.js
// import { FiHome, FiFileText, FiSearch, FiBarChart2 } from 'react-icons/fi';
// import { NavLink } from 'react-router-dom';

// function Sidebar() {
//   const menuItems = [
//     { to: '/dashboard/home', label: 'Home', icon: FiHome },
//     { to: '/dashboard/cv-list', label: 'CV List', icon: FiFileText },
//     { to: '/dashboard/search', label: 'Search', icon: FiSearch },
//     { to: '/dashboard/reports', label: 'Reports', icon: FiBarChart2 },
//   ];

//   return (
//     <aside
//       className="w-64 h-screen bg-white dark:bg-gray-950 border-r dark:border-gray-800 shadow-lg flex flex-col justify-between sticky top-0 p-4 md:p-5 z-20"
//       aria-label="Sidebar"
//     >
//       {/* 🔷 Header: Logo and Title */}
//       <div>
//         <div className="flex items-center gap-3 mb-8">
//           <img
//             src="/1.png"
//             alt="Logo"
//             className="w-10 h-10 object-cover rounded-full shadow-md"
//           />
//           <h1
//             className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-wide select-none"
//           >
//             Horeca Panel
//           </h1>
//         </div>

//         {/* 🔸 Navigation */}
//         <nav className="space-y-2" aria-label="Main Navigation">
//           {menuItems.map(({ to, label, icon: Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               end
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   isActive
//                     ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white shadow'
//                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white'
//                 }`
//               }
//               aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
//             >
//               <Icon className="text-xl" aria-hidden="true" />
//               <span>{label}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </div>

//       {/* 🔻 Footer */}
//       <footer className="text-xs text-gray-500 dark:text-gray-600 border-t pt-3 mt-6 text-center select-none">
//         &copy; {new Date().getFullYear()} Horeca Tech
//       </footer>
//     </aside>
//   );
// }

// export default Sidebar;
