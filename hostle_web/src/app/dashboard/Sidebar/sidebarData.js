import {
  HiOutlineViewGrid,
  HiOutlineShoppingCart,
  HiOutlineClipboardList,
  HiOutlineTag,
  HiOutlineStar,
} from "react-icons/hi";
import {
  HiOutlineBuildingStorefront,
  HiOutlineArrowPath,
  HiOutlineExclamationCircle,
  HiOutlineMegaphone,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineTicket,
} from "react-icons/hi2";
import { TbBrandProducthunt } from "react-icons/tb";

/**
 * Sidebar navigation items configuration.
 *
 * Each item can have:
 * - label: Display text
 * - icon: React icon component
 * - path: Route path (used for navigation & active state)
 * - hasSubmenu: Boolean — shows a chevron arrow to indicate expandable sub-items
 *
 * To add a new sidebar item, simply append a new object to this array.
 */
const sidebarData = [
  {
    label: "Dashboard",
    icon: HiOutlineViewGrid,
    path: "/dashboard",
  },
  // {
  //   label: "Products",
  //   icon: TbBrandProducthunt,
  //   path: "/dashboard/products",
  //   hasSubmenu: true,
  // },
  {
    label: "Menus",
    icon: TbBrandProducthunt,
    path: "/dashboard/menu",
    // hasSubmenu: true,
  },
];

export default sidebarData;
