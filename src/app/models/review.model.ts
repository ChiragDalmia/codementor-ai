export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'html' | 'css';

export interface ReviewRequest {
  language: SupportedLanguage;
  code: string;
}

export interface ReviewResponse {
  summary: string;
  bugs: ReviewIssue[];
  performance: ReviewIssue[];
  security: ReviewIssue[];
  refactoredCode: string;
}

export interface ReviewIssue {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  line?: number;
}

export interface ReviewHistoryItem {
  id: string;
  timestamp: string;
  language: SupportedLanguage;
  summary: string;
  codeSnippet: string;
  response: ReviewResponse;
}

export interface DashboardMetrics {
  totalReviews: number;
  bugsFound: number;
  securityIssues: number;
  performanceSuggestions: number;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

export type ReviewTab = 'summary' | 'bugs' | 'performance' | 'security' | 'refactored';

export interface ReviewState {
  status: 'idle' | 'loading' | 'streaming' | 'complete' | 'error';
  progress: number;
  currentStep: string;
  response: ReviewResponse | null;
  error: string | null;
}

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string; monacoLang: string }[] = [
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monacoLang: 'typescript' },
  { value: 'python', label: 'Python', monacoLang: 'python' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'html', label: 'HTML', monacoLang: 'html' },
  { value: 'css', label: 'CSS', monacoLang: 'css' },
];

export const CODE_SAMPLES: Record<SupportedLanguage, string> = {
  javascript: `// Paste your code here or use this sample
function fetchUserData(userId) {
  var data = null;
  $.ajax({
    url: '/api/users/' + userId,
    async: false,
    success: function(response) {
      data = response;
    }
  });

  for (var i = 0; i < data.items.length; i++) {
    console.log(data.items[i]);
    eval(data.items[i].action);
  }

  return data;
}`,
  typescript: `// TypeScript sample
interface User {
  id: number;
  name: string;
  password: string;
}

class UserService {
  private users: any[] = [];

  getUser(id: number) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id == id) {
        return this.users[i];
      }
    }
  }

  async fetchAllUsers() {
    const response = await fetch('/api/users');
    const data = await response.json();
    this.users = data;
    return this.users;
  }
}`,
  python: `# Python sample
import pickle
import os

def load_config(filename):
    with open(filename, 'rb') as f:
        config = pickle.load(f)
    return config

def execute_query(db, user_input):
    query = "SELECT * FROM users WHERE name = '" + user_input + "'"
    return db.execute(query)

def process_items(items):
    result = []
    for i in range(len(items)):
        result = result + [items[i] * 2]
    return result`,
  java: `// Java sample
public class UserManager {
    private static UserManager instance;
    private List<String> passwords = new ArrayList<>();

    public static UserManager getInstance() {
        if (instance == null) {
            instance = new UserManager();
        }
        return instance;
    }

    public void addPassword(String pwd) {
        passwords.add(pwd);
        System.out.println("Password added: " + pwd);
    }

    public String getUser(HttpServletRequest req) {
        String id = req.getParameter("id");
        return "SELECT * FROM users WHERE id = " + id;
    }
}`,
  cpp: `// C++ sample
#include <iostream>
#include <cstring>

void copyString(char* dest, const char* src) {
    strcpy(dest, src);
}

int* createArray(int size) {
    int arr[100];
    for (int i = 0; i <= size; i++) {
        arr[i] = i * 2;
    }
    return arr;
}

int main() {
    char buffer[10];
    copyString(buffer, "This is a very long string that will overflow");
    std::cout << buffer << std::endl;
    return 0;
}`,
  html: `<!-- HTML sample -->
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
  <script src="http://cdn.example.com/jquery.js"></script>
</head>
<body>
  <div id="output"></div>
  <script>
    var userInput = location.hash.substring(1);
    document.getElementById('output').innerHTML = userInput;

    function loadData(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();
      eval(xhr.responseText);
    }
  </script>
</body>
</html>`,
  css: `/* CSS sample */
* {
  box-sizing: border-box !important;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  padding: 0 15px;
}

.button {
  background-color: #007bff !important;
  color: white !important;
  border: none !important;
  padding: 10px 20px !important;
  cursor: pointer !important;
}

div div div div span {
  color: red;
}`,
};
