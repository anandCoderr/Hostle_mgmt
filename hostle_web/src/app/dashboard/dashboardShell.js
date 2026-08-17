"use client";

import React from "react";
import Sidebar from "./Sidebar/Sidebar";
import styles from "./DashboardShell.module.scss";

const DashboardShell = ({ children }) => {
  return (
    <div className={styles.dashboard_layout}>
      <Sidebar />
      <main className={styles.main_content}>{children}</main>
    </div>
  );
};

export default DashboardShell;
