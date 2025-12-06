import { Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'

interface ProtectedRouteProps {
    children: React.ReactNode;
    session: Session | null;
}

export default function ProtectedRoute({ children, session }: ProtectedRouteProps){
    if (!session){
        return <Navigate to="/login" replace/>;
    }

    return<>{children}</>
}