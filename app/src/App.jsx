import { RootProvider } from "./context/RootContext";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import AppRouter from "./Router"


function App() {

    return (
        <ErrorBoundary>
            <RootProvider>
                <AppRouter />
            </RootProvider>
        </ErrorBoundary>
    )
}

export default App;
