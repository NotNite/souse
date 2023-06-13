import ReactDOM from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";

import App from "@/routes/app";

import "./styles/main.css";
import Conversation, {
  loader as ConversationLoader
} from "./routes/conversation";

const router = createHashRouter([
  {
    path: "/*",
    element: <App />,
    children: [
      {
        path: "conversations/:jid",
        element: <Conversation />,
        loader: ConversationLoader
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);
