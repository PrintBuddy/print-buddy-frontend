

import { UserProvider } from "./UserContext";
import { PrinterProvider } from "./PrinterContext";
import { AuthProvider } from "./AuthContext";
import { QueryContext } from "./QueryContext";
import { FileProvider } from "./FileContext";
import { PrintProvider } from "./PrintContext";
import { NotifProvider } from "./NotificationContext";
import { TransactionProvider } from "./TransactionContext";
import { AdminProvider } from "./AdminContext";




export function RootProvider({ children }) {

    return (
        <NotifProvider>
            <QueryContext>
                <PrinterProvider>
                    <PrintProvider>
                    <AuthProvider>
                        <FileProvider>
                            <TransactionProvider>
                            <UserProvider>
                                <AdminProvider>
                                    {children}
                                </AdminProvider>
                            </UserProvider>
                            </TransactionProvider>
                        </FileProvider>
                    </AuthProvider>
                    </PrintProvider>
                </PrinterProvider>
            </QueryContext>
        </NotifProvider>
    );
}