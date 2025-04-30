
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreVertical,
  Eye,
  Send,
  Download,
  FileText,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentResult {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  status: "shared" | "not-shared";
  submissionDate: string;
}

interface StudentResultsTableProps {
  results: StudentResult[];
  onViewResult: (id: string) => void;
  onShareResult: (id: string) => void;
  onDownloadResult: (id: string) => void;
}

export const StudentResultsTable = ({
  results,
  onViewResult,
  onShareResult,
  onDownloadResult,
}: StudentResultsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof StudentResult>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof StudentResult) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredResults = results.filter((result) =>
    result.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-lime-600";
    if (percentage >= 70) return "text-amber-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Share All Results
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Student Name
                  {sortField === "name" && (
                    <ArrowUpDown size={14} className="ml-1" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center justify-end">
                  Score
                  {sortField === "score" && (
                    <ArrowUpDown size={14} className="ml-1" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("percentage")}
              >
                <div className="flex items-center justify-end">
                  Percentage
                  {sortField === "percentage" && (
                    <ArrowUpDown size={14} className="ml-1" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer text-center"
                onClick={() => handleSort("grade")}
              >
                <div className="flex items-center justify-center">
                  Grade
                  {sortField === "grade" && (
                    <ArrowUpDown size={14} className="ml-1" />
                  )}
                </div>
              </TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.length > 0 ? (
              sortedResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.name}</TableCell>
                  <TableCell className="text-right">
                    {result.score}/{result.maxScore}
                  </TableCell>
                  <TableCell
                    className={`text-right ${getScoreColor(result.percentage)}`}
                  >
                    {result.percentage}%
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`${getScoreColor(result.percentage)}`}
                    >
                      {result.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {result.submissionDate}
                  </TableCell>
                  <TableCell>
                    {result.status === "shared" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Shared
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        Not shared
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewResult(result.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onShareResult(result.id)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {result.status === "shared"
                            ? "Reshare Result"
                            : "Share Result"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDownloadResult(result.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
