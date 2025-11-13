import { RouterProvider } from "react-router-dom";
import router from "./router/router";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";

function App() {
  return (
    <CustomerAuthProvider>
      <RouterProvider router={router} />
    </CustomerAuthProvider>
  );
}

export default App;
