const styles = {
    gridContainer: {
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
      padding: '20px',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      paddingLeft: '25px',
      paddingRight: '25px',
      maxHeight: 'calc(100vh - 135px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      backgroundColor: 'white',
      justifyContent: 'start', 
    },

    singleCardGrid: {
      justifyItems: 'start',
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
  