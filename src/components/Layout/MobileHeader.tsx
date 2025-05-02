import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export const MobileHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img 
            src="/tick-ai-logo.svg" 
            alt="tick AI Logo" 
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-[#58CC02]">tick AI</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 bg-primary/10"
            >
              <User size={18} className="text-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b">
              <p className="font-medium">{user?.name || "Guest User"}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "Teacher"}
              </p>
            </div>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
