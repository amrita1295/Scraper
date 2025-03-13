import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

export default function App() {
    const [place, setPlace] = useState("");
    const [range, setRange] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchRestaurants = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await axios.post("https://scraper-jpb7.onrender.com/api/restaurants", { place, range });
            setRestaurants(response.data);
            setCurrentPage(1); // Reset pagination
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch restaurants. Please try again.");
        }
        setLoading(false);
    };

    const exportToExcel = () => {
        if (restaurants.length === 0) {
            alert("No data to export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(restaurants);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Restaurants");

        XLSX.writeFile(workbook, "restaurants.xlsx");
    };

    const totalPages = Math.ceil(restaurants.length / itemsPerPage);
    const displayedRestaurants = restaurants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Find Restaurants</h1>

            {/* Search Form */}
            <form className="flex space-x-4 mb-6 bg-white p-4 shadow-md rounded-lg" onSubmit={fetchRestaurants}>
                <input
                    type="text"
                    placeholder="Enter location"
                    className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Range (meters)"
                    className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    required
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition">
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <p className="text-red-500">{error}</p>}

            {/* Restaurant List */}
            {restaurants.length > 0 ? (
                <div className="w-full max-w-5xl">
                    {/* Export to Excel Button */}
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={exportToExcel} 
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                        >
                            Export to Excel
                        </button>
                    </div>

                    {displayedRestaurants.map((restaurant, idx) => (
                        <div key={idx} className="bg-white p-4 shadow-md rounded-lg mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">{restaurant.name}</h2>
                            <p className="text-gray-600">{restaurant.address}</p>

                            {/* Contact Info */}
                            <div className="mt-2 text-sm">
                                <p><strong>Phone:</strong> {restaurant.phone}</p>
                                <p>
                                    <strong>Website:</strong>{" "}
                                    {restaurant.website !== "No website available" ? (
                                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                            Visit
                                        </a>
                                    ) : (
                                        "No website"
                                    )}
                                </p>
                                <p><strong>Email:</strong> {restaurant.email}</p>
                            </div>

                            {/* Social Media Links */}
                            <div className="mt-2 flex gap-4">
                                {restaurant.facebook !== "No Facebook" && (
                                    <a href={restaurant.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                        Facebook
                                    </a>
                                )}
                                {restaurant.instagram !== "No Instagram" && (
                                    <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">
                                        Instagram
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <button 
                            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <p className="text-gray-600">Page {currentPage} of {totalPages}</p>
                        <button 
                            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                !loading && <p className="text-gray-500">No restaurants found.</p>
            )}
        </div>
    );
}
