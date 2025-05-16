// --- SVG Icon Placeholders (Replace with your actual icon components) ---
// You would import these: import { HomeIcon, AffiliatesIcon, ... } from './icons';
const PlaceholderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    {...props}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="white"
      strokeWidth="1"
      fill="transparent"
    />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="white"
      fontSize="8"
    >
      ICON
    </text>
  </svg>
);

const HolderPowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <line x1="12" y1="2" x2="12" y2="12" />
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
  </svg>
);

const HolderBackArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const HolderAffiliatesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    width="110"
    height="24"
    viewBox="0 0 110 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Affiliates
    </text>
  </svg>
);

const HolderClientsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="100"
    height="24"
    viewBox="0 0 100 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Clients
    </text>
  </svg>
);

const HolderEntitiesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="100"
    height="24"
    viewBox="0 0 100 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Entities
    </text>
  </svg>
);

const HolderChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="100"
    height="24"
    viewBox="0 0 100 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Ask AI
    </text>
  </svg>
);

const HolderSettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="100"
    height="24"
    viewBox="0 0 100 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Settings
    </text>
  </svg>
);

const HolderAddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="110"
    height="24"
    viewBox="0 0 110 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Add New
    </text>
  </svg>
);

const HolderManageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="110"
    height="24"
    viewBox="0 0 110 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Manage
    </text>
  </svg>
);

const HolderReportsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="110"
    height="24"
    viewBox="0 0 110 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Reports
    </text>
  </svg>
);

const HolderBillingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="110"
    height="24"
    viewBox="0 0 110 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="18"
      fontSize="24"
      fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      fill="currentColor"
    >
      Billing
    </text>
  </svg>
);

export {
  PlaceholderIcon,
  HolderPowerIcon,
  HolderBackArrowIcon,
  HolderAffiliatesIcon,
  HolderClientsIcon,
  HolderEntitiesIcon,
  HolderChatIcon,
  HolderSettingsIcon,
  HolderAddIcon,
  HolderManageIcon,
  HolderReportsIcon,
  HolderBillingIcon,
};
