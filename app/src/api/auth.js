import api from "../services/api";


const AUTH_ROUTE = "/auth";


// Login request
export async function loginUser({ username, password }) {
    
    const answer = {
        success: false,
        message: "",
        data: null
    }

    try {
        const response = await api.post(`${AUTH_ROUTE}/login`, {
            username: username,
            pwd: password
        })

        answer.success = true;
        answer.data = response.data

    } catch (err) {
        answer.success = false

        if (err.response) {
            const code = err.response.status;
            answer.message = code < 500 ? "Incorrect username or password!" : "Server error, try again later.";
        } else if (err.request) {
            answer.message = "Unable to connect to server.";
        } else {
            answer.message = err.message;
        }
    }

    return answer;
}


export async function registerUser({
    username, email, name, surname, password
}) {

    const answer = {
        success: false,
        message: "",
        data: null
    }

    try {
        const response = await api.post(`${AUTH_ROUTE}/register`, {
            username: username,
            email: email,
            name: name,
            surname: surname,
            pwd: password
        })

        answer.success = true;
        answer.data = response.data;

    } catch (err) {
        if (err.response) {
            const code = err.response.status;

            if (code == 409) {
                // Deliberately generic — revealing which specific field
                // (email vs username) already exists lets an attacker
                // probe which accounts are registered.
                answer.message = "Registration failed. Please check your details and try again.";
            } else if (code < 500) {
                answer.message = "Invalid request!";
            } else {
                answer.message = "Server error, try again later.";
            }
        } else if (err.request) {
            answer.message = "Unable to connect to server."
        } else {
            answer.message = err.message;
        }
    }

    return answer;
}


export async function requestPwdReset({ email }) {
    
    const answer = {
        success: false,
        message: "",
    }
    
    try {
        await api.post(`${AUTH_ROUTE}/pwd-reset-request`, {
            email: email
        })
        answer.success = true;
        
    } catch (err) {
        if (err.response) {
            const code = err.response.status;
            
            if (code == 404) {
                answer.message = "User not found!";
            } else if (code < 500) {
                answer.message = "Invalid request!";
            } else {
                answer.message = "Server error, try again later.";
            }
        } else if (err.request) {
            answer.message = "Unable to connect to server."
        } else {
            answer.message = err.message;
        }
    }

    return answer;
}


export async function resetPwd({ token, newPassword }) {
    
    const answer = {
        success: false,
        message: "",
    }

    try {
        await api.post(`${AUTH_ROUTE}/pwd-reset/${token}`, {
            new_pwd: newPassword
        })

        answer.success = true;
    } catch (err) {
        if (err.response) {
            const code = err.response.status;

            if (code == 404) {
                answer.message = "User not found!";
            } else if (code == 400) {
                answer.message = "Invalid or expired link! Please request a new password reset.";
            } else if (code < 500) {
                answer.message = "Invalid request!";
            } else {
                answer.message = "Server error, try again later.";
            }
        } else if (err.request) {
            answer.message = "Unable to connect to server."
        } else {
            answer.message = err.message;
        }
    }

    return answer;
}

