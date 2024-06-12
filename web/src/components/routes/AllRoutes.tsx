import { Route, Routes } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";

export const allRoutes: Record<
    string,
    { title: string; element: JSX.Element }
> = {
    "/": {
        title: "Outbound Tracker",
        element: <Dashboard />,
    },
    "/dashboard": {
        title: "Watcher",
        element: <>Dashboard</>,
    },
    "/overview": {
        title: "Watcher",
        element: <>overview</>,
    },
};

export const AllRoutes = () => {
    return (
        <Routes>
            {Object.entries(allRoutes).map(([path, { element }]) => {
                return <Route key={path} path={path} element={element} />;
            })}
            <Route path="*" element={<>Default</>} />
        </Routes>
    );
};
