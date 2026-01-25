import { Outlet } from 'react-router-dom';
interface ProtectedRouteProps {
	allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
	// const { token, role } = useAuthStore();
	// const location = useLocation();
	// 1. Якщо немає токена — на логін
	// if (!token) {
	//   return <Navigate to="/login" state={{ from: location }} replace />;
	// }
	// 2. Якщо є роль, але вона не підходить (наприклад, Клієнт лізе в Адмінку)
	// if (allowedRoles && role && !allowedRoles.includes(role)) {
	//   return <Navigate to="/unauthorized" replace />; // Або на головну
	// }
	// 3. Все ок — показуємо контент (Outlet)
	return <Outlet />;
};
