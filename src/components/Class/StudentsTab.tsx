import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
  Download,
  PlusCircle,
  MoreVertical,
  UserCircle,
  FileText,
  Edit,
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
                <Button
                  variant="outline"
            size="icon"
                  onClick={handleImportStudents}
            className="hover:text-[#58CC02] hover:border-[#58CC02] h-10 w-10 md:flex items-center justify-center hidden"
                >
                  <Upload size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportStudents}
            className="hover:text-[#58CC02] hover:border-[#58CC02] md:hidden flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Import
                </Button>

                <Button
                  variant="outline"
            size="icon"
                  onClick={handleExportStudents}
            className="hover:text-[#58CC02] hover:border-[#58CC02] h-10 w-10 md:flex items-center justify-center hidden"
                >
                  <Download size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStudents}
            className="hover:text-[#58CC02] hover:border-[#58CC02] md:hidden flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
                </Button>

                <Button
                  variant="outline"
            size="icon"
                  onClick={handleAddStudent}
            className="hover:text-[#58CC02] hover:border-[#58CC02] h-10 w-10 md:flex items-center justify-center hidden"
                >
                  <PlusCircle size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddStudent}
            className="hover:text-[#58CC02] hover:border-[#58CC02] md:hidden flex items-center"
          >
            <PlusCircle size={16} className="mr-2" />
            Add
                </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="sticky top-0 z-10 bg-muted/50 border-b">
            <div className="min-w-[600px]">
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
                <div className="px-4 flex items-center justify-center font-medium text-muted-foreground">
                  Actions
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-325px)] min-h-[400px]">
            <div className="min-w-[600px]">
              {filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className={`grid grid-cols-4 border-b hover:bg-[#EEF9EE]/50 transition-colors ${index % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <div className="p-4 truncate font-medium">{student.name}</div>
                  <div className="p-4">{student.roll || "-"}</div>
                  <div className="p-4 font-mono">{student.mobile}</div>
                  <div className="p-4 flex justify-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-[#58CC02] hover:bg-[#EEF9EE]"
                          onClick={() => handleViewStudent(student.id)}
                        >
                            <UserCircle size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-[#58CC02] hover:bg-[#EEF9EE]"
                          onClick={() => handleViewAssignments(student.id)}
                        >
                            <FileText size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Assignments</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-[#58CC02] hover:bg-[#EEF9EE]"
                          onClick={() => handleEditDetails(student.id)}
                        >
                            <Edit size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
