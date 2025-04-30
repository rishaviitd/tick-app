
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  FileText, 
  User, 
  Mail,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  roll: string;
}

interface StudentTableProps {
  students: Student[];
  onViewStudent: (id: string) => void;
}

export const StudentTable = ({ students, onViewStudent }: StudentTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Students</h3>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.roll}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Mail size={14} />
                    <span className="truncate max-w-[200px]">{student.email}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewStudent(student.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Assignments
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
