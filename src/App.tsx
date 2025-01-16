import React from "react";
import {AuthProvider} from "@shared/contexts/AuthContext.tsx";
import AppRoutes from "@app/routes/AppRoutes.tsx";


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes/>
    </AuthProvider>
  );
};


export default App;
