"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineChevronDown } from "react-icons/hi";
import sidebarData from "./sidebarData";
import styles from "./Sidebar.module.scss";

const Sidebar = () => {
  const pathname = usePathname();

  /**
   * Determines if a nav item is currently active.
   * - Exact match for "/dashboard" (home).
   * - startsWith match for all other routes.
   */
  const isActive = (itemPath) => {
    if (itemPath === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <aside className={styles.sidebar} id="dashboard-sidebar">
      {/* Logo */}
      <div className={styles.logo_wrapper}>
        <h2 className={styles.logo_text}>Hostle</h2>
      </div>

      {/* Navigation */}
      <nav>
        <ul className={styles.nav_list}>
          {sidebarData.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`${styles.nav_item} ${
                    active ? styles.nav_item_active : ""
                  }`}
                  id={`sidebar-${item.path.replace(/\//g, "-")}`}
                >
                  <span className={styles.nav_icon}>
                    <Icon />
                  </span>
                  <span className={styles.nav_label}>{item.label}</span>
                  {item.hasSubmenu && (
                    <span className={styles.nav_chevron}>
                      <HiOutlineChevronDown />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
