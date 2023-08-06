import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import MainPage from './components/pages/MainPage/MainPage.jsx'
import '@fontsource/inter';
import { CssVarsProvider, extendTheme } from "@mui/joy/styles"
import CssBaseline from "@mui/joy/CssBaseline"
import ProjectsPage from './components/pages/ProjectsPage/ProjectsPage.jsx'
import ProjectPage from './components/pages/ProjectPage/ProjectPage.jsx';
import './index.css'
import CreateProject from './components/pages/CreateProject/CreateProject.jsx';
import EditProject from './components/pages/EditProject/EditProject.jsx';
import { projectLoader } from './components/pages/EditProject/EditProject.jsx';


const router = createBrowserRouter([{
  path: "/",
  element: <MainPage />,
  children: [
    {
      path: "projects/:projectId",
      element: <ProjectPage />,
    },
    {path: "projects/create", element: <CreateProject />},
    {path: "projects/edit/:projectId", element: <EditProject/>, loader: projectLoader},
    { index: true, element: <ProjectsPage /> },
  ]
}])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssVarsProvider>
      <CssBaseline />
      <RouterProvider router={router} />
    </CssVarsProvider>
  </React.StrictMode>,
)
