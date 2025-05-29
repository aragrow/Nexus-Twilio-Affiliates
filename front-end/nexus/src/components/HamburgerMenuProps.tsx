import React from "react";
import type { NavItem } from "./interface";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  userRole: string;
  handleCardClick: (item: NavItem) => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  userRole,
  handleCardClick,
}) => {
  const menuStyles = {
    container: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
      display: isOpen ? "block" : "none",
    },
    menu: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "250px",
      height: "100%",
      backgroundColor: "#fff",
      boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
      padding: "20px",
      overflowY: "auto" as const,
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px",
      cursor: "pointer",
      borderRadius: "4px",
      margin: "4px 0",
      transition: "background-color 0.2s",
      ":hover": {
        backgroundColor: "#f0f0f0",
      },
    },
    closeButton: {
      position: "absolute" as const,
      top: "10px",
      right: "10px",
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
    },
  };

  return (
    <div style={menuStyles.container} onClick={onClose}>
      <div style={menuStyles.menu} onClick={(e) => e.stopPropagation()}>
        <button style={menuStyles.closeButton} onClick={onClose}>
          ×
        </button>
        {navItems.map((item) => {
          if (
            userRole.toLowerCase().includes("affiliate") &&
            item.ariaLabel.toLowerCase().includes("affiliate")
          ) {
            return null;
          } else if (
            userRole.toLowerCase().includes("client") &&
            (item.ariaLabel.toLowerCase().includes("affiliate") ||
              item.ariaLabel.toLowerCase().includes("client"))
          ) {
            return null;
          }

          return (
            <div
              key={item.id}
              style={menuStyles.menuItem}
              onClick={() => {
                handleCardClick(item);
                onClose();
              }}
            >
              <item.IconComponent style={{ marginRight: "10px" }} />
              <span>{item.ariaLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HamburgerMenu;
