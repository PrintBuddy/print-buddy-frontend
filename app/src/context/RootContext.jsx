

import { UserProvider } from "./UserContext";
import { PrinterProvider } from "./PrinterContext";
import { AuthProvider } from "./AuthContext";
import { QueryContext } from "./QueryContext";
import { FileProvider } from "./FileContext";
import { PrintProvider } from "./PrintContext";
import { NotifProvider } from "./NotificationContext";
import { TransactionProvider } from "./TransactionContext";
import { RechargeRequestProvider } from "./RechargeRequestContext";
import { AdminProvider } from "./AdminContext";




export function RootProvider({ children }) {

    // AuthProvider is the outermost data provider (right under QueryContext)
    // so every other provider below it can gate its queries on
    // statusLoggedIn — none of them should hit an authenticated endpoint
    // before we actually know a token exists (see each provider's `enabled`).
    return (
        <NotifProvider>
            <QueryContext>
                <AuthProvider>
                    <PrinterProvider>
                    <PrintProvider>
                        <FileProvider>
                            <TransactionProvider>
                            <RechargeRequestProvider>
                            <UserProvider>
                                <AdminProvider>
                                    {children}
                                </AdminProvider>
                            </UserProvider>
                            </RechargeRequestProvider>
                            </TransactionProvider>
                        </FileProvider>
                    </PrintProvider>
                    </PrinterProvider>
                </AuthProvider>
            </QueryContext>
        </NotifProvider>
    );
}