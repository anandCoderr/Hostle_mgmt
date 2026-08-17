import React from "react";
import DashboardShell from "./dashboardShell";

const layout = ({ children }) => {
  return (
    <>
      <DashboardShell>{children}</DashboardShell>
    </>
  );
};

export default layout;
