import React from "react";

const WarningAlert = ({ msg }) => {
  return (
    <div
      className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-700 shadow-sm"
      role="alert"
    >
      {msg}
    </div>
  );
};

export default WarningAlert;