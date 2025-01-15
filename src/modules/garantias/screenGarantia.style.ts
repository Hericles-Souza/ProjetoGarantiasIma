const styles = {
  gridContainer: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    padding: '20px',
    boxSizing: 'border-box' as const,
    width: '100%',
    height: '100%',
    paddingLeft: '25px',
    paddingRight: '25px',
    maxHeight: 'calc(100vh - 135px)',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    backgroundColor: 'white',
    justifyContent: 'start' as const,
  },
  singleCardGrid: {
    justifyItems: 'start' as const,
  },
  scrollbar: {
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'red',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'white',
    },
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
