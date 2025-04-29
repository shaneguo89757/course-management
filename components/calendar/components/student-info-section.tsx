import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EventStudent, fakeEventStudents } from "../type";
import { ScrollArea } from "@/components/ui/scroll-area";



export default function StudentInfoSection({
  initStudentId,
  onStudentSelectId,
  editable = true
}: {
  initStudentId: number | null;
  onStudentSelectId?: (id: number | null) => void;
  editable?: boolean;
}) {
  const [selectedStudent, setSelectedStudent] = useState<EventStudent | null>(fakeEventStudents.find(student => student.id === initStudentId) ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EventStudent[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);

  // Update search results when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = fakeEventStudents.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery]);

  const handlePickSearchResult = (student: EventStudent) => {
    if (!editable) {
      return;
    }

    setSelectedStudent(student);
    setIsSwitching(false);
    onStudentSelectId?.(student.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  const showSelectedStudent = selectedStudent != null && !isSwitching;
  const openSearchView = editable && (isSwitching || !selectedStudent);

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
          editable={editable}
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
  onSwitch,
  editable
}: {
  selectedStudent: EventStudent;
  onSwitch: () => void;
  editable: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium border-gray-600 border rounded-md px-2 py-1">
          {selectedStudent.name}
        </span>
        {editable && (
          <Button variant="default" size="sm" onClick={onSwitch}>
            替換
          </Button>
        )}
      </div>
    </div>
  );
}

function StudentSearchContent({
  searchResults,
  onSearch,
  onPick
}: {
  searchResults: EventStudent[];
  onSearch: (query: string) => void;
  onPick: (student: EventStudent) => void;
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
      
      {hasInput && (
        <ScrollArea className="h-[160px] rounded-md border">
          <div className="pr-2 space-y-1">
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
        </ScrollArea>
      )}
    </div>
  );
}
