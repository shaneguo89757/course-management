import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Student {
  id: number;
  name: string;
}

const STUDENTS: Student[] = [
  { id: 10, name: "張三1" },
  { id: 11, name: "李四1" },
  { id: 12, name: "王五1" },
  { id: 13, name: "張三1" },
  { id: 14, name: "李四1" },
  { id: 15, name: "王五1" },
  { id: 16, name: "張三1" },
  { id: 17, name: "李四1" },
  { id: 18, name: "王五1" },
  { id: 19, name: "張三1" },
  { id: 20, name: "李四1" },
  { id: 21, name: "王五1" }
];

export default function StudentInfoSection({
  onStudentSelectId
}: {
  onStudentSelectId: (id: number | null) => void;
}) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);

  // Update search results when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = STUDENTS.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery]);

  const handlePickSearchResult = (student: Student) => {
    setSelectedStudent(student);
    setIsSwitching(false);
    onStudentSelectId(student.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  const showSelectedStudent = selectedStudent != null && !isSwitching;
  const openSearchView = isSwitching || !selectedStudent;

  return (
    <div>
      <div className="inline-block mb-2">
        <h4 className="event-editor-title">
          <User className="h-6 w-6" />
          學生：
        </h4>
      </div>
      {showSelectedStudent && (
        <StudentInfoContent
          selectedStudent={selectedStudent}
          onSwitch={() => setIsSwitching(true)}
        />
      )}
      {openSearchView && (
        <StudentSearchContent
          searchResults={searchResults}
          onSearch={setSearchQuery}
          onPick={handlePickSearchResult}
        />
      )}
    </div>
  );
}

function StudentInfoContent({
  selectedStudent,
  onSwitch
}: {
  selectedStudent: Student;
  onSwitch: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium border-gray-600 border rounded-md px-2 py-1">
          {selectedStudent.name}
        </span>
        <Button variant="default" size="sm" onClick={onSwitch}>
          替換
        </Button>
      </div>
    </div>
  );
}

function StudentSearchContent({
  searchResults,
  onSearch,
  onPick
}: {
  searchResults: Student[];
  onSearch: (query: string) => void;
  onPick: (student: Student) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      return;
    }
    setSearchQuery(query);
    onSearch(query);
  };

  const hasInput = searchQuery.trim() !== "";

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋學生姓名"
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
        {hasInput && (
          <p className="absolute right-2 top-2.5 text-sm text-muted-foreground">
            搜尋結果：{searchResults.length}
          </p>
        )}
      </div>
      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md">
          {searchResults.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => onPick(student)}
            >
              <span>{student.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
