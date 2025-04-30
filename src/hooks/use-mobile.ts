
import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (client side)
    if (typeof window !== "undefined") {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkIfMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkIfMobile);

      // Cleanup
      return () => {
        window.removeEventListener("resize", checkIfMobile);
      };
    }
  }, []);

  return isMobile;
}
