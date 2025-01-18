import React from "react";
import AppRoutes from "@app/routes/AppRoutes.tsx";
import {AuthProvider} from "@shared/contexts/Auth/AuthProvider.tsx";


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes/>
    </AuthProvider>
  );
};


export default App;
