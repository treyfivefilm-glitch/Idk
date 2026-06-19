import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
