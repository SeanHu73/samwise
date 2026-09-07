import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Today } from "./pages/Today";
import { AllTasks } from "./pages/AllTasks";
import { Completed } from "./pages/Completed";
import { Ideas } from "./pages/Ideas";
import { Focus } from "./pages/Focus";
import { BigPicture, BigPictureDetail } from "./pages/BigPicture";
import {
  Assistant,
  Calendar,
  Insights,
  LongTerm,
  Plan,
  Reviews,
  Settings,
} from "./pages/OtherPages";
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/today" element={<Today />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/projects" element={<BigPicture />} />
        <Route path="/projects/:id" element={<BigPictureDetail />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/done" element={<Completed />} />
        <Route path="/map" element={<LongTerm />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
      <Route path="/focus/:id" element={<Focus />} />
    </Routes>
  );
}
