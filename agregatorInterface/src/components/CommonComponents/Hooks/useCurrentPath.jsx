import { useLocation, matchRoutes } from "react-router-dom";

const routes = [{path: "/"}]

export default function useCurrentPath(){
    const location = useLocation();
    const [{route}] = matchRoutes(routes, location);
    return route.path
}