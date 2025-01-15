const styles = {
  layout: {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  sider: {
    borderRight: '1px solid #d9d9d9',
    background: '#ffffff',
    transition: 'all 0.2s',
    overflow: 'auto',
  },
  siderHeader: (collapsed: boolean) => ({
    height: 80,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontWeight: 'bold',
    fontSize: collapsed ? 20 : 22,
    color: '#000',
  }),
  header: {
    padding: '0 30px',
    display: 'flex' as const,
    height: 70,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #d9d9d9',
    background: '#ffffff',
    overflow: 'hidden',
  },
  avatar: {
    backgroundColor: '#FF0000',
    marginLeft: '15px',
  },
  arrowButtonMenu: (collapsed: boolean) => ({
    position: 'absolute' as const,
    left: collapsed ? '64px' : '264px',
    height: 30,
    width: 30,
    borderRadius: 10,
    border: '1px solid #d9d9d9',
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    transition: 'left 0.3s ease',
    backgroundColor: '#ffffff',
  }),
  content: {
    margin: 0,
    minHeight: 'calc(100vh - 80px)',
    background: '#ffffff',
    color: '#000',
    overflow: 'hidden',
  },
  contentInner: {
    background: '#ffffff',
    padding: 24,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 160px)',
  },
  titleHeader: {
    color: '#333',
  },
  menu: {
    backgroundColor: '#ffffff',
    overflowY: 'auto',
  },
  menuItem: {
    backgroundColor: '#ffffff',
    color: '#000',
  },
  menuItemSelected: {
    background: '#ffffff',
    color: '#000',
  },
};

export default styles;
