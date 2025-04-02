import { useState } from "react";

const SOSButton = ({ onSOSPress }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    onSOSPress(); // Trigger SOS action
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
      disabled={loading}
    >
      {loading ? "Sending SOS..." : "SOS"}
    </button>
  );
};

export default SOSButton;
