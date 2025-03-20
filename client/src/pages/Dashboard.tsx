import { useEffect } from 'react'

const Dashboard = () => {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const result = params.get('result');

        if (result) {
            try {
                const parsedResult = JSON.parse(decodeURIComponent(result));
                // Store the user info in localStorage
                localStorage.setItem("user", JSON.stringify(parsedResult));

                // Remove the result query param from the URL to prevent infinite reload
                window.history.replaceState(null, "", window.location.pathname);

                // Reload the page to apply changes
                window.location.reload();
            } catch (error) {
                console.error("Error parsing result:", error);
            }
        }
    }, []); // This will run only once when the component mounts

    return (
        <div>Dashboard</div>
    )
}

export default Dashboard