import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
  Download,
  PlusCircle,
  MoreVertical,
} from "lucide-react";
import { Student } from "@/types/class";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StudentsTabProps {
  students: Student[];
}

export const StudentsTab = ({ students }: StudentsTabProps) => {
  const [searchStudents, setSearchStudents] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleImportStudents = () => {
    toast({
      title: "Import Students",
      description: "Upload attendance sheet or student database",
    });
  };

  const handleExportStudents = () => {
    toast({
      title: "Export Students",
      description: "Downloading student data as CSV",
    });
  };

  const handleAddStudent = () => {
    toast({
      title: "Add Student",
      description: "Opening form to add a new student",
    });
  };

  const handleViewStudent = (id: string) => {
    toast({
      title: "View Student Profile",
      description: `Viewing student with ID: ${id}`,
    });
  };

  const handleViewAssignments = (id: string) => {
    toast({
      title: "View Assignments",
      description: `Viewing assignments for student with ID: ${id}`,
    });
  };

  const handleEditDetails = (id: string) => {
    toast({
      title: "Edit Student Details",
      description: `Editing details for student with ID: ${id}`,
    });
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchStudents.toLowerCase()) ||
      student.roll.includes(searchStudents) ||
      student.mobile.includes(searchStudents)
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student..."
            className="pl-9"
            value={searchStudents}
            onChange={(e) => setSearchStudents(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "icon"}
                  onClick={handleImportStudents}
                >
                  <Upload size={16} />
                  {isMobile && <span className="ml-2">Import</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import Students</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "icon"}
                  onClick={handleExportStudents}
                >
                  <Download size={16} />
                  {isMobile && <span className="ml-2">Export</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Students</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "icon"}
                  onClick={handleAddStudent}
                >
                  <PlusCircle size={16} />
                  {isMobile && <span className="ml-2">Add</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Student</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <div className="sticky top-0 z-10 bg-muted/50 border-b">
            <div className={isMobile ? "min-w-[600px]" : "min-w-[600px]"}>
              <div className="grid grid-cols-4 h-10">
                <div className="px-4 flex items-center font-medium text-muted-foreground">
                  Name
                </div>
                <div className="px-4 flex items-center font-medium text-muted-foreground">
                  Roll No.
                </div>
                <div className="px-4 flex items-center font-medium text-muted-foreground">
                  Mobile
                </div>
                <div className="px-4 flex items-center font-medium text-muted-foreground text-center">
                  Actions
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-325px)] min-h-[400px]">
            <div className={isMobile ? "min-w-[600px]" : "min-w-[600px]"}>
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="p-4 truncate">{student.name}</div>
                  <div className="p-4">{student.roll || "-"}</div>
                  <div className="p-4">{student.mobile}</div>
                  <div className="p-4 flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-white"
                      >
                        <DropdownMenuItem
                          onClick={() => handleViewStudent(student.id)}
                        >
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewAssignments(student.id)}
                        >
                          <span>View Assignments</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditDetails(student.id)}
                        >
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="h-24 flex items-center justify-center text-muted-foreground">
                  No students found.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
