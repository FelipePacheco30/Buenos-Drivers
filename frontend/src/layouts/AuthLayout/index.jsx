import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={styles.container}>
      <Outlet />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(180deg, #75aadb 80%, #ffffff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
