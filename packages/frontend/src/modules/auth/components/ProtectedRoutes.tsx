import { getAccessToken } from '@/modules/auth/services/token.service';
import { useUserStore } from '@/modules/auth/store/user.store';
import { UserRole } from '@/shared/interfaces/user.interface';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
interface ProtectedRouteProps {
	allowedRoles?: UserRole[];
	fallbackPath?: string;
}

export const ProtectedRoute = ({
	allowedRoles,
	fallbackPath,
}: ProtectedRouteProps) => {
	const location = useLocation();
	const user = useUserStore(state => state.user);
	const accessToken = getAccessToken();

	if (!accessToken || !user) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		const safeDefault =
			fallbackPath ?? (user.role === 'MECHANIC' ? '/my-tasks' : '/');
		return <Navigate to={safeDefault} replace />;
	}

	return <Outlet />;
};
