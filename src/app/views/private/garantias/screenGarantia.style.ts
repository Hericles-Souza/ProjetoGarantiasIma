const styles = {
  gridContainer: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '1rem',
    overflowY: 'auto' as const, 
  },
  tabActive: {
    color: 'red',
    borderBottom: '2px solid red',
  },
  tabInactive: {
    color: 'black',
  },
};

export default styles;
